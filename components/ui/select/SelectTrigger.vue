<script setup lang="ts">
import { SelectIcon, SelectTrigger, type SelectTriggerProps } from "radix-vue";
import { ChevronDown } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = withDefaults(
  defineProps<
    SelectTriggerProps & {
      class?: string;
      invalid?: boolean;
      haveNoCheck?: boolean;
    }
  >(),
  {
    class: "",
    invalid: false,
    haveNoCheck: false,
  }
);
</script>

<template>
  <SelectTrigger
    v-bind="props"
    :class="[
      cn(
        'flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none  disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap [&>span]:truncate [&>span]:min-w-0',
        props.class
      ),
      props.invalid
        ? '!ring-destructive ring-2 placeholder:!text-destructive'
        : '',
    ]">
    <slot />
    <SelectIcon v-if="!haveNoCheck" as-child>
      <img src="/assets/images/arrow-down.svg" alt="arrow" />
    </SelectIcon>
  </SelectTrigger>
</template>
