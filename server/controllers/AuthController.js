import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Verifica se usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email já cadastrado.' });
    }

    // 2. Criptografa senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Cria usuário
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // 4. Gera Token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'segredo123', {
      expiresIn: '1d',
    });

    res.status(201).json({ 
      token, 
      user: { id: newUser._id, name: newUser.name, email: newUser.email } 
    });

  } catch (error) {
    console.log("ERRO NO CADASTRO:", error); // Isso vai mostrar o erro no terminal
    res.status(500).json({ message: 'Erro no servidor: ' + error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Senha incorreta.' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'segredo123', { expiresIn: '1d' });

    res.status(200).json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};