import { Request, Response } from 'express';
import { Concept } from '../models/Concept';

export const getAllConceptsController = async (req: Request, res: Response): Promise<void> => {
  try {
    const concepts = await Concept.find().sort({ name: 1 });
    res.json({ success: true, concepts });
  } catch (error) {
    console.error('Error in getAllConceptsController:', error);
    res.status(500).json({
      error: 'Failed to fetch concepts',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const createConceptController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, category, difficulty } = req.body;

    if (!name || !description || !category) {
      res.status(400).json({ error: 'Name, description, and category are required' });
      return;
    }

    const concept = new Concept({
      name,
      description,
      category,
      difficulty: difficulty || 'medium',
    });

    await concept.save();

    res.status(201).json({ success: true, concept });
  } catch (error) {
    console.error('Error in createConceptController:', error);
    if (error instanceof Error && error.message.includes('duplicate')) {
      res.status(409).json({ error: 'Concept already exists' });
      return;
    }
    res.status(500).json({
      error: 'Failed to create concept',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};


