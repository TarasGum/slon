import type {
  Category,
  InputCreateCategory,
  InputUpdateCategory,
} from "./types";
import type { APIResponse } from "../types";
const getCategories = async () => {
  return await useAPI("/categories");
};
const getCategory = async (id: number) => {
  return await useAPI("/categories", {
    query: { id },
  });
};
const deleteCategory = async (id: number) => {
  return await useAPI("/categories", {
    query: { id },
  });
};

const createCategory = async (input: InputCreateCategory) => {
  return await useAPI("/categories", { body: input });
};

const updateCategory = async (id: number, input: InputUpdateCategory) => {
  return await useAPI("/categories", {
    query: { id },
    body: input,
  });
};

export default {
  getCategories,
  getCategory,
  deleteCategory,
  createCategory,
  updateCategory,
};
