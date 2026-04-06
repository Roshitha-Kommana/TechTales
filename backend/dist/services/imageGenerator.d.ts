export interface ImageGenerationOptions {
    storyText: string;
    pageNumber: number;
    concept: string;
    ageGroup?: string;
    storyTitle?: string;
}
export declare function generateImagePrompt(storyText: string, concept: string, pageNumber: number, ageGroup?: string, storyTitle?: string, adventureStyle?: string): Promise<string>;
export declare function generateImage(imagePrompt: string, storyContext?: {
    text?: string;
    title?: string;
    pageNumber?: number;
    adventureStyle?: string;
}): Promise<string>;
//# sourceMappingURL=imageGenerator.d.ts.map