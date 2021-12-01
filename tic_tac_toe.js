const playerFactory = (name, mark) => {
    return {name, mark}
};

gameBoard = (() => {
    let board = [
        [null, null, null], 
        [null, null, null], 
        [null, null, null]
    ];

    function markTile(xCoord, yCoord, mark) {
        if (board[xCoord][yCoord] === null) {
            board[xCoord][yCoord] = mark;
            return true
        }
        else {
            return false
        }
    }
    
    function detectWinner() {
        console.log('detectWinner not implemented yet!');
    }

    function resetBoard() {
        board.forEach(row => {row.fill(null)});
    }
    
    return {board, markTile, resetBoard}
})();


displayController = (() => {
    let turn = 0;
    let mark = 'X';
    let changed;
    let coords;

    const tiles = document.getElementsByClassName('boardTile');
    Array.from(tiles).forEach(tile => tile.addEventListener("click", clicked));

    function displayBoard() {
        let tileMark = null;
        let selectedTile = null;
        let tileId = null;
        
        for (let i=0; i < 3; i++) {
            for (let j=0; j < 3; j++) {
                tileMark = gameBoard.board[i][j];
                tileId = `${i}` + `${j}`;
                selectedTile = document.getElementById(tileId);
                
                if (tileMark === null) {
                    selectedTile.textContent = ' ';
                }
                if (tileMark === 'X') {
                    selectedTile.textContent = 'X';
                }
                if (tileMark === 'O') {
                    selectedTile.textContent = 'O';
                }
            }
        }
    }

    function updateBoard(x, y, mark) {
        changed = gameBoard.markTile(x, y, mark);
        displayBoard();
        return changed
    }

    function clicked(event) {
        coords = event.target.id.split('');
        
        if (updateBoard(coords[0], coords[1], mark)) {
            if (turn == 0) {
                mark = 'O';
                turn = 1;
            }
            
            else {
                mark = 'X';
                turn = 0;
            }
        }
    }

    return {updateBoard}
})();