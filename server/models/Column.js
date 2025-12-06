import mongoose from 'mongoose';

const ColumnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  boardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  cardOrder: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Card' }
  ]
});

export default mongoose.model('Column', ColumnSchema);