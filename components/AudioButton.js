'use client'

// components/AudioButton.js
// Enhanced audio button component for Misti Italian Learning App
// Supports both dictionary words and conjugation forms with dual audio preferences

import { useState } from 'react'
import { playAudio } from '../lib/audio-utils'

export default function AudioButton({ 
  wordId, 
  italianText, 
  audioFilename = null,
  audioMetadata = null, // NEW: For conjugation forms with word_audio_metadata array
  audioPreference = 'form-only', // NEW: 'form-only' or 'with-pronoun'
  pronounContext = null, // NEW: Pronoun context (io, tu, lui, etc.)
  size = 'md',
  className = '',
  title = null
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isError, setIsError] = useState(false)

  // Enhanced audio detection for both dictionary and conjugation data
  const getAudioInfo = () => {
    // Handle conjugation data (word_audio_metadata array from join query)
    if (audioMetadata && Array.isArray(audioMetadata) && audioMetadata.length > 0) {
      console.log('🎵 Conjugation audio metadata:', audioMetadata)
      
      // Try to find preferred variant (form-only or with-pronoun)
      const preferredAudio = audioMetadata.find(meta => 
        meta.variant_type === audioPreference
      )
      
      if (preferredAudio) {
        console.log(`🎯 Found preferred audio variant: ${audioPreference}`)
        return {
          hasPremiumAudio: true,
          audioFilename: preferredAudio.audio_filename,
          voiceName: preferredAudio.azure_voice_name,
          variant: preferredAudio.variant_type
        }
      }
      
      // Fallback to any available audio variant
      const fallbackAudio = audioMetadata[0]
      if (fallbackAudio) {
        console.log(`🔄 Using fallback audio variant: ${fallbackAudio.variant_type}`)
        return {
          hasPremiumAudio: true,
          audioFilename: fallbackAudio.audio_filename,
          voiceName: fallbackAudio.azure_voice_name,
          variant: fallbackAudio.variant_type
        }
      }
    }
    
    // Handle dictionary word data (original format - single audio file)
    if (audioFilename) {
      console.log('📚 Dictionary word audio:', audioFilename)
      return {
        hasPremiumAudio: true,
        audioFilename: audioFilename,
        voiceName: 'Premium',
        variant: 'base-word'
      }
    }
    
    // No premium audio available
    console.log('🔊 No premium audio, will use TTS fallback')
    return {
      hasPremiumAudio: false,
      audioFilename: null,
      voiceName: null,
      variant: null
    }
  }

  const { hasPremiumAudio, audioFilename: actualAudioFile, voiceName, variant } = getAudioInfo()

  // Generate playback text based on audio preference and available context
  const getPlaybackText = () => {
    if (audioPreference === 'with-pronoun' && pronounContext) {
      // Use pronoun + form for with-pronoun preference
      return `${pronounContext} ${italianText}`
    }
    
    // Default to form-only text
    return italianText
  }

  // Handle audio playback with enhanced logging
  const handlePlay = async () => {
    if (isPlaying) return

    console.log('🎵 AudioButton play clicked:', {
      wordId,
      italianText,
      audioPreference,
      pronounContext,
      hasPremiumAudio,
      actualAudioFile,
      variant
    })

    setIsPlaying(true)
    setIsError(false)

    try {
      const playbackText = getPlaybackText()
      console.log(`🔊 Playing audio for: "${playbackText}"`)
      
      await playAudio(wordId, playbackText, actualAudioFile)
      
      console.log('✅ Audio playback completed successfully')
    } catch (error) {
      console.error('❌ Audio playback failed:', error)
      setIsError(true)
      
      // Show error state briefly, then reset
      setTimeout(() => {
        setIsError(false)
      }, 2000)
    } finally {
      // Reset playing state after a delay
      setTimeout(() => {
        setIsPlaying(false)
      }, 1000)
    }
  }

  // Generate enhanced title text with variant information
  const getButtonTitle = () => {
    if (title) return title
    
    const playbackText = getPlaybackText()
    
    if (hasPremiumAudio) {
      const variantText = variant ? ` (${variant})` : ''
      return `Play premium audio: "${playbackText}" (${voiceName}${variantText})`
    }
    
    return `Play pronunciation: "${playbackText}" (Text-to-Speech)`
  }

  const buttonTitle = getButtonTitle()

  // Size classes
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7', 
    lg: 'w-8 h-8',
    xl: 'w-10 h-10'
  }

  // Enhanced premium audio styling
  const getPremiumStyling = () => {
    if (!hasPremiumAudio) return ''
    
    // Different styling based on variant type
    switch (variant) {
      case 'with-pronoun':
        return 'premium-audio border-2 border-blue-400 shadow-lg' // Blue for with-pronoun
      case 'form-only':
        return 'premium-audio border-2 border-yellow-400 shadow-lg' // Gold for form-only
      default:
        return 'premium-audio border-2 border-yellow-400 shadow-lg' // Default gold
    }
  }

  return (
    <button
      onClick={handlePlay}
      disabled={isPlaying}
      className={`
        ${sizeClasses[size]}
        bg-emerald-600 hover:bg-emerald-700 
        text-white rounded-full 
        flex items-center justify-center 
        transition-all duration-200 
        flex-shrink-0
        ${getPremiumStyling()}
        ${isPlaying ? 'opacity-75 cursor-not-allowed' : 'hover:scale-105'}
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
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="ml-0.5">
          <path d="M8 5v14l11-7z"/>
        </svg>
      )}
    </button>
  )
}

// Enhanced CSS for premium audio variants (add to globals.css)
export const enhancedAudioButtonStyles = `
  /* Premium audio base styling */
  .premium-audio {
    position: relative;
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  }
  
  /* Form-only variant (gold) */
  .premium-audio.border-yellow-400 {
    box-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
  }
  
  /* With-pronoun variant (blue) */
  .premium-audio.border-blue-400 {
    box-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
  }
  
  /* Hover effects */
  .premium-audio:hover {
    transform: scale(1.05);
    box-shadow: 0 0 12px rgba(255, 215, 0, 0.8);
  }
  
  .premium-audio.border-blue-400:hover {
    box-shadow: 0 0 12px rgba(59, 130, 246, 0.8);
  }
`
