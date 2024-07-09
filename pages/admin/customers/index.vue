<script lang="ts" setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const token = useCookie("token");
import LazyDataTable from "./LazyDataTable.vue";
import { columns } from "./columns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AddCustomer from "./add-customer.vue";

const page = ref(1);

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
const limit = ref(10);
const offset = ref(0);
const orders = ref<any>([]);

const { data }: { data: any } = await useAPI("/customers/", {
  query: { search: querySearch, limit: limit.value, offset: offset },
  onResponse: ({ response }) => {
    if (response.status === 401) {
      token.value = undefined;
      userStore.loggedUserOut();
      navigateTo("/login");
    }
    orders.value.push(...response._data.results);
  },
});

const increaseOffset = () => {
  if (data.value.next) {
    offset.value += 10;
  }
};
</script>

<template>
  <div class="border rounded-3xl h-[95vh] bg-[#202020] pb-8 w-full">
    <div class="border-b mb-5 p-5 flex justify-between flex-wrap">
      <div class="flex gap-4 items-center max-[899px]:mb-4">
        <div
          class="w-8 h-8 rounded-sm flex justify-center items-center bg-[var(--sand)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none">
            <path
              d="M2.66663 21.3333C2.66663 17.2096 6.00956 13.8667 10.1333 13.8667C14.257 13.8667 17.6 17.2096 17.6 21.3333H2.66663ZM10.1333 12.9333C7.03929 12.9333 4.53329 10.4273 4.53329 7.33334C4.53329 4.23934 7.03929 1.73334 10.1333 1.73334C13.2273 1.73334 15.7333 4.23934 15.7333 7.33334C15.7333 10.4273 13.2273 12.9333 10.1333 12.9333ZM17.0052 15.0177C19.8849 15.7536 22.05 18.2753 22.2513 21.3333H19.4666C19.4666 18.8975 18.5335 16.6796 17.0052 15.0177ZM15.1174 12.8931C16.6412 11.5261 17.6 9.54167 17.6 7.33334C17.6 6.01049 17.2559 4.76799 16.6525 3.69042C18.7902 4.11704 20.4 6.00301 20.4 8.26667C20.4 10.845 18.3116 12.9333 15.7333 12.9333C15.5245 12.9333 15.3189 12.9196 15.1174 12.8931Z"
              fill="#DBDBDB" />
          </svg>
        </div>
        <h1 class="text-4xl max-[400px]:text-3xl">Клієнти</h1>
        <div
          class="border-[var(--sand)] border rounded-[34px] text-base p-3 py-2">
          {{ data.count }}
        </div>
      </div>
      <AddCustomer />
    </div>
    <div class="container flex flex-col py-10 mx-auto">
      <!-- <div class="flex justify-end mb-4 items-center h-12"></div> -->
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
      <LazyDataTable
        @intersect="increaseOffset"
        :columns="columns"
        :data="orders" />
    </div>
  </div>
</template>
