"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPENAI_CONFIG = exports.openai = void 0;
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not set in environment variables');
}
exports.openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
exports.OPENAI_CONFIG = {
    storyModel: 'gpt-4-turbo-preview',
    imageModel: 'dall-e-3',
    imageSize: '1024x1024',
    imageQuality: 'standard',
};
//# sourceMappingURL=openai.js.map