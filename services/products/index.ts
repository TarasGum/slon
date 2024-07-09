import type {
  Product,
  InputCreateProduct,
  InputUpdateProduct,
  ProductQueryParams,
} from "./types";

const getProducts = async (queryParams: Partial<ProductQueryParams>) => {
  return await useAPI("/products", {
    query: queryParams,
  });
};
const getProduct = async (id: number) => {
  return await useAPI("/products", {
    query: { id },
  });
};
const deleteProduct = async (id: number) => {
  return await useAPI("/products", {
    query: { id },
  });
};

const createProduct = async (input: InputCreateProduct) => {
  return await useAPI("/products", { body: input });
};

const updateProduct = async (id: number, input: InputUpdateProduct) => {
  return await useAPI("/products", {
    query: { id },
    body: input,
  });
};

export default {
  getProducts,
  getProduct,
  deleteProduct,
  createProduct,
  updateProduct,
};
