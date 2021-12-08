const playerFactory = (name, mark) => {
    let rows;
    let columns;
    let diag;
    let rdiag;

    function initiateMovements(size){
        rows = new Array(size);
        rows.fill(0);

        columns = new Array(size);
        columns.fill(0);

        diag = new Array(size);
        diag.fill(0);

        rdiag = new Array(size);
        rdiag.fill(0);
    }
    
    function resetMovements() {
        rows.fill(0);
        columns.fill(0);
        diag.fill(0);
        rdiag.fill(0);
    }

    function getMovements() {
        return [rows, columns, diag, rdiag]
    }

    function addMovement(xIndex, yIndex, size) {
        rows[xIndex] += 1;
        columns[yIndex] += 1;
        
        if (xIndex == yIndex) {
            diag[xIndex] += 1;
        }

        if (xIndex + yIndex == size - 1) {
            rdiag[xIndex] += 1;
        }
    }

    return {name, mark, initiateMovements, resetMovements, getMovements, addMovement}
};

gameBoard = ((size) => {
    let board;
    let boardSize = size; // size of grid (does not reflect page layout, yet)
    let numberOfMovements = 0; // for tracking total movements, when 9 and no winner it's a draw
    resetBoard(boardSize)

    function getSize() {
        return size
    }

    function getTotalMovements() {
        return numberOfMovements
    }

    function markTile(xCoord, yCoord, mark) {
        if (board[xCoord][yCoord] === null) {
            board[xCoord][yCoord] = mark;
            numberOfMovements += 1;
            return true
        }
        else {
            return false
        }
    }

    function resetBoard(size) {
        board = new Array(size)
        for (let i=0; i<size; i++) {
            board[i] = new Array(size)
        }
        board.forEach(row => {row.fill(null)});
    }
    
    return {board, getSize, getTotalMovements, markTile, resetBoard}
})(3);


displayController = (() => {
    let turn = 0;
    let coords;
    let updateStatus;

    const tiles = document.getElementsByClassName('boardTile');
    Array.from(tiles).forEach(tile => tile.addEventListener("click", clicked));
    let players = [playerFactory("John", "X"), playerFactory("Jane", "O")];
    players.forEach(player => {player.initiateMovements(gameBoard.getSize())})

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
        updateStatus = gameBoard.markTile(x, y, mark);
        displayBoard();
        return updateStatus
    }

    function clicked(event) {
        coords = event.target.id.split('').map(function(element) {return parseInt(element, 10)});
        
        if (updateBoard(coords[0], coords[1], players[turn].mark)) {
            players[turn].addMovement(coords[0], coords[1], gameBoard.getSize())
            detectWinner(players[turn], gameBoard.getSize());
            
            if (turn == 0) {
                turn = 1;
            }
            else {
                turn = 0;
            }
        }
    }

    function detectWinner(player, boardSize) {
        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        const comparer = (previousValue, currentValue) => previousValue == currentValue && currentValue > 0;
        movements = [...player.getMovements()];
        for (let i = 0; i < movements.length; i++) {
            if (movements[i].includes(boardSize) || (movements[i].reduce(reducer) == boardSize && movements[i].reduce(comparer))) {
                console.log(`${player.mark} wins!`);
                return true
            }
        }
        if (gameBoard.getTotalMovements() == 9) {
            console.log('Draw!');
        }
    }

    return {updateBoard, players}
})();