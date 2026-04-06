"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteStoryController = exports.getShareableLinkController = exports.updateStoryPageImageController = exports.updateStoryPageController = exports.saveStoryController = exports.getAllStoriesController = exports.generateImagesController = exports.getStoryController = exports.generateStoryController = void 0;
const Story_1 = require("../models/Story");
const storyGenerator_1 = require("../services/storyGenerator");
const imageGenerator_1 = require("../services/imageGenerator");
const fileProcessor_1 = require("../services/fileProcessor");
const authController_1 = require("./authController");
const generateStoryController = async (req, res) => {
    try {
        const authReq = req;
        // Log request body for debugging
        console.log('📥 Request body:', req.body);
        console.log('📥 Request file:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'No file');
        const { concept, characterName, adventureStyle, difficulty, numberOfPages } = req.body;
        const file = req.file; // File from multer middleware
        if (!concept) {
            console.error('❌ Concept is missing from request body');
            res.status(400).json({ error: 'Concept is required' });
            return;
        }
        console.log('✅ Request validated:', { concept, characterName, adventureStyle, difficulty, numberOfPages });
        // Process file if provided
        let sourceFileContent;
        let sourceFileMimeType;
        let sourceFileBase64;
        if (file) {
            try {
                console.log(`📄 Processing uploaded file: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
                const processedFile = await (0, fileProcessor_1.processFile)(file);
                if ((0, fileProcessor_1.isImageFile)(processedFile.mimeType)) {
                    // For images, use base64 data
                    sourceFileBase64 = processedFile.content;
                    sourceFileMimeType = processedFile.mimeType;
                    console.log(`✅ Processed image file: ${processedFile.filename}`);
                }
                else {
                    // For text-based files, use extracted text
                    sourceFileContent = processedFile.content;
                    sourceFileMimeType = processedFile.mimeType;
                    console.log(`✅ Processed text file: ${processedFile.filename} (${processedFile.content.length} characters)`);
                }
            }
            catch (fileError) {
                console.error('Error processing file:', fileError);
                res.status(400).json({
                    error: 'Failed to process uploaded file',
                    message: fileError instanceof Error ? fileError.message : 'Unknown error',
                });
                return;
            }
        }
        // Generate story using AI
        console.log('🚀 Starting story generation...');
        let generatedStory;
        try {
            generatedStory = await (0, storyGenerator_1.generateStory)({
                concept,
                characterName: characterName || 'Adventurer',
                adventureStyle: adventureStyle || 'adventure',
                difficulty: difficulty || 'beginner',
                numberOfPages: numberOfPages || 5,
                sourceFileContent,
                sourceFileMimeType,
                sourceFileBase64,
            });
            console.log('✅ Story generated successfully:', generatedStory.title);
        }
        catch (storyError) {
            console.error('❌ Error in generateStory:', storyError);
            throw storyError; // Re-throw to be caught by outer try-catch
        }
        // Create story in database
        const story = new Story_1.Story({
            title: generatedStory.title,
            concept,
            pages: generatedStory.pages.map((page) => ({
                pageNumber: page.pageNumber,
                text: page.text,
                keyPoints: page.keyPoints || [], // Include keyPoints from AI generation
            })),
            ageGroup: '8-12', // Keep for backward compatibility, but not used in generation
            difficulty: difficulty || 'beginner',
            adventureStyle: adventureStyle || 'adventure',
            keyConcepts: generatedStory.keyConcepts || [],
            userId: authReq.userId ? authReq.userId : undefined,
        });
        await story.save();
        // Update learning streak based on story generation activity
        if (authReq.userId) {
            try {
                const streak = await (0, authController_1.updateLearningStreakOnActivity)(authReq.userId);
                console.log(`📊 Learning streak updated to ${streak} after story generation`);
            }
            catch (streakError) {
                console.error('Error updating learning streak:', streakError);
                // Don't fail the request if streak update fails
            }
        }
        res.status(201).json({
            success: true,
            story: {
                id: story._id.toString(),
                title: story.title,
                concept: story.concept,
                pages: story.pages,
                ageGroup: story.ageGroup,
                difficulty: story.difficulty,
                keyConcepts: story.keyConcepts || [],
            },
        });
    }
    catch (error) {
        console.error('❌ Error in generateStoryController:', error);
        // Extract error message safely
        let errorMessage = 'Unknown error occurred';
        if (error instanceof Error) {
            errorMessage = error.message;
            console.error('❌ Error stack:', error.stack);
        }
        else if (typeof error === 'string') {
            errorMessage = error;
        }
        else if (error?.message) {
            errorMessage = error.message;
        }
        // Log full error details
        try {
            console.error('❌ Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
        }
        catch (stringifyError) {
            console.error('❌ Could not stringify error:', stringifyError);
            console.error('❌ Raw error:', error);
        }
        // Provide more helpful error messages for quota issues
        let statusCode = 500;
        let userMessage = errorMessage;
        if (errorMessage.includes('quota') || errorMessage.includes('Quota exceeded') || errorMessage.includes('exceeded')) {
            statusCode = 429; // Too Many Requests
            userMessage = 'API quota exceeded. All Gemini API keys have reached their daily limit. Please try again tomorrow or add more API keys.';
        }
        // Send error response
        const response = {
            success: false,
            error: 'Failed to generate story',
            message: userMessage,
            details: errorMessage,
        };
        // Only include stack in development
        if (process.env.NODE_ENV === 'development' && error instanceof Error && error.stack) {
            response.stack = error.stack;
        }
        res.status(statusCode).json(response);
    }
};
exports.generateStoryController = generateStoryController;
const getStoryController = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || id === 'undefined') {
            res.status(400).json({ error: 'Story ID is required' });
            return;
        }
        const story = await Story_1.Story.findById(id);
        if (!story) {
            res.status(404).json({ error: 'Story not found' });
            return;
        }
        // Transform story to include id field
        const transformedStory = {
            id: story._id.toString(),
            title: story.title,
            concept: story.concept,
            pages: story.pages,
            ageGroup: story.ageGroup,
            difficulty: story.difficulty,
            keyConcepts: story.keyConcepts || [],
        };
        res.json({ success: true, story: transformedStory });
    }
    catch (error) {
        console.error('Error in getStoryController:', error);
        res.status(500).json({
            error: 'Failed to fetch story',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getStoryController = getStoryController;
const generateImagesController = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story_1.Story.findById(id);
        if (!story) {
            res.status(404).json({ error: 'Story not found' });
            return;
        }
        // Generate images for all pages that don't have images yet
        console.log(`Generating images for story ${story._id}, ${story.pages.length} pages`);
        const pagesWithImages = await Promise.all(story.pages.map(async (page, index) => {
            if (page.imageUrl) {
                console.log(`Page ${page.pageNumber} already has image, skipping`);
                return page;
            }
            try {
                console.log(`🖼️  Generating image for Page ${page.pageNumber} (${index + 1}/${story.pages.length})...`);
                console.log(`📖 Page ${page.pageNumber} story text: ${page.text.substring(0, 200)}...`);
                // Step 1: Gemini generates image prompt based on THIS PAGE's story text
                const imagePrompt = await (0, imageGenerator_1.generateImagePrompt)(page.text, // Full story text for THIS specific page
                story.concept, page.pageNumber, story.ageGroup || '8-12', story.title, story.adventureStyle || 'adventure');
                console.log(`✅ Image prompt generated for Page ${page.pageNumber} by Gemini: ${imagePrompt.substring(0, 150)}...`);
                // Step 2: Pollinations generates image using the prompt AND the page's story text
                // This ensures the image matches the story content on the left side
                const imageUrl = await (0, imageGenerator_1.generateImage)(imagePrompt, {
                    text: page.text, // Pass the page's story text for direct use in Pollinations prompt
                    title: story.title,
                    pageNumber: page.pageNumber,
                    adventureStyle: story.adventureStyle || 'adventure'
                });
                // Validate image URL format
                if (!imageUrl || typeof imageUrl !== 'string') {
                    throw new Error(`Invalid image URL returned: ${typeof imageUrl}`);
                }
                if (!imageUrl.startsWith('data:image/')) {
                    throw new Error(`Image URL is not a valid data URL: ${imageUrl.substring(0, 50)}...`);
                }
                console.log(`✅ Image URL generated for page ${page.pageNumber}: ${imageUrl.substring(0, 100)}...`);
                console.log(`📏 Image URL length: ${imageUrl.length} characters`);
                console.log(`📏 Image URL starts with: ${imageUrl.substring(0, 30)}...`);
                // Update page with image
                page.imageUrl = imageUrl;
                page.imagePrompt = imagePrompt;
                console.log(`✅ Successfully generated and assigned image for Page ${page.pageNumber}`);
                console.log(`✅ Page ${page.pageNumber} now has imageUrl: ${!!page.imageUrl}`);
                return page;
            }
            catch (error) {
                const errorMessage = error?.message || 'Unknown error';
                console.error(`\n❌❌❌ ERROR GENERATING IMAGE FOR PAGE ${page.pageNumber} ❌❌❌`);
                console.error(`❌ Error Message: ${errorMessage}`);
                console.error(`❌ Error Name: ${error?.name || 'Unknown'}`);
                console.error(`❌ Error Stack (first 500 chars): ${error?.stack?.substring(0, 500) || 'No stack'}`);
                console.error(`❌ Full Error Object:`, error);
                console.error(`❌❌❌ END ERROR FOR PAGE ${page.pageNumber} ❌❌❌\n`);
                // Store error in page for debugging (optional, can be removed later)
                page.imageError = errorMessage;
                // Return page without image - frontend will show loading state
                return page;
            }
        }));
        const pagesWithImagesCount = pagesWithImages.filter(p => p.imageUrl).length;
        console.log(`📊 Image generation completed. ${pagesWithImagesCount}/${story.pages.length} pages have images.`);
        // Track failed pages with error details
        const failedPages = [];
        const failedPagesDetails = [];
        pagesWithImages.forEach((page) => {
            if (!page.imageUrl) {
                failedPages.push(page.pageNumber);
                failedPagesDetails.push({ pageNumber: page.pageNumber });
            }
        });
        if (pagesWithImagesCount < story.pages.length) {
            console.error(`❌ ${story.pages.length - pagesWithImagesCount} pages failed to generate images: ${failedPages.join(', ')}`);
            console.error(`❌ Failed pages details:`, failedPagesDetails);
        }
        story.pages = pagesWithImages;
        await story.save();
        console.log(`✅ Story saved with ${pagesWithImagesCount} images`);
        // Verify images were actually saved
        const savedStory = await Story_1.Story.findById(story._id);
        if (savedStory) {
            const savedImagesCount = savedStory.pages.filter(p => p.imageUrl).length;
            console.log(`🔍 Verification: Saved story has ${savedImagesCount} pages with images`);
            savedStory.pages.forEach((p, idx) => {
                if (p.imageUrl) {
                    console.log(`  ✅ Page ${p.pageNumber}: Has image (${p.imageUrl.substring(0, 50)}...)`);
                }
                else {
                    console.log(`  ❌ Page ${p.pageNumber}: NO IMAGE`);
                }
            });
        }
        // Return response with summary
        res.json({
            success: true,
            story: {
                id: story._id.toString(),
                title: story.title,
                pages: story.pages,
            },
            summary: {
                totalPages: story.pages.length,
                pagesWithImages: pagesWithImagesCount,
                pagesWithoutImages: story.pages.length - pagesWithImagesCount,
                failedPages: failedPages,
            },
        });
    }
    catch (error) {
        console.error('❌ Error in generateImagesController:', error);
        console.error('❌ Error stack:', error?.stack);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: 'Failed to generate images',
            message: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
        });
    }
};
exports.generateImagesController = generateImagesController;
const getAllStoriesController = async (req, res) => {
    try {
        const authReq = req;
        const query = authReq.userId ? { userId: authReq.userId } : {};
        const stories = await Story_1.Story.find(query).sort({ createdAt: -1 }).limit(100);
        // Transform stories to include id field
        const transformedStories = stories.map((story) => ({
            id: story._id.toString(),
            title: story.title,
            concept: story.concept,
            pages: story.pages,
            ageGroup: story.ageGroup,
            difficulty: story.difficulty,
            keyConcepts: story.keyConcepts || [],
        }));
        res.json({ success: true, stories: transformedStories });
    }
    catch (error) {
        console.error('Error in getAllStoriesController:', error);
        res.status(500).json({
            error: 'Failed to fetch stories',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getAllStoriesController = getAllStoriesController;
const saveStoryController = async (req, res) => {
    try {
        const { id } = req.params;
        const story = await Story_1.Story.findById(id);
        if (!story) {
            res.status(404).json({ error: 'Story not found' });
            return;
        }
        // Story is already saved in database, just return success
        res.json({ success: true, message: 'Story saved', story });
    }
    catch (error) {
        console.error('Error in saveStoryController:', error);
        res.status(500).json({
            error: 'Failed to save story',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.saveStoryController = saveStoryController;
const updateStoryPageController = async (req, res) => {
    try {
        const authReq = req;
        const { id, pageNumber } = req.params;
        const { text } = req.body;
        if (!id || id === 'undefined') {
            res.status(400).json({ error: 'Story ID is required' });
            return;
        }
        if (!pageNumber) {
            res.status(400).json({ error: 'Page number is required' });
            return;
        }
        if (!text || typeof text !== 'string') {
            res.status(400).json({ error: 'Text content is required' });
            return;
        }
        const story = await Story_1.Story.findById(id);
        if (!story) {
            res.status(404).json({ error: 'Story not found' });
            return;
        }
        // Check if user owns the story (if userId is set)
        if (story.userId && authReq.userId && story.userId.toString() !== authReq.userId) {
            res.status(403).json({ error: 'You do not have permission to edit this story' });
            return;
        }
        const pageIndex = parseInt(pageNumber) - 1;
        if (pageIndex < 0 || pageIndex >= story.pages.length) {
            res.status(400).json({ error: 'Invalid page number' });
            return;
        }
        // Update the page text
        story.pages[pageIndex].text = text;
        await story.save();
        res.json({
            success: true,
            message: 'Page updated successfully',
            story: {
                id: story._id.toString(),
                pages: story.pages,
            },
        });
    }
    catch (error) {
        console.error('Error in updateStoryPageController:', error);
        res.status(500).json({
            error: 'Failed to update page',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.updateStoryPageController = updateStoryPageController;
const updateStoryPageImageController = async (req, res) => {
    try {
        const authReq = req;
        const { id, pageNumber } = req.params;
        const file = req.file;
        if (!id || id === 'undefined') {
            res.status(400).json({ error: 'Story ID is required' });
            return;
        }
        if (!pageNumber) {
            res.status(400).json({ error: 'Page number is required' });
            return;
        }
        if (!file) {
            res.status(400).json({ error: 'Image file is required' });
            return;
        }
        const story = await Story_1.Story.findById(id);
        if (!story) {
            res.status(404).json({ error: 'Story not found' });
            return;
        }
        // Check if user owns the story (if userId is set)
        if (story.userId && authReq.userId && story.userId.toString() !== authReq.userId) {
            res.status(403).json({ error: 'You do not have permission to edit this story' });
            return;
        }
        const pageIndex = parseInt(pageNumber) - 1;
        if (pageIndex < 0 || pageIndex >= story.pages.length) {
            res.status(400).json({ error: 'Invalid page number' });
            return;
        }
        // Convert image to base64 data URL for storage
        // In production, you might want to upload to cloud storage (S3, Cloudinary, etc.)
        const base64Image = file.buffer.toString('base64');
        const imageUrl = `data:${file.mimetype};base64,${base64Image}`;
        // Update the page image
        story.pages[pageIndex].imageUrl = imageUrl;
        await story.save();
        res.json({
            success: true,
            message: 'Page image updated successfully',
            story: {
                id: story._id.toString(),
                pages: story.pages,
            },
        });
    }
    catch (error) {
        console.error('Error in updateStoryPageImageController:', error);
        res.status(500).json({
            error: 'Failed to update page image',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.updateStoryPageImageController = updateStoryPageImageController;
const getShareableLinkController = async (req, res) => {
    try {
        const { id } = req.params;
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
        if (!id || id === 'undefined') {
            res.status(400).json({ error: 'Story ID is required' });
            return;
        }
        const story = await Story_1.Story.findById(id);
        if (!story) {
            res.status(404).json({ error: 'Story not found' });
            return;
        }
        // Generate shareable link
        const shareableLink = `${FRONTEND_URL}/story/${id}`;
        res.json({
            success: true,
            shareableLink,
            story: {
                id: story._id.toString(),
                title: story.title,
                concept: story.concept,
            },
        });
    }
    catch (error) {
        console.error('Error in getShareableLinkController:', error);
        res.status(500).json({
            error: 'Failed to generate shareable link',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getShareableLinkController = getShareableLinkController;
const deleteStoryController = async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        if (!id || id === 'undefined') {
            res.status(400).json({ error: 'Story ID is required' });
            return;
        }
        const story = await Story_1.Story.findById(id);
        if (!story) {
            res.status(404).json({ error: 'Story not found' });
            return;
        }
        // Check if user owns the story (if userId is set)
        if (story.userId && authReq.userId && story.userId.toString() !== authReq.userId) {
            res.status(403).json({ error: 'You do not have permission to delete this story' });
            return;
        }
        await Story_1.Story.findByIdAndDelete(id);
        res.json({
            success: true,
            message: 'Story deleted successfully',
        });
    }
    catch (error) {
        console.error('Error in deleteStoryController:', error);
        res.status(500).json({
            error: 'Failed to delete story',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.deleteStoryController = deleteStoryController;
//# sourceMappingURL=storyController.js.map