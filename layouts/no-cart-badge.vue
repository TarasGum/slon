<script setup>
import { ref, onMounted, onUnmounted } from "vue";
const nuxtApp = useNuxtApp();
const loading = ref(true);
nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:finish", () => {
  loading.value = false;
});
</script>

<template>
  <div class="layout">
    <Loader v-if="loading" />
    <LayoutHeader />
    <main>
      <slot />
    </main>
    <LayoutFooter />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.v-leave-active,
.v-enter-active {
  transition: 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  transition: 0.5s ease;
  opacity: 0;
  transform: translateY(-3%);
}
</style>
