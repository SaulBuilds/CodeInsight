/**
 * Utilities for breaking large code repositories into manageable chunks
 * for processing with context-limited AI models
 */

/**
 * Split repository content into chunks of approximately equal size
 * Each chunk will try to maintain file boundaries where possible
 *
 * @param content The combined repository content as a string
 * @param maxChunkSize Maximum desired size of each chunk in characters (approximate)
 * @returns Array of content chunks, each within the size limit
 */
export function splitContentIntoChunks(content: string, maxChunkSize: number = 120000): string[] {
  // Detect file boundaries by looking for file path markers (added during scraping)
  const fileMarkerRegex = /^\/\/ File: .+$/gm;
  
  // Find all file markers using exec instead of matchAll for compatibility
  const fileMarkers: {marker: string, index: number}[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = fileMarkerRegex.exec(content)) !== null) {
    fileMarkers.push({
      marker: match[0],
      index: match.index
    });
  }
  
  // If no file markers are found or there's just one file, use fallback chunking
  if (fileMarkers.length <= 1) {
    return fallbackChunking(content, maxChunkSize);
  }
  
  // Split into files first
  const files: { marker: string, content: string }[] = [];
  
  for (let i = 0; i < fileMarkers.length; i++) {
    const currentMarker = fileMarkers[i];
    const nextMarker = fileMarkers[i + 1];
    const fileContent = nextMarker 
      ? content.substring(currentMarker.index, nextMarker.index)
      : content.substring(currentMarker.index);
      
    files.push({
      marker: currentMarker.marker,
      content: fileContent
    });
  }
  
  // Now group files into chunks
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const file of files) {
    // If adding this file would exceed the chunk size and we already have content,
    // finish the current chunk and start a new one
    if (currentChunk.length + file.content.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = file.content;
    } else {
      currentChunk += file.content;
    }
    
    // If a single file is larger than the max chunk size, split it further
    if (file.content.length > maxChunkSize) {
      const fileChunks = fallbackChunking(file.content, maxChunkSize);
      
      // Replace the current chunk with the first part of the split file
      if (chunks.length > 0) {
        chunks.push(fileChunks[0]);
      } else {
        currentChunk = fileChunks[0];
      }
      
      // Add the rest of the file chunks
      for (let i = 1; i < fileChunks.length; i++) {
        chunks.push(fileChunks[i]);
      }
      
      // Reset current chunk since we've handled this file
      currentChunk = "";
    }
  }
  
  // Add the final chunk if it has content
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Fallback chunking method that splits content by character count,
 * trying to break at reasonable boundaries like line breaks
 */
function fallbackChunking(content: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  
  // If content is smaller than max size, return as a single chunk
  if (content.length <= maxChunkSize) {
    return [content];
  }
  
  let currentPosition = 0;
  
  while (currentPosition < content.length) {
    // Determine end position for this chunk (either max size or end of content)
    let endPosition = Math.min(currentPosition + maxChunkSize, content.length);
    
    // Try to find a good breaking point (line break)
    if (endPosition < content.length) {
      // Look for a line break within the last 20% of the chunk
      const searchStartPos = Math.max(currentPosition, endPosition - maxChunkSize * 0.2);
      const searchText = content.substring(searchStartPos, endPosition);
      
      // Find the last line break in our search area
      const lastLineBreak = searchText.lastIndexOf('\n');
      
      if (lastLineBreak !== -1) {
        // Adjust end position to break at the line
        endPosition = searchStartPos + lastLineBreak + 1;
      }
    }
    
    // Extract the chunk and add it to our results
    const chunk = content.substring(currentPosition, endPosition);
    chunks.push(chunk);
    
    // Move position for next chunk
    currentPosition = endPosition;
  }
  
  return chunks;
}

/**
 * Calculate an approximate token count based on character count
 * This is a rough estimate since precise token counting depends on the tokenizer
 * 
 * @param text The text to estimate tokens for
 * @returns Approximate token count
 */
export function estimateTokenCount(text: string): number {
  // A rough average for English text is 4 characters per token
  // This is an approximation - actual tokenization depends on the model
  const averageCharsPerToken = 4;
  return Math.ceil(text.length / averageCharsPerToken);
}

/**
 * Adds metadata to chunks to help with reassembly and context
 */
export function addChunkMetadata(chunks: string[], totalChunks: number): string[] {
  return chunks.map((chunk, index) => {
    const metadata = `// CHUNK ${index + 1} OF ${totalChunks}\n\n`;
    return metadata + chunk;
  });
}