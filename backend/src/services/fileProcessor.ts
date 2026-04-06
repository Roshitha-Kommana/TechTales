import pdfParse from 'pdf-parse';

export interface ProcessedFile {
  content: string;
  mimeType: string;
  filename: string;
}

/**
 * Process uploaded file and extract text content
 * Supports PDF, images (via Gemini vision), and text files
 */
export async function processFile(
  file: Express.Multer.File
): Promise<ProcessedFile> {
  const { buffer, mimetype, originalname } = file;

  try {
    // Handle PDF files
    if (mimetype === 'application/pdf') {
      const pdfData = await pdfParse(buffer);
      return {
        content: pdfData.text,
        mimeType: mimetype,
        filename: originalname,
      };
    }

    // Handle text files
    if (mimetype.startsWith('text/')) {
      const textContent = buffer.toString('utf-8');
      return {
        content: textContent,
        mimeType: mimetype,
        filename: originalname,
      };
    }

    // Handle image files (PNG, JPG, JPEG)
    // For images, we'll need to use Gemini's vision API to extract text
    // For now, return a placeholder - this will be handled in storyGenerator
    if (mimetype.startsWith('image/')) {
      // Images will be processed directly by Gemini in storyGenerator
      // Return the buffer as base64 for Gemini to process
      const base64Data = buffer.toString('base64');
      return {
        content: base64Data, // Base64 encoded image data
        mimeType: mimetype,
        filename: originalname,
      };
    }

    throw new Error(`Unsupported file type: ${mimetype}`);
  } catch (error) {
    console.error('Error processing file:', error);
    throw new Error(
      `Failed to process file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Check if file is an image that needs Gemini vision processing
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}
