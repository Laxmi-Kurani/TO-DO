import { useState } from 'react'
import '../App.css'

function SignIn({ onSignIn, onToggleMode }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const response = await fetch('http://localhost:8080/api/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      })
      const data = await response.json()
      if (response.ok) {
        localStorage.setItem('token', data.token)
        onSignIn(data.user)
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError('Server error')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>Sign In</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="auth-button">Sign In</button>
        </form>
        <p className="auth-link">
          Don&apos;t have an account? <button onClick={onToggleMode} className="link-button">Sign Up</button>
        </p>
      </div>
    </div>
  )
}

export default SignIn