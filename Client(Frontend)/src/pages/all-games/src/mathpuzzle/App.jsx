import React, { useState, useEffect } from 'react';
import "./App.css";

/**
 * GRID MAPPING (11 rows x 9 columns)
 * null = Wall
 * ''   = Input Box
 * 'string' = Static Number/Operator
 */
const INITIAL_GRID = [
  ['12', '+', '', '=', '36', null, null, null, ''],
  [null, null, '÷', null, '÷', null, null, null, '+'],
  ['', '-', '', '=', '4', null, '', null, '23'],
  ['x', null, '=', null, '=', null, '÷', null, '='],
  ['', null, '6', null, '', 'x', '5', '=', ''],
  ['=', null, null, null, null, null, '=', null, null],
  ['56', null, '20', '-', '', '=', '11', null, '3'],
  [null, null, '+', null, 'x', null, null, null, 'x'],
  ['84', '÷', '', '=', '', null, null, null, '13'],
  [null, null, '=', null, '=', null, null, null, '='],
  [null, null, '', null, '63', '-', '', '=', '']
];

/**
 * CORRECT ANSWERS
 */
const SOLUTIONS = {
  "0-2": "24",
  "0-8": "22",
  "2-0": "8",
  "2-2": "4",
  "2-6": "55",
  "4-0": "7",
  "4-4": "9",
  "4-8": "45",
  "6-4": "9",
  "8-2": "12",
  "8-4": "7",
  "10-2": "32",
  "10-6": "24",
  "10-8": "39"
};

/**
 * CLUES FOR EACH PUZZLE POSITION
 */
const CLUES = {
  "0-2": "12 + ? = 36",
  "0-8": "? = 14 + 8",
  "2-0": "? - 2 + 4 = 10",
  "2-2": "? = 8 - 4",
  "2-6": "? = 23 + 32",
  "4-0": "? × 6 ÷ 5 = 8.4",
  "4-4": "? × 5 = 45",
  "4-8": "? = 9 × 5",
  "6-4": "? = 20 - 11",
  "8-2": "84 ÷ ? = 7",
  "8-4": "56 + 20 - 56 = ?",
  "10-2": "63 - ? = 31",
  "10-6": "? = 11 + 13",
  "10-8": "? = 48 - 9"
};

const MathPuzzle = ({ onComplete }) => {
  useEffect(() => {
    document.body.classList.add("game-math");
    return () => document.body.classList.remove("game-math");
  }, []);

  const [grid, setGrid] = useState(INITIAL_GRID);
  const [showErrors, setShowErrors] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);

  const handleChange = (row, col, value) => {
    if (value !== '' && !/^\d+$/.test(value)) return;
    setShowErrors(false);
    setSelectedCell(`${row}-${col}`);

    const newGrid = grid.map((r, rIdx) =>
      r.map((cell, cIdx) => (rIdx === row && cIdx === col ? value : cell))
    );
    setGrid(newGrid);
  };

  const verifySolution = () => {
    let hasError = false;
    let isMissing = false;

    for (const key in SOLUTIONS) {
      const [r, c] = key.split('-').map(Number);
      if (grid[r][c] === '') {
        isMissing = true;
      } else if (grid[r][c] !== SOLUTIONS[key]) {
        hasError = true;
      }
    }

    if (isMissing) {
      alert("Please fill in all empty boxes first.");
      setCompleted(false);
    } else if (hasError) {
      setShowErrors(true);
      alert("Some answers are incorrect. Check the red boxes!");
      setCompleted(false);
    } else {
      setShowErrors(false);
      setCompleted(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div className="mathpuzzle-page">
      <div className="mathpuzzle-card">
        <h1 className="mathpuzzle-title">Math Crossword Puzzle</h1>
        <p className="mathpuzzle-instructions">
          Fill the crossword grid by solving the math clues. Enter correct answers in the empty boxes so all across and down entries match at intersections.
        </p>

        <div className="mathpuzzle-grid">
          {grid.map((row, rIdx) => (
            <div key={rIdx} className="mathpuzzle-row">
              {row.map((cell, cIdx) => {
                const isWall = cell === null;
                const solKey = `${rIdx}-${cIdx}`;
                const isInput = SOLUTIONS[solKey] !== undefined;
                const isIncorrect = showErrors && isInput && grid[rIdx][cIdx] !== SOLUTIONS[solKey];
                const displayCell = cell === '%' ? '÷' : cell;
                const isOperator = ['+', '-', 'x', '÷', '=', '%'].includes(displayCell);

                return (
                  <div
                    key={solKey}
                    className={`mathpuzzle-cell ${isWall ? 'wall' : ''} ${isInput ? 'input' : 'static'} ${isIncorrect ? 'incorrect' : ''} ${selectedCell === solKey && isInput ? 'selected' : ''}`}
                    onClick={() => isInput && setSelectedCell(solKey)}
                  >
                    {isInput ? (
                      <input
                        type="text"
                        className="mathpuzzle-input"
                        value={grid[rIdx][cIdx]}
                        onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        inputMode="numeric"
                      />
                    ) : (
                      <span className={`mathpuzzle-text ${isOperator ? 'operator' : ''}`}>
                        {displayCell}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="mathpuzzle-actions">
          <button className="mathpuzzle-btn primary" onClick={verifySolution}>Submit</button>
          <button
            className="mathpuzzle-btn secondary"
            onClick={() => {
              setGrid(INITIAL_GRID);
              setShowErrors(false);
              setCompleted(false);
            }}
          >
            Reset
          </button>
        </div>

        {completed && (
          <div className="mathpuzzle-success">You have completed the puzzle!</div>
        )}
      </div>
    </div>
  );
};

export default MathPuzzle;
