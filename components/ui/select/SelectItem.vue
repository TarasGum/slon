<script setup lang="ts">
import {
  SelectItem,
  SelectItemIndicator,
  type SelectItemProps,
  SelectItemText,
} from "radix-vue";
import { Check } from "lucide-vue-next";
import { cn } from "@/lib/utils";

const props = defineProps<SelectItemProps & { class?: string }>();
</script>

<template>
  <SelectItem
    v-bind="props"
    :class="
      cn(
        'relative flex  cursor-default select-none items-center rounded-sm py-1.5  pr-2 text-sm outline-none pl-2 data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class
      )
    ">
    <!-- <span class="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectItemIndicator>
        <Check class="h-4 w-4" />
      </SelectItemIndicator>
    </span> -->

    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
