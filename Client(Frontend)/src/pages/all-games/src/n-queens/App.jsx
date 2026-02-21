import React, { useState, useEffect } from "react";
import "./App.css";

const SIZE = 6;

function App({ onComplete }) {
  useEffect(() => {
    document.body.classList.add("game-nqueens");
    return () => document.body.classList.remove("game-nqueens");
  }, []);

  const [board, setBoard] = useState(
    Array(SIZE)
      .fill()
      .map(() => Array(SIZE).fill(0))
  );

  const toggleQueen = (row, col) => {
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = newBoard[row][col] === 1 ? 0 : 1;
    setBoard(newBoard);
  };

  const getAttackingQueens = () => {
    const queens = [];
    const attacking = new Set();

    for (let i = 0; i < SIZE; i++) {
      for (let j = 0; j < SIZE; j++) {
        if (board[i][j] === 1) {
          queens.push([i, j]);
        }
      }
    }

    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const [r1, c1] = queens[i];
        const [r2, c2] = queens[j];

        if (
          r1 === r2 ||
          c1 === c2 ||
          Math.abs(r1 - r2) === Math.abs(c1 - c2)
        ) {
          attacking.add(`${r1}-${c1}`);
          attacking.add(`${r2}-${c2}`);
        }
      }
    }

    return attacking;
  };

  const attackingQueens = getAttackingQueens();
  const queenCount = board.flat().filter(cell => cell === 1).length;
  const [hasCompleted, setHasCompleted] = useState(false);

  const getStatus = () => {
    if (queenCount < SIZE) {
      return { text: `Place ${SIZE - queenCount} more queens`, type: "warning" };
    }

    if (attackingQueens.size > 0) {
      return { text: "Queens are attacking each other!", type: "error" };
    }

    return { text: "Perfect Solution! 🎉", type: "success" };
  };

  const status = getStatus();

  useEffect(() => {
    const solved = queenCount === SIZE && attackingQueens.size === 0;
    if (solved && !hasCompleted) {
      setHasCompleted(true);
      if (onComplete) onComplete();
    }

    if (!solved && hasCompleted) {
      setHasCompleted(false);
    }
  }, [queenCount, attackingQueens, hasCompleted, onComplete]);

  const resetBoard = () => {
    setBoard(
      Array(SIZE)
        .fill()
        .map(() => Array(SIZE).fill(0))
    );
  };

  return (
    <div className="wrapper">
      <div className="glass-card">

        <h1 className="title">6×6 N-Queens Challenge</h1>

        <div className="rules">
          <strong>Rules:</strong>
          <p>• Place 6 queens.</p>
          <p>• No same row, column, or diagonal.</p>
        </div>

        {/* 🔥 Big Status Banner */}
        <div className={`status-banner ${status.type}`}>
          {status.text}
        </div>

        <div className="board">
          {board.map((row, i) =>
            row.map((cell, j) => {
              const isAttacking = attackingQueens.has(`${i}-${j}`);
              return (
                <div
                  key={`${i}-${j}`}
                  className={`cell 
                    ${(i + j) % 2 === 0 ? "white" : "black"} 
                    ${isAttacking ? "attack" : ""}
                  `}
                  onClick={() => toggleQueen(i, j)}
                >
                  {cell === 1 ? "♛" : ""}
                </div>
              );
            })
          )}
        </div>

        <button onClick={resetBoard} className="reset-btn">
          Reset Puzzle
        </button>

      </div>
    </div>
  );
}

export default App;
