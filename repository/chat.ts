import OpenAI from 'openai'

export const getAnswer = async ({
    messages,
}: {
    messages: OpenAI.Chat.ChatCompletionMessageParam[]
}) => {
    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            messages,
        }),
    })
    if (!response.ok) throw new Error('API request failed')
    if (!response.body) throw new Error('No response body')

    return response.body
}
