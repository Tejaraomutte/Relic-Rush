import React, { useState } from 'react';
import Kriss from './kriss-kross/App';
import Magic from './magic-square/App';
import MathPuzzle from './mathpuzzle/App';
import NQueens from './n-queens/App';
import Sudoku from './sudoku/App';
import Hanoi from './towers-of-hanoi/App';
import './App.css';

const GAME_ORDER = ['kriss', 'math', 'magic', 'nqueens', 'sudoku', 'hanoi'];

function App({ sequentialMode = false, onRoundComplete }) {
  const [game, setGame] = useState(sequentialMode ? GAME_ORDER[0] : null);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [completedGames, setCompletedGames] = useState(0);

  // add a class to <body> so individual game CSS can target backgrounds
  React.useEffect(() => {
    const classPrefix = 'game-';
    // remove any previous game-* classes
    document.body.className = document.body.className
      .split(' ')
      .filter(c => !c.startsWith(classPrefix))
      .join(' ');
    if (game) {
      document.body.classList.add(`${classPrefix}${game}`);
    }
  }, [game]);

  const handleGameComplete = () => {
    if (!sequentialMode) return;

    const nextCompleted = completedGames + 1;
    setCompletedGames(nextCompleted);

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
    switch (game) {
      case 'kriss': return <Kriss onComplete={handleGameComplete} />;
      case 'magic': return <Magic onComplete={handleGameComplete} />;
      case 'math': return <MathPuzzle onComplete={handleGameComplete} />;
      case 'nqueens': return <NQueens onComplete={handleGameComplete} />;
      case 'sudoku': return <Sudoku onComplete={handleGameComplete} />;
      case 'hanoi': return <Hanoi onComplete={handleGameComplete} />;
      default: return null;
    }
  };

  return (
    <div className="root-container">
      <header>
        <h1>Round 2 Games</h1>
        {sequentialMode && <p>Complete each game to unlock the next one.</p>}
        {sequentialMode && <p>{`Progress: ${completedGames}/${GAME_ORDER.length}`}</p>}
      </header>
      {!game && !sequentialMode && (
        <nav className="menu">
          <button onClick={() => setGame('kriss')}>Kriss-Kross</button>
          <button onClick={() => setGame('magic')}>Magic Square</button>
          <button onClick={() => setGame('math')}>Math Puzzle</button>
          <button onClick={() => setGame('nqueens')}>N-Queens</button>
          <button onClick={() => setGame('sudoku')}>Sudoku</button>
          <button onClick={() => setGame('hanoi')}>Towers of Hanoi</button>
        </nav>
      )}
      {game && (
        <div className="game-area">
          {!sequentialMode && <button className="back-btn" onClick={() => setGame(null)}>&larr; Back to menu</button>}
          {renderGame()}
        </div>
      )}
    </div>
  );
}

export default App;
