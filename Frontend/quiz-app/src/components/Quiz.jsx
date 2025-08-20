import { useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'https://radical-sigrid-okaymisba-4fed5e3d.koyeb.app'

function Quiz({ count, startPage, endPage, onRetake }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  const total = questions.length
  const attempted = useMemo(() => Object.keys(answers).length, [answers])

  useEffect(() => {
    let isMounted = true
    setLoading(true)
    setError('')

    const url = `${API_BASE}/questions?count=${encodeURIComponent(count)}&start_page=${encodeURIComponent(startPage)}&end_page=${encodeURIComponent(endPage)}`

    fetch(url)
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text()
          throw new Error(text || 'Failed to fetch questions')
        }
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return
        setQuestions(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message || 'Something went wrong')
      })
      .finally(() => {
        if (!isMounted) return
        setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [count, startPage, endPage])

  const handleSelect = (qIndex, option) => {
    if (submitted) return
    setAnswers((prev) => ({ ...prev, [qIndex]: option }))
  }

  const handleSubmit = () => {
    let s = 0
    questions.forEach((q, idx) => {
      // Use correct_option from API response
      if (
        answers[idx] &&
        q.correct_option &&
        answers[idx][0] === q.correct_option // answers[idx] is like "A", "B", etc.
      ) {
        s += 1
      }
    })
    setScore(s)
    setSubmitted(true)
  }

  const handleRetake = () => {
    onRetake()
  }

  if (loading) {
    return (
      <div>
        <h2>Loading quiz…</h2>
        <p className="meta">Fetching questions from pages {startPage} to {endPage}.</p>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <h2>Unable to load quiz</h2>
        <p className="error">{error}</p>
        <div className="actions" style={{ marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={handleRetake}>Back</button>
        </div>
      </div>
    )
  }

  if (!questions.length) {
    return (
      <div>
        <h2>No questions available</h2>
        <p className="meta">Try different pages or increase range.</p>
        <div className="actions" style={{ marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={handleRetake}>Back</button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1>Quiz</h1>
      <p className="meta">Answer the questions below.</p>

      {questions.map((q, idx) => (
        <div className="card" key={idx}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            {idx + 1}. {q.question}
          </div>
          {q.options && q.options.length > 0 ? (
            <div className="options">
              {q.options.map((opt, i) => {
                const id = `q${idx}-opt${i}`
                // Option format: "A – ..."; answers[idx] is "A", "B", etc.
                const optionLetter = opt.split('–')[0].trim()
                const selected = answers[idx] === optionLetter
                return (
                  <label key={id} className="option" htmlFor={id}>
                    <input
                      id={id}
                      type="radio"
                      name={`q-${idx}`}
                      value={optionLetter}
                      checked={!!selected}
                      onChange={() => handleSelect(idx, optionLetter)}
                    />
                    <span>{opt}</span>
                  </label>
                )
              })}
            </div>
          ) : (
            <div className="options">
              <em>No options provided for this question.</em>
            </div>
          )}
        </div>
      ))}

      {!submitted ? (
        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn btn-primary" onClick={handleSubmit}>Submit</button>
        </div>
      ) : (
        <div className="card" style={{ background: '#f9fafb' }}>
          <h2>Results</h2>
          <p className="meta" style={{ marginTop: 6 }}>Correct: {score} / {total}</p>
          <p className="meta">Attempted: {attempted} / {total}</p>
          <div className="actions" style={{ marginTop: 12 }}>
            <button className="btn btn-primary" onClick={handleRetake}>Retake</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quiz 
