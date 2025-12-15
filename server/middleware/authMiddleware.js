import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;

  // 1. Verifica se o cabeçalho existe e começa com "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Pega o token (remove a palavra "Bearer ")
      token = req.headers.authorization.split(' ')[1];
      
      console.log("🔍 Token Recebido:", token); // <--- DEBUG NO TERMINAL

      // Decodifica o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo123'); // Usa um fallback caso o .env falhe

      // Busca o usuário no banco (sem a senha)
      req.user = await User.findById(decoded.id).select('-password');

      console.log("✅ Usuário Autenticado:", req.user ? req.user.name : "Não encontrado no banco");

      next(); // Pode passar!
    } catch (error) {
      console.error("❌ Erro na validação do token:", error.message);
      res.status(401).json({ message: 'Token inválido ou expirado' });
    }
  }

  if (!token) {
    console.log("⛔ Nenhum token encontrado no cabeçalho");
    res.status(401).json({ message: 'Não autorizado, sem token' });
  }
};