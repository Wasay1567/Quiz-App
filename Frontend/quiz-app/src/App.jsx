import { useState } from 'react'
import './App.css'
import QuizForm from './components/QuizForm'
import Quiz from './components/Quiz'

function App() {
  const [params, setParams] = useState(null)

  const handleStart = ({ count, startPage, endPage }) => {
    setParams({ count, startPage, endPage })
  }

  const handleRetake = () => {
    setParams(null)
  }

  return (
    <div className="container">
      {!params ? (
        <QuizForm onStart={handleStart} />
      ) : (
        <Quiz
          count={params.count}
          startPage={params.startPage}
          endPage={params.endPage}
          onRetake={handleRetake}
        />
      )}
    </div>
  )
}

export default App
