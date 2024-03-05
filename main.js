const gameBoardElement = document.querySelector(".game-board");
const numbersContainer = document.querySelector(".numbers-container");
const levelsSpans = document.querySelectorAll(".levels .level");
const toggle = document.querySelector(".toggle");
const errorsElement = document.querySelector(".errors");
const btnStart = document.querySelector(".btn-start");
const timerElement = document.querySelector(".timer");
const btnSolve = document.querySelector(".btn-solve");
const btnHints = document.querySelector(".btn-hints");

let theBoard, theSolution, chosenLevel, allowedErrors, passedSeconds,
    hintsNumber, selectedNumber, IntervalID, availableCells, usedNumbers;

function setTimer() {
    IntervalID = setInterval(() => {
        passedSeconds++;
        let minutes = Math.floor(passedSeconds / 60);
        let seconds = passedSeconds % 60;
        minutes = (minutes < 10) ? `0${minutes}` : minutes;
        seconds = (seconds < 10) ? `0${seconds}` : seconds;
        timerElement.innerHTML = `${minutes} : ${seconds}`;
        if (passedSeconds === 60 * 5) {
            btnSolve.disabled = false;
        }
    }, 1000);
}

function getAndSetSudokuBoard() {
    const RawSudoku = SudokusWithSolutions["RawSudoku"];
    const SolvedSudoku = SudokusWithSolutions["SolvedSudoku"];
    const random = Math.floor(Math.random() * RawSudoku.length);
    theSolution = SolvedSudoku[random];
    theBoard = RawSudoku[random];
    createBoardAndNumbers();
}

function sudokuSolver() {
    function solveSudoku(board) {
        const n = board.length;
        solve(board, n);
    }

    function solve(board, n) {
        for (let row = 0; row < n; row++) {
            for (let col = 0; col < n; col++) {
                if (board[row][col] !== 0) continue;
                for (let i = 1; i <= 9; i++) {
                    if (isValid(board, row, col, n, i)) {
                        board[row][col] = i;
                        if (solve(board, n)) return true;
                    }
                }
                board[row][col] = 0;
                return false;
            }
        }
        return true;
    }

    function isValid(board, row, col, n, num) {
        const blockRow = Math.floor(row / 3) * 3;
        const blockCol = Math.floor(col / 3) * 3;
        for (let i = 0; i < n; i++) {
            const curRow = blockRow + Math.floor(i / 3);
            const curCol = blockCol + Math.floor(i % 3);
            if (board[row][i] === num || board[i][col] === num) return false;
            if (board[curRow][curCol] === num) return false;
        }
        return true;
    }

    solveSudoku(theBoard);
}

function createBoardAndNumbers() {
    for (let i = 1; i <= 9; i++) {
        const number = document.createElement("div");
        number.textContent = i;
        number.id = i;
        number.classList.add("number");
        number.addEventListener("click", selectNumberToUse);
        numbersContainer.append(number);
    }
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("div");
            cell.id = `${row}-${col}`;
            cell.classList.add("cell");
            if (theBoard[row][col] !== 0) {
                if (--usedNumbers[theBoard[row][col]] <= 0) {
                    document.querySelectorAll(".number").forEach(num => {
                        if (num.id == theBoard[row][col]) {
                            num.classList.add("disabled");
                        }
                    });
                };
                cell.textContent = theBoard[row][col];
                cell.classList.add("right");
                availableCells--;
            }
            if (row == 2 || row == 5) cell.classList.add("bottom-border");
            if (col == 2 || col == 5) cell.classList.add("right-border");
            cell.addEventListener("click", handleCellClick);
            gameBoardElement.append(cell);
        }
    }
}

function disableBtnsAndTimer() {
    clearInterval(IntervalID);
    btnSolve.disabled = true;
    btnHints.disabled = true;
}

function highlightRelatedCells(cell) {
    const hasHighlight = cell.classList.contains("highlight");
    document.querySelectorAll(".cell").forEach(cell => cell.classList.remove("highlight"));
    if (hasHighlight) return;
    const row = cell.id.split("-")[0];
    const col = cell.id.split("-")[1];
    for (let i = 0; i < 9; i++) {
        const sRow = Math.floor(row / 3) * 3 + Math.floor(i / 3);
        const sCol = Math.floor(col / 3) * 3 + Math.floor(i % 3);
        //if (!document.getElementById(`${row}-${i}`).classList.contains("right"))
        document.getElementById(`${row}-${i}`).classList.add("highlight");
        //if (!document.getElementById(`${i}-${col}`).classList.contains("right"))
        document.getElementById(`${i}-${col}`).classList.add("highlight");
        //if (!document.getElementById(`${sRow}-${sCol}`).classList.contains("right"))
        document.getElementById(`${sRow}-${sCol}`).classList.add("highlight");
    }
}

function onRightCellClicked(cell) {
    const row = parseInt(cell.id.split("-")[0]);
    const col = parseInt(cell.id.split("-")[1]);
    cell.textContent = theSolution[row][col];
    cell.classList.remove("wronge");
    cell.classList.add("right");
    document.querySelectorAll(".number").forEach(num => {
        if (num.id == theSolution[row][col]) {
            if (--usedNumbers[theSolution[row][col]] <= 0) {
                num.classList.add("disabled");
                num.classList.remove("active");
            }
        }
    });
    if (--availableCells <= 0) {
        disableBtnsAndTimer();
    }
}

function handleHints(cell) {
    onRightCellClicked(cell);
    if (--hintsNumber <= 0) {
        btnHints.disabled = true;
        btnHints.classList.remove("active");
    }
    if (hintsNumber > 1) btnHints.textContent = `${hintsNumber} Hints`;
    else btnHints.textContent = `${hintsNumber} Hint`;
}

