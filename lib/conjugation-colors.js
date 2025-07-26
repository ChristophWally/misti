export const getConjugationColors = (wordTags) => {
  if (wordTags?.includes('are-conjugation')) {
    return {
      type: 'are',
      primary: '#14b8a6',
      light: '#f0fdfa',
      border: '#5eead4',
      text: '#134e4a'
    }
  }

  if (wordTags?.includes('ere-conjugation')) {
    return {
      type: 'ere',
      primary: '#06b6d4',
      light: '#ecfeff',
      border: '#67e8f9',
      text: '#164e63'
    }
  }

  if (wordTags?.includes('ire-conjugation') || wordTags?.includes('ire-isc-conjugation')) {
    return {
      type: 'ire',
      primary: '#2dd4bf',
      light: '#f0fdfa',
      border: '#99f6e4',
      text: '#134e4a'
    }
  }

  // Default fallback
  return {
    type: 'default',
    primary: '#14b8a6',
    light: '#f0fdfa',
    border: '#5eead4',
    text: '#134e4a'
  }
}
