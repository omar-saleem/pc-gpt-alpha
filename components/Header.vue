<template>
    <v-app-bar permanent elevation="0" class="px-4 bg-grey-lighten-4" app flat>
        <div class="d-flex align-center w-100">
            <!-- Logo/Title -->
            <div class="d-flex align-center">
                <Icon icon="mdi:desktop-tower-monitor" :style="{ fontSize: '1.75rem', marginRight: '0.75rem' }"
                    class="text-primary" />
                <span class="text-h6 font-weight-medium text-primary">PC GPT</span>
            </div>

            <!-- Spacer -->
            <v-spacer></v-spacer>

            <!-- Refresh Button -->
            <v-btn icon variant="text" @click="refreshPage" class="text-grey-darken-1">
                <Icon icon="mdi:refresh" :style="{ fontSize: '1.25rem' }" />
            </v-btn>
        </div>
    </v-app-bar>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";

const refreshPage = () => {
    window.location.reload();
};
</script>

<style scoped>
.v-app-bar {
    border-bottom: 1px solid #e0e0e0;
}
</style>
