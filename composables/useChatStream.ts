const parseStreamChunks = (stream: string) => {
    if (!stream) {
        console.log('Empty stream received')
        return []
    }

    // Split by newlines while preserving markdown syntax
    const lines = stream.split(/(?<=\n)/)

    const dataLines = lines
        .map(line => {
            // Preserve empty lines and whitespace
            if (line.match(/^\s*$/)) {
                return { text: line }
            }

            // Extract content after data prefix while preserving markdown
            if (line.startsWith('data: ')) {
                const content = line.slice(6) // Remove 'data: ' prefix

                if (content === '[DONE]') {
                    return null
                }

                try {
                    // Try parsing as JSON first
                    const parsed = JSON.parse(content)
                    return parsed
                } catch (e) {
                    // If not JSON, preserve as raw markdown text
                    return { text: content }
                }
            }

            // Return non-data lines as-is to preserve markdown
            return { text: line }
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
