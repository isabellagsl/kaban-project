import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import api from './api';

// --- Interfaces ---
interface Card {
  _id: string;
  title: string;
}
interface Column {
  _id: string;
  title: string;
  cardOrder: Card[];
}
interface Board {
  _id: string;
  title: string;
  columnOrder: Column[];
}

function App() {
  // Estados de Autenticação
  const [token, setToken] = useState<string | null>(localStorage.getItem('kanban_token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // Estados do Kanban
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState<boolean>(false); // Começa false pois depende do login
  const [newCardText, setNewCardText] = useState<{ [key: string]: string }>({});

  // Efeito: Quando o token muda (login/logout), tenta buscar os dados
  useEffect(() => {
    if (token) {
      setLoading(true);
      fetchData();
    }
  }, [token]);

  // --- FUNÇÕES DE AUTH ---
  const handleLoginOrRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const route = isRegistering ? '/auth/register' : '/auth/login';
      const payload = isRegistering ? { name, email, password } : { email, password };
      
      const { data } = await api.post(route, payload);
      
      // Salva o token e atualiza o estado
      localStorage.setItem('kanban_token', data.token);
      setToken(data.token);
      alert(isRegistering ? 'Cadastro realizado! Bem-vindo .' : 'Login realizado!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro na autenticação');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('kanban_token');
    setToken(null);
    setBoard(null);
  };

  // --- FUNÇÕES DO KANBAN ---
  async function fetchData() {
    try {
      const { data: boards } = await api.get<Board[]>('/Boards');
      if (boards.length > 0) {
        const firstBoardId = boards[0]._id;
        const { data: fullBoard } = await api.get<Board>(`/Boards/${firstBoardId}`);
        setBoard(fullBoard);
      }
    } catch (error) {
      console.error("Erro ao buscar dados:", error);

      // Se der erro 401 (token inválido), faz logout
      //handleLogout();
    } finally {
      setLoading(false);
    }
  }

  const handleAddCard = async (columnId: string) => {
    const title = newCardText[columnId];
    if (!title || !board) return;

    try {
      const { data: createdCard } = await api.post('/Cards', {
        title,
        columnId,
        boardId: board._id
      });

      const newBoard = structuredClone(board);
      const column = newBoard.columnOrder.find(col => col._id === columnId);
      if (column) {
        column.cardOrder.push(createdCard);
        setBoard(newBoard);
      }
      setNewCardText(prev => ({ ...prev, [columnId]: '' }));
    } catch (error) {
      console.error("Erro ao criar card:", error);
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    if (!board) return;

    const newBoard = structuredClone(board);
    const startColumn = newBoard.columnOrder.find(col => col._id === source.droppableId);
    const finishColumn = newBoard.columnOrder.find(col => col._id === destination.droppableId);

    if (!startColumn || !finishColumn) return;

    if (startColumn === finishColumn) {
      const newCardOrder = Array.from(startColumn.cardOrder);
      const [movedCard] = newCardOrder.splice(source.index, 1);
      newCardOrder.splice(destination.index, 0, movedCard);
      startColumn.cardOrder = newCardOrder;
      setBoard(newBoard);

      try {
        const cardIds = newCardOrder.map(card => card._id);
        await api.put(`/Columns/${startColumn._id}`, { cardOrder: cardIds });
      } catch (error) {
        console.error("Erro ao salvar ordem:", error);
      }
    } else {
      const startCardOrder = Array.from(startColumn.cardOrder);
      const finishCardOrder = Array.from(finishColumn.cardOrder);
      const [movedCard] = startCardOrder.splice(source.index, 1);
      finishCardOrder.splice(destination.index, 0, movedCard);
      startColumn.cardOrder = startCardOrder;
      finishColumn.cardOrder = finishCardOrder;
      setBoard(newBoard);

      try {
        const startIds = startCardOrder.map(card => card._id);
        const finishIds = finishCardOrder.map(card => card._id);
        await Promise.all([
          api.put(`/Columns/${startColumn._id}`, { cardOrder: startIds }),
          api.put(`/Columns/${finishColumn._id}`, { cardOrder: finishIds })
        ]);
      } catch (error) {
        console.error("Erro ao salvar ordem:", error);
      }
    }
  };

  // --- RENDERIZAÇÃO ---

  // 1. Se não tiver token, mostra tela de Login
  if (!token) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column', color: 'white' }}>
        <h1 style={{ marginBottom: 20 }}>Kanban Login</h1>
        <form onSubmit={handleLoginOrRegister} style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 300 }}>
          {isRegistering && (
            <input 
              type="text" placeholder="Nome" value={name} onChange={e => setName(e.target.value)} required 
              style={{ padding: 10, borderRadius: 5, border: 'none' }}
            />
          )}
          <input 
            type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required 
            style={{ padding: 10, borderRadius: 5, border: 'none' }}
          />
          <input 
            type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required 
            style={{ padding: 10, borderRadius: 5, border: 'none' }}
          />
          <button type="submit" style={{ padding: 10, borderRadius: 5, border: 'none', background: '#0079bf', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRegistering ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>
        <button onClick={() => setIsRegistering(!isRegistering)} style={{ marginTop: 20, background: 'transparent', border: 'none', color: '#fff', textDecoration: 'underline', cursor: 'pointer' }}>
          {isRegistering ? 'Já tenho conta' : 'Criar conta nova'}
        </button>
      </div>
    );
  }

  // 2. Se tiver token, mostra o Kanban
  if (loading) return <div style={{ color: 'white', padding: 20 }}>Carregando...</div>;
  if (!board) return (
    <div style={{ color: 'white', padding: 20 }}>
      Nenhum quadro encontrado. 
      <button onClick={handleLogout} style={{ marginLeft: 10 }}>Sair</button>
    </div>
  );

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ padding: '20px', height: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h1 style={{ color: 'white' }}>{board.title}</h1>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: '#eb5a46', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Sair</button>
        </div>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          {board.columnOrder.map((column) => (
            <div key={column._id} style={{ background: '#ebecf0', borderRadius: '3px', width: '280px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '600' }}>{column.title}</h3>
              <Droppable droppableId={column._id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} style={{ minHeight: '10px' }}>
                    {column.cardOrder.map((card, index) => (
                      <Draggable key={card._id} draggableId={card._id} index={index}>
                        {(provided) => (
                          <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} 
                            style={{ background: 'white', padding: '10px', marginBottom: '8px', borderRadius: '3px', boxShadow: '0 1px 0 rgba(9,30,66,.25)', fontSize: '14px', ...provided.draggableProps.style }}>
                            {card.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              <div style={{ marginTop: '10px' }}>
                <input 
                  type="text" placeholder="+ Add card" value={newCardText[column._id] || ''} 
                  onChange={(e) => setNewCardText({ ...newCardText, [column._id]: e.target.value })}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddCard(column._id); }}
                  style={{ width: '100%', padding: '8px', borderRadius: '3px', border: '1px solid #ccc' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DragDropContext>
  );
}

export default App;