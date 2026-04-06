export interface ProcessedFile {
    content: string;
    mimeType: string;
    filename: string;
}
/**
 * Process uploaded file and extract text content
 * Supports PDF, images (via Gemini vision), and text files
 */
export declare function processFile(file: Express.Multer.File): Promise<ProcessedFile>;
/**
 * Check if file is an image that needs Gemini vision processing
 */
export declare function isImageFile(mimeType: string): boolean;
//# sourceMappingURL=fileProcessor.d.ts.map