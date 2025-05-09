import flashCardRepository from '../repositories/flashCardRepository.js';

export default {
    /**
     * Gets basic user information for the flashcard view.
     * @param {number|string|null} userId - ID of the user (or null/undefined).
     * @returns {Promise<object>} - User info object.
     */
    async getUserInfo(userId) {
        const defaultInfo = { 
            username: "Guest User", 
            avatarUrl: null, 
            avatarInitials: "G", 
            streakDays: 0 
        };
        
        if (!userId || isNaN(parseInt(userId, 10))) { 
            return defaultInfo; 
        }
        
        try {
            const user = await flashCardRepository.getUserById(userId);
            
            if (!user) { 
                return { 
                    ...defaultInfo, 
                    username: "Unknown User", 
                    avatarInitials: "?" 
                }; 
            }
            
            const initials = user.username ? user.username.charAt(0).toUpperCase() : '?';
            const streakDays = await flashCardRepository.getUserStreakDays(userId);
            
            return {
                username: user.username,
                avatarUrl: user.avatarUrl,
                avatarInitials: initials,
                streakDays: streakDays,
            };
        } catch (error) {
            console.error(`Error getting user info for user ${userId}:`, error);
            return defaultInfo;
        }
    },

    /**
     * Process flashcards data from repository for display
     * @returns {Promise<Array>} - Processed flashcards array
     */
    async getAllFlashcardsForDisplay() {
        try {
            const flashcards = await flashCardRepository.getAllFlashcards();
            
            // Process image URLs
            flashcards.forEach(fc => {
                if (!fc.questionImageUrl && fc.questionImageUrlSource && 
                    !/^\d+$/.test(fc.questionImageUrlSource)) {
                    fc.questionImageUrl = fc.questionImageUrlSource;
                }
                delete fc.questionImageUrlSource;
            });
            
            return flashcards;
        } catch (error) {
            console.error('Error processing flashcards data:', error);
            throw error;
        }
    },

    /**
     * Prepares the complete data structure needed for rendering the flashcard study view.
     * @param {number|string|null} targetFlashcardId - The ID of the flashcard to display initially.
     * @param {number|string|null} userId - The ID of the current user for fetching user info.
     * @returns {Promise<object|null>} Object with flashcard view data or null if no flashcards exist.
     */
    async prepareFlashcardViewData(targetFlashcardId, userId) {
        const parsedTargetId = targetFlashcardId ? parseInt(targetFlashcardId, 10) : null;

        try {
            // Fetch all cards data and user info concurrently
            const [allFlashcards, userInfo] = await Promise.all([
                this.getAllFlashcardsForDisplay(),
                this.getUserInfo(userId)
            ]);

            if (!allFlashcards || allFlashcards.length === 0) {
                return null; // No flashcards exist
            }

            // Find the index of the target card
            let targetIndex = -1;
            if (parsedTargetId && !isNaN(parsedTargetId)) {
                targetIndex = allFlashcards.findIndex(fc => fc.id === parsedTargetId);
            }

            // Default to first card if target not found
            if (targetIndex === -1) {
                targetIndex = 0;
            }

            const currentCardData = allFlashcards[targetIndex];
            if (!currentCardData) {
                console.error("prepareFlashcardViewData: Could not determine current card data.");
                return null;
            }

            // Prepare deck info
            const deckInfo = {
                totalCards: allFlashcards.length,
                learningCount: allFlashcards.length, // Placeholder
                masteredCount: 0,                    // Placeholder
            };

            // Prepare the specific 'currentCard' object for the view
            const currentCard = {
                ...currentCardData,
                index: targetIndex + 1, // 1-based index
                frontEmoji: "❓",      // Example default
                backEmoji: "💡"        // Example default
            };

            // Prepare JSON list with full data for client-side switching
            const allFlashcardsJson = JSON.stringify(allFlashcards);

            return {
                deckInfo,
                currentCard,
                userInfo,
                allFlashcardsJson
            };
        } catch (error) {
            console.error(`Error preparing flashcard view data (target ID: ${targetFlashcardId}):`, error);
            throw error;
        }
    },

    /**
     * Create a new flashcard
     * @param {object} data - The flashcard data
     * @returns {Promise<number>} - ID of the created flashcard
     */
    async createFlashcard(data) {
        return flashCardRepository.createFlashcard(data);
    },
    
    /**
     * Update an existing flashcard
     * @param {number} flashcardId - ID of the flashcard to update
     * @param {object} data - New flashcard data
     * @returns {Promise<boolean>} - Success indicator
     */
    async updateFlashcard(flashcardId, data) {
        const result = await flashCardRepository.updateFlashcard(flashcardId, data);
        return result > 0;
    },
    
    /**
     * Delete a flashcard
     * @param {number} flashcardId - ID of the flashcard to delete
     * @returns {Promise<boolean>} - Success indicator
     */
    async deleteFlashcard(flashcardId) {
        const result = await flashCardRepository.deleteFlashcard(flashcardId);
        return result > 0;
    },
    
    /**
     * Get a specific flashcard by ID
     * @param {number} flashcardId - ID of the flashcard
     * @returns {Promise<object|null>} - Flashcard object or null
     */
    async getFlashcardById(flashcardId) {
        return flashCardRepository.getFlashcardById(flashcardId);
    }
};