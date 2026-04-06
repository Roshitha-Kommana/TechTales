import { Request, Response } from 'express';
import { Note } from '../models/Note';
import { AuthRequest } from '../middleware/auth';

export const createNoteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { title, content, storyId, storyTitle, pageNumber } = req.body;

    if (!title || !content) {
      res.status(400).json({ error: 'Title and content are required' });
      return;
    }

    if (!authReq.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const note = new Note({
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
  } catch (error: any) {
    console.error('Error creating note:', error);
    res.status(500).json({
      error: 'Failed to create note',
      message: error.message,
    });
  }
};

export const getAllNotesController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;

    if (!authReq.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const notes = await Note.find({ userId: authReq.userId })
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
  } catch (error: any) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      error: 'Failed to fetch notes',
      message: error.message,
    });
  }
};

export const getNoteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    if (!authReq.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const note = await Note.findOne({ _id: id, userId: authReq.userId }).lean();

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
  } catch (error: any) {
    console.error('Error fetching note:', error);
    res.status(500).json({
      error: 'Failed to fetch note',
      message: error.message,
    });
  }
};

export const updateNoteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;
    const { title, content } = req.body;

    if (!authReq.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const note = await Note.findOne({ _id: id, userId: authReq.userId });

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
  } catch (error: any) {
    console.error('Error updating note:', error);
    res.status(500).json({
      error: 'Failed to update note',
      message: error.message,
    });
  }
};

export const deleteNoteController = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    if (!authReq.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const note = await Note.findOneAndDelete({ _id: id, userId: authReq.userId });

    if (!note) {
      res.status(404).json({ error: 'Note not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Note deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting note:', error);
    res.status(500).json({
      error: 'Failed to delete note',
      message: error.message,
    });
  }
};
