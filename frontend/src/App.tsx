import { useState } from 'react'
import { Routes, Route } from 'react-router'
 

function App() {
  const [count, setCount] = useState(0)

  return (
    <div>
      <h1>Hello, Dickhead!</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
 
    </div>
  )
}

export default App
