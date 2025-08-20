import { useState } from 'react'

function QuizForm({ onStart }) {
  const [count, setCount] = useState(5)
  const [startPage, setStartPage] = useState(1)
  const [endPage, setEndPage] = useState(3)
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    const c = Number(count)
    const s = Number(startPage)
    const epage = Number(endPage)

    if (!Number.isInteger(c) || c < 1) {
      setError('Number of questions must be a positive integer')
      return
    }
    if (!Number.isInteger(s) || s < 1) {
      setError('Start page must be a positive integer')
      return
    }
    if (!Number.isInteger(epage) || epage < 1) {
      setError('End page must be a positive integer')
      return
    }
    if (s > epage) {
      setError('Start page must be less than or equal to end page')
      return
    }

    onStart({ count: c, startPage: s, endPage: epage })
  }

  return (
    <div>
      <h1>Create Quiz</h1>
      <p className="meta">Enter quiz parameters and click Create Quiz.</p>
      <form className="form" onSubmit={handleSubmit}>
        <div className="row">
          <div>
            <label className="label" htmlFor="count">No of questions</label>
            <input id="count" className="input" type="number" min="1" value={count} onChange={(e) => setCount(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="start">Start page</label>
            <input id="start" className="input" type="number" min="1" value={startPage} onChange={(e) => setStartPage(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="end">End page</label>
            <input id="end" className="input" type="number" min="1" value={endPage} onChange={(e) => setEndPage(e.target.value)} />
          </div>
        </div>
        {error && <div className="error">{error}</div>}
        <div className="actions">
          <button type="submit" className="btn btn-primary">Create Quiz</button>
        </div>
      </form>
    </div>
  )
}

export default QuizForm 