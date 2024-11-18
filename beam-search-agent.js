// Beam Search implementation for Tetris
class BeamSearchAgent {
    constructor(beamWidth = 3, depth = 2) {
        this.beamWidth = beamWidth;
        this.depth = depth;
    }

    // Get best move using beam search
    getBestMove(currentPiece, board, nextPieces) {
        // Initialize beam with current state
        let beam = [{
            board: copyBlocks(board),
            score: 0,
            moves: [],
            linesCleared: 0
        }];

        // Perform beam search for specified depth
        for (let d = 0; d < this.depth; d++) {
            let candidates = [];
            
            // Expand each state in the beam
            for (let state of beam) {
                const piece = d === 0 ? currentPiece : nextPieces[d - 1];
                const moves = this.getPossibleMoves(piece, state.board);
                
                // Generate new states for each possible move
                for (let move of moves) {
                    const newBoard = this.applyMove(move, state.board);
                    const linesCleared = this.clearLines(newBoard);
                    const score = this.evaluateState(newBoard, state.score, linesCleared);
                    
                    candidates.push({
                        board: newBoard,
                        score: score,
                        moves: [...state.moves, move],
                        linesCleared: state.linesCleared + linesCleared
                    });
                }
            }
            
            // Select top states for next beam
            beam = this.selectTopStates(candidates, this.beamWidth);
        }

        // Return first move of best sequence
        return beam[0].moves[0];
    }

    // Get all possible moves for a piece
    getPossibleMoves(piece, board) {
        let moves = [];
        for (let dir = 0; dir < 4; dir++) {
            piece.dir = dir;
            for (let x = 0; x < nx - piece.type.size + 1; x++) {
                let y = this.getDropPosition(piece, x, board);
                moves.push({
                    piece: {...piece},
                    x: x,
                    y: y
                });
            }
        }
        return moves;
    }

    // Apply move to board and return new board state
    applyMove(move, board) {
        const newBoard = copyBlocks(board);
        eachblock(move.piece.type, move.x, move.y, move.piece.dir, function(x, y) {
            if (x >= 0 && x < nx && y >= 0 && y < ny) {
                newBoard[x][y] = move.piece.type;
            }
        });
        return newBoard;
    }

    // Clear complete lines and return number of lines cleared
    clearLines(board) {
        let linesCleared = 0;
        for (let y = ny - 1; y >= 0; y--) {
            let complete = true;
            for (let x = 0; x < nx; x++) {
                if (!board[x][y]) {
                    complete = false;
                    break;
                }
            }
            if (complete) {
                linesCleared++;
                // Move all lines above down
                for (let y2 = y; y2 > 0; y2--) {
                    for (let x = 0; x < nx; x++) {
                        board[x][y2] = board[x][y2-1];
                    }
                }
                // Clear top line
                for (let x = 0; x < nx; x++) {
                    board[x][0] = 0;
                }
                y++; // Recheck same line
            }
        }
        return linesCleared;
    }

    // Select top N states based on score
    selectTopStates(states, n) {
        return states
            .sort((a, b) => b.score - a.score)
            .slice(0, n);
    }

    // Evaluate state using enhanced heuristics
    evaluateState(board, previousScore, newLinesCleared) {
        const baseScore = evaluateBoard(board);
        const lineScore = Math.pow(2, newLinesCleared - 1) * 100;
        return baseScore + previousScore + lineScore;
    }

    // Get lowest possible position for piece
    getDropPosition(piece, x, board) {
        let y = 0;
        while (!this.occupied(piece.type, x, y + 1, piece.dir, board)) {
            y++;
        }
        return y;
    }

    // Check if position is occupied
    occupied(type, x, y, dir, board) {
        let result = false;
        eachblock(type, x, y, dir, function(x, y) {
            if ((x < 0) || (x >= nx) || (y < 0) || (y >= ny) || board[x][y]) {
                result = true;
            }
        });
        return result;
    }
}

// Create beam search agent and integrate with game
const beamSearchAgent = new BeamSearchAgent(3, 2);

// Modified agent function to use beam search
function agent() {
    const nextPieces = [next]; // In a real implementation, you'd want more next pieces
    const bestMove = beamSearchAgent.getBestMove(current, blocks, nextPieces);
    
    if (bestMove) {
        current.x = bestMove.x;
        current.y = bestMove.y;
        current.dir = bestMove.piece.dir;
        drop();
    }
}
