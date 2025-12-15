import express from 'express';
import { getBoard, getBoards } from '../controllers/BoardController.js'; 
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/', protect, getBoards);     
router.get('/:id', protect, getBoard);    

export default router;