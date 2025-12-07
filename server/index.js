import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import BoardRoutes from './routes/BoardRoutes.js';
import CardRoutes from './routes/CardRoutes.js';
import ColumnRoutes from './routes/ColumnRoutes.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors()); // Libera acesso para o Front-end
app.use(express.json()); // Permite receber JSON no body

// Rotas
app.use('/api/Boards', BoardRoutes);
app.use('/api/Cards', CardRoutes);
app.use('/api/Columns', ColumnRoutes);

// Conexão com Banco e Start do Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => console.log(err));