import React, { useState, useRef } from "react";
import "./App.css";

const solution = [
  ["#", "v", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "a", "l", "g", "o", "r", "i", "t", "h", "m", "#", "#", "#", "#", "#"],
  ["#", "r", "#", "#", "#", "u", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["b", "i", "t", "#", "i", "n", "p", "u", "t", "#", "#", "#", "#", "#", "#"],
  ["#", "a", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "b", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
  ["#", "l", "#", "#", "#", "#", "#", "#", "s", "e", "a", "r", "c", "h", "#"],
  ["d", "e", "c", "o", "m", "p", "o", "s", "e", "#", "#", "e", "#", "#", "#"],
  ["#", "#", "#", "#", "#", "r", "#", "#", "l", "#", "#", "p", "#", "o", "#"],
  ["#", "#", "#", "#", "#", "o", "#", "#", "e", "#", "d", "e", "b", "u", "g"],
  ["#", "#", "#", "#", "#", "g", "#", "#", "c", "#", "#", "a", "#", "t", "#"],
  ["#", "#", "#", "#", "#", "r", "#", "#", "t", "#", "#", "t", "#", "p", "#"],
  ["#", "#", "#", "#", "#", "a", "#", "#", "i", "#", "#", "#", "#", "u", "#"],
  ["#", "#", "#", "#", "#", "m", "#", "#", "o", "#", "#", "b", "y", "t", "e"],
  ["#", "#", "#", "#", "#", "#", "#", "#", "n", "#", "#", "#", "#", "#", "#"]
];

function App({ onComplete }) {
  const [grid, setGrid] = useState(
    solution.map(row => row.map(cell => (cell === "#" ? "#" : "")))
  );

  const [message, setMessage] = useState("");
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const inputRefs = useRef([]);

  // Move focus helper
  const moveFocus = (row, col, rowStep, colStep) => {
    let r = row + rowStep;
    let c = col + colStep;

    while (
      r >= 0 &&
      r < solution.length &&
      c >= 0 &&
      c < solution[0].length
    ) {
      if (solution[r][c] !== "#") {
        inputRefs.current[r]?.[c]?.focus();
        break;
      }
      r += rowStep;
      c += colStep;
    }
  };

  // Handle typing (NO auto move)
  const handleChange = (row, col, value) => {
    if (!/^[a-zA-Z]?$/.test(value)) return;

    const newGrid = [...grid];
    newGrid[row][col] = value.toLowerCase();
    setGrid(newGrid);
  };

  // Handle arrow keys only
  const handleKeyDown = (e, row, col) => {
    const key = e.key;

    const directions = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1]
    };

    if (directions[key]) {
      e.preventDefault();
      const [rowStep, colStep] = directions[key];
      moveFocus(row, col, rowStep, colStep);
    }

    // Backspace move left if empty
    if (key === "Backspace" && grid[row][col] === "") {
      e.preventDefault();
      moveFocus(row, col, 0, -1);
    }
  };

  const checkPuzzle = () => {
    setHasSubmitted(true);

    const isCorrect = grid.every((row, i) =>
      row.every((cell, j) => {
        if (solution[i][j] === "#") return true;
        return cell === solution[i][j];
      })
    );

    setMessage(isCorrect ? "You have done it! 🎉" : "Retry! ❌");

    if (isCorrect && !hasCompleted) {
      setHasCompleted(true);
      if (onComplete) onComplete();
    }
  };

  const resetGame = () => {
    setGrid(solution.map(row => row.map(cell => (cell === "#" ? "#" : ""))));
    setMessage("");
    setHasSubmitted(false);
    setHasCompleted(false);
  };

  const getCellClass = (row, col) => {
    if (!hasSubmitted || grid[row][col] === "") return "";
    return grid[row][col] === solution[row][col] ? "correct" : "wrong";
  };

  return (
    <div className="container">
      <h1>Kriss Kross Puzzle</h1>

      <div className="layout">
        <div className="grid-container">
          {grid.map((row, i) => (
            <div key={i} className="grid-row">
              {row.map((cell, j) => (
                <div key={`${i}-${j}`} className="cell-box">
                  {cell === "#" ? (
                    <div className="blank"></div>
                  ) : (
                    <input
                      ref={el => {
                        if (!inputRefs.current[i]) inputRefs.current[i] = [];
                        inputRefs.current[i][j] = el;
                      }}
                      type="text"
                      maxLength="1"
                      autoComplete="off"
                      spellCheck="false"
                      value={grid[i][j]}
                      onChange={(e) =>
                        handleChange(i, j, e.target.value)
                      }
                      onKeyDown={(e) =>
                        handleKeyDown(e, i, j)
                      }
                      className={`input-field ${getCellClass(i, j)}`}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}

          <div className="buttons">
            <button onClick={checkPuzzle}>Submit</button>
            <button onClick={resetGame}>Reset</button>
          </div>

          {message && <p className="message">{message}</p>}
        </div>

        <div className="word-list">
          <h2>Word List</h2>
          <p><strong>3 Letters:</strong> bit, run</p>
          <p><strong>4 Letters:</strong> byte</p>
          <p><strong>5 Letters:</strong> debug, input</p>
          <p><strong>6 Letters:</strong> output, repeat, search</p>
          <p><strong>7 Letters:</strong> program</p>
          <p><strong>8 Letters:</strong> variable</p>
          <p><strong>9 Letters:</strong> decompose, algorithm, selection</p>
        </div>
      </div>
    </div>
  );
}

export default App;
