import { ref } from "vue";
import { defineStore } from "pinia";

export const useDarkStore = defineStore(
  "darkStore",
  () => {
    const isDark = ref(true);

    const change = () => {
      isDark.value = !isDark.value;
    };

    return {
      isDark,
      change,
    };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  }
);
