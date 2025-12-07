 Kanban Task Manager

Um aplicativo Fullstack de gerenciamento de tarefas estilo Kanban (inspirado no Trello), desenvolvido para facilitar a organização visual de projetos. O sistema permite criar tarefas, arrastar e soltar itens entre colunas e mantém a persistência dos dados e da ordem dos cards no banco de dados.

![Status Concluído](https://img.shields.io/static/v1?label=Status&message=Concluído&color=SUCCESS&style=for-the-badge)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)

## 🚀 Funcionalidades

- **Gerenciamento de Quadro:** Visualização clara de colunas (A Fazer, Em Progresso, Concluído).
- **Drag & Drop (Arrastar e Soltar):** Movimentação fluida de cards entre colunas ou reordenação na mesma lista.
- **Persistência de Dados:** Integração completa com MongoDB; a posição dos cards é salva automaticamente.
- **Criação de Tarefas:** Adição dinâmica de novos cards em qualquer coluna.
- **Arquitetura MVC:** Backend organizado em Models, Views (Routes) e Controllers.

## 🛠️ Tecnologias Utilizadas

### Frontend (`/client`)
- **React** (Vite)
- **TypeScript** (Tipagem estática para segurança do código)
- **@hello-pangea/dnd** (Biblioteca moderna para Drag & Drop)
- **Axios** (Consumo de API REST)
- **CSS** (Estilização limpa e responsiva)

### Backend (`/server`)
- **Node.js** & **Express**
- **MongoDB Atlas** (Banco de dados na nuvem)
- **Mongoose** (ODM para modelagem de dados)
- **Dotenv** (Gerenciamento de variáveis de ambiente)
- **Cors** (Segurança e permissão de acesso)

---

## 📦 Como rodar o projeto localmente

Siga os passos abaixo para ter o projeto rodando na sua máquina.

### Pré-requisitos
- Node.js instalado
- Uma conta no MongoDB Atlas (ou uma instância local do MongoDB)

### 1. Configurar o Backend (Servidor)

Entre na pasta do servidor e instale as dependências:
```bash
cd server
npm install
````

Crie um arquivo `.env` na pasta `server` com as seguintes variáveis (substitua pela sua string de conexão):

```env
MONGO_URI=mongodb+srv://SEU_USUARIO:SUA_SENHA@cluster0.exemplo.mongodb.net/my-kanban
PORT=5000
```

Popule o banco de dados com os dados iniciais (Seed):

```bash
node seed.js
# Você deve ver a mensagem: "Banco populado com sucesso!"
```

Inicie o servidor:

```bash
npm run dev
```

*O backend rodará em `http://localhost:5000`*

### 2\. Configurar o Frontend (Cliente)

Abra um **novo terminal**, entre na pasta do cliente e instale as dependências:

```bash
cd client
npm install
```

Inicie o frontend:

```bash
npm run dev
```

*Acesse o projeto no navegador (geralmente em `http://localhost:5173`)*

-----

## 🔗 Estrutura da API (Backend)

O backend fornece os seguintes endpoints RESTful:

| Método | Rota               | Descrição                                      |
|--------|--------------------|------------------------------------------------|
| GET    | `/api/Boards`      | Retorna todos os quadros disponíveis.          |
| GET    | `/api/Boards/:id`  | Retorna um quadro específico com colunas/cards.|
| POST   | `/api/Cards`       | Cria um novo card em uma coluna específica.    |
| PUT    | `/api/Columns/:id` | Atualiza a ordem dos cards (Drag & Drop).      |

-----

## 📝 Licença

Este projeto foi desenvolvido para fins de estudo e portfólio. Sinta-se à vontade para contribuir ou utilizar como base para seus projetos.

-----

Feito com 💙 por [isabella Gonçalves]

