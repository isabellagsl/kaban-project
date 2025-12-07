import express from 'express';
import { updateColumn } from '../controllers/ColumnController.js';

const router = express.Router();

// Rota PUT para atualizar (ex: /api/Columns/123)
router.put('/:id', updateColumn);

export default router;