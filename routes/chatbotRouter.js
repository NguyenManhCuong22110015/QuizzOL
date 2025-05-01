import e from 'connect-flash'
import  {Router} from 'express'
import { testGeminiFunctionCalling } from '../ai/geminiClient.js'

const router = new Router()

router.get("/test", async (req, res) => {
    const prompt = req.query.prompt;

    try {
      const result = await testGeminiFunctionCalling(prompt);
      res.json({ success: true, result });
    } catch (error) {
      console.error("❌ Lỗi ở router:", error);
      res.status(500).json({ success: false, error: 'Đã xảy ra lỗi.' });
    }
})



export default router