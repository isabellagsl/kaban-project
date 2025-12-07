import Card from '../models/Card.js';
import Column from '../models/Column.js';

export const createCard = async (req, res) => {
  try {
    const { title, columnId, boardId } = req.body;

    // cria o Card novo
    const newCard = await Card.create({ title, columnId, boardId });

    // Adiciona o ID do card no final da lista da Coluna correspondente
    await Column.findByIdAndUpdate(columnId, {
      $push: { cardOrder: newCard._id }
    });

    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};