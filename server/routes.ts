import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import cli from "./cli";
import openai from "./openai";
import { z } from "zod";
import { insertAnalysisSchema, insertDocSchema, insertRepoSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefixed with /api
  
  // Repository analysis routes
  app.post("/api/repositories/scrape", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        directory: z.string(),
        exclude: z.array(z.string()).optional(),
        maxSize: z.number().optional(),
      });
      
      const validatedData = schema.parse(req.body);
      
      const result = await cli.scrapeRepository({
        directory: validatedData.directory,
        exclude: validatedData.exclude,
        maxSize: validatedData.maxSize,
      });
      
      // Create repository record
      const now = new Date().toISOString();
      
      const repo = await storage.createRepository({
        name: validatedData.directory.split("/").pop() || "Unknown",
        path: validatedData.directory,
        analyzed_at: now,
        files_count: result.stats.includedFiles,
        code_size: result.stats.includedSizeBytes,
        user_id: 1, // Default user ID for now
      });
      
      // Save result to a file
      const outputFile = `repository_${repo.id}_${now}.txt`;
      const filePath = cli.saveToFile(outputFile, result.content);
      
      res.status(200).json({
        repository: repo,
        stats: result.stats,
        outputFile: filePath,
      });
    } catch (error) {
      console.error("Error scraping repository:", error);
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all repositories
  app.get("/api/repositories", async (req: Request, res: Response) => {
    try {
      const repositories = await storage.getAllRepositories();
      res.status(200).json(repositories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get repository by ID
  app.get("/api/repositories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const repository = await storage.getRepository(id);
      
      if (!repository) {
        return res.status(404).json({ error: "Repository not found" });
      }
      
      res.status(200).json(repository);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // OpenAI documentation generation routes
  app.post("/api/analyses/generate", async (req: Request, res: Response) => {
    try {
      const schema = z.object({
        repository_id: z.number(),
        code_content: z.string(),
        type: z.enum(["architecture", "user_stories", "custom"]),
        custom_prompt: z.string().optional(),
        api_key: z.string().optional(),
      });
      
      const validatedData = schema.parse(req.body);
      
      // Use custom API key if provided
      if (validatedData.api_key) {
        const isValid = await openai.validateApiKey(validatedData.api_key);
        if (!isValid) {
          return res.status(401).json({ error: "Invalid OpenAI API key" });
        }
      } else if (!process.env.OPENAI_API_KEY) {
        return res.status(400).json({ error: "OpenAI API key is required" });
      }
      
      let content = "";
      
      // Generate documentation based on type
      switch (validatedData.type) {
        case "architecture":
          content = await openai.generateArchitecturalDoc(validatedData.code_content);
          break;
        case "user_stories":
          content = await openai.generateUserStories(validatedData.code_content);
          break;
        case "custom":
          if (!validatedData.custom_prompt) {
            return res.status(400).json({ error: "Custom prompt is required for custom analysis" });
          }
          content = await openai.generateCustomAnalysis(validatedData.code_content, validatedData.custom_prompt);
          break;
        default:
          return res.status(400).json({ error: "Invalid analysis type" });
      }
      
      // Save analysis to storage
      const now = new Date().toISOString();
      const analysis = await storage.createAnalysis({
        repository_id: validatedData.repository_id,
        type: validatedData.type,
        content: content,
        ai_model: "gpt-4o",
        created_at: now,
        metadata: validatedData.custom_prompt ? { prompt: validatedData.custom_prompt } : undefined,
      });
      
      res.status(200).json({
        analysis,
        content,
      });
    } catch (error) {
      console.error("Error generating documentation:", error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get all analyses
  app.get("/api/analyses", async (req: Request, res: Response) => {
    try {
      const analyses = await storage.getAllAnalyses();
      res.status(200).json(analyses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get analysis by ID
  app.get("/api/analyses/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const analysis = await storage.getAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      
      res.status(200).json(analysis);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get analyses by repository ID
  app.get("/api/repositories/:id/analyses", async (req: Request, res: Response) => {
    try {
      const repositoryId = parseInt(req.params.id);
      const analyses = await storage.getAnalysesByRepositoryId(repositoryId);
      res.status(200).json(analyses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Documentation routes
  app.post("/api/docs", async (req: Request, res: Response) => {
    try {
      const validatedData = insertDocSchema.parse(req.body);
      const doc = await storage.createDoc(validatedData);
      res.status(201).json(doc);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  // Get all docs
  app.get("/api/docs", async (req: Request, res: Response) => {
    try {
      const docs = await storage.getAllDocs();
      res.status(200).json(docs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Get doc by ID
  app.get("/api/docs/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const doc = await storage.getDoc(id);
      
      if (!doc) {
        return res.status(404).json({ error: "Document not found" });
      }
      
      res.status(200).json(doc);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
