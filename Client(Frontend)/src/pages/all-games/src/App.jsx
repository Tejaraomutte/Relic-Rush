import React, { useState } from 'react';
import Kriss from './kriss-kross/App';
import Magic from './magic-square/App';
import MathPuzzle from './mathpuzzle/App';
import NQueens from './n-queens/App';
import Hanoi from './towers-of-hanoi/App';

const GAME_ORDER = ['kriss', 'math', 'nqueens', 'magic', 'hanoi'];

const GAME_TITLES = {
  kriss: 'Kriss-Kross Puzzle',
  math: 'Math Puzzle',
  nqueens: 'N-Queens Challenge',
  magic: 'Magic Square',
  hanoi: 'Towers of Hanoi'
};

const GAME_HINTS = {
  kriss: 'Start filling the longest words (9 & 8 letters) first — they unlock most intersections quickly.',
  math: 'Find the missing numbers so that all horizontal and vertical equations satisfy BODMAS (order of operations).',
  nqueens: 'Start by placing a queen in a corner or edge square where it attacks the fewest boxes.',
  magic: `In a 5×5 magic square using numbers 1–25, every pair of numbers placed symmetrically opposite to the center (13) adds up to 26.
  17 ↔ 9
  15 ↔ 11
  4 ↔ 22
  5 ↔ 21
  1 ↔ 25`,
  hanoi: 'First move the smallest disk to Tower C, then focus on moving the remaining stack to Tower B before placing the largest disk.'
};

function App({ sequentialMode = false, onRoundComplete, onProgress, onHintUsed }) {
  const [game, setGame] = useState(sequentialMode ? GAME_ORDER[0] : null);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [completedGames, setCompletedGames] = useState(0);
  const [usedHintGames, setUsedHintGames] = useState([]);

  const handleGameComplete = () => {
    if (!sequentialMode) return;

    const nextCompleted = completedGames + 1;
    setCompletedGames(nextCompleted);
    if (onProgress) {
      onProgress(nextCompleted);
    }

    if (nextCompleted >= GAME_ORDER.length) {
      if (onRoundComplete) {
        onRoundComplete(nextCompleted);
      }
      return;
    }

    const nextIndex = currentGameIndex + 1;
    setCurrentGameIndex(nextIndex);

    setTimeout(() => {
      setGame(GAME_ORDER[nextIndex]);
    }, 1200);
  };

  const renderGame = () => {
    const gameProps = { 
      onComplete: handleGameComplete,
      gameTitle: GAME_TITLES[game]
    };

    switch (game) {
      case 'kriss': return <Kriss {...gameProps} />;
      case 'magic': return <Magic {...gameProps} />;
      case 'math': return <MathPuzzle {...gameProps} />;
      case 'nqueens': return <NQueens {...gameProps} />;
      case 'hanoi': return <Hanoi {...gameProps} />;
      default: return null;
    }
  };

  const handleHintClick = () => {
    if (!game) return;

    if (!usedHintGames.includes(game)) {
      setUsedHintGames(prev => [...prev, game]);
      if (onHintUsed) {
        onHintUsed();
      }
    }
  };

  return (
    <>
      {/* Progress indicator for sequential mode */}
      {sequentialMode && (
        <div className="game-progress">
          <p className="game-progress-text">
            Game Progress: {completedGames + 1} of {GAME_ORDER.length}
          </p>
        </div>
      )}

      {/* Menu for non-sequential mode */}
      {!game && !sequentialMode && (
        <div className="quiz-container">
          <div className="question-display">
            <h2 className="question-text">Choose a Game</h2>
            <div className="options-grid">
              {GAME_ORDER.map(gameKey => (
                <button 
                  key={gameKey}
                  className="btn btn-golden game-option-btn" 
                  onClick={() => setGame(gameKey)}
                >
                  {GAME_TITLES[gameKey]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Game area */}
      {game && (
        <>
          {!sequentialMode && (
            <div className="round-actions left-align">
              <button className="btn btn-secondary" onClick={() => setGame(null)}>
                ← Back to Menu
              </button>
            </div>
          )}
          {sequentialMode && (
            <div className="allgames-hint-panel">
              <button className="btn btn-secondary allgames-hint-btn" onClick={handleHintClick}>
                {usedHintGames.includes(game) ? '💡 Hint Used' : '💡 Hint (-5 pts)'}
              </button>
              {usedHintGames.includes(game) && (
                <p className="allgames-hint-text">
                  {GAME_HINTS[game] || 'Think step-by-step and validate each move before final submission.'}
                </p>
              )}
            </div>
          )}
          {renderGame()}
        </>
      )}
    </>
  );
}

export default App;
