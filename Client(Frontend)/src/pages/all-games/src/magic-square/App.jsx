import React, { useState, useEffect, useRef } from "react";
import "./App.css";

function App({ onComplete }) {
  const magicSum = 65;

  const initialGrid = [
    [17, "", 1, "", 15],
    ["", 5, "", 14, ""],
    [4, "", 13, "", 22],
    ["", 12, "", 21, ""],
    [11, "", 25, "", 9],
  ];

  const [grid, setGrid] = useState(initialGrid);
  const [rowStatus, setRowStatus] = useState(Array(5).fill(null));
  const [colStatus, setColStatus] = useState(Array(5).fill(null));
  const [diagStatus, setDiagStatus] = useState([null, null]);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const inputRefs = useRef([]);

  const handleChange = (row, col, value) => {
    if (value === "" || (value >= 1 && value <= 25)) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = value === "" ? "" : Number(value);
      setGrid(newGrid);
    }
  };

  const handleKeyDown = (e, row, col) => {
    let newRow = row;
    let newCol = col;

    if (e.key === "ArrowRight") newCol++;
    if (e.key === "ArrowLeft") newCol--;
    if (e.key === "ArrowDown") newRow++;
    if (e.key === "ArrowUp") newRow--;

    if (
      newRow >= 0 &&
      newRow < 5 &&
      newCol >= 0 &&
      newCol < 5 &&
      initialGrid[newRow][newCol] === ""
    ) {
      inputRefs.current[newRow][newCol].focus();
    }
  };

  useEffect(() => {
    validateGrid();
  }, [grid]);

  const validateGrid = () => {
    let newRowStatus = [];
    let newColStatus = [];
    let newDiagStatus = [];

    // Rows
    for (let i = 0; i < 5; i++) {
      newRowStatus[i] = grid[i].includes("")
        ? null
        : grid[i].reduce((a, b) => a + b, 0) === magicSum;
    }

    // Columns
    for (let i = 0; i < 5; i++) {
      let col = [];
      for (let j = 0; j < 5; j++) col.push(grid[j][i]);

      newColStatus[i] = col.includes("")
        ? null
        : col.reduce((a, b) => a + b, 0) === magicSum;
    }

    // Diagonals
    let d1 = [], d2 = [];
    for (let i = 0; i < 5; i++) {
      d1.push(grid[i][i]);
      d2.push(grid[i][4 - i]);
    }

    newDiagStatus[0] = d1.includes("")
      ? null
      : d1.reduce((a, b) => a + b, 0) === magicSum;

    newDiagStatus[1] = d2.includes("")
      ? null
      : d2.reduce((a, b) => a + b, 0) === magicSum;

    setRowStatus(newRowStatus);
    setColStatus(newColStatus);
    setDiagStatus(newDiagStatus);
  };

  const getCellClass = (row, col) => {
    if (rowStatus[row] === false || colStatus[col] === false)
      return "cell wrong";
    if (rowStatus[row] === true || colStatus[col] === true)
      return "cell correct";
    return "cell";
  };

  const handleSubmit = () => {
    const isFilled = grid.every((row) => row.every((cell) => cell !== ""));

    if (!isFilled) {
      setStatusMessage("Please fill all cells before submitting.");
      return;
    }

    const solved =
      rowStatus.every((status) => status === true) &&
      colStatus.every((status) => status === true) &&
      diagStatus.every((status) => status === true);

    if (!solved) {
      setStatusMessage("Some rows, columns, or diagonals are incorrect. Try again.");
      return;
    }

    if (!hasCompleted) {
      setHasCompleted(true);
      setStatusMessage("Perfect! Moving to the next game...");
      if (onComplete) onComplete();
    }
  };

  const handleReset = () => {
    setGrid(initialGrid);
    setRowStatus(Array(5).fill(null));
    setColStatus(Array(5).fill(null));
    setDiagStatus([null, null]);
    setHasCompleted(false);
    setStatusMessage("");
  };

  return (
    <div className="container">
      <div className="header">
        <h1>5×5 Magic Square Challenge</h1>
        <p className="description">
          Use each number from 1 to 25 exactly once.
          Every row, column, and the two main diagonals must add up to 65.
        </p>
      </div>

      <div className="grid">
        {grid.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <input
                key={colIndex}
                type="number"
                value={cell}
                disabled={initialGrid[rowIndex][colIndex] !== ""}
                onChange={(e) =>
                  handleChange(rowIndex, colIndex, e.target.value)
                }
                onKeyDown={(e) =>
                  handleKeyDown(e, rowIndex, colIndex)
                }
                ref={(el) => {
                  if (!inputRefs.current[rowIndex])
                    inputRefs.current[rowIndex] = [];
                  inputRefs.current[rowIndex][colIndex] = el;
                }}
                className={getCellClass(rowIndex, colIndex)}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="actions">
        <button className="submit-btn" onClick={handleSubmit}>Submit</button>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      {statusMessage && <p className="status-message">{statusMessage}</p>}
    </div>
  );
}

export default App;
