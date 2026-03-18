'use client'

// components/AudioButton.js
// Reusable audio button component for Misti Italian Learning App

import { useState } from 'react'
import { playAudio } from '../lib/audio-utils'

export default function AudioButton({
  wordId,
  italianText,
  audioObjectKey = null,
  audioBucket = null,
  size = 'md',
  variant = 'icon',
  className = '',
  title = null,
  colorClass = 'bg-emerald-600 hover:bg-emerald-700'
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isError, setIsError] = useState(false)

  // Determine if this is premium audio
  const hasPremiumAudio = audioObjectKey &&
                         audioObjectKey !== 'null' &&
                         audioObjectKey !== null &&
                         audioObjectKey.trim() !== '' &&
                         typeof audioObjectKey === 'string'

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7', 
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
    chip: 'w-8 h-8'
  }

  // Handle audio playback
  const handlePlay = async () => {
    if (isPlaying) return

    setIsPlaying(true)
    setIsError(false)

    try {
      await playAudio(wordId, italianText, audioObjectKey, audioBucket)
    } catch (error) {
      console.error('Audio playback failed:', error)
      setIsError(true)

      // Show error state briefly, then reset
      setTimeout(() => {
        setIsError(false)
      }, 2000)
    } finally {
      setIsPlaying(false)
    }
  }

  // Generate title text
  const buttonTitle = title || (hasPremiumAudio ? 'Play premium audio' : 'Play pronunciation')

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      aria-label={buttonTitle}
      className={`
        ${sizeClasses[size] || sizeClasses.md}
        text-white rounded-full
        flex items-center justify-center
        transition-all duration-200
        flex-shrink-0
        ${hasPremiumAudio ? 'premium-audio border-2 border-yellow-400 shadow-lg' : ''}
        ${isPlaying ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}
        ${colorClass}
        ${isError ? 'bg-red-500 hover:bg-red-600' : ''}
        ${className}
      `}
      title={buttonTitle}
    >
      {isPlaying ? (
        <svg 
          className="animate-spin h-3 w-3 text-white" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : isError ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
        </svg>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M11 7L7.5 10H5V14H7.5L11 17V7Z"
              fill="currentColor"
            />
            <path
              d="M14 10C14.7 10.6 15.1 11.25 15.1 12C15.1 12.75 14.7 13.4 14 14"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M16.2 8.4C17.5 9.3 18.3 10.55 18.3 12C18.3 13.45 17.5 14.7 16.2 15.6"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
          </svg>
        </>
      )}
    </button>
  )
}

// Premium audio indicator styles (add to globals.css later)
export const audioButtonStyles = `
  .premium-audio {
    position: relative;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  }
  
  .premium-audio::before {
    content: '★';
    position: absolute;
    top: -4px;
    right: -4px;
    font-size: 10px;
    color: #FFD700;
    background: white;
    border-radius: 50%;
    width: 14px;
    height: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #FFD700;
  }
`
