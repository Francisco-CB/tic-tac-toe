const playerFactory = (mark, isComputer, difficulty) => {
    let rows;
    let columns;
    let diag;
    let rdiag;
    let bot = isComputer ?? false;
    let diff = difficulty ?? false;

    function isBot() {
        return bot
    }

    function getDifficulty() {
        return diff
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

    function removeMovement(xIndex, yIndex, size) {
        rows[xIndex] -= 1;
        columns[yIndex] -= 1;
        
        if (xIndex == yIndex) {
            diag[xIndex] -= 1;
        }

        if (xIndex + yIndex == size - 1) {
            rdiag[xIndex] -= 1;
        }
    }

    return {mark, isBot, getDifficulty, resetMovements, getMovements, addMovement, removeMovement}
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
    }
    
    function updateNumberOfMoves(numberToAdd=1) {
        numberOfMovements += numberToAdd;
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
    
    return {board, getSize, updateNumberOfMoves, getTotalMovements, isValidMove, markTile, resetBoard}
})(3);


gameController = (() => {
    let turn = 0;
    let playerScores = [0, 0];
    let players;

    function makePlayers(playerXBot=false, playerXDiff=false, playerOBot=false, playerODiff=false) {
        players = [
            playerFactory("X", isComputer=playerXBot, difficulty=playerXDiff),
            playerFactory("O", isComputer=playerOBot, difficulty=playerODiff)
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
                return [true, player.mark]
            }
        }
        
        // Check diagonals
        for (let j = 0; j < movements.slice(2).length; j++) {
            if (movements.slice(2)[j].reduce(reducer) == boardSize && movements.slice(2)[j].reduce(comparer)) {
                return [true, player.mark]
            }
        }
        
        // Base case of draw
        if (gameBoard.getTotalMovements() == gameBoard.getSize()**2) {
            return [false, null]
        }

        return [null, null]
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

    function minimax(currentBoard, currentPlayer, isMaximizingPlayer, otherPlayer, scoring) {
        let newEval;

        let gameOverState = detectWinner(currentPlayer, currentBoard.getSize());
        if (gameOverState[0] === true || gameOverState[0] === false) {
            return stateEvaluation(gameOverState, scoring)
        }

        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (let i = 0; i < currentBoard.getSize(); i++) {
                for (let j = 0; j < currentBoard.getSize(); j++) {
                    if (currentBoard.isValidMove(i, j)) {
                        currentBoard.markTile(i, j, currentPlayer.mark);
                        currentBoard.updateNumberOfMoves(1);
                        currentPlayer.addMovement(i, j, gameBoard.getSize());
                        
                        // Once maximizing player marks, it's minimizing player's turn
                        newEval = minimax(currentBoard, otherPlayer, false, currentPlayer, scoring);
                        maxEval = Math.max(maxEval, newEval);
                        
                        currentBoard.markTile(i, j, null);
                        currentBoard.updateNumberOfMoves(-1);
                        currentPlayer.removeMovement(i, j, gameBoard.getSize());
                    }
                }
            }
            return maxEval
        }

        else {
            let minEval = Infinity;
            for (let i = 0; i < currentBoard.getSize(); i++) {
                for (let j = 0; j < currentBoard.getSize(); j++) {
                    if (currentBoard.isValidMove(i, j)) {
                        currentBoard.markTile(i, j, currentPlayer.mark);
                        currentBoard.updateNumberOfMoves(1);
                        currentPlayer.addMovement(i, j, gameBoard.getSize());
                        
                        // Once minimizing player marks, it's maximizing player's turn
                        newEval = minimax(currentBoard, otherPlayer, true, currentPlayer, scoring);
                        minEval = Math.min(minEval, newEval);
                        
                        currentBoard.markTile(i, j, null);
                        currentBoard.updateNumberOfMoves(-1);
                        currentPlayer.removeMovement(i, j, gameBoard.getSize());
                    }
                }
            }
            return minEval
        }
    }

    function stateEvaluation(gameOverState, scoringBoard) {
        if (gameOverState[1] === null) {
            return scoringBoard["draw"]
        }
        else {
            return scoringBoard[gameOverState[1]]
        }
    }

    function makeBestMove(currentBoard, currentPlayer, otherPlayer) {
        let scores = {
            [currentPlayer.mark]: 1,
            [otherPlayer.mark]: -1,
            draw: 0
        };

        let bestScore = -Infinity;
        let move = null;
        let finalEval;

        for (let i = 0; i < currentBoard.getSize(); i++) {
            for (let j = 0; j < currentBoard.getSize(); j++) {
                if (currentBoard.isValidMove(i, j)) {
                    currentBoard.markTile(i, j, currentPlayer.mark);
                    currentBoard.updateNumberOfMoves(1);
                    currentPlayer.addMovement(i, j, gameBoard.getSize());
                    
                    finalEval = minimax(currentBoard, otherPlayer, false, currentPlayer, scores);
                    
                    currentBoard.markTile(i, j, null);
                    currentBoard.updateNumberOfMoves(-1);
                    currentPlayer.removeMovement(i, j, gameBoard.getSize());
                    
                    if (finalEval > bestScore) {
                        bestScore = finalEval;
                        move = [i, j];
                    }
                }
            }
        }
        return move
    }

    function makeEasyBotMove(board) {
        let validMove = false;
        max = board.getSize()-1;
        min = 0;
        while (!validMove) {
            randomCoords = [
                Math.floor(Math.random() * (max - min + 1) + min),
                Math.floor(Math.random() * (max - min + 1) + min)
            ];
            validMove = gameBoard.isValidMove(randomCoords[0], randomCoords[1]);
        }

        return randomCoords
    }

    function ifPlayerBotMove(board, player, otherPlayer) {
        if(player.isBot()) {
            //Hard Bot
            if (player.getDifficulty()) {
                return makeBestMove(board, player, otherPlayer)
            }
            //Easy Bot
            else {
                return makeEasyBotMove(board)
            }
        }
    }

    function initializeGame(playerXBot=false, playerXDiff=false, playerOBot=false, playerODiff=false) {
        gameBoard.resetBoard(gameBoard.getSize());
        makePlayers(playerXBot, playerXDiff, playerOBot, playerODiff);
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
    const playerXDiffToggle = document.querySelector('#diff-toggle-playerX input[name="diff-xToggle"]');
    const playerOToggle = document.querySelector('#toggle-playerO input[name="oToggle"]');
    const playerODiffToggle = document.querySelector('#diff-toggle-playerO input[name="diff-oToggle"]');

    const tiles = document.getElementsByClassName('boardTile');
    
    const startButton = document.getElementById('startButton'); 
    startButton.addEventListener("click", startGame);
    
    const resetButton = document.getElementById('resetButton');
    resetButton.addEventListener("click", restartGame);
    
    const playerScoresTexts = [document.querySelector('#playerXScore .score'), document.querySelector('#playerOScore .score')];

    const controller = gameController;

    function enableBotToggles() {
        playerXToggle.disabled = false;
        playerXDiffToggle.disabled = false;
        playerOToggle.disabled = false;
        playerODiffToggle.disabled = false;
    }

    function disableBotToggles() {
        playerXToggle.disabled = true;
        playerXDiffToggle.disabled = false;
        playerOToggle.disabled = true;
        playerODiffToggle.disabled = false;
    }

    function startGame() {
        controller.initializeGame(playerXToggle.checked, playerXDiffToggle.checked, playerOToggle.checked, playerODiffToggle.checked);
        disableBotToggles();
        displayBoard();
        currentTurn = controller.getCurrentTurn();
        infoDisplay.textContent = `Player ${controller.getPlayers()[currentTurn].mark}'s turn`;
        Array.from(tiles).forEach(tile => tile.addEventListener("click", clicked));
        
        if (currentTurn === 0) {
            otherPlayer = controller.getPlayers()[1]
        }
        else {
            otherPlayer = controller.getPlayers()[0]
        }

        moves = controller.ifPlayerBotMove(gameBoard, controller.getPlayers()[currentTurn], otherPlayer);
        if (moves !== null) {
            document.getElementById(`${moves[0]}${moves[1]}`).click();
        }
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
            gameBoard.updateNumberOfMoves();
            controller.getPlayers()[currentTurn].addMovement(coords[0], coords[1], gameBoard.getSize());
            displayBoard();
            [winner, winningMark] = controller.detectWinner(controller.getPlayers()[currentTurn], gameBoard.getSize());

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
                if (currentTurn === 0) {
                    otherPlayer = controller.getPlayers()[1]
                }
                else {
                    otherPlayer = controller.getPlayers()[0]
                }
        
                moves = controller.ifPlayerBotMove(gameBoard, controller.getPlayers()[currentTurn], otherPlayer);
                if (moves !== null) {
                    document.getElementById(`${moves[0]}${moves[1]}`).click();
                }
            }
        }
    }

    return {}
})();