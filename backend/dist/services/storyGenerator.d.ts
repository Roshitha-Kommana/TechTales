import { IStoryPage } from '../models/Story';
interface StoryGenerationOptions {
    concept: string;
    characterName?: string;
    adventureStyle?: string;
    difficulty?: string;
    numberOfPages?: number;
    sourceFileContent?: string;
    sourceFileMimeType?: string;
    sourceFileBase64?: string;
}
export interface GeneratedStory {
    title: string;
    pages: Omit<IStoryPage, 'imageUrl' | 'imagePrompt'>[];
    keyConcepts?: string[];
}
export declare function generateStory(options: StoryGenerationOptions): Promise<GeneratedStory>;
export {};
//# sourceMappingURL=storyGenerator.d.ts.map