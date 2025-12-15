import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Board from './models/Board.js'; 
import Column from './models/Column.js'
import BoardRoutes from './routes/BoardRoutes.js';
import CardRoutes from './routes/CardRoutes.js';
import ColumnRoutes from './routes/ColumnRoutes.js'
import AuthRoutes from './routes/AuthRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/setup', async (req, res) => {
  try {
    // 1.

    await Board.deleteMany({});
    await Column.deleteMany({});
// 2. Cria Colunas
    const col1 = await Column.create({ title: 'A Fazer', cardOrder: [] });
    const col2 = await Column.create({ title: 'Em Andamento', cardOrder: [] });
    const col3 = await Column.create({ title: 'Concluído', cardOrder: [] });

    // 3. Cria o Quadro
    const newBoard = await Board.create({
      title: 'Meu Quadro',
      columnOrder: [col1._id, col2._id, col3._id]
    });

    res.send(`
      <h1>Sucesso!</h1>
      <p>Quadro criado com ID: ${newBoard._id}</p>
      <p>Pode voltar para o App e dar F5.</p>
    `);
  } catch (err) {
    res.status(500).send('Erro: ' + err.message);
  }
});


// Middlewares
app.use(cors()); // Libera acesso para o Front-end
app.use(express.json()); // Permite receber JSON no body

// Rotas
app.use('/api/Boards', BoardRoutes);
app.use('/api/Cards', CardRoutes);
app.use('/api/Columns', ColumnRoutes);
app.use('/api/auth', AuthRoutes);

// Conexão com Banco e Start do Server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => console.log(err));