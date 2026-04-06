"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createConceptController = exports.getAllConceptsController = void 0;
const Concept_1 = require("../models/Concept");
const getAllConceptsController = async (req, res) => {
    try {
        const concepts = await Concept_1.Concept.find().sort({ name: 1 });
        res.json({ success: true, concepts });
    }
    catch (error) {
        console.error('Error in getAllConceptsController:', error);
        res.status(500).json({
            error: 'Failed to fetch concepts',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
exports.getAllConceptsController = getAllConceptsController;
const createConceptController = async (req, res) => {
    try {
        const { name, description, category, difficulty } = req.body;
        if (!name || !description || !category) {
            res.status(400).json({ error: 'Name, description, and category are required' });
            return;
        }
        const concept = new Concept_1.Concept({
            name,
            description,
            category,
            difficulty: difficulty || 'medium',
        });
        await concept.save();
        res.status(201).json({ success: true, concept });
    }
    catch (error) {
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
exports.createConceptController = createConceptController;
//# sourceMappingURL=conceptController.js.map