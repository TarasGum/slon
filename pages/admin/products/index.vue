<script lang="ts" setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
import CategoryDropdown from "./CategoryDropdown.vue";
import DataTable from "./DataTable.vue";
import { columns } from "./columns";
import AddProduct from "./add-product.vue";
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const token = useCookie("token");
import { Button } from "@/components/ui/button";

const activeCategory = ref<string>("all");

const queryCategories = computed(() => {
  if (activeCategory.value === "all") {
    return "";
  } else return activeCategory.value;
});
let debouncedData = ref("");
const querySearch = computed(() => {
  return debouncedData.value;
});
const mainSearch = ref("");
let debounceSearchTimer: NodeJS.Timeout;
const handleMainSearch = () => {
  clearTimeout(debounceSearchTimer);
  debounceSearchTimer = setTimeout(() => {
    debouncedData.value = mainSearch.value;
  }, 500); // Таймер дебаунсу - 500 мілісекунд
};

const page = ref(1);
const limit = ref(10);
const offset = ref(0);
const orders = ref<any>([]);
const { data }: { data: any } = await useAPI("/products", {
  query: {
    categories: queryCategories,
    search: querySearch,
    limit: limit.value,
    offset: offset,
  },
  onResponse: ({ response }) => {
    if (response.status === 401) {
      token.value = undefined;
      userStore.loggedUserOut();
      navigateTo("/login");
    }

    if (offset.value === 0) {
      orders.value = [];
    }
    orders.value.push(...response._data.results);
  },
});

const increaseOffset = () => {
  if (data.value.next) {
    offset.value += 10;
  }
};

watch(activeCategory, () => {
  offset.value = 0;
});
</script>

<template>
  <div class="border bg-[#202020] h-[95vh] rounded-3xl pb-8 w-full">
    <div class="border-b mb-5 p-5 flex flex-wrap gap-4 justify-between">
      <div class="flex gap-4 items-center">
        <div
          class="w-8 h-8 rounded-sm justify-center flex items-center bg-[var(--blue)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none">
            <path
              d="M3.59996 10.1334H20.4V19.4709C20.4 19.9841 19.9847 20.4001 19.4728 20.4001H4.52713C4.01507 20.4001 3.59996 19.985 3.59996 19.4709V10.1334ZM9.19996 12.0001V13.8668H14.8V12.0001H9.19996ZM2.66663 4.53325C2.66663 4.01789 3.09158 3.6001 3.59231 3.6001H20.4076C20.9189 3.6001 21.3333 4.01424 21.3333 4.53325V8.26676H2.66663V4.53325Z"
              fill="#DBDBDB" />
          </svg>
        </div>
        <h1 class="text-4xl">Товари</h1>
        <div
          class="border-[var(--blue)] border rounded-[34px] text-base p-3 py-2">
          {{ data.count }}
        </div>
      </div>
      <AddProduct :active-category="activeCategory" />
    </div>

    <div class="container flex flex-col py-10 mx-auto">
      <div
        class="flex w-full items-center gap-4 justify-between flex-wrap mb-4">
        <CategoryDropdown
          v-model="activeCategory"
          class="w-fit mb-2 p-1 flex gap-2 rounded bg-gray-200" />
      </div>
      <div class="mb-4 relative">
        <img
          class="absolute ml-4 top-1/2 w-5 h-5 brightness-50 -translate-y-1/2"
          src="@/assets/images/search.svg" />

        <Input
          v-model="mainSearch"
          @input="handleMainSearch"
          type="text"
          class="flex p-[10px] pr-[20px] my-5 items-center h-10 gap-[10px] self-stretch rounded-[10px] border border-[#383838] bg-[#191919] text-xl placeholder:tracking-wider placeholder:text-xl placeholder:text-[var(--Grey-Dark)] pl-12"
          placeholder="Пошук" />
      </div>
      <DataTable
        :key="activeCategory"
        @intersect="increaseOffset"
        :columns="columns"
        :data="orders" />
    </div>
  </div>
</template>
<style>
@import url("vue-accessible-color-picker/styles");
</style>
