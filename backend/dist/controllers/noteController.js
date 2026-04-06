"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNoteController = exports.updateNoteController = exports.getNoteController = exports.getAllNotesController = exports.createNoteController = void 0;
const Note_1 = require("../models/Note");
const createNoteController = async (req, res) => {
    try {
        const authReq = req;
        const { title, content, storyId, storyTitle, pageNumber } = req.body;
        if (!title || !content) {
            res.status(400).json({ error: 'Title and content are required' });
            return;
        }
        if (!authReq.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const note = new Note_1.Note({
            title: title.trim(),
            content: content.trim(),
            storyId: storyId || undefined,
            storyTitle: storyTitle || undefined,
            pageNumber: pageNumber !== undefined ? pageNumber : undefined,
            userId: authReq.userId,
        });
        await note.save();
        res.status(201).json({
            success: true,
            note: {
                id: note._id.toString(),
                title: note.title,
                content: note.content,
                storyId: note.storyId?.toString(),
                storyTitle: note.storyTitle,
                pageNumber: note.pageNumber,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Error creating note:', error);
        res.status(500).json({
            error: 'Failed to create note',
            message: error.message,
        });
    }
};
exports.createNoteController = createNoteController;
const getAllNotesController = async (req, res) => {
    try {
        const authReq = req;
        if (!authReq.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const notes = await Note_1.Note.find({ userId: authReq.userId })
            .sort({ createdAt: -1 })
            .lean();
        res.json({
            success: true,
            notes: notes.map((note) => ({
                id: note._id.toString(),
                title: note.title,
                content: note.content,
                storyId: note.storyId?.toString(),
                storyTitle: note.storyTitle,
                pageNumber: note.pageNumber,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
            })),
        });
    }
    catch (error) {
        console.error('Error fetching notes:', error);
        res.status(500).json({
            error: 'Failed to fetch notes',
            message: error.message,
        });
    }
};
exports.getAllNotesController = getAllNotesController;
const getNoteController = async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        if (!authReq.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const note = await Note_1.Note.findOne({ _id: id, userId: authReq.userId }).lean();
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        res.json({
            success: true,
            note: {
                id: note._id.toString(),
                title: note.title,
                content: note.content,
                storyId: note.storyId?.toString(),
                storyTitle: note.storyTitle,
                pageNumber: note.pageNumber,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Error fetching note:', error);
        res.status(500).json({
            error: 'Failed to fetch note',
            message: error.message,
        });
    }
};
exports.getNoteController = getNoteController;
const updateNoteController = async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        const { title, content } = req.body;
        if (!authReq.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const note = await Note_1.Note.findOne({ _id: id, userId: authReq.userId });
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        if (title !== undefined) {
            note.title = title.trim();
        }
        if (content !== undefined) {
            note.content = content.trim();
        }
        await note.save();
        res.json({
            success: true,
            note: {
                id: note._id.toString(),
                title: note.title,
                content: note.content,
                storyId: note.storyId?.toString(),
                storyTitle: note.storyTitle,
                pageNumber: note.pageNumber,
                createdAt: note.createdAt,
                updatedAt: note.updatedAt,
            },
        });
    }
    catch (error) {
        console.error('Error updating note:', error);
        res.status(500).json({
            error: 'Failed to update note',
            message: error.message,
        });
    }
};
exports.updateNoteController = updateNoteController;
const deleteNoteController = async (req, res) => {
    try {
        const authReq = req;
        const { id } = req.params;
        if (!authReq.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const note = await Note_1.Note.findOneAndDelete({ _id: id, userId: authReq.userId });
        if (!note) {
            res.status(404).json({ error: 'Note not found' });
            return;
        }
        res.json({
            success: true,
            message: 'Note deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting note:', error);
        res.status(500).json({
            error: 'Failed to delete note',
            message: error.message,
        });
    }
};
exports.deleteNoteController = deleteNoteController;
//# sourceMappingURL=noteController.js.map