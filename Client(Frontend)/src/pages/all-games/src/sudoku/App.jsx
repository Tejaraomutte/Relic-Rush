import React, { useState } from "react";
import "./App.css";

// 1. Initial Puzzle Data
const initialPuzzle = [
  [5, 3, null, null, 7, null, null, null, null],
  [6, null, null, 1, 9, 5, null, null, null],
  [null, 9, 8, null, null, null, null, 6, null],
  [8, null, null, null, 6, null, null, null, 3],
  [4, null, null, 8, null, 3, null, null, 1],
  [7, null, null, null, 2, null, null, null, 6],
  [null, 6, null, null, null, null, 2, 8, null],
  [null, null, null, 4, 1, 9, null, null, 5],
  [null, null, null, null, 8, null, null, 7, 9],
];

function App({ onComplete }) {
  // Initialize state with a deep copy of the initial puzzle
  const [grid, setGrid] = useState(initialPuzzle.map((row) => [...row]));
  const [incorrectCells, setIncorrectCells] = useState([]);
  const [hasCompleted, setHasCompleted] = useState(false);

  // Handle Input Change
  const handleChange = (row, col, value) => {
    // Only allow numbers 1-9 or empty string
    if (value !== "" && !/^[1-9]$/.test(value)) return;

    const val = value === "" ? null : parseInt(value);

    const newGrid = grid.map((r, rowIndex) =>
      r.map((cell, colIndex) => (rowIndex === row && colIndex === col ? val : cell))
    );

    setGrid(newGrid);

    // Clear incorrect highlight when the user types in that cell
    setIncorrectCells(prev => prev.filter(([r, c]) => !(r === row && c === col)));
  };

  // Validation Logic
  const validateGrid = () => {
    const errors = [];
    let isComplete = true;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const val = grid[i][j];
        if (val === null) {
          isComplete = false;
          continue;
        }

        // Check Row
        if (grid[i].filter((v, idx) => v === val && idx !== j).length > 0) errors.push([i, j]);

        // Check Column
        if (grid.filter((r, idx) => r[j] === val && idx !== i).length > 0) errors.push([i, j]);

        // Check 3x3 Box
        const startRow = Math.floor(i / 3) * 3;
        const startCol = Math.floor(j / 3) * 3;
        for (let r = startRow; r < startRow + 3; r++) {
          for (let c = startCol; c < startCol + 3; c++) {
            if ((r !== i || c !== j) && grid[r][c] === val) {
              errors.push([i, j]);
            }
          }
        }
      }
    }

    setIncorrectCells(errors);
    return { isComplete, hasErrors: errors.length > 0 };
  };

  const handleCheck = () => {
    const { isComplete, hasErrors } = validateGrid();

    if (!isComplete) {
      alert("Please fill in all cells! 📝");
    } else if (hasErrors) {
      alert("Almost there, but some numbers are misplaced. ❌");
    } else {
      alert("Congratulations! You solved it! ✅");
      if (!hasCompleted) {
        setHasCompleted(true);
        if (onComplete) onComplete();
      }
    }
  };

  const handleReset = () => {
    setGrid(initialPuzzle.map((row) => [...row]));
    setIncorrectCells([]);
    setHasCompleted(false);
  };

  return (
    <div className="App">
      <h1>Sudoku Game</h1>

      <div className="rules">
        <h3>How to Play</h3>
        <ul>
          <li>Fill the grid with numbers from 1 to 9.</li>
          <li>Each row must contain numbers 1–9 without repetition.</li>
          <li>Each column must contain numbers 1–9 without repetition.</li>
          <li>Each 3×3 box must contain numbers 1–9 without repetition.</li>
        </ul>
      </div>

      <div className="grid">
        {grid.map((row, i) =>
          row.map((cell, j) => {
            const isFixed = initialPuzzle[i][j] !== null;
            const isWrong = incorrectCells.some(([r, c]) => r === i && c === j);

            return (
              <input
                key={`${i}-${j}`}
                type="text"
                inputMode="numeric"
                value={cell || ""}
                disabled={isFixed}
                onChange={(e) => handleChange(i, j, e.target.value)}
                className={`cell ${isFixed ? "fixed" : ""} ${isWrong ? "wrong" : ""}`}
              />
            );
          })
        )}
      </div>
      <div className="buttons">
        <button onClick={handleCheck}>Check Solution</button>
        <button onClick={handleReset} className="reset-btn">Reset</button>
      </div>
    </div>
  );
}

export default App;
