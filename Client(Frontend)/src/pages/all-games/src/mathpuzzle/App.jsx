import React, { useState } from 'react';
import "./App.css";

/**
 * GRID MAPPING (11 rows x 9 columns)
 * null = Blue Wall
 * ''   = Input Box
 * 'string' = Static Number/Operator
 */
const INITIAL_GRID = [
  ['12', '+', '', '=', '36', null, null, null, ''], // Row 0
  [null, null, '÷', null, '÷', null, null, null, '+'], // Row 1
  ['', '-', '', '=', '4', null, '', null, '23'], // Row 2
  ['x', null, '=', null, '=', null, '÷', null, '='], // Row 3
  ['', null, '6', null, '', 'x', '5', '=', ''],   // Row 4
  ['=', null, null, null, null, null, '=', null, null], // Row 5
  ['56', null, '20', '-', '', '=', '11', null, '3'],  // Row 6
  [null, null, '+', null, 'x', null, null, null, 'x'], // Row 7
  ['84', '÷', '', '=', '', null, null, null, '13'], // Row 8
  [null, null, '=', null, '=', null, null, null, '='], // Row 9
  [null, null, '', null, '63', '-', '', '=', '']   // Row 10
];

/**
 * CORRECT ANSWERS
 * Pre-calculated
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

const MathPuzzle = ({ onComplete }) => {
  const [grid, setGrid] = useState(INITIAL_GRID);
  const [showErrors, setShowErrors] = useState(false);
  const [completed, setCompleted] = useState(false);

  const handleChange = (row, col, value) => {
    if (value !== '' && !/^\d+$/.test(value)) return; // Only digits allowed
    setShowErrors(false);

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
      // mark completed and show inline message instead of alert
      setShowErrors(false);
      setCompleted(true);
      if (onComplete) onComplete();
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Math Crossword Puzzle</h1>
        <p style={styles.instructions}>
          Fill the crossword grid by solving the math clues. Enter correct answers in the empty boxes so all across and down entries match at intersections.
        </p>

        <div style={styles.gridContainer}>
          {grid.map((row, rIdx) => (
            <div key={rIdx} style={styles.row}>
              {row.map((cell, cIdx) => {
                const isWall = cell === null;
                const solKey = `${rIdx}-${cIdx}`;
                const isInput = SOLUTIONS[solKey] !== undefined;
                const isIncorrect = showErrors && isInput && grid[rIdx][cIdx] !== SOLUTIONS[solKey];

                // Treat % as division visually
                const displayCell = cell === '%' ? '÷' : cell;

                return (
                  <div
                    key={solKey}
                    style={{
                      ...styles.cell,
                      backgroundColor: isWall ? '#001f3f' : (isIncorrect ? '#ffebee' : 'white'),
                      border: isWall ? '1px solid #001f3f' : '1px solid #ccc'
                    }}
                  >
                    {isInput ? (
                      <input
                        type="text"
                        style={{
                          ...styles.input,
                          color: isIncorrect ? '#d32f2f' : '#007bff'
                        }}
                        value={grid[rIdx][cIdx]}
                        onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
                      />
                    ) : (
                      <span style={{
                        ...styles.text,
                        color: isWall ? 'white' : '#333',
                        fontSize: ['+', '-', 'x', '÷', '=', '%'].includes(displayCell) ? '1.4rem' : '1.1rem'
                      }}>
                        {displayCell}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div style={styles.buttonGroup}>
          <button style={styles.verifyBtn} onClick={verifySolution}>Submit</button>
          <button
            style={styles.resetBtn}
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
          <div style={styles.successMessage}>🎉 You have completed the puzzle!</div>
        )}
      </div>
    </div>
  );
};

const styles = {
  page: { backgroundColor: '#f4f7f6', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 8px 30px rgba(0,0,0,0.1)', textAlign: 'center', width: 'fit-content' },
  title: { color: '#001f3f', marginBottom: '10px', fontSize: '1.8rem' },
  instructions: { color: '#555', marginBottom: '25px', maxWidth: '450px', margin: '0 auto 25px auto', lineHeight: '1.4' },
  gridContainer: { display: 'inline-block', padding: '10px', backgroundColor: '#001f3f', borderRadius: '8px' },
  row: { display: 'flex' },
  cell: { width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '1px' },
  text: { fontWeight: 'bold' },
  input: { width: '100%', height: '100%', textAlign: 'center', border: 'none', fontSize: '1.1rem', fontWeight: 'bold', backgroundColor: 'transparent', outline: 'none' },
  buttonGroup: { marginTop: '25px', display: 'flex', gap: '15px', justifyContent: 'center' },
  verifyBtn: { padding: '12px 25px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  resetBtn: { padding: '12px 25px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  successMessage: { marginTop: '20px', color: '#155724', backgroundColor: '#d4edda', padding: '10px 15px', borderRadius: '5px', fontWeight: 'bold' }
};

export default MathPuzzle;
