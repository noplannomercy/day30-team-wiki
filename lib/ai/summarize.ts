import { callOpenRouter, stripHtmlTags, truncateText } from './openrouter'

export async function generateSummary(
  title: string,
  content: string
): Promise<string> {
  const plainText = stripHtmlTags(content)
  const truncatedText = truncateText(plainText)

  const systemPrompt = `You are a helpful assistant that creates concise summaries of documents.
Generate a brief TL;DR summary (2-3 sentences) that captures the main points and key takeaways.

Rules:
- Keep it concise (2-3 sentences, ~50-100 words)
- Focus on key information and main points
- Use the same language as the document (English or Korean)
- Write in a clear, professional tone`

  const userPrompt = `Document Title: ${title}

Document Content:
${truncatedText}

Create a brief TL;DR summary (2-3 sentences) of this document.`

  try {
    const response = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      300
    )

    const summary = response.trim()

    if (summary.length === 0) {
      throw new Error('Empty summary received')
    }

    return summary
  } catch (error) {
    console.error('Failed to generate summary:', error)
    throw new Error('Failed to generate summary from AI')
  }
}
