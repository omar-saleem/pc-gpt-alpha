import { getChatStream } from '../utils/openai'

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        console.log('Received body:', body) // Debug log

        if (!body.messages || !Array.isArray(body.messages)) {
            throw new Error('Invalid messages format')
        }

        const { messages } = body

        // Validate message format
        const isValidMessage = (msg: any) => 
            !!msg.role && 
            !!msg.content

        if (!messages.every(isValidMessage)) {
            throw new Error('Messages must have valid role and content')
        }

        const stream = await getChatStream({ messages })

        const readable = new ReadableStream({
            async start(controller) {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || ''
                    if (content) {
                        console.log('Sending chunk:', content) // Debug log
                        controller.enqueue(new TextEncoder().encode(content))
                    }
                }
                controller.close()
            },
        })

        return sendStream(event, readable)
    } catch (error) {
        console.error('Chat endpoint error:', error)
        throw createError({
            statusCode: 500,
            message: error instanceof Error ? error.message : 'Server error'
        })
    }
})
