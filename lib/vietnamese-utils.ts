// Utility functions for Vietnamese text processing

// Map Vietnamese characters to their non-accent equivalents
const accentMapObject: Record<string, string> = {
  'à': 'a', 'á': 'a', 'ạ': 'a', 'ả': 'a', 'ã': 'a', 'â': 'a', 'ầ': 'a', 'ấ': 'a', 'ậ': 'a', 'ẩ': 'a', 'ẫ': 'a', 'ă': 'a', 'ằ': 'a', 'ắ': 'a', 'ặ': 'a', 'ẳ': 'a', 'ẵ': 'a',
  'è': 'e', 'é': 'e', 'ẹ': 'e', 'ẻ': 'e', 'ẽ': 'e', 'ê': 'e', 'ề': 'e', 'ế': 'e', 'ệ': 'e', 'ể': 'e', 'ễ': 'e',
  'ì': 'i', 'í': 'i', 'ị': 'i', 'ỉ': 'i', 'ĩ': 'i',
  'ò': 'o', 'ó': 'o', 'ọ': 'o', 'ỏ': 'o', 'õ': 'o', 'ô': 'o', 'ồ': 'o', 'ố': 'o', 'ộ': 'o', 'ổ': 'o', 'ỗ': 'o', 'ơ': 'o', 'ờ': 'o', 'ớ': 'o', 'ợ': 'o', 'ở': 'o', 'ỡ': 'o',
  'ù': 'u', 'ú': 'u', 'ụ': 'u', 'ủ': 'u', 'ũ': 'u', 'ư': 'u', 'ừ': 'u', 'ứ': 'u', 'ự': 'u', 'ử': 'u', 'ữ': 'u',
  'ỳ': 'y', 'ý': 'y', 'ỵ': 'y', 'ỷ': 'y', 'ỹ': 'y',
  'đ': 'd',
  'À': 'A', 'Á': 'A', 'Ạ': 'A', 'Ả': 'A', 'Ã': 'A', 'Â': 'A', 'Ầ': 'A', 'Ấ': 'A', 'Ậ': 'A', 'Ẩ': 'A', 'Ẫ': 'A', 'Ă': 'A', 'Ằ': 'A', 'Ắ': 'A', 'Ặ': 'A', 'Ẳ': 'A', 'Ẵ': 'A',
  'È': 'E', 'É': 'E', 'Ẹ': 'E', 'Ẻ': 'E', 'Ẽ': 'E', 'Ê': 'E', 'Ề': 'E', 'Ế': 'E', 'Ệ': 'E', 'Ể': 'E', 'Ễ': 'E',
  'Ì': 'I', 'Í': 'I', 'Ị': 'I', 'Ỉ': 'I', 'Ĩ': 'I',
  'Ò': 'O', 'Ó': 'O', 'Ọ': 'O', 'Ỏ': 'O', 'Õ': 'O', 'Ô': 'O', 'Ồ': 'O', 'Ố': 'O', 'Ộ': 'O', 'Ổ': 'O', 'Ỗ': 'O', 'Ơ': 'O', 'Ờ': 'O', 'Ớ': 'O', 'Ợ': 'O', 'Ở': 'O', 'Ỡ': 'O',
  'Ù': 'U', 'Ú': 'U', 'Ụ': 'U', 'Ủ': 'U', 'Ũ': 'U', 'Ư': 'U', 'Ừ': 'U', 'Ứ': 'U', 'Ự': 'U', 'Ử': 'U', 'Ữ': 'U',
  'Ỳ': 'Y', 'Ý': 'Y', 'Ỵ': 'Y', 'Ỷ': 'Y', 'Ỹ': 'Y',
  'Đ': 'D'
}

// Use Map for better performance with large texts
const accentMap = new Map<string, string>(Object.entries(accentMapObject))

