'use client';

import { useState, useEffect } from 'react';

export default function TestHooks() {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState('Hooks loaded');

  useEffect(() => {
    setMessage('useEffect ran successfully');
  }, []);

  return (
    <div>
      <h1>Test React Hooks</h1>
      <p>Message: {message}</p>
      <p>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        className="bg-blue-500 text-white px-3 py-1 rounded"
      >
        Increment
      </button>
    </div>
  );
}