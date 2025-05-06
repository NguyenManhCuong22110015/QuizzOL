// services/flashCardService.js (Revised based on provided router)

import db from '../configs/db.js'; // Adjust path as needed

export default {

    /**
     * Fetches all flashcards with their associated question/answer data.
     * This is used as a helper by prepareFlashcardViewData.
     * @returns {Promise<Array>} - An array of all flashcard objects.
     */
    async getAllFlashcards() {
        // --- This implementation is kept from previous steps ---
        // It fetches f.id, f.name as flashcardName, f.method_type, f.question as questionId,
        // q.content as questionText, q.img_url handling, and answerText
        try {
             const flashcards = await db('flashcard as f')
                 .join('question as q', 'f.question', 'q.id')
                 .leftJoin(db.raw(`(SELECT question_id, GROUP_CONCAT(content SEPARATOR '; ') AS answer_text FROM \`option\` WHERE isCorrect = 1 GROUP BY question_id) as correct_options`), 'q.id', 'correct_options.question_id')
                 .leftJoin('media as m', builder => { builder.on(db.raw('CAST(q.img_url AS SIGNED)'), '=', 'm.id').andOn(db.raw('q.img_url REGEXP \'^[0-9]+$\'')); })
                 .select(
                     'f.id', 'f.name as flashcardName', 'f.method_type', 'f.question as questionId',
                     'q.content as questionText', 'q.img_url as questionImageUrlSource', 'm.url as questionImageUrl',
                     db.raw('COALESCE(correct_options.answer_text, \'Correct answer not set\') as answerText')
                 )
                 .orderBy('f.id');

            flashcards.forEach(fc => {
                if (!fc.questionImageUrl && fc.questionImageUrlSource && !/^\d+$/.test(fc.questionImageUrlSource)) { fc.questionImageUrl = fc.questionImageUrlSource; }
                delete fc.questionImageUrlSource;
            });
            return flashcards;
        } catch (error) { console.error('Error fetching all flashcards:', error); throw error; }
    },

    /**
     * Gets basic user information. Used by prepareFlashcardViewData.
     * @param {number|string|null} userId - ID of the user (or null/undefined).
     * @returns {Promise<object>} - User info object.
     */
    async getUserInfo(userId) {
       // --- This implementation is kept from previous steps ---
       const defaultInfo = { username: "Guest User", avatarUrl: null, avatarInitials: "G", streakDays: 0 };
       if (!userId || isNaN(parseInt(userId, 10))) { return defaultInfo; }
       try {
           const user = await db('user').leftJoin('media', 'user.avatar', 'media.id').where('user.id', userId).first('user.username', 'media.url as avatarUrl');
           if (!user) { return { ...defaultInfo, username: "Unknown User", avatarInitials: "?" }; }
           const initials = user.username ? user.username.charAt(0).toUpperCase() : '?';
           const streakDays = 0; // Placeholder
           return { username: user.username, avatarUrl: user.avatarUrl, avatarInitials: initials, streakDays: streakDays, };
       } catch (error) { console.error(`Error fetching info for user ${userId}:`, error); return defaultInfo; }
   },


    /**
     * Prepares the complete data structure needed for rendering the flashcard study view (flashCard/flashCard.hbs).
     * Handles both starting a session (targetFlashcardId is null/invalid -> uses first card)
     * and loading a specific card.
     * Called by both GET /study and GET /:id routes.
     * @param {number|string|null} targetFlashcardId - The ID of the flashcard to display initially, or null/invalid to default to the first card.
     * @param {number|string|null} userId - The ID of the current user for fetching user info.
     * @returns {Promise<object|null>} Object { deckInfo, currentCard, userInfo, allFlashcardsJson } or null if no flashcards exist.
     */
    async prepareFlashcardViewData(targetFlashcardId, userId) {
        // Renamed from getStudySessionData and made to handle both cases
        const parsedTargetId = targetFlashcardId ? parseInt(targetFlashcardId, 10) : null;

        try {
            // Fetch all cards data and user info concurrently
            const [allFlashcards, userInfo] = await Promise.all([
                this.getAllFlashcards(), // Fetches full data for all cards
                this.getUserInfo(userId)
            ]);

            if (!allFlashcards || allFlashcards.length === 0) {
                // No flashcards exist at all
                return null; // Signal no data
            }

            // Find the index of the target card
            let targetIndex = -1;
            if (parsedTargetId && !isNaN(parsedTargetId)) {
                 targetIndex = allFlashcards.findIndex(fc => fc.id === parsedTargetId);
            }

            // If target ID not found or wasn't provided, default to the first card
            if (targetIndex === -1) {
                targetIndex = 0;
            }

            const currentCardData = allFlashcards[targetIndex];
            // If somehow targetIndex is out of bounds (e.g., empty array check failed), return null
             if (!currentCardData) {
                 console.error("prepareFlashcardViewData: Could not determine current card data.");
                 return null;
             }

            // Prepare deck info
            const deckInfo = {
                totalCards: allFlashcards.length,
                learningCount: allFlashcards.length, // Placeholder
                masteredCount: 0,                 // Placeholder
            };

            // Prepare the specific 'currentCard' object for the view
            const currentCard = {
                ...currentCardData,
                index: targetIndex + 1, // 1-based index
                frontEmoji: "❓",      // Example default
                backEmoji: "💡"       // Example default
            };

            // Prepare JSON list with *full data* for client-side switching
            const allFlashcardsJson = JSON.stringify(allFlashcards);

            return {
                deckInfo,
                currentCard,
                userInfo,
                allFlashcardsJson // Contains full data for each card
            };
        } catch (error) {
             console.error(`Error preparing flashcard view data (target ID: ${targetFlashcardId}):`, error);
             throw error; // Propagate error
        }
    },

    // --- Standard CRUD functions (kept from previous steps) ---
    createFlashcard: async function(data) { /* ... implementation ... */ },
    updateFlashcard: async function(flashcardId, data) { /* ... implementation ... */ },
    deleteFlashcard: async function(flashcardId) { /* ... implementation ... */ },
    getFlashcardById: async function(flashcardId) { /* ... implementation ... */ }, // Kept for potential API use

};