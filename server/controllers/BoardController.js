import Board from '../models/Board.js';

export const getBoard = async (req, res) => {
    try{
        const {id} = req.params;
        const board = await Board.findById(id).populate({
            path: 'columnOrder',
            populate:{
                path:'cardOrder',
                model:'Card'
            }
        });
        if (!board) {
            return res.status(404).json({ message: 'Board não encontrado'});
        }
        res.status(200).json(board);
    } catch (error) {
        res.status(500).json({ menssage: error.message});
    }
};

export const getBoards = async( req, res) => {
    try {
        const boards = await Board.find();
        res.status(200).json(boards);
    } catch (error){
        res.status(500).json({ message:error.message});
    }
};