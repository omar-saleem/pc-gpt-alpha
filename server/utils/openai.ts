import OpenAI from 'openai'

const config = useRuntimeConfig()

const configuration = {
    apiKey: config.openAiApiKey,
}
const openai = new OpenAI(configuration)

export const getChatStream = async ({
    messages,
}: {
    messages: OpenAI.Chat.ChatCompletionMessageParam[]
}) => {
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        throw new Error('Messages array is required and must not be empty')
    }
    const response = await openai.chat.completions.create({
        //   max_tokens: 2048,
        model: 'gpt-4o-mini',
        //   temperature: 0.5,
        messages,
        stream: true,
    })

    return response
}
