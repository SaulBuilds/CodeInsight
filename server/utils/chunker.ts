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
  // If content is smaller than maxChunkSize, return as a single chunk
  if (content.length <= maxChunkSize) {
    return [content];
  }

  const chunks: string[] = [];
  const fileMarkerRegex = /\/\/ (.+?)\n\/\/ -{50,}\n/g;
  let lastIndex = 0;
  let currentChunk = '';
  let match;

  // Reset regex
  fileMarkerRegex.lastIndex = 0;

  // Track files in the current chunk
  while ((match = fileMarkerRegex.exec(content)) !== null) {
    const fileHeader = match[0];
    
    // Find the end of this file content (start of next file or end of content)
    const nextFileMatch = content.indexOf('\n\n//', match.index + match[0].length);
    const fileEndIndex = nextFileMatch > -1 ? nextFileMatch + 2 : content.length;
    const fileContent = content.substring(match.index, fileEndIndex);
    
    // If adding this file would exceed the chunk size, start a new chunk
    // Exception: if the current chunk is empty, include this file regardless of size
    if (currentChunk.length + fileContent.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk);
      currentChunk = fileContent;
    } else {
      currentChunk += fileContent;
    }

    lastIndex = fileEndIndex;
  }

  // Add any remaining content
  if (lastIndex < content.length) {
    currentChunk += content.substring(lastIndex);
  }

  // Add the final chunk if it's not empty
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  // If no files were matched or chunks are too large, fall back to character-based chunking
  if (chunks.length === 0 || chunks.some(chunk => chunk.length > maxChunkSize * 1.5)) {
    return fallbackChunking(content, maxChunkSize);
  }

  return chunks;
}

/**
 * Fallback chunking method that splits content by character count,
 * trying to break at reasonable boundaries like line breaks
 */
function fallbackChunking(content: string, maxChunkSize: number): string[] {
  const chunks: string[] = [];
  let remainingContent = content;

  while (remainingContent.length > 0) {
    if (remainingContent.length <= maxChunkSize) {
      chunks.push(remainingContent);
      break;
    }

    // Try to find a reasonable break point near the target size
    let breakPoint = maxChunkSize;
    
    // Look for a double newline backwards from the target point
    const doubleNewlineIndex = remainingContent.lastIndexOf('\n\n', maxChunkSize);
    if (doubleNewlineIndex !== -1 && doubleNewlineIndex > maxChunkSize * 0.75) {
      breakPoint = doubleNewlineIndex + 2; // Include the double newline
    } else {
      // Try to find a regular newline
      const newlineIndex = remainingContent.lastIndexOf('\n', maxChunkSize);
      if (newlineIndex !== -1 && newlineIndex > maxChunkSize * 0.75) {
        breakPoint = newlineIndex + 1; // Include the newline
      }
    }

    chunks.push(remainingContent.substring(0, breakPoint));
    remainingContent = remainingContent.substring(breakPoint);
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
  // GPT models average about 4 characters per token for English text
  // This is a rough approximation
  return Math.ceil(text.length / 4);
}

/**
 * Adds metadata to chunks to help with reassembly and context
 */
export function addChunkMetadata(chunks: string[], totalChunks: number): string[] {
  return chunks.map((chunk, index) => {
    return `
[CHUNK METADATA]
Chunk: ${index + 1} of ${totalChunks}
Characters: ${chunk.length}
Estimated Tokens: ${estimateTokenCount(chunk)}
[END METADATA]

${chunk}
`;
  });
}