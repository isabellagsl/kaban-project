import { useState, useEffect } from 'react';
// Importo os componentes de arrastar e soltar (o 'type DropResult'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import api from './api';

// INTERFACES (O contrato dos dados)
interface Card {
  _id: string;
  title: string;
}

interface Column {
  _id: string;
  title: string;
  cardOrder: Card[]; // A coluna tem uma lista de Cards dentro dela
}

interface Board {
  _id: string;
  title: string;
  columnOrder: Column[]; // O Board tem uma lista de Colunas
}

function App() {
  // Estado principal: aqui fica o quadro completo
  const [board, setBoard] = useState<Board | null>(null);
  // Estado de carregamento pra não mostrar tela branca pro usuário
  const [loading, setLoading] = useState<boolean>(true);
  
  // Estado para controlar o que estou digitando em cada input de "Novo Card"
  // Uso um objeto onde a chave é o ID da coluna e o valor é o texto digitado
  const [newCardText, setNewCardText] = useState<{ [key: string]: string }>({});

  // BUSCAR DADOS (Roda assim que abro a tela)
  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const { data: boards } = await api.get<Board[]>('/Boards');
      
      if (boards.length > 0) {
        // Pego o ID do primeiro quadro que achar
        const firstBoardId = boards[0]._id;
        // Busco os detalhes completos (Colunas + Cards)
        const { data: fullBoard } = await api.get<Board>(`/Boards/${firstBoardId}`);
        setBoard(fullBoard);
      }
    } catch (error) {
      console.error("Ops, erro ao buscar dados:", error);
    } finally {
      // Terminando ou não, aviso que parou de carregar
      setLoading(false);
    }
  }

  //CRIAR NOVO CARD
  const handleAddCard = async (columnId: string) => {
    const title = newCardText[columnId];
    if (!title || !board) return; // Se não tem texto, não faço nada

    try {
      // Primeiro salvo no Banco
      const { data: createdCard } = await api.post('/Cards', {
        title,
        columnId,
        boardId: board._id
      });

      // Se o banco aceitou,atualiza a tela na hora (sem precisar dar F5)
      const newBoard = structuredClone(board); // Faz uma cópia do board atual
      const column = newBoard.columnOrder.find(col => col._id === columnId);
      
      if (column) {
        column.cardOrder.push(createdCard); // Adiciona o card novo na lista
        setBoard(newBoard); // Manda o React desenhar a tela nova
      }

      // Limpa o campo de texto dessa coluna
      setNewCardText(prev => ({ ...prev, [columnId]: '' }));

    } catch (error) {
      console.error("Erro ao criar card:", error);
    }
  };

  // DRAG & DROP (Com Persistência)
  const onDragEnd = async (result: DropResult) => {
    const { destination, source } = result;

    // Se soltar o card fora de qualquer coluna, cancela tudo
    if (!destination) return;

    // Se soltar exatamente onde já estava, não gasta processamento
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!board) return;

    // Cria uma cópia profunda do board para poder mexer à vontade sem quebrar o React
    const newBoard = structuredClone(board);

    // Descobre de qual coluna saiu e pra qual coluna foi
    const startColumn = newBoard.columnOrder.find(col => col._id === source.droppableId);
    const finishColumn = newBoard.columnOrder.find(col => col._id === destination.droppableId);

    if (!startColumn || !finishColumn) return;

    // --- CENÁRIO A: Movi o card dentro da MESMA coluna ---
    if (startColumn === finishColumn) {
      const newCardOrder = Array.from(startColumn.cardOrder);
      
      // 1. Tiro o card da posição antiga
      const [movedCard] = newCardOrder.splice(source.index, 1);
      // 2. Coloco na nova posição
      newCardOrder.splice(destination.index, 0, movedCard);

      // Atualizo a coluna e mostro na tela imediatamente
      startColumn.cardOrder = newCardOrder;
      setBoard(newBoard);

      // Salvar no banco
      try {
        // Extraio só os IDs para mandar pro backend
        const cardIds = newCardOrder.map(card => card._id);
        // Chamo a rota PUT /Columns 
        await api.put(`/Columns/${startColumn._id}`, { cardOrder: cardIds });
      } catch (error) {
        console.error("Deu erro ao salvar a ordem no banco:", error);
      }

    } 
    // --- CENÁRIO B: Movi o card para OUTRA coluna ---
    else {
      const startCardOrder = Array.from(startColumn.cardOrder);
      const finishCardOrder = Array.from(finishColumn.cardOrder);

      // 1. Tiro da coluna de origem
      const [movedCard] = startCardOrder.splice(source.index, 1);
      // 2. Coloco na coluna de destino
      finishCardOrder.splice(destination.index, 0, movedCard);

      // Atualizo as duas colunas e mostro na tela
      startColumn.cardOrder = startCardOrder;
      finishColumn.cardOrder = finishCardOrder;
      setBoard(newBoard);

      // Salvar no banco(As duas colunas mudaram!)
      try {
        const startIds = startCardOrder.map(card => card._id);
        const finishIds = finishCardOrder.map(card => card._id);

        // Uso Promise.all para salvar as duas ao mesmo tempo e ser mais rápido
        await Promise.all([
          api.put(`/Columns/${startColumn._id}`, { cardOrder: startIds }),
          api.put(`/Columns/${finishColumn._id}`, { cardOrder: finishIds })
        ]);
      } catch (error) {
        console.error("Deu erro ao trocar de coluna no banco:", error);
      }
    }
  };
//estilização
  if (loading) return <div style={{ color: 'white', padding: 20 }}>Carregando meu Kanban...</div>;
  if (!board) return <div style={{ color: 'white', padding: 20 }}>Nenhum quadro encontrado.</div>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ padding: '20px', height: '100%' }}>
        <h1 style={{ color: 'white', marginBottom: '20px' }}>{board.title}</h1>

        <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
          {board.columnOrder.map((column) => (
            <div
              key={column._id}
              style={{
                background: '#ebecf0',
                borderRadius: '3px',
                width: '280px',
                padding: '10px',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '100%'
              }}
            >
              <h3 style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '600' }}>
                {column.title}
              </h3>

              {/* Área onde posso soltar os cards */}
              <Droppable droppableId={column._id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{ minHeight: '10px' }} // Altura mínima pra eu conseguir soltar algo se estiver vazio
                  >
                    {column.cardOrder.map((card, index) => (
                      <Draggable key={card._id} draggableId={card._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              background: 'white',
                              padding: '10px',
                              marginBottom: '8px',
                              borderRadius: '3px',
                              boxShadow: '0 1px 0 rgba(9,30,66,.25)',
                              fontSize: '14px',
                              ...provided.draggableProps.style
                            }}
                          >
                            {card.title}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* Input para adicionar novo card no final da coluna */}
              <div style={{ marginTop: '10px' }}>
                <input 
                  type="text" 
                  placeholder="+ Add card"
                  value={newCardText[column._id] || ''}
                  onChange={(e) => setNewCardText({ ...newCardText, [column._id]: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddCard(column._id);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '3px',
                    border: '1px solid #ccc'
                  }}
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