// Improved heuristic evaluation function
function evaluateBoard(board) {
    let aggregateHeight = 0;
    let completeLines = 0;
    let holes = 0;
    let bumpiness = 0;
    let wellSum = 0;
    let blockades = 0;
    let columnHeights = new Array(nx).fill(0);
    let maxHeight = 0;

    // Calculate column heights
    for (let x = 0; x < nx; x++) {
        for (let y = 0; y < ny; y++) {
            if (board[x][y] !== 0) {
                columnHeights[x] = ny - y;
                aggregateHeight += columnHeights[x];
                maxHeight = Math.max(maxHeight, columnHeights[x]);
                break;
            }
        }
    }

    // Calculate complete lines
    for (let y = 0; y < ny; y++) {
        let complete = true;
        for (let x = 0; x < nx; x++) {
            if (board[x][y] === 0) {
                complete = false;
                break;
            }
        }
        if (complete)
            completeLines++;
    }

    // Calculate holes and blockades
    for (let x = 0; x < nx; x++) {
        let blockFound = false;
        let blocksAbove = 0;
        for (let y = 0; y < ny; y++) {
            if (board[x][y] !== 0) {
                blockFound = true;
                blocksAbove++;
            } else if (blockFound && board[x][y] === 0) {
                holes++;
                blockades += blocksAbove;
            }
        }
    }

    // Calculate bumpiness and wells
    for (let x = 0; x < nx - 1; x++) {
        bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1]);
        
        // Check for wells
        if (x > 0) {
            const leftHeight = columnHeights[x - 1];
            const currentHeight = columnHeights[x];
            const rightHeight = columnHeights[x + 1];
            
            if (currentHeight < leftHeight && currentHeight < rightHeight) {
                wellSum += Math.min(leftHeight - currentHeight, rightHeight - currentHeight);
            }
        }
    }

    // New features weights
    const heightWeight = -0.51;
    const linesWeight = 0.76;
    const holesWeight = -0.36;
    const bumpinessWeight = -0.18;
    const wellSumWeight = -0.12;
    const blockadeWeight = -0.05;
    const maxHeightPenalty = maxHeight > ny * 0.75 ? -0.2 : 0; // Penalize high stacks

    // Combine features into a heuristic score
    return (heightWeight * aggregateHeight) +
           (linesWeight * completeLines) +
           (holesWeight * holes) +
           (bumpinessWeight * bumpiness) +
           (wellSumWeight * wellSum) +
           (blockadeWeight * blockades) +
           maxHeightPenalty;
}

// Enhanced move selection with look-ahead
function selectBestMove(piece, board) {
    const moves = getPossibleMoves(piece);
    let bestMove = null;
    let bestScore = -Infinity;
    
    moves.forEach(move => {
        // Evaluate current move
        let score = evaluateBoard(move.board);
        
        // Look ahead one piece
        const nextPiece = next; // Using the global next piece
        if (nextPiece) {
            const nextMoves = getPossibleMoves({...nextPiece, x: 0, y: 0});
            let bestNextScore = -Infinity;
            
            // Find best next move
            nextMoves.forEach(nextMove => {
                const nextScore = evaluateBoard(nextMove.board);
                bestNextScore = Math.max(bestNextScore, nextScore);
            });
            
            // Combine current and future scores with weight
            score = score * 0.7 + bestNextScore * 0.3;
        }
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    
    return bestMove;
}

// Helper function to get all possible positions for a piece
function getPossibleMoves(piece) {
    let moves = [];
    // For each rotation of the piece
    for (let dir = 0; dir < 4; dir++) {
        piece.dir = dir;
        // For each horizontal position
        for (let x = 0; x < nx - piece.type.size + 1; x++) {
            let y = getDropPosition(piece, x);
            let new_blocks = copyBlocks(blocks);
            eachblock(piece.type, x, y, piece.dir, function(x, y) {
                if (x >= 0 && x < nx && y >= 0 && y < ny) {
                    new_blocks[x][y] = piece.type;
                }
            });
            moves.push({piece: {...piece}, x: x, y: y, board: new_blocks});
        }
    }
    return moves;
}
