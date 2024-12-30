<template>
    <div>
        <textarea v-model="logStore.asText" readonly></textarea>
    </div>
</template>

<style scoped>
    textarea {
        padding: 0.5em;
        width: 100%;
        height: 100%;
        resize: none;
        cursor: default;
    }
</style>

<script setup lang="ts">
    import { useLogStore } from '../stores/logs';


    const logStore = useLogStore();
</script>
