import { Router, Request, Response } from 'express';
import { askFixMateAi } from '../services/geminiService.js';

export const aiRouter = Router();

// POST /api/ai/chat
aiRouter.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { prompt, history = [] } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ success: false, message: 'A text prompt is required.' });
      return;
    }

    const result = await askFixMateAi(prompt, history);

    res.json({
      success: true,
      data: {
        reply: result.reply,
        toolCalls: result.toolCalls || [],
        suggestedCategory: (result as any).suggestedCategory,
      },
    });
  } catch (error: any) {
    console.error('AI Route Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process FixMate AI request. Please try again.',
      error: error.message,
    });
  }
});
