import express from 'express'; //mini–framework de Node,monta rotas
import { getBoard, getBoards } from '../controllers/BoardController.js';

const router = express.Router();

router.get('/', getBoards);
router.get('/', getBoard);
export default router; 