const playerFactory = (mark, isComputer) => {
    let rows;
    let columns;
    let diag;
    let rdiag;
    let bot = isComputer ?? false;

    function isBot() {
        return bot
    }

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

    function makeRandomMove(max, min=0) {
        x = Math.floor(Math.random() * (max - min + 1) + min);
        y = Math.floor(Math.random() * (max - min + 1) + min);
        randomCoords = [x, y];
        return randomCoords
    }

    return {mark, isBot, resetMovements, getMovements, addMovement, makeRandomMove}
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

    function isValidMove(xCoord, yCoord) {
        if (board[xCoord][yCoord] === null) {
           return true
        }
        else {
            return false
        }
    }

    function markTile(xCoord, yCoord, mark) {
        board[xCoord][yCoord] = mark;
        numberOfMovements += 1;
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
    
    return {board, getSize, getTotalMovements, isValidMove, markTile, resetBoard}
})(3);


gameController = (() => {
    let turn = 0;
    let playerScores = [0, 0];
    let validMove;
    let players;

    function makePlayers(playerXBot=false, playerOBot=false) {
        players = [
            playerFactory("X", isComputer=playerXBot),
            playerFactory("O", isComputer=playerOBot)
        ];
        players.forEach(player => {player.resetMovements(gameBoard.getSize())});
    }
    
    function getPlayers() {
        return players
    }

    function setNextTurn() {
        if (turn == 0) {
            turn = 1;
        }
        else {
            turn = 0;
        }
    }

    function getCurrentTurn() {
        return turn
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
        return null
    }

    function increaseScore(turn) {
        playerScores[turn] += 1;
    }

    function resetScore() {
        playerScores = [0, 0];
    }

    function getPlayerScores() {
        return playerScores
    }

    function makeBotMove(player) {
        validMove = false;
        while (!validMove) {
            randomCoords = player.makeRandomMove(gameBoard.getSize()-1);
            validMove = gameBoard.isValidMove(randomCoords[0], randomCoords[1]);
        }
        document.getElementById(`${randomCoords[0]}${randomCoords[1]}`).click();
    }

    function ifPlayerBotMove(player) {
        if(player.isBot()) {
            makeBotMove(player);
        }
    }

    function initializeGame(playerXBot=false, playerOBot=false) {
        gameBoard.resetBoard(gameBoard.getSize());
        makePlayers(playerXBot, playerOBot);
    }

    function resetGame() {
        turn = 0;
        resetScore();
        gameBoard.resetBoard(gameBoard.getSize());
    }

    return {getPlayers, initializeGame, resetGame, getCurrentTurn, setNextTurn, increaseScore, getPlayerScores, ifPlayerBotMove, detectWinner}
})()


displayController = (() => {
    let coords;
    let winner;
    let currentTurn;

    const infoDisplay = document.getElementById('infoDisplay');
    
    const playerXToggle = document.querySelector('#toggle-playerX input[name="xToggle"]');
    const playerOToggle = document.querySelector('#toggle-playerO input[name="oToggle"]');

    const tiles = document.getElementsByClassName('boardTile');
    
    const startButton = document.getElementById('startButton'); 
    startButton.addEventListener("click", startGame);
    
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener("click", restartGame);
    
    const playerScoresTexts = [document.querySelector('#playerXScore .score'), document.querySelector('#playerOScore .score')];

    const controller = gameController;
    
    function enableBotToggles() {
        playerXToggle.disabled = false;
        playerOToggle.disabled = false;
    }

    function disableBotToggles() {
        playerXToggle.disabled = true;
        playerOToggle.disabled = true;
    }

    function startGame() {
        controller.initializeGame(playerXToggle.checked, playerOToggle.checked);
        disableBotToggles();
        displayBoard();
        currentTurn = controller.getCurrentTurn();
        infoDisplay.textContent = `Player ${controller.getPlayers()[currentTurn].mark}'s turn`;
        Array.from(tiles).forEach(tile => tile.addEventListener("click", clicked));
        controller.ifPlayerBotMove(controller.getPlayers()[currentTurn]);
    }

    function restartGame() {
        infoDisplay.textContent = `Press Start to play!`;
        enableBotToggles();
        controller.resetGame();
        resetScoreText();
        displayBoard();
    }

    function endGame() {
        Array.from(tiles).forEach(tile => tile.removeEventListener("click", clicked));
        enableBotToggles();
    }

    function displayBoard() {
        let tileMark = null;
        let selectedTile = null;
        let tileId = null;

        for (let i=0; i < 3; i++) {
            for (let j=0; j < 3; j++) {
                tileMark = gameBoard.board[i][j];
                tileId = `${i}${j}`;
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
    
    function updateScoreText(turn) {
        playerScoresTexts[turn].textContent = `${controller.getPlayerScores()[turn]}`;
    }

    function resetScoreText() {
        playerScoresTexts.forEach(score => {score.textContent = 0});
    }

    function clicked(event) {
        coords = event.target.id.split('').map(function(element) {return parseInt(element, 10)});
        currentTurn = controller.getCurrentTurn();

        if (gameBoard.isValidMove(coords[0], coords[1])) {
            gameBoard.markTile(coords[0], coords[1], controller.getPlayers()[currentTurn].mark);
            controller.getPlayers()[currentTurn].addMovement(coords[0], coords[1], gameBoard.getSize());
            displayBoard();
            winner = controller.detectWinner(controller.getPlayers()[currentTurn], gameBoard.getSize());

            if (winner) {
                controller.increaseScore(currentTurn);
                updateScoreText(currentTurn);
                infoDisplay.textContent = `Congrats player ${controller.getPlayers()[currentTurn].mark}, you win!`;
                endGame();
            }

            else if (winner === false) {
                infoDisplay.textContent = `Draw!`;
                endGame();
            }
            
            controller.setNextTurn();
            currentTurn = controller.getCurrentTurn();

            if (winner == null) {
                infoDisplay.textContent = `Player ${controller.getPlayers()[currentTurn].mark}'s turn`;
                controller.ifPlayerBotMove(controller.getPlayers()[currentTurn]);
            }
        }
    }

    return {}
})();