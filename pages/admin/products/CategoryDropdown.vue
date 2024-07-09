<script setup lang="ts">
import { ref } from "vue";
const props = defineProps<{
  modelValue: string;
}>();
import { useDarkStore } from "~/stores/dark";
import { useCategoriesStore } from "~/stores/categories";

const categoriesStore = useCategoriesStore();
const darkStore = useDarkStore();
const emits = defineEmits(["update:modelValue"]);

const handleCategoryChange = (value: string) => {
  emits("update:modelValue", value);
};
</script>

<template>
  <Select :value="modelValue" @update:modelValue="handleCategoryChange">
    <SelectTrigger
      class="flex w-[324px] px-[20px] justify-between items-center rounded-[10px] border border-[#383838] bg-[#191919]">
      <SelectValue placeholder="Усі категорії" class="text-lg" />
    </SelectTrigger>
    <SelectContent
      class="bg-[var(--Black)] border border-[var(--Grey-Dark)] text-[var(--White)] rounded-lg">
      <SelectGroup class="my-2">
        <SelectItem class="transition-all hover:brightness-150" value="all">
          УСІ КАТЕГОРІЇ
        </SelectItem>
        <SelectItem
          class="transition-all hover:brightness-150"
          v-for="category in categoriesStore.categories"
          :key="category.id"
          :value="'' + category.id">
          {{ category.name }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
