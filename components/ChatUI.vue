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
                    <div v-for="(message, index) in messages" :key="index" class="mb-4">
                        <!-- User Message -->
                        <div class="message-group">
                            <div class="message-sender font-weight-medium">You</div>
                            <v-card class="message-card bg-white" flat>
                                <v-card-text>{{ message }}</v-card-text>
                            </v-card>
                        </div>
                        <!-- Assistant Message -->
                        <div class="message-group mt-2">
                            <div class="message-sender font-weight-medium">PC GPT</div>
                            <v-card class="message-card bg-grey-lighten-3" flat>
                                <v-card-text>{{ message }}</v-card-text>
                            </v-card>
                        </div>
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
                                class="rounded-pill" bg-color="white"></v-text-field>
                        </v-col>
                        <v-col cols="auto" class="ml-2">
                            <v-btn icon color="primary" class="rounded-circle"
                                @click="sendMessage">
                                <Icon icon="mdi:send" :style="{ fontSize: '20px' }" />
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

const userPrompt = ref('')
const messages = ref<string[]>([])
const chatContainer = ref<HTMLElement | null>(null)

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

const sendMessage = () => {
    if (userPrompt.value.trim()) {
        messages.value.push(userPrompt.value)
        userPrompt.value = ''
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
    border-radius: 32px;
}

.message-card :deep(.v-card-text) {
    padding: 8px 16px;
}

.input-area {
    background-color: rgb(243, 244, 246);
    border-top: 1px solid #e0e0e0;
}
</style>
