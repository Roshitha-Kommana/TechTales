"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deepgramService = exports.DeepgramService = void 0;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
if (!DEEPGRAM_API_KEY) {
    throw new Error('DEEPGRAM_API_KEY must be set in environment variables. Do not hardcode API keys.');
}
const wavHeader = [
    0x52, 0x49, 0x46, 0x46, // "RIFF"
    0x00, 0x00, 0x00, 0x00, // Placeholder for file size
    0x57, 0x41, 0x56, 0x45, // "WAVE"
    0x66, 0x6D, 0x74, 0x20, // "fmt "
    0x10, 0x00, 0x00, 0x00, // Chunk size (16)
    0x01, 0x00, // Audio format (1 for PCM)
    0x01, 0x00, // Number of channels (1)
    0x80, 0xBB, 0x00, 0x00, // Sample rate (48000)
    0x00, 0x77, 0x01, 0x00, // Byte rate (48000 * 2 = 96000)
    0x02, 0x00, // Block align (2)
    0x10, 0x00, // Bits per sample (16)
    0x64, 0x61, 0x74, 0x61, // "data"
    0x00, 0x00, 0x00, 0x00 // Placeholder for data size
];
class DeepgramService {
    /**
     * Generates audio from text using Deepgram's Text-to-Speech SDK via WebSocket.
     * @param text The text to read aloud
     * @param model The voice model to use
     * @returns Resolves with the audio Buffer
     */
    async generateAudio(text, model = 'aura-asteria-en') {
        return new Promise((resolve, reject) => {
            try {
                const url = `wss://api.deepgram.com/v1/speak?model=${model}&encoding=linear16&sample_rate=48000`;
                // Use global Node 21+ WebSocket
                const ws = new WebSocket(url, {
                    headers: {
                        Authorization: `Token ${DEEPGRAM_API_KEY}`
                    }
                });
                let audioBuffer = Buffer.from(wavHeader);
                ws.onopen = () => {
                    console.log("Deepgram Native WS Connection opened");
                    ws.send(JSON.stringify({ type: 'Speak', text }));
                    ws.send(JSON.stringify({ type: 'Flush' }));
                };
                ws.onmessage = async (event) => {
                    try {
                        const data = event.data;
                        if (data instanceof ArrayBuffer || data instanceof Buffer) {
                            const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
                            audioBuffer = Buffer.concat([audioBuffer, buf]);
                        }
                        else if (data.constructor && data.constructor.name === 'Blob') {
                            const arrayBuf = await data.arrayBuffer();
                            audioBuffer = Buffer.concat([audioBuffer, Buffer.from(arrayBuf)]);
                        }
                        else if (typeof data === 'string') {
                            const parsed = JSON.parse(data);
                            if (parsed.type === "Flushed") {
                                console.log("Deepgram Native Flushed");
                                // Update WAV header
                                const dataSize = audioBuffer.length - 44;
                                const fileSize = dataSize + 36;
                                audioBuffer.writeUInt32LE(fileSize, 4);
                                audioBuffer.writeUInt32LE(dataSize, 40);
                                resolve(audioBuffer);
                                ws.close();
                            }
                            else if (parsed.type === "Error") {
                                reject(new Error(parsed.message));
                                ws.close();
                            }
                        }
                    }
                    catch (e) {
                        console.error("Deepgram WS parse error:", e.message);
                    }
                };
                ws.onerror = (e) => {
                    console.error("Deepgram Native WS Error:", e.message || "Unknown error");
                    reject(new Error("Deepgram API Error" + (e.message ? `: ${e.message}` : "")));
                };
                ws.onclose = () => {
                    console.log("Deepgram Native WS closed");
                };
            }
            catch (error) {
                console.error('Error in deepgramService:', error.message);
                reject(error);
            }
        });
    }
}
exports.DeepgramService = DeepgramService;
exports.deepgramService = new DeepgramService();
//# sourceMappingURL=deepgramService.js.map