export const vietnameseUtils = {
  // Expose accentMap for backward compatibility
  accentMap: accentMapObject,

  /**
   * Convert Vietnamese text to non-accent equivalent
   * Optimized with Map for better performance
   */
  removeAccents: (text: string): string => {
    if (!text) return ''
    
    // Use Map for faster lookups
    return text
      .split('')
      .map(char => accentMap.get(char) || char)
      .join('')
  },

  /**
   * Create search terms with both accented and non-accented versions
   * Returns array of normalized search terms for fuzzy matching
   */
  createSearchTerms: (text: string): string[] => {
    if (!text) return []
    
    const trimmedText = text.trim()
    if (!trimmedText) return []
    
    const terms = trimmedText.split(/\s+/).filter(term => term.length > 0)
    if (terms.length === 0) return []
    
    const searchTerms = new Set<string>()
    
    for (const term of terms) {
      const lowerTerm = term.toLowerCase()
      // Add original term
      searchTerms.add(lowerTerm)
      // Add non-accented version
      searchTerms.add(vietnameseUtils.removeAccents(term).toLowerCase())
      
      // Add common Vietnamese variations
      const variations = vietnameseUtils.getVietnameseVariations(term)
      for (const variation of variations) {
        searchTerms.add(variation.toLowerCase())
        searchTerms.add(vietnameseUtils.removeAccents(variation).toLowerCase())
      }
    }
    
    return Array.from(searchTerms)
  },

  /**
   * Get common Vietnamese word variations for better search matching
   * Maps non-accented terms to their accented equivalents
   */
  getVietnameseVariations: (term: string): string[] => {
    if (!term) return []
    
    const lowerTerm = term.toLowerCase().trim()
    if (!lowerTerm) return []
    
    // Common Vietnamese word mappings (non-accented -> accented variants)
    const wordMap: Readonly<Record<string, readonly string[]>> = {
      'xuc': ['xúc'],
      'xich': ['xích'],
      'nuong': ['nướng'],
      'thit': ['thịt'],
      'heo': ['heo'],
      'bo': ['bò'],
      'ga': ['gà'],
      'combo': ['combo'],
      'giam': ['giăm'],
      'bong': ['bông'],
      'cha': ['chả'],
      'lua': ['lụa'],
      'pate': ['pate'],
      'ham': ['hầm'],
      'suon': ['sườn'],
      'cot': ['cốt'],
      'let': ['lết'],
      'nac': ['nạc'],
      'ba': ['ba'],
      'chi': ['chỉ'],
      'xay': ['xay'],
      'chan': ['chân'],
      'ribs': ['ribs'],
      'belly': ['belly'],
      'chops': ['chops'],
      'leg': ['leg'],
      'shoulder': ['shoulder'],
      'ground': ['ground'],
      'fresh': ['fresh'],
      'lean': ['lean'],
      'premium': ['premium'],
      'healthy': ['healthy'],
      'processed': ['processed'],
      'cured': ['cured'],
      'smoked': ['smoked'],
      'grilled': ['grilled'],
      'fried': ['fried'],
      'canned': ['canned']
    } as const
    
    const variations: string[] = []
    const words = lowerTerm.split(/\s+/).filter(word => word.length > 0)
    
    // Add variations for each word
    for (const word of words) {
      const variants = wordMap[word]
      if (variants) {
        variations.push(...variants)
      }
    }
    
    return variations
  },

  /**
   * Check if text matches search query (supports both accented and non-accented)
   * Case-insensitive and accent-insensitive matching
   */
  matchesSearch: (text: string, searchQuery: string): boolean => {
    if (!text || !searchQuery) return false
    
    const normalizedText = vietnameseUtils.removeAccents(text).toLowerCase().trim()
    const normalizedQuery = vietnameseUtils.removeAccents(searchQuery).toLowerCase().trim()
    
    if (!normalizedText || !normalizedQuery) return false
    
    return normalizedText.includes(normalizedQuery)
  },

  /**
   * Highlight all matching text in search results
   * Improved to highlight all occurrences, not just the first one
   * Returns HTML string with highlighted matches
   * 
   * Note: Uses normalized text for matching but highlights original text
   * This ensures accent-insensitive matching while preserving original formatting
   */
  highlightMatch: (text: string, searchQuery: string, className: string = 'bg-yellow-200'): string => {
    if (!text || !searchQuery) return text
    
    const normalizedText = vietnameseUtils.removeAccents(text).toLowerCase()
    const normalizedQuery = vietnameseUtils.removeAccents(searchQuery).toLowerCase().trim()
    
    if (!normalizedQuery || !normalizedText.includes(normalizedQuery)) {
      return text
    }
    
    // Since normalization doesn't change string length (1 char -> 1 char),
    // we can safely use normalized indices on original text
    // Find all match positions in normalized text
    const matches: Array<{ start: number; end: number }> = []
    let searchIndex = 0
    
    while (searchIndex < normalizedText.length) {
      const index = normalizedText.indexOf(normalizedQuery, searchIndex)
      if (index === -1) break
      
      // Store positions (normalized and original text have same length)
      matches.push({ start: index, end: index + normalizedQuery.length })
      searchIndex = index + 1
    }
    
    if (matches.length === 0) return text
    
    // Build result with highlights using original text
    let result = ''
    let lastIndex = 0
    
    for (const match of matches) {
      // Add text before match (from original text)
      result += text.substring(lastIndex, match.start)
      // Add highlighted match (from original text, preserving accents)
      const matchText = text.substring(match.start, match.end)
      result += `<mark class="${className}">${matchText}</mark>`
      lastIndex = match.end
    }
    
    // Add remaining text after last match
    result += text.substring(lastIndex)
    
    return result
  }
}

export default vietnameseUtils
