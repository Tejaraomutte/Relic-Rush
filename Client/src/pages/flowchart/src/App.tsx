// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'

// function App() {
//   const [count, setCount] = useState(0)

//   return (
//     <>
//       <div>
//         <a href="https://vite.dev" target="_blank">
//           <img src={viteLogo} className="logo" alt="Vite logo" />
//         </a>
//         <a href="https://react.dev" target="_blank">
//           <img src={reactLogo} className="logo react" alt="React logo" />
//         </a>
//       </div>
//       <h1>Vite + React</h1>
//       <div className="card">
//         <button onClick={() => setCount((count) => count + 1)}>
//           count is {count}
//         </button>
//         <p>
//           Edit <code>src/App.tsx</code> and save to test HMR
//         </p>
//       </div>
//       <p className="read-the-docs">
//         Click on the Vite and React logos to learn more
//       </p>
//     </>
//   )
// }

// export default App

import FlowBuilder from "./pages/FlowBuilder";
import DebugRound from "./debug/DebugRound";
import { useState } from "react";
import { TimerProvider } from "./utils/TimerContext";

function App() {
  const [activeRound, setActiveRound] = useState<'flowchart' | 'debug'>('flowchart');

  return (
    <TimerProvider>
      <div>
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px 0 12px 0',
          background: '#f9fafb',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: 24
        }}>
          <div style={{
            display: 'inline-flex',
            borderRadius: 8,
            overflow: 'hidden',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
          }}>
          <button
            className="toggle-btn"
            style={{
              padding: '10px 32px',
              fontWeight: 600,
              fontSize: 18,
              background: activeRound === 'flowchart' ? '#10b981' : '#e5e7eb',
              color: activeRound === 'flowchart' ? '#fff' : '#111827',
              border: 'none',
              outline: 'none',
              transition: 'background 0.2s, color 0.2s',
              cursor: 'pointer',
              boxShadow: activeRound === 'flowchart' ? '0 2px 8px #10b98133' : 'none'
            }}
            onClick={() => setActiveRound('flowchart')}
          >
            Flowchart Round
          </button>
          <button
            className="toggle-btn"
            style={{
              padding: '10px 32px',
              fontWeight: 600,
              fontSize: 18,
              background: activeRound === 'debug' ? '#10b981' : '#e5e7eb',
              color: activeRound === 'debug' ? '#fff' : '#111827',
              border: 'none',
              outline: 'none',
              transition: 'background 0.2s, color 0.2s',
              cursor: 'pointer',
              boxShadow: activeRound === 'debug' ? '0 2px 8px #10b98133' : 'none'
            }}
            onClick={() => setActiveRound('debug')}
          >
            Debug Round
          </button>
        </div>
        </header>
        <main style={{
          minHeight: 'calc(100vh - 80px)',
          transition: 'opacity 0.3s',
          padding: 0
        }}>
          {activeRound === 'flowchart' && <FlowBuilder />}
          {activeRound === 'debug' && <DebugRound />}
        </main>
      </div>
    </TimerProvider>
  );
}

export default App;

