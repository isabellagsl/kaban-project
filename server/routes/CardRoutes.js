import express from 'express';
import { createCard } from '../controllers/CardController.js';

const router = express.Router();


router.post('/', createCard);   
export default router;