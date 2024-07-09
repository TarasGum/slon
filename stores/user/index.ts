import { ref } from "vue";
import { defineStore } from "pinia";

export const useUserStore = defineStore(
  "userStore",
  () => {
    const user = ref({});
    const isLoggedIn = ref(false);

    const loggedUserIn = () => {
      isLoggedIn.value = true;
    };
    const loggedUserOut = () => {
      isLoggedIn.value = false;
    };
    return {
      user,
      isLoggedIn,
      loggedUserIn,
      loggedUserOut,
    };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  }
);
