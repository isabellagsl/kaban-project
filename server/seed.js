import mongoose from 'mongoose';
import dotenv from 'dotenv';


import Board from './models/Board.js';
import Column from './models/Column.js';
import Card from './models/Card.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🌱 Conectado ao Mongo para semear...");

    // Limpa o banco
    await Board.deleteMany({});
    await Column.deleteMany({});
    await Card.deleteMany({});

    // Cria dados iniciais
    const newBoard = await Board.create({ title: "Projeto Kanban 1.0" });
    
    const colTodo = await Column.create({ title: "A Fazer", boardId: newBoard._id });
    const colDoing = await Column.create({ title: "Em Progresso", boardId: newBoard._id });
    const colDone = await Column.create({ title: "Concluído", boardId: newBoard._id });

    newBoard.columnOrder = [colTodo._id, colDoing._id, colDone._id];
    await newBoard.save();

    const card1 = await Card.create({ title: "Estudar React", columnId: colTodo._id, boardId: newBoard._id });
    const card2 = await Card.create({ title: "Configurar Banco", columnId: colTodo._id, boardId: newBoard._id });
    
    colTodo.cardOrder.push(card1._id, card2._id);
    await colTodo.save();

    console.log("Banco populado com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro:", error);
    process.exit(1);
  }
};

seedDatabase();