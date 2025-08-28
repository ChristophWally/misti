'use client'

import React from 'react'

export default function TestComponent() {
  if (false) return null;

  // Test the exact same structure
  return (
    <div className="fixed inset-0">
      <div>Test</div>
    </div>
  )
}