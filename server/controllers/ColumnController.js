import Column from '../models/Column.js';

export const updateColumn = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardOrder } = req.body; // Recebe o array de IDs novo

    // Atualiza a coluna no banco com a nova ordem
    const updatedColumn = await Column.findByIdAndUpdate(
      id,
      { cardOrder },
      { new: true }
    );

    res.status(200).json(updatedColumn);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};