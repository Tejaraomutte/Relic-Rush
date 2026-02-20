import React, { useState, useEffect } from "react";
import "./App.css";

const initialState = {
  A: [4, 3, 2, 1],
  B: [],
  C: []
};

function App({ onComplete }) {
  const [towers, setTowers] = useState(initialState);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);

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
      alert("❌ Invalid Move! Smaller disks must stay on top.");
    }
  };

  const resetGame = () => {
    setTowers(initialState);
    setMoves(0);
    setSelected(null);
  };

  const checkWin = towers.C.length === 4;

  useEffect(() => {
    if (checkWin && !hasCompleted) {
      setHasCompleted(true);
      if (onComplete) onComplete();
    }

    if (!checkWin && hasCompleted) {
      setHasCompleted(false);
    }
  }, [checkWin, hasCompleted, onComplete]);

  return (
    <div className="App">
      <h1 className="title">🧩 Towers of Hanoi</h1>

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
    </div>
  );
}

export default App;
