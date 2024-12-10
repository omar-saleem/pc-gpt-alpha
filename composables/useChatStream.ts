const parseStreamChunks = (stream: string) => {
    if (!stream) {
        console.log('Empty stream received')
        return []
    }

    // Split while keeping the newline characters
    const lines = stream.split(/(?<=\n)/)
    console.log('Split lines:', lines)

    const dataLines = lines
        .map(line => {
            // Preserve empty lines and whitespace
            if (line.match(/^\s*$/)) {
                return { text: line }
            }

            // Handle prefixed and raw JSON
            const content = line.includes('data: ') 
                ? line.replace('data: ', '')
                : line

            if (content === '[DONE]') {
                return null
            }

            try {
                return JSON.parse(content)
            } catch (e) {
                // Preserve raw text with newlines
                return { text: line }
            }
        })
        .filter(Boolean)

    return dataLines
}

const data = ref('')

const resolveStream = async ({
    data,
    onChunk = () => {},
    onReady = () => {},
    stream,
}) => {
    const reader = stream.pipeThrough(new TextDecoderStream()).getReader()
    
    while (true) {
        const { value, done } = await reader.read()
        if (done) {
            onReady({ data: data.value })
            break
        }

        const chunks = value ? parseStreamChunks(value) : []
        
        for (const chunk of chunks) {
            const content = chunk.choices ? chunk.choices[0]?.delta?.content : chunk.text
            if (!content) continue
            data.value += content
            onChunk({ data: content })
        }
    }
}

const useChatStream = ({
    onChunk = () => {},
    onReady = () => {},
    stream,
}) => {
    data.value = '' // Reset data
    resolveStream({ data, onChunk, onReady, stream })
        .catch(error => console.error('Stream processing error:', error))
}

export { useChatStream }
