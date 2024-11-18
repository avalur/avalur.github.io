// Heuristic evaluation function
function evaluateBoard(board) {
    let aggregateHeight = 0;
    let completeLines = 0;
    let holes = 0;
    let bumpiness = 0;
    let columnHeights = new Array(nx).fill(0);

    // Calculate aggregate height and column heights
    for (let y = 0; y < ny; y++) {
        for (let x = 0; x < nx; x++) {
            if (board[x][y] !== 0) {
                columnHeights[x] = ny - y;
                aggregateHeight += columnHeights[x];
                break;
            }
        }
    }

    // Calculate complete lines
    for (let y = 0; y < ny; y++) {
        var complete = true;
        for (let x = 0; x < nx; x++) {
            if (board[x][y] === 0) {
                complete = false;
                break;
            }
        }
        if (complete)
            completeLines++;
    }

    // Calculate holes
    for (let x = 0; x < nx; x++) {
        let blockFound = false;
        for (let y = 0; y < ny; y++) {
            if (board[x][y] !== 0) {
                blockFound = true;
            } else if (blockFound && board[x][y] === 0) {
                holes++;
            }
        }
    }

    // Calculate bumpiness
    for (let x = 0; x < nx - 1; x++) {
        bumpiness += Math.abs(columnHeights[x] - columnHeights[x + 1]);
    }

    // Combine features into a heuristic score
    return -0.51 * aggregateHeight + 0.76 * completeLines - 0.36 * holes - 0.18 * bumpiness;
}

// Function to deep copy the blocks array
function copyBlocks(blocks) {
    let new_blocks = [];
    for (let x = 0; x < nx; x++) {
        new_blocks[x] = [];
        for (let y = 0; y < ny; y++) {
            new_blocks[x][y] = blocks[x][y];
        }
    }
    return new_blocks;
}

// Generate all possible moves for the current piece
function getPossibleMoves(piece) {
    let moves = [];
    // For each rotation of the piece
    for (let dir = 0; dir < 4; dir++) {
        piece.dir = dir;
        // For each horizontal position
        for (let x = 0; x < nx - piece.type.size; x++) {
            let y = getDropPosition(piece, x);
            let new_blocks = copyBlocks(blocks);
            eachblock(piece.type, x, y, piece.dir, function(x, y) {
                new_blocks[x][y] = piece.type;
            });
            moves.push({piece: piece, x: x, y: y, board: new_blocks});
        }
    }
    return moves;
}

// Select the best move based on heuristic evaluation
function selectBestMove(piece, board) {
    let moves = getPossibleMoves(piece);
    let bestMove = null;
    let bestScore = -Infinity;
    moves.forEach(move => {
        let score = evaluateBoard(move.board);
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    });
    return bestMove;
}

// Function to get the drop position of the piece
function getDropPosition(piece, x) {
    let y = 0;
    while (!occupied(piece.type, x, y + 1, piece.dir)) {
        y++;
    }
    return y;
}
