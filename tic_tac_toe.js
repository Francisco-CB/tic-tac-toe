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
        board[xCoord][yCoord] = mark;
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
        gameBoard.markTile(x, y, mark);
        displayBoard();
    }

    function clicked(event) {
        if (turn == 0) {
            mark = 'X';
            turn = 1;
        }
        
        else {
            mark = 'O';
            turn = 0;
        }

        coords = event.target.id.split('');
        displayController.updateBoard(coords[0], coords[1], mark);
    }


    return {updateBoard}
})();