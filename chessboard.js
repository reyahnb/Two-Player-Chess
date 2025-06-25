console.log("Chessboard script loaded");

const chessboard = document.getElementById('chessboard');

// Define the initial positions of the pieces
const initialBoard = [
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'],
    Array(8).fill('pawn'),
    ...Array(4).fill(Array(8).fill(null)),
    Array(8).fill('pawn'),
    ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']
];

// Define the colors for each row
const pieceColors = ['black', 'black', null, null, null, null, 'white', 'white'];

// Define Unicode symbols for pieces
const pieceSymbols = {
    black: {
        king: '♚',
        queen: '♛',
        rook: '♜',
        bishop: '♝',
        knight: '♞',
        pawn: '♟'
    },
    white: {
        king: '♔',
        queen: '♕',
        rook: '♖',
        bishop: '♗',
        knight: '♘',
        pawn: '♙'
    }
};

// Track the current turn (start with white)
let currentTurn = 'white';

// Generate the chessboard
for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
        const square = document.createElement('div');
        square.classList.add('square', (row + col) % 2 === 0 ? 'white' : 'black');
        square.dataset.row = row;
        square.dataset.col = col;

        const piece = initialBoard[row][col];
        if (piece) {
            const pieceDiv = document.createElement('div');
            pieceDiv.classList.add('piece');
            pieceDiv.draggable = true; // Make the piece draggable
            const color = pieceColors[row];
            pieceDiv.textContent = pieceSymbols[color]?.[piece] || '';
            pieceDiv.dataset.color = color; // Store the piece's color
        
            // Add drag event listeners for highlighting valid moves
            pieceDiv.addEventListener('dragstart', (e) => {
                const parentSquare = pieceDiv.parentElement;
                const fromRow = parseInt(parentSquare.dataset.row, 10);
                const fromCol = parseInt(parentSquare.dataset.col, 10);
        
                if (pieceDiv.dataset.color !== currentTurn) {
                    console.log(`Cannot drag ${pieceDiv.textContent} because it's not ${currentTurn}'s turn.`);
                    e.preventDefault(); // Prevent dragging if it's not the piece's turn
                    return;
                }
        
                console.log(`Dragging piece: ${pieceDiv.textContent} from row ${fromRow}, col ${fromCol}`);
                e.dataTransfer.setData('text/plain', `${fromRow},${fromCol}`);
        
                // Highlight valid moves
                const squares = document.querySelectorAll('.square');
                squares.forEach(square => {
                    const targetRow = parseInt(square.dataset.row, 10);
                    const targetCol = parseInt(square.dataset.col, 10);
        
                    // Check if the move is valid
                    let isValidMove = false;
        
                    // Validate pawn movement
                    if (pieceDiv.textContent === '♙' || pieceDiv.textContent === '♟') {
                        const direction = pieceDiv.dataset.color === 'white' ? -1 : 1;
                        const startingRow = pieceDiv.dataset.color === 'white' ? 6 : 1;
        
                        if (
                            targetRow === fromRow + direction &&
                            (targetCol === fromCol - 1 || targetCol === fromCol + 1) &&
                            square.querySelector('.piece') &&
                            square.querySelector('.piece').dataset.color !== pieceDiv.dataset.color
                        ) {
                            isValidMove = true; // Pawn captures diagonally
                        } else if (targetRow === fromRow + direction && targetCol === fromCol && !square.querySelector('.piece')) {
                            isValidMove = true; // Pawn moves forward
                        } else if (fromRow === startingRow && targetRow === fromRow + 2 * direction && targetCol === fromCol && !square.querySelector('.piece')) {
                            isValidMove = true; // Pawn moves two squares forward
                        }
                    }
        
                    // Validate rook movement
                    if (pieceDiv.textContent === '♖' || pieceDiv.textContent === '♜') {
                        if ((targetRow === fromRow || targetCol === fromCol) && isPathClear(fromRow, fromCol, targetRow, targetCol)) {
                            isValidMove = true;
                        }
                    }
        
                    // Validate bishop movement
                    if (pieceDiv.textContent === '♗' || pieceDiv.textContent === '♝') {
                        if (Math.abs(targetRow - fromRow) === Math.abs(targetCol - fromCol) && isPathClear(fromRow, fromCol, targetRow, targetCol)) {
                            isValidMove = true;
                        }
                    }
        
                    // Validate queen movement
                    if (pieceDiv.textContent === '♕' || pieceDiv.textContent === '♛') {
                        if (
                            (targetRow === fromRow || targetCol === fromCol || Math.abs(targetRow - fromRow) === Math.abs(targetCol - fromCol)) &&
                            isPathClear(fromRow, fromCol, targetRow, targetCol)
                        ) {
                            isValidMove = true;
                        }
                    }
        
                    // Validate knight movement
                    if (pieceDiv.textContent === '♘' || pieceDiv.textContent === '♞') {
                        const rowDiff = Math.abs(targetRow - fromRow);
                        const colDiff = Math.abs(targetCol - fromCol);
                        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
                            isValidMove = true;
                        }
                    }
        
                    // Validate king movement
                    if (pieceDiv.textContent === '♔' || pieceDiv.textContent === '♚') {
                        const rowDiff = Math.abs(targetRow - fromRow);
                        const colDiff = Math.abs(targetCol - fromCol);
                        if (rowDiff <= 1 && colDiff <= 1) {
                            isValidMove = true;
                        }
                    }
        
                    // Highlight the square if the move is valid
                    if (isValidMove) {
                        square.classList.add('valid-move');
                    }
                });
            });
        
            pieceDiv.addEventListener('dragend', () => {
                // Remove the highlight from all squares
                const squares = document.querySelectorAll('.square.valid-move');
                squares.forEach(square => {
                    square.classList.remove('valid-move');
                });
            });
        
            // Add click event listener for highlighting valid moves
            pieceDiv.addEventListener('click', () => {
                const parentSquare = pieceDiv.parentElement;
                const fromRow = parseInt(parentSquare.dataset.row, 10);
                const fromCol = parseInt(parentSquare.dataset.col, 10);
        
                // Remove previous highlights
                const squares = document.querySelectorAll('.square.valid-move');
                squares.forEach(square => {
                    square.classList.remove('valid-move');
                });
        
                console.log(`Clicked piece: ${pieceDiv.textContent} from row ${fromRow}, col ${fromCol}`);
        
                // Highlight valid moves
                const allSquares = document.querySelectorAll('.square');
                allSquares.forEach(square => {
                    const targetRow = parseInt(square.dataset.row, 10);
                    const targetCol = parseInt(square.dataset.col, 10);
        
                    // Check if the move is valid
                    let isValidMove = false;
        
                    // Validate pawn movement
                    if (pieceDiv.textContent === '♙' || pieceDiv.textContent === '♟') {
                        const direction = pieceDiv.dataset.color === 'white' ? -1 : 1;
                        const startingRow = pieceDiv.dataset.color === 'white' ? 6 : 1;
        
                        if (
                            targetRow === fromRow + direction &&
                            (targetCol === fromCol - 1 || targetCol === fromCol + 1) &&
                            square.querySelector('.piece') &&
                            square.querySelector('.piece').dataset.color !== pieceDiv.dataset.color
                        ) {
                            isValidMove = true; // Pawn captures diagonally
                        } else if (targetRow === fromRow + direction && targetCol === fromCol && !square.querySelector('.piece')) {
                            isValidMove = true; // Pawn moves forward
                        } else if (fromRow === startingRow && targetRow === fromRow + 2 * direction && targetCol === fromCol && !square.querySelector('.piece')) {
                            isValidMove = true; // Pawn moves two squares forward
                        }
                    }
        
                    // Validate rook movement
                    if (pieceDiv.textContent === '♖' || pieceDiv.textContent === '♜') {
                        if ((targetRow === fromRow || targetCol === fromCol) && isPathClear(fromRow, fromCol, targetRow, targetCol)) {
                            isValidMove = true;
                        }
                    }
        
                    // Validate bishop movement
                    if (pieceDiv.textContent === '♗' || pieceDiv.textContent === '♝') {
                        if (Math.abs(targetRow - fromRow) === Math.abs(targetCol - fromCol) && isPathClear(fromRow, fromCol, targetRow, targetCol)) {
                            isValidMove = true;
                        }
                    }
        
                    // Validate queen movement
                    if (pieceDiv.textContent === '♕' || pieceDiv.textContent === '♛') {
                        if (
                            (targetRow === fromRow || targetCol === fromCol || Math.abs(targetRow - fromRow) === Math.abs(targetCol - fromCol)) &&
                            isPathClear(fromRow, fromCol, targetRow, targetCol)
                        ) {
                            isValidMove = true;
                        }
                    }
        
                    // Validate knight movement
                    if (pieceDiv.textContent === '♘' || pieceDiv.textContent === '♞') {
                        const rowDiff = Math.abs(targetRow - fromRow);
                        const colDiff = Math.abs(targetCol - fromCol);
                        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
                            isValidMove = true;
                        }
                    }
        
                    // Validate king movement
                    if (pieceDiv.textContent === '♔' || pieceDiv.textContent === '♚') {
                        const rowDiff = Math.abs(targetRow - fromRow);
                        const colDiff = Math.abs(targetCol - fromCol);
                        if (rowDiff <= 1 && colDiff <= 1) {
                            isValidMove = true;
                        }
                    }
        
                    // Highlight the square if the move is valid
                    if (isValidMove) {
                        square.classList.add('valid-move');
                    }
                });
            });
        
            square.appendChild(pieceDiv);
        }

        /**
         * Helper function to check if the path between two squares is clear
         */
        function isPathClear(fromRow, fromCol, targetRow, targetCol) {
            const rowStep = targetRow === fromRow ? 0 : targetRow > fromRow ? 1 : -1;
            const colStep = targetCol === fromCol ? 0 : targetCol > fromCol ? 1 : -1;

            let currentRow = fromRow + rowStep;
            let currentCol = fromCol + colStep;

            while (currentRow !== targetRow || currentCol !== targetCol) {
                const square = chessboard.querySelector(`[data-row="${currentRow}"][data-col="${currentCol}"]`);
                if (square.querySelector('.piece')) {
                    return false; // Path is blocked
                }
                currentRow += rowStep;
                currentCol += colStep;
            }

            return true; // Path is clear
        }
        /**
         * Function to check if a move results in capturing an opponent's piece
         */
        function checkCapture(targetSquare, pieceToMove) {
            const capturedPiece = targetSquare.querySelector('.piece');
            if (capturedPiece && capturedPiece.dataset.color !== pieceToMove.dataset.color) {
                console.log(`Captured piece: ${capturedPiece.textContent} (${capturedPiece.dataset.color})`);
        
                // Remove the captured piece from the board
                targetSquare.removeChild(capturedPiece);
        
                // Add the captured piece to the player's captured area
                const capturedAreaId = pieceToMove.dataset.color === 'white' ? 'white-captured' : 'black-captured';
                const capturedArea = document.getElementById(capturedAreaId);
                capturedArea.appendChild(capturedPiece);
        
                // Check if the captured piece is a king
                if (capturedPiece.textContent === '♔' || capturedPiece.textContent === '♚') {
                    const winner = pieceToMove.dataset.color === 'white' ? 'White' : 'Black';
                    alert(`${winner} wins! The game is over.`);
                    // Disable further moves by removing event listeners
                    const squares = document.querySelectorAll('.square');
                    squares.forEach(square => {
                        square.removeEventListener('dragover', (e) => e.preventDefault());
                        square.removeEventListener('drop', (e) => {});
                    });
                }
            }
        }

        

        // Add drop event listeners to squares
        square.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow dropping
        });

        square.addEventListener('drop', (e) => {
            e.preventDefault();
            const [fromRow, fromCol] = e.dataTransfer.getData('text/plain').split(',').map(Number);
            console.log(`Dropping piece from row ${fromRow}, col ${fromCol}`);
            const fromSquare = chessboard.querySelector(`[data-row="${fromRow}"][data-col="${fromCol}"]`);
            console.log(`Looking for piece in square at row ${fromRow}, col ${fromCol}`);
            const pieceToMove = fromSquare?.querySelector('.piece');
        
            // Ensure a piece is being moved
            if (!pieceToMove) {
                console.log("No piece found to move.");
                return;
            }
        
            console.log(`Moving piece: ${pieceToMove.textContent} (${pieceToMove.dataset.color})`);
        
            // Check if the target square already has a piece
            const targetSquare = e.currentTarget;
            const existingPiece = targetSquare.querySelector('.piece');
            if (existingPiece && existingPiece.dataset.color === pieceToMove.dataset.color) {
                console.log("Invalid move: Target square already occupied by your own piece.");
                return; // Invalidate the move
            }
        
            const targetRow = parseInt(targetSquare.dataset.row, 10); // Ensure targetRow is defined
            const targetCol = parseInt(targetSquare.dataset.col, 10); // Ensure targetCol is defined

            
        
            let isValidMove = false; // Track whether the move is valid
        
            // Validate pawn movement
            if (pieceToMove.textContent === '♙' || pieceToMove.textContent === '♟') {
                const direction = pieceToMove.dataset.color === 'white' ? -1 : 1; // White moves up, black moves down
                const startingRow = pieceToMove.dataset.color === 'white' ? 6 : 1; // Starting row for white and black pawns
        
                // Allow capturing diagonally
                if (
                    targetRow === fromRow + direction &&
                    (targetCol === fromCol - 1 || targetCol === fromCol + 1) &&
                    existingPiece &&
                    existingPiece.dataset.color !== pieceToMove.dataset.color
                ) {
                    console.log("Valid move: Pawn captures diagonally.");
                    isValidMove = true; // Mark the move as valid
                }
                // Allow moving one square forward
                else if (targetRow === fromRow + direction && targetCol === fromCol) {
                    // Ensure the target square is empty
                    if (existingPiece) {
                        console.log("Invalid move: Pawns cannot capture by moving forward.");
                        return; // Invalidate the move
                    }
                    console.log("Valid move: Pawn moves one square forward.");
                    isValidMove = true; // Mark the move as valid
                }
                // Allow moving two squares forward if it's the pawn's first move
                else if (fromRow === startingRow && targetRow === fromRow + 2 * direction && targetCol === fromCol) {
                    // Check if the path is clear for the two-square move
                    if (!isPathClear(fromRow, fromCol, targetRow, targetCol)) {
                        console.log("Invalid move: Path is blocked for pawn's two-square move.");
                        return; // Invalidate the move
                    }
                    console.log("Valid move: Pawn moves two squares forward on its first move.");
                    isValidMove = true; // Mark the move as valid
                }
                // Invalidate any other move
                else {
                    console.log("Invalid move: Pawns can only move forward or capture diagonally.");
                    return; // Invalidate the move
                }
            }
        
            // Validate rook movement
            if (pieceToMove.textContent === '♖' || pieceToMove.textContent === '♜') {
                if (targetRow !== fromRow && targetCol !== fromCol) {
                    console.log("Invalid move: Rooks can only move in a straight line.");
                    return; // Invalidate the move
                }

                // Check if the path is clear
                if (!isPathClear(fromRow, fromCol, targetRow, targetCol)) {
                    console.log("Invalid move: Rooks cannot move over other pieces.");
                    return; // Invalidate the move
                }
                console.log("Valid move: Rook moves in a straight line.");
                isValidMove = true; // Mark the move as valid
            }

            // Validate bishop movement
            if (pieceToMove.textContent === '♗' || pieceToMove.textContent === '♝') {
                if (Math.abs(targetRow - fromRow) !== Math.abs(targetCol - fromCol)) {
                    console.log("Invalid move: Bishops can only move diagonally.");
                    return; // Invalidate the move
                }

                // Check if the path is clear
                if (!isPathClear(fromRow, fromCol, targetRow, targetCol)) {
                    console.log("Invalid move: Bishops cannot move over other pieces.");
                    return; // Invalidate the move
                }
                console.log("Valid move: Bishop moves diagonally.");
                isValidMove = true; // Mark the move as valid
            }

            // Validate queen movement
            if (pieceToMove.textContent === '♕' || pieceToMove.textContent === '♛') {
                if (
                    targetRow !== fromRow &&
                    targetCol !== fromCol &&
                    Math.abs(targetRow - fromRow) !== Math.abs(targetCol - fromCol)
                ) {
                    console.log("Invalid move: Queens can only move in a straight line or diagonally.");
                    return; // Invalidate the move
                }

                // Check if the path is clear
                if (!isPathClear(fromRow, fromCol, targetRow, targetCol)) {
                    console.log("Invalid move: Queens cannot move over other pieces.");
                    return; // Invalidate the move
                }
                console.log("Valid move: Queen moves in a straight line or diagonally.");
                isValidMove = true; // Mark the move as valid
            }
        
            // Validate knight movement
            if (pieceToMove.textContent === '♘' || pieceToMove.textContent === '♞') {
                const rowDiff = Math.abs(targetRow - fromRow);
                const colDiff = Math.abs(targetCol - fromCol);
        
                // Check if the move is an "L" shape
                if (!((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2))) {
                    console.log("Invalid move: Knights can only move in an L shape.");
                    return; // Invalidate the move
                }
        
                console.log("Valid move: Knight moves in an L shape.");
                isValidMove = true; // Mark the move as valid
            }
        
            // Validate king movement
            if (pieceToMove.textContent === '♔' || pieceToMove.textContent === '♚') {
                const rowDiff = Math.abs(targetRow - fromRow);
                const colDiff = Math.abs(targetCol - fromCol);
        
                // Check if the move is one square in any direction
                if (rowDiff > 1 || colDiff > 1) {
                    console.log("Invalid move: Kings can only move one square in any direction.");
                    return; // Invalidate the move
                }
        
                console.log("Valid move: King moves one square.");
                isValidMove = true; // Mark the move as valid
            }
        
            // If the move is valid, proceed with capturing and moving the piece
            if (isValidMove) {
                // Remove the piece from its original square
                fromSquare.removeChild(pieceToMove);
        
                // Add the piece to the target square
                targetSquare.appendChild(pieceToMove);
        
                // Check for capture
                if (existingPiece) {
                    checkCapture(targetSquare, pieceToMove);
                }
        
                // Preserve the piece's color
                pieceToMove.dataset.color = currentTurn;
        
                // Switch turns
                currentTurn = currentTurn === 'white' ? 'black' : 'white';
                console.log(`Turn switched to: ${currentTurn}`);
            }
        });

        chessboard.appendChild(square);
    }
}
