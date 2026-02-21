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

function App({ sequentialMode = false, onRoundComplete, onProgress }) {
  const [game, setGame] = useState(sequentialMode ? GAME_ORDER[0] : null);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [completedGames, setCompletedGames] = useState(0);

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
          {renderGame()}
        </>
      )}
    </>
  );
}

export default App;
