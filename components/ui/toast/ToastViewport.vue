<script setup lang="ts">
import { type HTMLAttributes, computed } from "vue";
import { ToastViewport, type ToastViewportProps } from "radix-vue";
import { cn } from "@/lib/utils";

const props = defineProps<
  ToastViewportProps & { class?: HTMLAttributes["class"] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});
</script>

<template>
  <ToastViewport
    v-bind="delegatedProps"
    :class="
      cn(
        'fixed top-0 !z-[60] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-2 sm:right-2 sm:top-auto sm:flex-col md:max-w-[420px] mb-2 mr-2',
        props.class
      )
    " />
</template>