function selectNumberToUse() {
    btnHints.classList.remove("active");
    if (this.classList.contains("disabled")) return;
    if (selectedNumber == this) {
        this.classList.remove("active");
        selectedNumber = null;
        return;
    }
    if (selectedNumber) selectedNumber.classList.remove("active");
    selectedNumber = this.classList.add("active");
    selectedNumber = this;
}

function handleLosing() {
    document.documentElement.classList.add("loser");
}

function handleWinning() {
    document.documentElement.classList.add("winner");
}

const handleCellClick = function () {
    if (selectedNumber && !this.classList.contains("right")) {
        this.textContent = selectedNumber.id;
        const row = parseInt(this.id.split("-")[0]);
        const col = parseInt(this.id.split("-")[1]);
        if (selectedNumber.id == theSolution[row][col]) {
            onRightCellClicked(this);
        }
        else {
            this.classList.add("wronge");
            document.querySelector(".errors").innerHTML = --allowedErrors;
            if (allowedErrors == 0) {
                disableBtnsAndTimer();
                btnSolve.disabled = false;
                document.querySelectorAll(".number").forEach(num => {
                    num.classList.add("disabled")
                    num.classList.remove("active");
                });
                selectedNumber = null;
            }
        }
    }
    else if (btnHints.classList.contains("active")) handleHints(this);
    else highlightRelatedCells(this);
}

btnStart.onclick = function () {
    passedSeconds = 0;
    selectedNumber = null;
    availableCells = 81;
    usedNumbers = [0, 9, 9, 9, 9, 9, 9, 9, 9, 9];
    levelsSpans.forEach(span => {
        if (span.classList.contains("active")) {
            chosenLevel = span.classList[1];
            if (chosenLevel === "easy") {
                allowedErrors = 5;
                hintsNumber = 5;
            }
            else if (chosenLevel === "medium") {
                allowedErrors = 3;
                hintsNumber = 3;
            }
            else {
                allowedErrors = 1;
                hintsNumber = 1;
            }
        }
    });
    clearInterval(IntervalID);
    btnSolve.disabled = false;
    btnHints.disabled = false;
    gameBoardElement.innerHTML = "";
    numbersContainer.innerHTML = "";
    timerElement.innerHTML = "00 : 00";
    errorsElement.textContent = allowedErrors;
    if (hintsNumber > 1) btnHints.textContent = `${hintsNumber} Hints`;
    else btnHints.textContent = `${hintsNumber} Hint`;
    getAndSetSudokuBoard();
    setTimer();
}

btnSolve.onclick = function () {
    document.querySelectorAll(".game-board .cell:not(.right)").forEach(cell => {
        onRightCellClicked(cell);
    });
}

btnHints.onclick = function () {
    if (this.disabled) return;
    this.classList.toggle("active");
    if (selectedNumber) selectedNumber.classList.remove("active")
    selectedNumber = null;
}

toggle.onclick = function () {
    if (document.documentElement.classList.contains("light-mode")) {
        document.documentElement.classList.add("dark-mode");
        document.documentElement.classList.remove("light-mode");
        this.src = "imgs/sun.png";
    }
    else {
        document.documentElement.classList.remove("dark-mode");
        document.documentElement.classList.add("light-mode");
        this.src = "imgs/moon.png";
    }
}

levelsSpans.forEach(span => {
    span.addEventListener("click", function () {
        levelsSpans.forEach(span => span.classList.remove("active"));
        this.classList.add("active");
    });
});

setTimeout(() => {
    btnStart.click();
}, 0);

