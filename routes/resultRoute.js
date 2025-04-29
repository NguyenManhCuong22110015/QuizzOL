import {Router} from 'express'
import resultService from '../services/resultService.js'


const router = new Router()

router.put('/complete/:currentResultId', async (req, res) => {
    try {
        const { currentResultId } = req.params;
        console.log('Received resultId:', currentResultId);

        if (!currentResultId) {
            return res.status(400).json({ error: 'Missing required field: currentResultId' });
        }

        // Assuming you have a service to complete the result
        const response = await resultService.completeResult(currentResultId); 
        await resultService.calculateScore(currentResultId);


        if (response) {
            return res.status(200).json({ message: 'Result completed successfully' });
        } else {
            return res.status(500).json({ error: 'Failed to complete result' });
        }
    }
    catch(error) {
        console.error('Error completing result:', error);
        res.status(500).json({ error: 'Failed to complete result' });
    }
})





export default router