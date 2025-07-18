// lib/audio-utils.js
// Audio playback utilities for Misti Italian Learning App
// Handles premium Azure audio and TTS fallback

import { supabase } from './supabase'

/**
 * Main audio playback function
 * Tries premium audio first, falls back to browser TTS
 */
export async function playAudio(wordId, italianText, audioFilename) {
  console.log('DEBUG: playAudio called - wordId:', wordId, 'italianText:', italianText, 'audioFilename:', audioFilename)
  
  try {
    // Check if we have a valid premium audio file
    const hasValidAudioFile = audioFilename && 
                            audioFilename !== 'null' && 
                            audioFilename !== null && 
                            audioFilename.trim() !== '' &&
                            typeof audioFilename === 'string'
    
    console.log('DEBUG: hasValidAudioFile:', hasValidAudioFile)
    
    if (hasValidAudioFile) {
      console.log(`DEBUG: Attempting to create signed URL for: ${audioFilename}`)
      
      // Try both possible bucket names to be safe
      let urlData, urlError
      
      // First try 'word-audio'
      const result1 = await supabase
        .storage
        .from('word-audio')
        .createSignedUrl(audioFilename, 60)
      
      if (result1.data && result1.data.signedUrl) {
        urlData = result1.data
        urlError = null
      } else {
        // Try 'audio-files' as fallback
        const result2 = await supabase
          .storage
          .from('audio-files')
          .createSignedUrl(audioFilename, 60)
        
        urlData = result2.data
        urlError = result2.error
      }

      if (urlData && urlData.signedUrl) {
        console.log('DEBUG: Successfully created signed URL. Playing audio.')
        return new Promise((resolve, reject) => {
          const audio = new Audio(urlData.signedUrl)

          audio.onended = () => resolve({ success: true, source: 'premium' })
          audio.onerror = (e) => {
            console.error('DEBUG: Error playing pregenerated audio from URL:', e)
            fallbackToTTS(italianText).then(resolve).catch(reject)
          }

          audio.play().catch(err => {
            console.error('DEBUG: Audio play failed:', err)
            fallbackToTTS(italianText).then(resolve).catch(reject)
          })
        })
      } else {
        console.error('DEBUG: Error creating signed URL:', urlError)
      }
    }
    
    // Fallback to TTS
    console.log('DEBUG: No valid audioFilename. Falling back to TTS.')
    return await fallbackToTTS(italianText)
    
  } catch (error) {
    console.error('DEBUG: General error in playAudio function:', error)
    return await fallbackToTTS(italianText)
  }
}

/**
 * Fallback to browser Text-to-Speech
 * Improved with iOS support and Italian voice selection
 */
export async function fallbackToTTS(text) {
  console.log('DEBUG: Using TTS fallback for:', text)

  return new Promise((resolve, reject) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)

      const setItalianVoice = (voices) => {
        const italianVoices = voices.filter(voice =>
          voice.lang.startsWith('it') ||
          voice.lang.includes('IT') ||
          voice.name.toLowerCase().includes('ital')
        )

        if (italianVoices.length > 0) {
          const preferredVoice = italianVoices.find(voice =>
            voice.name.includes('Luca') ||
            voice.name.includes('Alice') ||
            voice.name.includes('Federica') ||
            voice.name.includes('Italia')
          ) || italianVoices[0]

          utterance.voice = preferredVoice
        }

        utterance.lang = 'it-IT'
        utterance.rate = 0.9
        utterance.pitch = 1.0
      }

      const speak = () => {
        utterance.onend = () => {
          resolve({ success: true, source: 'tts' })
        }

        utterance.onerror = (event) => {
          console.error('DEBUG: Speech synthesis error:', event)
          reject(new Error('Speech synthesis failed'))
        }

        speechSynthesis.cancel()
        speechSynthesis.speak(utterance)
      }

      const voices = speechSynthesis.getVoices()

      if (voices.length > 0) {
        setItalianVoice(voices)
        speak()
      } else {
        // Attempt to load voices briefly, but speak regardless after delay
        setTimeout(() => {
          const retryVoices = speechSynthesis.getVoices()
          if (retryVoices.length > 0) {
            setItalianVoice(retryVoices)
          }
          speak()
        }, 300)
      }
    } else {
      console.error('DEBUG: Speech synthesis not supported')
      reject(new Error('Speech synthesis not supported'))
    }
  })
}

/**
 * Initialize voices for mobile devices
 * Call this on app startup
 */
export function initializeVoices() {
  if ('speechSynthesis' in window) {
    speechSynthesis.onvoiceschanged = () => {
      console.log('🔄 Voices loaded:', speechSynthesis.getVoices().length)
    }
    speechSynthesis.getVoices()
  }
}

/**
 * Get available Italian voices
 * Useful for voice selection UI
 */
export function getItalianVoices() {
  if ('speechSynthesis' in window) {
    const voices = speechSynthesis.getVoices()
    return voices.filter(voice => 
      voice.lang.startsWith('it') || 
      voice.lang.includes('IT') || 
      voice.name.toLowerCase().includes('ital')
    )
  }
  return []
}

/**
 * Check if premium audio exists for a word
 * Returns the audio filename if it exists
 */
export function checkPremiumAudio(word) {
  const audioMetadata = word.word_audio_metadata && word.word_audio_metadata.length > 0 
    ? word.word_audio_metadata[0] 
    : null
    
  const hasPremiumAudio = audioMetadata && audioMetadata.audio_filename && audioMetadata.audio_filename.trim() !== ''
  const audioFilename = hasPremiumAudio ? audioMetadata.audio_filename : null
  
  return { hasPremiumAudio, audioFilename, voiceName: audioMetadata?.azure_voice_name }
}
