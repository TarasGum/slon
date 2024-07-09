<script setup lang="ts">
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
  <Select
    :value="modelValue"
    class="px-0"
    @update:modelValue="handleCategoryChange">
    <SelectTrigger haveNoCheck class="w-full px-0 rounded-3xl h-12 border">
      <SelectValue placeholder="Усі категорії" class="w-full text-lg pl-2" />
    </SelectTrigger>
    <SelectContent class="border dark rounded-3xl p-0 bg-[#000000]">
      <SelectGroup
        class="px-0 h-[220px] scale-x-[100.8%] overflow-y-scroll overflow-x-hidden">
        <SelectItem
          class="hover:bg-[#3B4241] px-2 pt-2.5 border-b rounded-none transition-all"
          :class="{ 'bg-[#2b2b2bc8]': modelValue === 'all' }"
          value="all">
          УСІ КАТЕГОРІЇ
        </SelectItem>

        <SelectItem
          class="hover:bg-[#3B4241] h-10 px-2 transition-all rounded-none border-b"
          v-for="category in categoriesStore.categories"
          :class="{ 'bg-[#2b2b2bc8]': modelValue === '' + category.id }"
          :key="category.id"
          :value="'' + category.id">
          {{ category.name }}
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
