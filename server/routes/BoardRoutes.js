import express from 'express';
import { getBoard, getBoards } from '../controllers/BoardController.js'; 

const router = express.Router();


router.get('/', getBoards);     
router.get('/:id', getBoard);    

export default router;