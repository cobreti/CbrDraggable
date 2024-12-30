import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useLogStore = defineStore('logs', () => {
    const logs = ref<string[]>([]);

    function add(message: string) {
        logs.value = [...logs.value, message];
    }

    const asText = computed(() => {
        return logs.value.join('\n');
    })

    return {
        logs,
        add,
        asText
    };
});
