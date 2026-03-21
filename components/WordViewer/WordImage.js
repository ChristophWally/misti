'use client'

// components/WordViewer/WordImage.js
// Renders a single dictionary image from a media_asset.
// Fetches a signed URL from Supabase storage (private bucket).

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function WordImage({ mediaAsset, alt = '', className = '' }) {
  const [url, setUrl] = useState(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!mediaAsset?.object_key) return
    let cancelled = false

    const fetchUrl = async () => {
      // Try the declared bucket first, then common image bucket names
      const buckets = [mediaAsset.storage_bucket, 'word-images', 'images'].filter(Boolean)
      for (const bucket of buckets) {
        const { data, error: urlErr } = await supabase.storage
          .from(bucket)
          .createSignedUrl(mediaAsset.object_key, 3600)
        if (data?.signedUrl && !cancelled) {
          setUrl(data.signedUrl)
          return
        }
      }
      if (!cancelled) setError(true)
    }

    fetchUrl()
    return () => { cancelled = true }
  }, [mediaAsset?.object_key, mediaAsset?.storage_bucket])

  if (error || !mediaAsset?.object_key) return null

  if (!url) {
    return (
      <div className={`bg-gray-100 animate-pulse rounded-lg ${className}`} style={{ aspectRatio: '16/9' }} />
    )
  }

  return (
    <img
      src={url}
      alt={alt}
      className={`rounded-lg object-cover ${className}`}
      loading="lazy"
    />
  )
}