const SudokusWithSolutions = {
    "SolvedSudoku":
        [
            [
                [1, 9, 4, 8, 6, 5, 2, 3, 7],
                [7, 3, 5, 4, 1, 2, 9, 6, 8],
                [8, 6, 2, 3, 9, 7, 1, 4, 5],
                [9, 2, 1, 7, 4, 8, 3, 5, 6],
                [6, 7, 8, 5, 3, 1, 4, 2, 9],
                [4, 5, 3, 9, 2, 6, 8, 7, 1],
                [3, 8, 9, 6, 5, 4, 7, 1, 2],
                [2, 4, 6, 1, 7, 9, 5, 8, 3],
                [5, 1, 7, 2, 8, 3, 6, 9, 4]
            ],
            [
                [5, 1, 9, 3, 2, 4, 6, 7, 8],
                [8, 6, 3, 9, 1, 7, 2, 5, 4],
                [4, 2, 7, 5, 8, 6, 1, 9, 3],
                [1, 9, 8, 7, 6, 5, 4, 3, 2],
                [2, 3, 5, 1, 4, 9, 8, 6, 7],
                [6, 7, 4, 8, 3, 2, 9, 1, 5],
                [3, 8, 2, 6, 5, 1, 7, 4, 9],
                [7, 4, 1, 2, 9, 3, 5, 8, 6],
                [9, 5, 6, 4, 7, 8, 3, 2, 1]
            ],
            [
                [8, 4, 7, 3, 6, 1, 2, 9, 5],
                [9, 6, 5, 4, 2, 8, 3, 7, 1],
                [3, 2, 1, 5, 7, 9, 4, 8, 6],
                [4, 1, 6, 7, 9, 3, 8, 5, 2],
                [5, 9, 8, 6, 4, 2, 1, 3, 7],
                [2, 7, 3, 1, 8, 5, 9, 6, 4],
                [6, 8, 4, 9, 1, 7, 5, 2, 3],
                [7, 5, 2, 8, 3, 4, 6, 1, 9],
                [1, 3, 9, 2, 5, 6, 7, 4, 8]
            ],
            [
                [3, 9, 5, 1, 6, 4, 7, 8, 2],
                [2, 6, 7, 8, 9, 5, 1, 3, 4],
                [1, 8, 4, 7, 2, 3, 5, 9, 6],
                [5, 4, 2, 3, 8, 9, 6, 1, 7],
                [9, 1, 3, 6, 7, 2, 8, 4, 5],
                [6, 7, 8, 5, 4, 1, 3, 2, 9],
                [4, 3, 6, 9, 5, 8, 2, 7, 1],
                [8, 5, 9, 2, 1, 7, 4, 6, 3],
                [7, 2, 1, 4, 3, 6, 9, 5, 8]
            ],
            [
                [2, 8, 7, 6, 3, 9, 5, 4, 1],
                [5, 3, 6, 4, 2, 1, 8, 7, 9],
                [9, 4, 1, 8, 7, 5, 3, 2, 6],
                [3, 2, 5, 1, 9, 4, 6, 8, 7],
                [6, 1, 9, 3, 8, 7, 4, 5, 2],
                [8, 7, 4, 5, 6, 2, 9, 1, 3],
                [7, 9, 8, 2, 5, 6, 1, 3, 4],
                [1, 6, 3, 7, 4, 8, 2, 9, 5],
                [4, 5, 2, 9, 1, 3, 7, 6, 8]
            ],
            [
                [5, 4, 3, 7, 9, 8, 2, 6, 1],
                [1, 8, 2, 4, 5, 6, 3, 7, 9],
                [9, 6, 7, 1, 3, 2, 5, 4, 8],
                [6, 5, 9, 2, 7, 3, 1, 8, 4],
                [8, 2, 1, 5, 4, 9, 7, 3, 6],
                [3, 7, 4, 8, 6, 1, 9, 2, 5],
                [7, 9, 5, 3, 8, 4, 6, 1, 2],
                [2, 3, 8, 6, 1, 5, 4, 9, 7],
                [4, 1, 6, 9, 2, 7, 8, 5, 3]
            ],
            [
                [3, 1, 8, 4, 9, 7, 6, 2, 5],
                [2, 4, 5, 6, 3, 1, 7, 8, 9],
                [7, 6, 9, 5, 8, 2, 1, 3, 4],
                [8, 9, 3, 7, 4, 6, 2, 5, 1],
                [6, 2, 1, 3, 5, 8, 4, 9, 7],
                [4, 5, 7, 1, 2, 9, 8, 6, 3],
                [9, 7, 4, 8, 6, 3, 5, 1, 2],
                [5, 8, 2, 9, 1, 4, 3, 7, 6],
                [1, 3, 6, 2, 7, 5, 9, 4, 8]
            ],
            [
                [8, 3, 7, 4, 5, 1, 6, 2, 9],
                [9, 2, 4, 6, 8, 3, 7, 5, 1],
                [1, 5, 6, 7, 2, 9, 4, 3, 8],
                [7, 1, 5, 8, 9, 2, 3, 4, 6],
                [6, 8, 2, 3, 1, 4, 9, 7, 5],
                [4, 9, 3, 5, 6, 7, 8, 1, 2],
                [5, 4, 9, 2, 3, 8, 1, 6, 7],
                [2, 7, 1, 9, 4, 6, 5, 8, 3],
                [3, 6, 8, 1, 7, 5, 2, 9, 4]
            ],
            [
                [3, 1, 4, 7, 8, 9, 6, 2, 5],
                [7, 2, 6, 3, 1, 5, 4, 8, 9],
                [5, 9, 8, 6, 2, 4, 7, 1, 3],
                [9, 6, 5, 1, 4, 3, 8, 7, 2],
                [2, 8, 3, 9, 7, 6, 1, 5, 4],
                [1, 4, 7, 8, 5, 2, 9, 3, 6],
                [8, 5, 9, 2, 6, 7, 3, 4, 1],
                [4, 3, 1, 5, 9, 8, 2, 6, 7],
                [6, 7, 2, 4, 3, 1, 5, 9, 8]
            ],
            [
                [7, 4, 8, 1, 2, 5, 6, 9, 3],
                [2, 3, 5, 8, 6, 9, 4, 1, 7],
                [6, 9, 1, 7, 4, 3, 2, 5, 8],
                [1, 2, 3, 9, 8, 6, 7, 4, 5],
                [5, 7, 6, 4, 3, 1, 8, 2, 9],
                [4, 8, 9, 2, 5, 7, 3, 6, 1],
                [3, 5, 2, 6, 9, 8, 1, 7, 4],
                [8, 1, 4, 5, 7, 2, 9, 3, 6],
                [9, 6, 7, 3, 1, 4, 5, 8, 2]
            ],
            [
                [6, 8, 3, 2, 7, 4, 5, 9, 1],
                [5, 9, 2, 1, 6, 8, 3, 7, 4],
                [7, 4, 1, 9, 5, 3, 6, 2, 8],
                [4, 2, 7, 5, 1, 6, 8, 3, 9],
                [1, 6, 8, 7, 3, 9, 2, 4, 5],
                [9, 3, 5, 8, 4, 2, 1, 6, 7],
                [8, 7, 4, 3, 2, 1, 9, 5, 6],
                [2, 1, 6, 4, 9, 5, 7, 8, 3],
                [3, 5, 9, 6, 8, 7, 4, 1, 2]
            ],
            [
                [5, 8, 2, 4, 3, 7, 9, 6, 1],
                [3, 6, 1, 8, 9, 5, 7, 4, 2],
                [7, 9, 4, 1, 2, 6, 8, 5, 3],
                [9, 7, 5, 2, 6, 4, 3, 1, 8],
                [4, 2, 8, 3, 5, 1, 6, 7, 9],
                [6, 1, 3, 7, 8, 9, 5, 2, 4],
                [1, 4, 6, 9, 7, 3, 2, 8, 5],
                [2, 5, 9, 6, 1, 8, 4, 3, 7],
                [8, 3, 7, 5, 4, 2, 1, 9, 6]
            ],
            [
                [5, 7, 9, 6, 8, 3, 1, 4, 2],
                [1, 3, 4, 7, 9, 2, 8, 5, 6],
                [2, 8, 6, 5, 1, 4, 3, 7, 9],
                [7, 9, 5, 4, 6, 8, 2, 1, 3],
                [4, 1, 2, 9, 3, 7, 5, 6, 8],
                [8, 6, 3, 2, 5, 1, 4, 9, 7],
                [3, 5, 7, 1, 2, 9, 6, 8, 4],
                [6, 4, 8, 3, 7, 5, 9, 2, 1],
                [9, 2, 1, 8, 4, 6, 7, 3, 5]
            ],
            [
                [5, 4, 7, 9, 8, 3, 1, 6, 2],
                [3, 9, 1, 5, 2, 6, 7, 8, 4],
                [6, 2, 8, 1, 4, 7, 3, 9, 5],
                [7, 3, 4, 6, 9, 8, 5, 2, 1],
                [1, 8, 6, 2, 5, 4, 9, 3, 7],
                [2, 5, 9, 3, 7, 1, 8, 4, 6],
                [9, 7, 5, 8, 6, 2, 4, 1, 3],
                [8, 1, 2, 4, 3, 5, 6, 7, 9],
                [4, 6, 3, 7, 1, 9, 2, 5, 8]
            ],
            [
                [6, 3, 8, 5, 1, 4, 2, 7, 9],
                [4, 1, 9, 2, 3, 7, 6, 8, 5],
                [5, 7, 2, 8, 6, 9, 3, 1, 4],
                [7, 8, 6, 4, 5, 3, 9, 2, 1],
                [2, 5, 3, 7, 9, 1, 4, 6, 8],
                [9, 4, 1, 6, 2, 8, 5, 3, 7],
                [3, 2, 4, 1, 8, 5, 7, 9, 6],
                [1, 6, 7, 9, 4, 2, 8, 5, 3],
                [8, 9, 5, 3, 7, 6, 1, 4, 2]
            ],
            [
                [5, 1, 6, 9, 4, 2, 3, 8, 7],
                [7, 8, 3, 6, 1, 5, 9, 4, 2],
                [9, 2, 4, 7, 3, 8, 6, 5, 1],
                [2, 4, 1, 3, 6, 9, 8, 7, 5],
                [3, 7, 8, 2, 5, 4, 1, 9, 6],
                [6, 5, 9, 8, 7, 1, 4, 2, 3],
                [4, 9, 5, 1, 2, 3, 7, 6, 8],
                [8, 3, 7, 5, 9, 6, 2, 1, 4],
                [1, 6, 2, 4, 8, 7, 5, 3, 9]
            ],
            [
                [7, 8, 4, 5, 6, 2, 3, 1, 9],
                [1, 6, 9, 3, 4, 7, 8, 2, 5],
                [5, 3, 2, 9, 8, 1, 4, 7, 6],
                [8, 4, 6, 1, 7, 9, 2, 5, 3],
                [2, 9, 7, 6, 5, 3, 1, 8, 4],
                [3, 5, 1, 4, 2, 8, 9, 6, 7],
                [9, 7, 5, 2, 1, 4, 6, 3, 8],
                [4, 1, 8, 7, 3, 6, 5, 9, 2],
                [6, 2, 3, 8, 9, 5, 7, 4, 1]
            ],
            [
                [6, 3, 7, 5, 8, 2, 4, 9, 1],
                [4, 8, 2, 9, 1, 3, 7, 5, 6],
                [5, 9, 1, 6, 7, 4, 2, 3, 8],
                [1, 2, 3, 4, 6, 9, 5, 8, 7],
                [9, 6, 8, 1, 5, 7, 3, 2, 4],
                [7, 4, 5, 3, 2, 8, 6, 1, 9],
                [2, 7, 9, 8, 3, 6, 1, 4, 5],
                [3, 1, 4, 7, 9, 5, 8, 6, 2],
                [8, 5, 6, 2, 4, 1, 9, 7, 3]
            ],
            [
                [9, 7, 5, 6, 3, 2, 4, 1, 8],
                [3, 4, 1, 8, 9, 5, 6, 7, 2],
                [2, 6, 8, 4, 7, 1, 3, 5, 9],
                [4, 1, 7, 2, 5, 8, 9, 6, 3],
                [6, 8, 3, 9, 1, 7, 2, 4, 5],
                [5, 9, 2, 3, 6, 4, 7, 8, 1],
                [7, 2, 4, 1, 8, 3, 5, 9, 6],
                [1, 3, 6, 5, 4, 9, 8, 2, 7],
                [8, 5, 9, 7, 2, 6, 1, 3, 4]
            ],
            [
                [2, 1, 4, 6, 7, 9, 5, 8, 3],
                [8, 3, 9, 4, 5, 1, 7, 2, 6],
                [5, 6, 7, 8, 2, 3, 1, 9, 4],
                [7, 9, 3, 1, 6, 5, 8, 4, 2],
                [6, 8, 5, 2, 3, 4, 9, 7, 1],
                [4, 2, 1, 9, 8, 7, 3, 6, 5],
                [3, 7, 6, 5, 9, 2, 4, 1, 8],
                [1, 5, 2, 7, 4, 8, 6, 3, 9],
                [9, 4, 8, 3, 1, 6, 2, 5, 7]
            ],
            [
                [4, 6, 1, 8, 2, 5, 7, 3, 9],
                [3, 8, 9, 7, 1, 6, 4, 5, 2],
                [2, 5, 7, 4, 9, 3, 1, 8, 6],
                [8, 7, 2, 3, 6, 4, 5, 9, 1],
                [9, 3, 6, 5, 7, 1, 8, 2, 4],
                [1, 4, 5, 9, 8, 2, 6, 7, 3],
                [5, 9, 3, 6, 4, 8, 2, 1, 7],
                [6, 1, 8, 2, 3, 7, 9, 4, 5],
                [7, 2, 4, 1, 5, 9, 3, 6, 8]
            ],
            [
                [5, 8, 4, 1, 2, 7, 6, 9, 3],
                [3, 7, 2, 6, 5, 9, 1, 8, 4],
                [9, 1, 6, 3, 8, 4, 2, 5, 7],
                [4, 3, 7, 9, 1, 8, 5, 2, 6],
                [2, 5, 9, 7, 4, 6, 8, 3, 1],
                [1, 6, 8, 5, 3, 2, 4, 7, 9],
                [7, 2, 3, 8, 6, 1, 9, 4, 5],
                [6, 4, 5, 2, 9, 3, 7, 1, 8],
                [8, 9, 1, 4, 7, 5, 3, 6, 2]
            ],
            [
                [4, 1, 6, 7, 2, 8, 3, 5, 9],
                [8, 5, 2, 1, 9, 3, 7, 4, 6],
                [7, 3, 9, 6, 5, 4, 8, 1, 2],
                [6, 4, 5, 9, 8, 7, 2, 3, 1],
                [9, 2, 7, 3, 1, 6, 5, 8, 4],
                [1, 8, 3, 5, 4, 2, 9, 6, 7],
                [2, 9, 8, 4, 3, 1, 6, 7, 5],
                [5, 7, 4, 8, 6, 9, 1, 2, 3],
                [3, 6, 1, 2, 7, 5, 4, 9, 8]
            ],
            [
                [8, 3, 5, 4, 2, 1, 6, 9, 7],
                [4, 7, 1, 5, 9, 6, 8, 2, 3],
                [6, 9, 2, 8, 3, 7, 1, 4, 5],
                [3, 4, 6, 2, 5, 8, 7, 1, 9],
                [1, 5, 9, 3, 7, 4, 2, 6, 8],
                [2, 8, 7, 1, 6, 9, 3, 5, 4],
                [5, 1, 4, 6, 8, 3, 9, 7, 2],
                [9, 6, 8, 7, 4, 2, 5, 3, 1],
                [7, 2, 3, 9, 1, 5, 4, 8, 6]
            ],
            [
                [9, 1, 3, 5, 7, 8, 2, 6, 4],
                [8, 4, 6, 9, 2, 1, 7, 3, 5],
                [2, 5, 7, 3, 4, 6, 8, 9, 1],
                [6, 9, 2, 8, 1, 5, 4, 7, 3],
                [5, 7, 4, 2, 6, 3, 1, 8, 9],
                [1, 3, 8, 7, 9, 4, 6, 5, 2],
                [4, 2, 5, 6, 8, 9, 3, 1, 7],
                [3, 6, 1, 4, 5, 7, 9, 2, 8],
                [7, 8, 9, 1, 3, 2, 5, 4, 6]
            ],
            [
                [7, 3, 9, 2, 5, 8, 6, 1, 4],
                [5, 1, 8, 7, 6, 4, 3, 9, 2],
                [2, 4, 6, 1, 3, 9, 8, 7, 5],
                [3, 2, 7, 9, 4, 5, 1, 6, 8],
                [6, 8, 5, 3, 1, 2, 9, 4, 7],
                [1, 9, 4, 6, 8, 7, 5, 2, 3],
                [4, 7, 1, 8, 9, 3, 2, 5, 6],
                [8, 6, 2, 5, 7, 1, 4, 3, 9],
                [9, 5, 3, 4, 2, 6, 7, 8, 1]
            ],
            [
                [7, 3, 8, 9, 6, 1, 5, 2, 4],
                [6, 2, 1, 7, 4, 5, 8, 9, 3],
                [4, 9, 5, 8, 3, 2, 7, 1, 6],
                [9, 5, 4, 2, 1, 6, 3, 8, 7],
                [3, 8, 2, 4, 9, 7, 6, 5, 1],
                [1, 7, 6, 5, 8, 3, 2, 4, 9],
                [2, 6, 3, 1, 5, 9, 4, 7, 8],
                [8, 1, 7, 3, 2, 4, 9, 6, 5],
                [5, 4, 9, 6, 7, 8, 1, 3, 2]
            ]
        ],

    "RawSudoku":
        [
            [
                [0, 9, 0, 8, 6, 5, 2, 0, 0],
                [0, 0, 5, 0, 1, 2, 0, 6, 8],
                [0, 0, 0, 0, 0, 0, 0, 4, 0],
                [0, 0, 0, 0, 0, 8, 0, 5, 6],
                [0, 0, 8, 0, 0, 0, 4, 0, 0],
                [4, 5, 0, 9, 0, 0, 0, 0, 0],
                [0, 8, 0, 0, 0, 0, 0, 0, 0],
                [2, 4, 0, 1, 7, 0, 5, 0, 0],
                [0, 0, 7, 2, 8, 3, 0, 9, 0]
            ],
            [
                [0, 0, 0, 0, 0, 4, 6, 7, 8],
                [0, 0, 0, 9, 0, 0, 0, 0, 4],
                [0, 0, 7, 0, 0, 6, 1, 9, 0],
                [0, 9, 8, 7, 6, 0, 0, 0, 2],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [6, 0, 0, 0, 3, 2, 9, 1, 0],
                [0, 8, 2, 6, 0, 0, 7, 0, 0],
                [7, 0, 0, 0, 0, 3, 0, 0, 0],
                [9, 5, 6, 4, 0, 0, 0, 0, 0]
            ],
            [
                [0, 0, 7, 0, 0, 1, 0, 0, 5],
                [0, 0, 5, 4, 0, 0, 3, 7, 1],
                [0, 0, 0, 0, 0, 0, 4, 8, 0],
                [0, 0, 0, 7, 9, 0, 8, 0, 2],
                [0, 9, 0, 0, 0, 0, 0, 3, 0],
                [2, 0, 3, 0, 8, 5, 0, 0, 0],
                [0, 8, 4, 0, 0, 0, 0, 0, 0],
                [7, 5, 2, 0, 0, 4, 6, 0, 0],
                [1, 0, 0, 2, 0, 0, 7, 0, 0]
            ],
            [
                [0, 9, 5, 0, 0, 0, 0, 0, 0],
                [0, 6, 0, 0, 9, 0, 0, 0, 0],
                [1, 8, 0, 7, 2, 3, 5, 0, 0],
                [0, 0, 0, 3, 0, 0, 0, 1, 7],
                [0, 1, 3, 0, 0, 0, 8, 4, 0],
                [6, 7, 0, 0, 0, 1, 0, 0, 0],
                [0, 0, 6, 9, 5, 8, 0, 7, 1],
                [0, 0, 0, 0, 1, 0, 0, 6, 0],
                [0, 0, 0, 0, 0, 0, 9, 5, 0]
            ],
            [
                [0, 0, 7, 6, 3, 0, 5, 4, 0],
                [0, 0, 0, 0, 2, 1, 8, 0, 9],
                [0, 0, 0, 0, 0, 0, 3, 0, 0],
                [0, 2, 5, 0, 0, 4, 6, 0, 7],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [8, 0, 4, 5, 0, 0, 9, 1, 0],
                [0, 0, 8, 0, 0, 0, 0, 0, 0],
                [1, 0, 3, 7, 4, 0, 0, 0, 0],
                [0, 5, 2, 0, 1, 3, 7, 0, 0]
            ],
            [
                [0, 0, 3, 0, 9, 0, 0, 0, 0],
                [0, 8, 0, 4, 5, 0, 0, 0, 0],
                [9, 6, 0, 1, 0, 0, 0, 4, 8],
                [6, 0, 0, 2, 7, 0, 0, 0, 0],
                [8, 2, 0, 0, 4, 0, 0, 3, 6],
                [0, 0, 0, 0, 6, 1, 0, 0, 5],
                [7, 9, 0, 0, 0, 4, 0, 1, 2],
                [0, 0, 0, 0, 1, 5, 0, 9, 0],
                [0, 0, 0, 0, 2, 0, 8, 0, 0]
            ],
            [
                [0, 0, 0, 0, 0, 7, 0, 0, 5],
                [0, 0, 0, 0, 0, 1, 7, 0, 0],
                [0, 6, 9, 5, 8, 2, 0, 0, 0],
                [0, 0, 3, 7, 0, 6, 0, 5, 0],
                [6, 2, 0, 0, 5, 0, 0, 9, 7],
                [0, 5, 0, 1, 0, 9, 8, 0, 0],
                [0, 0, 0, 8, 6, 3, 5, 1, 0],
                [0, 0, 2, 9, 0, 0, 0, 0, 0],
                [1, 0, 0, 2, 0, 0, 0, 0, 0]
            ],
            [
                [0, 0, 0, 0, 5, 0, 6, 0, 9],
                [0, 2, 0, 0, 8, 0, 0, 5, 0],
                [0, 0, 6, 7, 0, 0, 0, 0, 0],
                [7, 0, 5, 8, 0, 2, 3, 4, 0],
                [0, 0, 2, 0, 0, 0, 9, 0, 0],
                [0, 9, 3, 5, 0, 7, 8, 0, 2],
                [0, 0, 0, 0, 0, 8, 1, 0, 0],
                [0, 7, 0, 0, 4, 0, 0, 8, 0],
                [3, 0, 8, 0, 7, 0, 0, 0, 0]
            ],
            [
                [0, 1, 4, 7, 0, 9, 0, 2, 5],
                [0, 0, 0, 0, 0, 0, 4, 0, 0],
                [0, 9, 0, 0, 0, 4, 0, 1, 3],
                [0, 0, 5, 0, 4, 0, 0, 7, 0],
                [0, 8, 0, 0, 7, 0, 0, 5, 0],
                [0, 4, 0, 0, 5, 0, 9, 0, 0],
                [8, 5, 0, 2, 0, 0, 0, 4, 0],
                [0, 0, 1, 0, 0, 0, 0, 0, 0],
                [6, 7, 0, 4, 0, 1, 5, 9, 0]
            ],
            [
                [7, 0, 8, 0, 0, 5, 6, 0, 3],
                [0, 0, 0, 0, 0, 9, 0, 0, 0],
                [6, 0, 1, 7, 4, 0, 0, 0, 8],
                [1, 2, 0, 0, 8, 0, 0, 0, 0],
                [0, 0, 6, 0, 0, 0, 8, 0, 0],
                [0, 0, 0, 0, 5, 0, 0, 6, 1],
                [3, 0, 0, 0, 9, 8, 1, 0, 4],
                [0, 0, 0, 5, 0, 0, 0, 0, 0],
                [9, 0, 7, 3, 0, 0, 5, 0, 2]
            ],
            [
                [6, 0, 0, 0, 0, 4, 5, 9, 1],
                [5, 0, 0, 1, 6, 0, 0, 7, 0],
                [0, 4, 0, 9, 0, 0, 6, 0, 0],
                [0, 0, 0, 5, 0, 0, 8, 0, 0],
                [0, 6, 0, 0, 3, 0, 0, 4, 0],
                [0, 0, 5, 0, 0, 2, 0, 0, 0],
                [0, 0, 4, 0, 0, 1, 0, 5, 0],
                [0, 1, 0, 0, 9, 5, 0, 0, 3],
                [3, 5, 9, 6, 0, 0, 0, 0, 2]
            ],
            [
                [5, 8, 0, 0, 3, 7, 0, 0, 1],
                [0, 6, 0, 0, 0, 0, 0, 4, 0],
                [0, 9, 4, 0, 0, 0, 8, 5, 0],
                [0, 0, 5, 0, 6, 4, 0, 1, 0],
                [0, 0, 0, 0, 0, 0, 0, 0, 0],
                [0, 1, 0, 7, 8, 0, 5, 0, 0],
                [0, 4, 6, 0, 0, 0, 2, 8, 0],
                [0, 5, 0, 0, 0, 0, 0, 3, 0],
                [8, 0, 0, 5, 4, 0, 0, 9, 6]
            ],
            [
                [5, 7, 9, 0, 0, 3, 1, 4, 2],
                [0, 0, 0, 0, 0, 2, 8, 0, 0],
                [0, 0, 0, 5, 1, 0, 0, 0, 0],
                [0, 9, 5, 0, 0, 0, 0, 0, 3],
                [4, 0, 0, 0, 0, 0, 0, 0, 8],
                [8, 0, 0, 0, 0, 0, 4, 9, 0],
                [0, 0, 0, 0, 2, 9, 0, 0, 0],
                [0, 0, 8, 3, 0, 0, 0, 0, 0],
                [9, 2, 1, 8, 0, 0, 7, 3, 5]
            ],
            [
                [5, 0, 0, 9, 0, 0, 0, 6, 2],
                [0, 9, 1, 0, 2, 6, 7, 0, 0],
                [0, 0, 0, 1, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 8, 0, 2, 0],
                [1, 0, 6, 2, 0, 4, 9, 0, 7],
                [0, 5, 0, 3, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 2, 0, 0, 0],
                [0, 0, 2, 4, 3, 0, 6, 7, 0],
                [4, 6, 0, 0, 0, 9, 0, 0, 8]
            ],
            [
                [6, 0, 0, 5, 0, 0, 0, 0, 0],
                [0, 1, 0, 0, 0, 0, 0, 0, 5],
                [0, 7, 2, 0, 0, 9, 3, 0, 0],
                [7, 8, 0, 4, 0, 3, 0, 0, 0],
                [2, 0, 3, 7, 0, 1, 4, 0, 8],
                [0, 0, 0, 6, 0, 8, 0, 3, 7],
                [0, 0, 4, 1, 0, 0, 7, 9, 0],
                [1, 0, 0, 0, 0, 0, 0, 5, 0],
                [0, 0, 0, 0, 0, 6, 0, 0, 2]
            ],
            [
                [5, 0, 0, 9, 4, 2, 3, 0, 0],
                [0, 0, 3, 6, 0, 0, 0, 0, 2],
                [0, 0, 4, 7, 0, 8, 0, 0, 0],
                [0, 4, 1, 0, 0, 0, 0, 7, 0],
                [3, 0, 0, 0, 0, 0, 0, 0, 6],
                [0, 5, 0, 0, 0, 0, 4, 2, 0],
                [0, 0, 0, 1, 0, 3, 7, 0, 0],
                [8, 0, 0, 0, 0, 6, 2, 0, 0],
                [0, 0, 2, 4, 8, 7, 0, 0, 9]
            ],
            [
                [7, 8, 4, 5, 0, 2, 0, 0, 0],
                [0, 0, 0, 0, 4, 0, 0, 0, 0],
                [5, 3, 2, 0, 0, 0, 0, 0, 0],
                [8, 0, 0, 1, 0, 0, 0, 5, 0],
                [2, 0, 7, 6, 0, 3, 1, 0, 4],
                [0, 5, 0, 0, 0, 8, 0, 0, 7],
                [0, 0, 0, 0, 0, 0, 6, 3, 8],
                [0, 0, 0, 0, 3, 0, 0, 0, 0],
                [0, 0, 0, 8, 0, 5, 7, 4, 1]
            ],
            [
                [0, 3, 0, 5, 8, 0, 0, 9, 0],
                [4, 8, 0, 9, 0, 0, 7, 0, 0],
                [0, 0, 0, 0, 0, 4, 0, 0, 8],
                [0, 0, 3, 0, 0, 0, 5, 0, 7],
                [0, 0, 8, 1, 5, 7, 3, 0, 0],
                [7, 0, 5, 0, 0, 0, 6, 0, 0],
                [2, 0, 0, 8, 0, 0, 0, 0, 0],
                [0, 0, 4, 0, 0, 5, 0, 6, 2],
                [0, 5, 0, 0, 4, 1, 0, 7, 0]
            ],
            [
                [9, 0, 5, 6, 3, 0, 0, 0, 8],
                [0, 4, 0, 8, 9, 0, 0, 0, 0],
                [0, 6, 0, 0, 0, 1, 3, 0, 0],
                [4, 1, 0, 0, 0, 0, 0, 0, 0],
                [6, 0, 3, 0, 0, 0, 2, 0, 5],
                [0, 0, 0, 0, 0, 0, 0, 8, 1],
                [0, 0, 4, 1, 0, 0, 0, 9, 0],
                [0, 0, 0, 0, 4, 9, 0, 2, 0],
                [8, 0, 0, 0, 2, 6, 1, 0, 4]
            ],
            [
                [2, 0, 4, 0, 7, 9, 5, 0, 0],
                [0, 0, 0, 0, 5, 0, 0, 0, 6],
                [0, 6, 0, 0, 2, 3, 1, 0, 0],
                [0, 0, 3, 0, 0, 0, 0, 4, 0],
                [6, 0, 5, 0, 0, 0, 9, 0, 1],
                [0, 2, 0, 0, 0, 0, 3, 0, 0],
                [0, 0, 6, 5, 9, 0, 0, 1, 0],
                [1, 0, 0, 0, 4, 0, 0, 0, 0],
                [0, 0, 8, 3, 1, 0, 2, 0, 7]
            ],
            [
                [0, 0, 0, 0, 0, 5, 0, 0, 0],
                [3, 8, 9, 7, 0, 0, 0, 0, 2],
                [0, 5, 7, 0, 0, 3, 0, 0, 6],
                [8, 0, 2, 0, 0, 4, 5, 0, 0],
                [0, 3, 0, 0, 0, 0, 0, 2, 0],
                [0, 0, 5, 9, 0, 0, 6, 0, 3],
                [5, 0, 0, 6, 0, 0, 2, 1, 0],
                [6, 0, 0, 0, 0, 7, 9, 4, 5],
                [0, 0, 0, 1, 0, 0, 0, 0, 0]
            ],
            [
                [5, 0, 0, 1, 0, 0, 6, 0, 0],
                [3, 7, 0, 0, 0, 9, 0, 0, 4],
                [9, 1, 0, 0, 0, 4, 0, 5, 0],
                [0, 0, 7, 9, 0, 0, 0, 0, 0],
                [0, 0, 9, 7, 0, 6, 8, 0, 0],
                [0, 0, 0, 0, 0, 2, 4, 0, 0],
                [0, 2, 0, 8, 0, 0, 0, 4, 5],
                [6, 0, 0, 2, 0, 0, 0, 1, 8],
                [0, 0, 1, 0, 0, 5, 0, 0, 2]
            ],
            [
                [4, 0, 6, 0, 2, 0, 0, 0, 9],
                [0, 5, 2, 1, 0, 0, 0, 0, 0],
                [0, 0, 9, 0, 0, 4, 8, 0, 0],
                [0, 4, 0, 9, 8, 7, 0, 0, 0],
                [9, 0, 0, 0, 0, 0, 0, 0, 4],
                [0, 0, 0, 5, 4, 2, 0, 6, 0],
                [0, 0, 8, 4, 0, 0, 6, 0, 0],
                [0, 0, 0, 0, 0, 9, 1, 2, 0],
                [3, 0, 0, 0, 7, 0, 4, 0, 8]
            ],
            [
                [8, 0, 5, 4, 2, 1, 0, 0, 0],
                [0, 7, 0, 0, 9, 0, 0, 0, 0],
                [0, 9, 0, 0, 3, 0, 0, 0, 5],
                [0, 4, 6, 2, 0, 0, 0, 0, 0],
                [0, 5, 9, 0, 0, 0, 2, 6, 0],
                [0, 0, 0, 0, 0, 9, 3, 5, 0],
                [5, 0, 0, 0, 8, 0, 0, 7, 0],
                [0, 0, 0, 0, 4, 0, 0, 3, 0],
                [0, 0, 0, 9, 1, 5, 4, 0, 6]
            ],
            [
                [0, 1, 0, 0, 7, 8, 2, 6, 0],
                [0, 0, 6, 0, 0, 0, 0, 3, 5],
                [0, 0, 0, 0, 0, 6, 8, 0, 1],
                [6, 0, 0, 0, 0, 5, 0, 0, 0],
                [0, 0, 4, 2, 0, 3, 1, 0, 0],
                [0, 0, 0, 7, 0, 0, 0, 0, 2],
                [4, 0, 5, 6, 0, 0, 0, 0, 0],
                [3, 6, 0, 0, 0, 0, 9, 0, 0],
                [0, 8, 9, 1, 3, 0, 0, 4, 0]
            ],
            [
                [0, 0, 9, 2, 0, 0, 6, 0, 0],
                [5, 1, 8, 0, 0, 4, 0, 0, 0],
                [0, 0, 0, 0, 3, 0, 0, 0, 5],
                [0, 2, 7, 0, 0, 5, 0, 0, 8],
                [0, 8, 5, 0, 1, 0, 9, 4, 0],
                [1, 0, 0, 6, 0, 0, 5, 2, 0],
                [4, 0, 0, 0, 9, 0, 0, 0, 0],
                [0, 0, 0, 5, 0, 0, 4, 3, 9],
                [0, 0, 3, 0, 0, 6, 7, 0, 0]
            ],
            [
                [0, 0, 8, 0, 0, 0, 5, 0, 0],
                [6, 0, 0, 7, 0, 5, 0, 0, 3],
                [0, 9, 0, 8, 3, 2, 0, 0, 0],
                [0, 0, 4, 0, 1, 0, 0, 0, 0],
                [3, 8, 0, 4, 0, 7, 0, 5, 1],
                [0, 0, 0, 0, 8, 0, 2, 0, 0],
                [0, 0, 0, 1, 5, 9, 0, 7, 0],
                [8, 0, 0, 3, 0, 4, 0, 0, 5],
                [0, 0, 9, 0, 0, 0, 1, 0, 0]
            ]
        ]
}