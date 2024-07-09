import { defineStore } from "pinia";
import { ref } from "vue";

export const useCategoriesStore = defineStore("categoriesStore", () => {
  const categories = ref<Category[] | null>([]);

  const addCategories = (category: Category[] | null) => {
    categories.value = category;
  };

  return {
    categories,
    addCategories,
  };
});
