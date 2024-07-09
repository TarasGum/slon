<script lang="ts" setup>
defineProps<{
  text: string;
}>();
</script>

<template>
  <div class="tooltip" v-bind="$attrs">{{ text }}</div>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/variables";
.tooltip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10000;
  transform: translateY(50%);
  width: max-content;
  padding: 4px 10px;
  border-radius: 4px;
  border: 1px solid rgba($dark-green, 0.5);
  background: $light-green;
  @include font(14px, $dark, 500, 1);

  // transition: 0.2s;
}
</style>
