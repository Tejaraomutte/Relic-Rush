import React, { useState, useEffect } from "react";
import "./App.css";

const initialState = {
  A: [4, 3, 2, 1],
  B: [],
  C: []
};

function App({ onComplete }) {
  useEffect(() => {
    document.body.classList.add("game-hanoi");
    return () => document.body.classList.remove("game-hanoi");
  }, []);

  const [towers, setTowers] = useState(initialState);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showInvalidMove, setShowInvalidMove] = useState(false);

  const handleSelect = (tower) => {
    if (selected === null) {
      if (towers[tower].length === 0) return;
      setSelected(tower);
    } else {
      moveDisk(selected, tower);
      setSelected(null);
    }
  };

  const moveDisk = (from, to) => {
    if (from === to) return;

    const fromTower = [...towers[from]];
    const toTower = [...towers[to]];
    const disk = fromTower[fromTower.length - 1];

    if (
      toTower.length === 0 ||
      disk < toTower[toTower.length - 1]
    ) {
      fromTower.pop();
      toTower.push(disk);

      setTowers({
        ...towers,
        [from]: fromTower,
        [to]: toTower
      });

      setMoves(moves + 1);
    } else {
      setShowInvalidMove(true);
    }
  };

  const resetGame = () => {
    setTowers(initialState);
    setMoves(0);
    setSelected(null);
    setHasSubmitted(false);
  };

  const checkWin = towers.C.length === 4;

  useEffect(() => {
    if (!checkWin && hasSubmitted) {
      setHasSubmitted(false);
    }
  }, [checkWin, hasSubmitted]);

  const handleSubmitPuzzle = () => {
    if (!checkWin || hasSubmitted) return;

    setHasSubmitted(true);
    if (onComplete) onComplete();
  };

  return (
    <div className="App">
      <h1 className="title">🧩 Towers of Hanoi</h1>

      {/* Invalid Move Modal */}
      {showInvalidMove && (
        <div className="modal-overlay">
          <div className="modal-content">
            <span className="modal-icon">❌</span>
            <h2>Invalid Move!</h2>
            <p>Smaller disks must stay on top.<br/>Try a different move.</p>
            <button className="modal-btn" onClick={() => setShowInvalidMove(false)}>
              OK
            </button>
          </div>
        </div>
      )}

      <div className="rules">
        <h3>📜 Rules</h3>
        <ul>
          <li>Move only one disk at a time.</li>
          <li>Only the top disk of a tower can be moved.</li>
          <li>A larger disk cannot be placed on a smaller disk.</li>
          <li>Move all disks to Tower C to win.</li>
        </ul>
      </div>

      <div className="stats">
        <span>Moves: {moves}</span>
        {checkWin && (
          <span className="win">🎉 Puzzle Solved!</span>
        )}
      </div>

      <div className="board">
        {Object.keys(towers).map((tower) => (
          <div
            key={tower}
            className={`tower ${selected === tower ? "selected" : ""}`}
            onClick={() => handleSelect(tower)}
          >
            {towers[tower].map((disk, index) => (
              <div
                key={index}
                className={`disk disk-${disk}`}
                style={{ width: `${disk * 40}px` }}
              >
                {disk}
              </div>
            ))}
            <p className="tower-label">{tower}</p>
          </div>
        ))}
      </div>

      <button className="reset-btn" onClick={resetGame}>
        🔄 Reset Game
      </button>

      <button
        className="reset-btn"
        onClick={handleSubmitPuzzle}
        disabled={!checkWin || hasSubmitted}
      >
        {hasSubmitted ? 'Submitted ✓' : 'Submit Puzzle'}
      </button>
    </div>
  );
}

export default App;
