export declare class DeepgramService {
    /**
     * Generates audio from text using Deepgram's Text-to-Speech SDK via WebSocket.
     * @param text The text to read aloud
     * @param model The voice model to use
     * @returns Resolves with the audio Buffer
     */
    generateAudio(text: string, model?: string): Promise<Buffer>;
}
export declare const deepgramService: DeepgramService;
//# sourceMappingURL=deepgramService.d.ts.map