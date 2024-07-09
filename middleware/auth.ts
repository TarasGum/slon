import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
userStore.loggedUserOut();
const token = useCookie("token");
export default defineNuxtRouteMiddleware((to, from) => {
  if (!userStore.isLoggedIn && !token.value) {
    return navigateTo("/login");
  }
});
