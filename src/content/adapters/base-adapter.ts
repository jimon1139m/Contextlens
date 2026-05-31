export interface SiteAdapter {
  name: string
  getPromptText(): string | null
  setPromptText(text: string): void
  onSubmit(callback: (prompt: string) => Promise<string>): void
  destroy(): void
}
