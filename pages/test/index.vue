<script setup>
import { getAnswer } from "@/repository/chat";
import { ref, watchEffect } from "vue";

const messages = ref([]);
const answer = ref(null);

const question = ref("");
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
                        <div class="message-sender font-weight-medium d-flex justify-space-between align-center">
                            <span>{{ message.role === 'user' ? 'You' : 'Assistant' }}</span>
                            <span class="text-caption text-grey">{{ new Date().toLocaleTimeString() }}</span>
                        </div>
                        <v-card class="message-card" 
                               :class="message.role === 'user' ? 'bg-white' : 'bg-grey-lighten-3'"
                               flat>
                            <v-card-text>{{ message.content }}</v-card-text>
                        </v-card>
                    </div>
                    <div v-if="answer" class="message-group ml-auto mb-4">
                        <div class="message-sender font-weight-medium">Assistant</div>
                        <v-card class="message-card bg-grey-lighten-3" flat>
                            <v-card-text>{{ answer.content }}</v-card-text>
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
    padding: 0.5rem 1rem;
    white-space: pre-wrap;
}

.input-area {
    background-color: rgb(243, 244, 246);
    border-top: 1px solid #e0e0e0;
}
</style>
