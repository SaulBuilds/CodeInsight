import { users, type User, type InsertUser, docs, type Doc, type InsertDoc, repositories, type Repository, type InsertRepo, analyses, type Analysis, type InsertAnalysis } from "@shared/schema";

// Storage interface with all CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Repository methods
  getRepository(id: number): Promise<Repository | undefined>;
  getAllRepositories(): Promise<Repository[]>;
  createRepository(repo: InsertRepo): Promise<Repository>;
  
  // Analysis methods
  getAnalysis(id: number): Promise<Analysis | undefined>;
  getAllAnalyses(): Promise<Analysis[]>;
  getAnalysesByRepositoryId(repositoryId: number): Promise<Analysis[]>;
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  
  // Doc methods
  getDoc(id: number): Promise<Doc | undefined>;
  getAllDocs(): Promise<Doc[]>;
  createDoc(doc: InsertDoc): Promise<Doc>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private repositories: Map<number, Repository>;
  private analyses: Map<number, Analysis>;
  private docs: Map<number, Doc>;
  
  private userCurrentId: number;
  private repositoryCurrentId: number;
  private analysisCurrentId: number;
  private docCurrentId: number;

  constructor() {
    this.users = new Map();
    this.repositories = new Map();
    this.analyses = new Map();
    this.docs = new Map();
    
    this.userCurrentId = 1;
    this.repositoryCurrentId = 1;
    this.analysisCurrentId = 1;
    this.docCurrentId = 1;
    
    // Add a default user
    this.createUser({
      username: "default",
      password: "password"
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Repository methods
  async getRepository(id: number): Promise<Repository | undefined> {
    return this.repositories.get(id);
  }
  
  async getAllRepositories(): Promise<Repository[]> {
    return Array.from(this.repositories.values());
  }
  
  async createRepository(insertRepo: InsertRepo): Promise<Repository> {
    const id = this.repositoryCurrentId++;
    const repository: Repository = { ...insertRepo, id };
    this.repositories.set(id, repository);
    return repository;
  }
  
  // Analysis methods
  async getAnalysis(id: number): Promise<Analysis | undefined> {
    return this.analyses.get(id);
  }
  
  async getAllAnalyses(): Promise<Analysis[]> {
    return Array.from(this.analyses.values());
  }
  
  async getAnalysesByRepositoryId(repositoryId: number): Promise<Analysis[]> {
    return Array.from(this.analyses.values()).filter(
      (analysis) => analysis.repository_id === repositoryId,
    );
  }
  
  async createAnalysis(insertAnalysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisCurrentId++;
    const analysis: Analysis = { ...insertAnalysis, id };
    this.analyses.set(id, analysis);
    return analysis;
  }
  
  // Doc methods
  async getDoc(id: number): Promise<Doc | undefined> {
    return this.docs.get(id);
  }
  
  async getAllDocs(): Promise<Doc[]> {
    return Array.from(this.docs.values());
  }
  
  async createDoc(insertDoc: InsertDoc): Promise<Doc> {
    const id = this.docCurrentId++;
    const doc: Doc = { ...insertDoc, id };
    this.docs.set(id, doc);
    return doc;
  }
}

export const storage = new MemStorage();
