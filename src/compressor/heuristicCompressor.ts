// Filler phrases that add zero information
const FILLER_PATTERNS: RegExp[] = [
  /\b(please\s+)?(could\s+you\s+)?kindly\b/gi,
  /\bas\s+an?\s+AI\s+(language\s+model|assistant)?\b/gi,
  /\bi\s+would\s+like\s+(you\s+to\s+)?/gi,
  /\bcan\s+you\s+please\b/gi,
  /\bi\s+was\s+wondering\s+if\s+you\s+could\b/gi,
  /\bif\s+that\s+makes\s+sense\b/gi,
  /\bjust\s+to\s+clarify\b/gi,
  /\bfor\s+your\s+information\b/gi,
  /\bbasically\b/gi,
  /\bto\s+be\s+honest\b/gi,
  /\bas\s+I\s+mentioned\s+(earlier|before|previously)\b/gi,
  /\b(very|really|quite|rather|somewhat)\s+(very|really|quite|rather|somewhat)\b/gi,
  /\b(please|kindly|could\s+you|can\s+you)\b/gi,
  /\bi\s+(want|need)(\s+you)?\s+to\b/gi,
]

// Redundant verbose openers
const OPENER_PATTERNS: RegExp[] = [
  /^(hello|hi|hey)[,!.]?\s*/i,
  /^good\s+(morning|afternoon|evening)[,!.]?\s*/i,
  /^i\s+hope\s+(you('re|r|re)\s+doing\s+well)[.!,]?\s*/i,
  /^thank\s+you\s+for\s+(your\s+)?(help|assistance|response)[.!,]?\s*/i,
]

export function compressPrompt(
  text: string,
  level: 'light' | 'medium' | 'aggressive' = 'medium'
): string {
  let compressed = text

  // Always: strip opener fluff
  for (const pattern of OPENER_PATTERNS) {
    compressed = compressed.replace(pattern, '')
  }

  if (level === 'medium' || level === 'aggressive') {
    // Strip filler phrases
    for (const pattern of FILLER_PATTERNS) {
      compressed = compressed.replace(pattern, '')
    }
    // Normalize whitespace
    compressed = compressed.replace(/\s{2,}/g, ' ').trim()
  }

  if (level === 'aggressive') {
    // Remove articles where unambiguous
    compressed = compressed.replace(/\b(the|a|an)\s+(?=[A-Z])/g, '')
    // Condense "in order to" → "to"
    compressed = compressed.replace(/\bin\s+order\s+to\b/gi, 'to')
    // "due to the fact that" → "because"
    compressed = compressed.replace(/\bdue\s+to\s+the\s+fact\s+that\b/gi, 'because')
    // "at this point in time" → "now"
    compressed = compressed.replace(/\bat\s+this\s+point\s+in\s+time\b/gi, 'now')
  }

  return compressed.trim()
}
