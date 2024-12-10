<script setup lang="ts">
import { getAnswer } from "@/repository/chat";
import { ref, watchEffect } from "vue";
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const messages = ref([]);
const answer = ref(null);
const question = ref("");

// Configure marked options without custom renderer
marked.setOptions({
  breaks: true, // Allow line breaks
  gfm: true, // GitHub Flavored Markdown
  headerIds: false,
  mangle: false
});

// Update formatMessage function to handle text blocks
const formatMessage = (text: unknown) => {
  if (!text) return '';
  
  try {
    const textString = String(text);
    // Let marked handle the text block parsing
    const rawHtml = marked(textString);
    
    return DOMPurify.sanitize(rawHtml, {
      ALLOWED_TAGS: [
        'br', 'strong', 'em', 'h1', 'h2', 'h3',
        'li', 'ul', 'ol', 'hr', 'p', 'code', 'pre'
      ],
      ALLOWED_ATTR: ['class']
    });
  } catch (error) {
    console.error('Error formatting message:', error);
    return String(text);
  }
}

const askQuestion = async () => {
    messages.value.push({
        role: "user",
        content: question.value,
    });
    question.value = "";
    const stream = await getAnswer({ messages: messages.value });
    console.log('stream', stream);
    answer.value = {
        role: "assistant",
        content: "",
    };
    useChatStream({
        stream,
        onChunk: ({ data }) => {
            answer.value.content += data;
        },
        onReady: () => {
            messages.value.push(answer.value);
            answer.value = null;
        },
    });
};

watchEffect(() => {
    console.log('messages', messages.value);
    console.log('answer', answer.value);
}, { deep: true });
</script>

<template>
    <v-container class="pa-0 d-flex flex-column bg-grey-lighten-4" fluid style="height: 100vh;">
        <!-- Chat Area -->
        <v-row class="flex-0-1-100 overflow-y-auto ma-0" style="min-height: 0">
            <v-col class="pa-0">
                <div ref="chatContainer" class="chat-container px-4">
                    <div v-for="message in messages" 
                         class="message-group mb-4"
                         :class="message.role === 'user' ? 'user-message' : 'assistant-message'">
                        <div class="message-sender font-weight-medium d-flex justify-space-between align-center"
                             :class="'text-start'">
                            <span class="sender-name">
                              {{ message.role === 'user' ? 'You' : 'Assistant' }}
                            </span>
                            <span class="text-caption text-grey">
                              {{ new Date().toLocaleTimeString() }}
                            </span>
                        </div>
                        <v-card class="message-card" 
                               :class="message.role === 'user' ? 'bg-white' : 'bg-grey-lighten-3'"
                               flat>
                            <v-card-text v-html="formatMessage(message.content)"></v-card-text>
                        </v-card>
                    </div>
                    <div v-if="answer" class="message-group mb-4 assistant-message">
                        <div class="message-sender font-weight-medium d-flex justify-space-between align-center">
                            <span class="sender-name">Assistant</span>
                            <span class="text-caption text-grey">
                              {{ new Date().toLocaleTimeString() }}
                            </span>
                        </div>
                        <v-card class="message-card bg-grey-lighten-3" flat>
                            <v-card-text v-html="formatMessage(answer.content)"></v-card-text>
                        </v-card>
                    </div>
                </div>
            </v-col>
        </v-row>

        <!-- Input Area -->
        <v-row class="ma-0">
            <v-col cols="12" class="py-2 input-area">
                <v-form @submit.prevent="askQuestion">
                    <v-row no-gutters align="center">
                        <v-col>
                            <v-text-field v-model="question" 
                                        placeholder="Type your message..."
                                        variant="outlined" 
                                        density="comfortable" 
                                        hide-details 
                                        rounded
                                        class="rounded-pill" 
                                        bg-color="white">
                            </v-text-field>
                        </v-col>
                        <v-col cols="auto" class="ml-2">
                            <v-btn icon color="primary" 
                                   class="rounded-circle"
                                   type="submit">
                                <v-icon>mdi-send</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<style scoped>
.chat-container {
    height: calc(100vh - 7.5px);
    overflow-y: auto;
    padding: 1rem;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
}

.message-group {
    width: 100%; /* Full width */
}

.user-message {
    /* Align user messages to right */
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.assistant-message {
    /* Align assistant messages to left */
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.message-card {
    width: 100%; /* Full width cards */
    border: 1px solid #e0e0e0;
    border-radius: 1.125rem;
}

.message-card :deep(.v-card-text) {
    padding: 0.75rem 1.25rem 1.0rem;
    white-space: pre-wrap;
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

.message-card :deep(li.bullet) {
    list-style: none;
    padding-left: 1em;
    position: relative;
}

.message-card :deep(li.bullet)::before {
    content: "•";
    position: absolute;
    left: 0;
}

.message-card :deep(hr) {
    margin: 0.75rem 0;
    border: 0;
    border-top: 1px solid #e0e0e0;
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

.message-card :deep(ol) {
    margin-left: 2rem;
}

.message-card :deep(ul) {
    margin-left: 2rem;
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
</style>
