// routes/flashcardRoutes.js (Ensure it uses the unified service function)

import express from 'express';
import flashCardService from '../services/flashCardService.js';

const router = express.Router();

// --- Middleware ---
const getCurrentUserId = (req) => { return 1; };
const validateIdParam = (req, res, next) => { /* ... implementation ... */ };

// --- Routes ---

// GET /study - Uses prepareFlashcardViewData with null ID
router.get('/study', async (req, res) => {
    const userId = getCurrentUserId(req);
    try {
        // Call the unified function with null ID to get the first card
        const viewData = await flashCardService.prepareFlashcardViewData(null, userId);
        if (!viewData) {
            return res.render('flashcard/noFlashcards', { message: "No flashcards available." });
        }
        // Render the study template
        res.render('flashCard/flashCard_dataFilled', viewData); // Verify template name
    } catch (error) {
        console.error(`Error starting study session:`, error);
        res.status(500).render('error', { message: 'Failed to load study session.' });
    }
});

// GET /:id - Uses prepareFlashcardViewData with specific ID
router.get('/:id', validateIdParam, async (req, res) => {
    const requestedFlashcardId = req.flashcardId;
    const userId = getCurrentUserId(req);
    try {
        // Call the unified function with the specific requested ID
        const viewData = await flashCardService.prepareFlashcardViewData(requestedFlashcardId, userId);
        // Check if the specific card was found and returned
        if (!viewData || !viewData.currentCard || viewData.currentCard.id !== requestedFlashcardId) {
            return res.status(404).render('error', { message: 'Flashcard not found.' });
        }
        // Render the study template
        res.render('flashCard/flashCard_dataFilled', viewData); // Verify template name
    } catch (error) {
        console.error(`Error rendering flashcard ${requestedFlashcardId}:`, error);
        res.status(500).render('error', { message: 'Failed to load flashcard.' });
    }
});

// --- POST, PUT, DELETE routes remain the same ---
router.post('/', async (req, res) => { /* ... */ });
router.put('/:id', validateIdParam, async (req, res) => { /* ... */ });
router.delete('/:id', validateIdParam, async (req, res) => { /* ... */ });

// --- GET / list route remains the same ---
router.get('/', async (req, res) => { /* ... renders list template ... */ });

export default router;