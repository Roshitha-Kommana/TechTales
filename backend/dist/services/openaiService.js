"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateImagePrompt = exports.generateImage = exports.generateStory = exports.OPENAI_CONFIG = exports.openai = void 0;
// Re-export OpenAI service functions
var openai_1 = require("../config/openai");
Object.defineProperty(exports, "openai", { enumerable: true, get: function () { return openai_1.openai; } });
Object.defineProperty(exports, "OPENAI_CONFIG", { enumerable: true, get: function () { return openai_1.OPENAI_CONFIG; } });
var storyGenerator_1 = require("./storyGenerator");
Object.defineProperty(exports, "generateStory", { enumerable: true, get: function () { return storyGenerator_1.generateStory; } });
var imageGenerator_1 = require("./imageGenerator");
Object.defineProperty(exports, "generateImage", { enumerable: true, get: function () { return imageGenerator_1.generateImage; } });
Object.defineProperty(exports, "generateImagePrompt", { enumerable: true, get: function () { return imageGenerator_1.generateImagePrompt; } });
//# sourceMappingURL=openaiService.js.map