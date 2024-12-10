<template>
    <v-container class="pa-0 d-flex flex-column bg-grey-lighten-4" fluid style="height: 100vh;">
        <!-- Chat Area -->
        <v-row class="flex-0-1-100 overflow-y-auto ma-0" style="min-height: 0">
            <v-col class="pa-0">
                <div v-if="messages.length === 0" class="d-flex justify-center align-center h-100">
                    <h1 class="text-h4 font-weight-light text-grey-darken-1 text-center">
                        Let's build your dream PC together!
                    </h1>
                </div>
                <div v-else ref="chatContainer" class="chat-container px-4">
                    <div v-for="message in messages" :key="message.id" 
                         class="message-group mb-4"
                         :class="message.role === 'user' ? 'user-message' : 'assistant-message'">
                        <div class="message-sender font-weight-medium d-flex justify-space-between align-center">
                            <span class="sender-name">
                                {{ message.role === 'user' ? 'You' : 'PC GPT' }}
                            </span>
                            <span class="text-caption text-grey">
                                {{ formatTime(message.timestamp) }}
                            </span>
                        </div>
                        <v-card class="message-card" 
                               :class="message.role === 'user' ? 'bg-white' : 'bg-grey-lighten-3'"
                               flat>
                            <v-card-text v-html="formatMessage(message.content)"></v-card-text>
                        </v-card>
                    </div>
                    <div v-if="currentAnswer" 
                         class="message-group mb-4 assistant-message">
                        <div class="message-sender font-weight-medium d-flex justify-space-between align-center">
                            <span class="sender-name">PC GPT</span>
                            <span class="text-caption text-grey">
                                {{ formatTime(currentAnswer.timestamp) }}
                            </span>
                        </div>
                        <v-card class="message-card bg-grey-lighten-3" flat>
                            <v-card-text v-html="formatMessage(currentAnswer.content)"></v-card-text>
                        </v-card>
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- Input Area -->
        <v-row class="ma-0">
            <v-col cols="12" class="py-2 input-area">
                <v-form @submit.prevent="sendMessage">
                    <v-row no-gutters align="center">
                        <v-col>
                            <v-text-field v-model="userPrompt" placeholder="Type your message..."
                                variant="outlined" density="comfortable" hide-details rounded
                                class="rounded-pill" bg-color="white" :disabled="isLoading"></v-text-field>
                        </v-col>
                        <v-col cols="auto" class="ml-2">
                            <v-btn icon color="primary" class="rounded-circle"
                                @click="sendMessage"
                                :disabled="isLoading">
                                <Icon v-if="!isLoading" icon="mdi:send" :style="{ fontSize: '1.25rem' }" />
                                <v-progress-circular v-else indeterminate size="20" />
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue';
import { Icon } from "@iconify/vue";
import { getAnswer } from "@/repository/chat";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface ChatMessage {
  id: string | number;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

// Markdown configuration
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: false,
  mangle: false,
  pedantic: false, // Ensures GFM list behavior
  smartLists: true // Better list detection
});

const formatMessage = (text: unknown) => {
  if (!text) return '';
  try {
    const textString = String(text);
    console.log('Raw markdown:', textString);
    
    const rawHtml = marked(textString);
    console.log('Parsed HTML:', rawHtml);
    
    const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: ['br', 'strong', 'em', 'h1', 'h2', 'h3', 'li', 'ul', 'ol', 'hr', 'p', 'code', 'pre'],
      ALLOWED_ATTR: ['class']
    });
    console.log('Sanitized HTML:', sanitizedHtml);
    
    return sanitizedHtml;
  } catch (error) {
    console.error('Error formatting message:', error);
    return String(text);
  }
}

const userPrompt = ref('')
const messages = ref<ChatMessage[]>([])
const chatContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)
const currentAnswer = ref<ChatMessage | null>(null)

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            chatContainer.value.scrollTo({
                top: chatContainer.value.scrollHeight,
                behavior: 'smooth'
            });
        }
    })
}

