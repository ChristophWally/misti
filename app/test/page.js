'use client'
import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function TestAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Success! Check your email.')
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Misti Auth</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: '10px' }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: 'block', margin: '10px 0', padding: '10px' }}
      />
      <button onClick={signUp} style={{ padding: '10px 20px' }}>
        Test Sign Up
      </button>
      {message && <p>{message}</p>}
    </div>
  )
}
