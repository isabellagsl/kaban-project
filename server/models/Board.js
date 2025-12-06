import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  columnOrder: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'Column' }
  ]
});

export default mongoose.model('Board', BoardSchema);