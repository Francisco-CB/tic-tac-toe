const playerFactory = (mark) => {
    let rows;
    let columns;
    let diag;
    let rdiag;
    let score = 0;

    function resetMovements(size) {
        if(rows == undefined) {
            rows = new Array(size);
        }
        if(columns == undefined) {
            columns = new Array(size);
        }
        if(diag == undefined) {
            diag = new Array(size);
        }
        if(rdiag == undefined) {
            rdiag = new Array(size);
        }

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

    function getScore() {
        return score
    }

    function increaseScore() {
        score += 1;
    }

    function resetScore() {
        score = 0;
    }

    return {mark, resetMovements, getMovements, addMovement, getScore, increaseScore, resetScore}
};

gameBoard = ((size) => {
    let board;
    let boardSize = size; // size of grid (does not reflect page layout, yet)
    let numberOfMovements = 0; // for tracking total movements, when 9 and no winner it's a draw
    resetBoard(boardSize)

    function getSize() {
        return boardSize
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
        if (board == undefined) {
            board = new Array(size);
            for (let i = 0; i < size; i++) {
                board[i] = new Array(size);
            }
        }
        board.forEach(row => {row.fill(null)});
        numberOfMovements = 0;
    }
    
    return {board, getSize, getTotalMovements, markTile, resetBoard}
})(3);


displayController = (() => {
    let turn = 0;
    let coords;
    let winner;
    let updateStatus;

    const tiles = document.getElementsByClassName('boardTile');
    
    const startButton = document.getElementById('startButton'); 
    startButton.addEventListener("click", startGame);
    
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener("click", resetGame);
    
    let players = [playerFactory("X"), playerFactory("O")];
    
    let scores = [document.getElementById('playerXScore'), document.getElementById('playerOScore')];
    
    function startGame() {
        gameBoard.resetBoard(gameBoard.getSize());
        players.forEach(player => {player.resetMovements(gameBoard.getSize())});
        Array.from(tiles).forEach(tile => tile.addEventListener("click", clicked));
        displayBoard();
    }

    function resetGame() {
        turn = 0;
        players.forEach(player => {player.resetScore()});
        gameBoard.resetBoard(gameBoard.getSize());
        players.forEach(player => {player.resetMovements(gameBoard.getSize())});
        Array.from(tiles).forEach(tile => tile.addEventListener("click", clicked));
        displayBoard();
    }

    function endGame() {
        Array.from(tiles).forEach(tile => tile.removeEventListener("click", clicked));
    }

    function displayBoard() {
        let tileMark = null;
        let selectedTile = null;
        let tileId = null;
        
        for(let k = 0; k < scores.length; k++) {
            scores[k].textContent = `Score: ${players[k].getScore()}`;
        }

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

    function detectWinner(player, boardSize) {
        const reducer = (previousValue, currentValue) => previousValue + currentValue;
        const comparer = (previousValue, currentValue) => previousValue == currentValue && currentValue > 0;
        movements = [...player.getMovements()];
        // Number of rows, columns, and diagonals independent of size of board
        // Conditions always the same, just length of rows, columns, and diagonals changes
        // Check rows and columns
        for (let i = 0; i < movements.slice(0, 2).length; i++) {
            if (movements.slice(0, 2)[i].includes(boardSize)) {
                return true
            }
        }
        
        // Check diagonals
        for (let j = 0; j < movements.slice(2).length; j++) {
            if (movements.slice(2)[j].reduce(reducer) == boardSize && movements.slice(2)[j].reduce(comparer)) {
                return true
            }
        }
        
        // Base case of draw
        if (gameBoard.getTotalMovements() == 9) {
            return false
        }
    }
    
    function clicked(event) {
        coords = event.target.id.split('').map(function(element) {return parseInt(element, 10)});
        
        if (updateBoard(coords[0], coords[1], players[turn].mark)) {
            players[turn].addMovement(coords[0], coords[1], gameBoard.getSize());
            winner = detectWinner(players[turn], gameBoard.getSize());
            
            if(winner) {
                players[turn].increaseScore();
                scores[turn].textContent = `Score: ${players[turn].getScore()}`;
                endGame();
            }

            if (turn == 0) {
                turn = 1;
            }
            else {
                turn = 0;
            }
        }
    }

    return {updateBoard, players}
})();