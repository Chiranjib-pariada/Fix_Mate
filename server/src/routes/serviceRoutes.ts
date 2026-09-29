import { Router, Request, Response } from 'express';
import { db } from '../db/inMemoryStore.js';

export const serviceRouter = Router();

// GET /api/services
serviceRouter.get('/', (req: Request, res: Response): void => {
  const { category, search } = req.query;

  let results = [...db.services];

  if (category) {
    const cat = String(category).toLowerCase();
    results = results.filter(s => s.categorySlug === cat || s.categoryId === cat);
  }

  if (search) {
    const q = String(search).toLowerCase();
    results = results.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.description.toLowerCase().includes(q) ||
      s.categorySlug.toLowerCase().includes(q)
    );
  }

  res.json({
    success: true,
    count: results.length,
    data: results,
  });
});

// GET /api/categories
export const categoryRouter = Router();
categoryRouter.get('/', (req: Request, res: Response): void => {
  res.json({
    success: true,
    count: db.categories.length,
    data: db.categories,
  });
});
