import { defineStore } from "pinia";
import { ref } from "vue";

export const useOrdersStore = defineStore("ordersStore", () => {
  const products = ref<Product[] | null>([]);
  const customers = ref<Customer[] | null>([]);
  const activeCategory = ref<string>("all");

  const productSearchQuery = ref("");

  let debounceProductSearchTimer: NodeJS.Timeout;
  const handleProductSearch = (productSearch: string) => {
    clearTimeout(debounceProductSearchTimer);
    debounceProductSearchTimer = setTimeout(() => {
      productSearchQuery.value = productSearch;
    }, 500); // Таймер дебаунсу - 500 мілісекунд
  };

  const customerSearchQuery = ref("");

  let debounceCustomerSearchTimer: NodeJS.Timeout;
  const handleCustomerSearch = (customerSearch: string) => {
    clearTimeout(debounceCustomerSearchTimer);
    debounceCustomerSearchTimer = setTimeout(() => {
      customerSearchQuery.value = customerSearch;
    }, 500); // Таймер дебаунсу - 500 мілісекунд
  };

  const addProducts = (product: Product[] | null) => {
    products.value = product;
  };
  const addCustomers = (customer: Customer[] | null) => {
    customers.value = customer;
  };
  return {
    customers,
    products,
    addProducts,
    addCustomers,
    handleProductSearch,
    handleCustomerSearch,
    productSearchQuery,
    customerSearchQuery,
    activeCategory,
  };
});
