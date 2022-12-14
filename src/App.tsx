import React, { useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import AutoTrackerComponent from '../lib/auto-logger/component';

function App() {
  const [count, setCount] = useState<number>(0)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setCount((count) => count + 1)
  }

  return (
    <div className="App">
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <AutoTrackerComponent>
          <button data-report-data={JSON.stringify({ count })} data-log-id="add-button" data-event-name="add_button_click" onClick={handleClick}>
            count is {count}
          </button>
        </AutoTrackerComponent>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
