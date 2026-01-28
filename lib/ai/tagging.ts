import { callOpenRouter, stripHtmlTags, truncateText } from './openrouter'

export async function generateTags(
  title: string,
  content: string
): Promise<string[]> {
  const plainText = stripHtmlTags(content)
  const truncatedText = truncateText(plainText)

  const systemPrompt = `You are a helpful assistant that generates relevant tags for documents.
Analyze the document and suggest 3-5 relevant tags that capture the main topics and themes.

Rules:
- Return ONLY a JSON array of strings
- Each tag should be 1-3 words
- Tags should be in English or Korean (match document language)
- Focus on topics, categories, or key concepts
- Example format: ["Project Management", "API Design", "Backend"]`

  const userPrompt = `Document Title: ${title}

Document Content:
${truncatedText}

Generate 3-5 relevant tags for this document. Return only a JSON array of strings.`

  try {
    const response = await callOpenRouter(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      500
    )

    // Parse JSON response
    const tags = JSON.parse(response.trim())

    if (!Array.isArray(tags)) {
      throw new Error('Response is not an array')
    }

    // Filter and validate tags
    return tags
      .filter((tag) => typeof tag === 'string' && tag.length > 0)
      .slice(0, 5)
  } catch (error) {
    console.error('Failed to generate tags:', error)
    throw new Error('Failed to generate tags from AI')
  }
}
