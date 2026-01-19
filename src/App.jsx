import { useState, useEffect } from 'react'
import SignIn from './components/SignIn'
import SignUp from './components/SignUp'
import './App.css'

function TodoApp({ user, onLogout }) {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()
  }, [])

  const fetchTodos = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:8080/api/todos', {
        headers: {
          'Authorization': token
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTodos(data)
      }
    } catch (error) {
      console.error('Error fetching todos:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTodo = async () => {
    if (input.trim()) {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch('http://localhost:8080/api/todos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({ text: input })
        })
        if (response.ok) {
          const newTodo = await response.json()
          setTodos([...todos, newTodo])
          setInput('')
        }
      } catch (error) {
        console.error('Error adding todo:', error)
      }
    }
  }

  const toggleTodo = async (id) => {
    const todo = todos.find(t => t.id === id)
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8080/api/todos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ completed: !todo.completed })
      })
      if (response.ok) {
        setTodos(todos.map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
        ))
      }
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const deleteTodo = async (id) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8080/api/todos/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      })
      if (response.ok) {
        setTodos(todos.filter(t => t.id !== id))
      }
    } catch (error) {
      console.error('Error deleting todo:', error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="app">
      <div className="header">
        <h1>Todo App</h1>
        <div className="user-info">
          <span>Welcome, {user.username}!</span>
          <button onClick={onLogout} className="logout-button">Logout</button>
        </div>
      </div>
      <div className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new todo..."
          onKeyPress={(e) => e.key === 'Enter' && addTodo()}
        />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul className="todo-list">
        {todos.map(todo => (
          <li key={todo.id} className={todo.completed ? 'completed' : ''}>
            <span onClick={() => toggleTodo(todo.id)}>{todo.text}</span>
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [isSignUp, setIsSignUp] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // Optionally verify token here
      // For now, assume it's valid
    }
  }, [])

  const handleSignIn = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
  }

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp)
  }

  if (!user) {
    return isSignUp ? (
      <SignUp onToggleMode={toggleAuthMode} />
    ) : (
      <SignIn onSignIn={handleSignIn} onToggleMode={toggleAuthMode} />
    )
  }

  return <TodoApp user={user} onLogout={handleLogout} />
}

export default App