const gameBoardElement = document.querySelector(".game-board");
const numbersContainer = document.querySelector(".numbers-container");
const levelsSpans = document.querySelectorAll(".levels .level");
const toggle = document.querySelector(".toggle");
const errorsElement = document.querySelector(".errors");
const btnStart = document.querySelector(".btn-start");
const timerElement = document.querySelector(".timer");
const btnSolve = document.querySelector(".btn-solve");
const btnHints = document.querySelector(".btn-hints");

let theBoard, theSolution, chosenLevel, allowedErrors, passedSeconds, numberOfHoles,
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
    const SudokuWithSolution = generateSudokuWithSolution(numberOfHoles);
    theBoard = SudokuWithSolution["puzzle"];
    theSolution = SudokuWithSolution["solution"];
    createBoardAndNumbers();
}

function generateSudokuWithSolution(numHoles) {
    const size = 9;
    const sudoku = Array.from({ length: size }, () => Array(size).fill(0));
    let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    nums = shuffleArray(nums);

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function isSafe(grid, row, col, num) {
        for (let x = 0; x < size; x++) {
            if (grid[row][x] === num || grid[x][col] === num) {
                return false;
            }
        }

        const startRow = row - (row % 3);
        const startCol = col - (col % 3);

        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                if (grid[i + startRow][j + startCol] === num) {
                    return false;
                }
            }
        }
        return true;
    }

    function solve(grid) {
        const emptyCell = findEmptyCell(grid);
        const row = emptyCell[0];
        const col = emptyCell[1];

        if (row === -1) {
            return true;
        }

        for (let num = 0; num < size; num++) {
            if (isSafe(grid, row, col, nums[num])) {
                grid[row][col] = nums[num];

                if (solve(grid)) {
                    return true;
                }

                grid[row][col] = 0;
            }
        }

        return false;
    }

    function findEmptyCell(grid) {
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (grid[i][j] === 0) {
                    return [i, j];
                }
            }
        }
        return [-1, -1];
    }

    solve(sudoku);

    const solvedSudoku = sudoku.map(row => [...row]);

    let holes = numHoles;
    while (holes > 0) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        if (sudoku[row][col] !== 0) {
            sudoku[row][col] = 0;
            holes--;
        }
    }

    return { puzzle: sudoku, solution: solvedSudoku };
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
    availableCells = 81;
    hintsNumber = 3;
    allowedErrors = 3;
    selectedNumber = null;
    btnHints.classList.remove("active");
    usedNumbers = [0, 9, 9, 9, 9, 9, 9, 9, 9, 9];
    levelsSpans.forEach(span => {
        if (span.classList.contains("active")) {
            chosenLevel = span.classList[1];
            if (chosenLevel === "easy") numberOfHoles = 40;
            else if (chosenLevel === "medium") numberOfHoles = 50;
            else numberOfHoles = 60;
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