watch([messages, currentAnswer], () => {
    scrollToBottom()
}, { deep: true })

const sendMessage = async () => {
    if (userPrompt.value.trim()) {
        const userMessage = {
            id: Date.now(),
            content: userPrompt.value,
            role: 'user' as const,
            timestamp: new Date()
        };
        
        messages.value.push(userMessage);
        userPrompt.value = '';
        isLoading.value = true;
        
        try {
            const stream = await getAnswer({ 
                messages: messages.value.map(m => ({
                    role: m.role,
                    content: m.content
                }))
            });

            currentAnswer.value = {
                id: Date.now(),
                content: '',
                role: 'assistant',
                timestamp: new Date()
            };

            useChatStream({
                stream,
                onChunk: ({ data }) => {
                    if (currentAnswer.value) {
                        currentAnswer.value.content += data;
                    }
                },
                onReady: () => {
                    if (currentAnswer.value) {
                        messages.value.push(currentAnswer.value);
                        currentAnswer.value = null;
                    }
                    isLoading.value = false;
                },
            })

        } catch (error) {
            console.error('Error:', error);
            isLoading.value = false;
        }
    }
}

const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
}
</script>

<style scoped>
.chat-container {
    height: calc(100vh - 7.5px); /* Adjust value based on header/input heights */
    overflow-y: auto;
    padding: 1rem;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
}

.message-group {
    width: 100%;
}

.user-message {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.assistant-message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.message-card {
    width: 100%;
    border: 1px solid #e0e0e0;
    border-radius: 1.125rem;
}

.message-card :deep(.v-card-text) {
    padding: 1.0rem 1.25rem;
    white-space: pre-wrap;
    font-size: 0.9375rem;
    line-height: 1.6;
    font-weight: 400;
    letter-spacing: 1px;
}

.message-card :deep(h1) {
    font-size: 1.5em;
    margin: 0.5em 0;
}

.message-card :deep(h2) {
    font-size: 1.3em;
    margin: 0.4em 0;
}

.message-card :deep(h3) {
    font-size: 1.1em;
    margin: 0.3em 0;
}

.message-card :deep(strong) {
    font-weight: 600;
}

.message-card :deep(em) {
    font-style: italic;
}

.message-card :deep(code) {
    background: #f5f5f5;
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
}

.message-card :deep(pre) {
    background: #f5f5f5;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
}

.message-card :deep(ol), 
.message-card :deep(ul) {
    margin: 0 0 0 2rem;
    padding: 0;
    height: fit-content;
    min-height: min-content;
    display: flex;
    flex-direction: column;
}

.message-card :deep(li) {
    height: fit-content;
    min-height: min-content;
}

.message-card :deep(hr) {
    margin: 0.75rem 0;
    border: 0;
    border-top: 1px solid #e0e0e0;
}

.input-area {
    background-color: rgb(243, 244, 246);
    border-top: 1px solid #e0e0e0;
}

.message-sender {
    padding: 0 0.5rem;
    margin-bottom: 0.25rem;
    width: 100%;
}

.sender-name {
    flex: 1;
    letter-spacing: 1px;
}

@keyframes pulse {
    0% {
        background-position: 100% 50%;
    }
    100% {
        background-position: 0 50%;
    }
}

.loading-skeleton {
    width: 100%;
}

.loading-skeleton .skeleton-line {
    height: 1.25rem;
    border-radius: 0.5rem;
    background: linear-gradient(
        90deg,
        rgba(190, 190, 190, 0.2) 25%,
        rgba(129, 129, 129, 0.24) 37%,
        rgba(190, 190, 190, 0.2) 63%
    );
    background-size: 400% 100%;
    animation: pulse 1.4s ease infinite;
}

.loading-skeleton .skeleton-line:last-child {
    margin-bottom: 0;
}

.text-caption {
  font-size: 0.75rem;
}
</style>
