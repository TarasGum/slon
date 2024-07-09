<script setup>
import { ref, onMounted, onUnmounted } from "vue";
// const body = document.querySelector("body");
// if (body !== null) {
//   body.style.backgroundColor = "#191919";
// }

const isVisible = ref(true);
const nuxtApp = useNuxtApp();
const loading = ref(true);
nuxtApp.hook("page:start", () => {
  loading.value = true;
});
nuxtApp.hook("page:finish", () => {
  loading.value = false;
});
const handleScroll = () => {
  const scrollPosition = window.scrollY + window.innerHeight;
  const pageHeight = document.documentElement.scrollHeight;

  // Перевірка, чи доскролено до низу сторінки
  if (scrollPosition >= pageHeight) {
    isVisible.value = false;
  } else {
    isVisible.value = true;
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<template>
  <div class="layout">
    <Loader v-if="loading" />
    <LayoutHeader />
    <main>
      <ClientOnly>
        <transition> <CartBadge v-if="isVisible" /> </transition
      ></ClientOnly>
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
