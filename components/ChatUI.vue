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
                    <div v-for="message in messages" :key="message.id" class="mb-4">
                        <div class="message-group" :class="{'ml-auto': message.sender === 'assistant'}">
                            <div class="message-sender font-weight-medium">
                                {{ message.sender === 'user' ? 'You' : 'PC GPT' }}
                            </div>
                            <v-card 
                                class="message-card" 
                                :class="message.sender === 'user' ? 'bg-white' : 'bg-grey-lighten-3'"
                                flat>
                                <v-card-text>{{ message.content }}</v-card-text>
                            </v-card>
                        </div>
                    </div>
                    <div v-if="isLoading" class="message-group ml-auto mb-4 w-100">
                        <div class="message-sender font-weight-medium">PC GPT</div>
                        <v-card class="message-card bg-grey-lighten-3" flat>
                            <v-card-text class="loading-skeleton">
                                <div class="skeleton-line"></div>
                            </v-card-text>
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
                                <Icon v-if="!isLoading" icon="mdi:send" :style="{ fontSize: '20px' }" />
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
import { ref, watch, nextTick } from 'vue'
import { Icon } from "@iconify/vue";

interface ChatMessage {
  id: number;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const userPrompt = ref('')
const messages = ref<ChatMessage[]>([])
const chatContainer = ref<HTMLElement | null>(null)
const isLoading = ref(false)

const scrollToBottom = () => {
    nextTick(() => {
        if (chatContainer.value) {
            // Force layout recalculation
            chatContainer.value.scrollTo({
                top: chatContainer.value.scrollHeight,
                behavior: 'smooth'
            });
        }
    })
}

// Watch for changes in messages
watch(messages, () => {
    scrollToBottom()
}, { deep: true })

const sendMessage = async () => {
    if (userPrompt.value.trim()) {
        // Add user message
        messages.value.push({
            id: Date.now(),
            content: userPrompt.value,
            sender: 'user',
            timestamp: new Date()
        })
        
        const userMessage = userPrompt.value
        userPrompt.value = ''
        isLoading.value = true
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 3000))
            // Add assistant response
            messages.value.push({
                id: Date.now(),
                content: `Response to: ${userMessage}`,
                sender: 'assistant',
                timestamp: new Date()
            })
        } finally {
            isLoading.value = false
        }
    }
}
</script>

<style scoped>
.chat-container {
    height: calc(100vh - 120px);
    /* Adjust value based on header/input heights */
    overflow-y: auto;
    padding: 1rem;
    scroll-behavior: smooth;
    display: flex;
    flex-direction: column;
}

.message-group {
    max-width: 100%;
    margin-bottom: 1rem;
}

.message-sender {
    padding-left: 0.5rem;
    margin-bottom: 0.25rem;
    color: #666;
}

.message-card {
    border: 1px solid #e0e0e0;
    border-radius: 18px;
}

.message-card :deep(.v-card-text) {
    padding: 8px 16px;
}

.input-area {
    background-color: rgb(243, 244, 246);
    border-top: 1px solid #e0e0e0;
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
    height: 20px;
    /* margin: 2px; */
    border-radius: 4px;
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
</style>
