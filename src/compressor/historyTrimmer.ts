import { estimateTokens } from '../shared/utils'

interface ConversationTurn {
  role: 'user' | 'assistant'
  content: string
}

export function trimHistory(
  history: ConversationTurn[],
  maxTokenBudget: number = 800
): ConversationTurn[] {
  if (!history.length) return history

  let total = 0
  const kept: ConversationTurn[] = []

  // Always keep the last turn (most recent context)
  for (let i = history.length - 1; i >= 0; i--) {
    const tokens = estimateTokens(history[i].content)
    if (total + tokens > maxTokenBudget) break
    kept.unshift(history[i])
    total += tokens
  }

  return kept
}

export function summarizeTurn(turn: ConversationTurn, maxChars = 200): ConversationTurn {
  if (turn.content.length <= maxChars) return turn
  return {
    ...turn,
    content: turn.content.slice(0, maxChars).trimEnd() + '… [truncated]',
  }
}
