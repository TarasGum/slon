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
import AddCost from "./add-cost.vue";

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

const { data }: { data: any } = await useAPI("/costs/", {
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
          class="w-8 h-8 rounded-sm flex justify-center items-center bg-[var(--Red)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none">
            <path
              d="M13.8713 2.66943C17.995 2.66943 21.3379 6.01237 21.3379 10.1361C21.3379 13.1644 19.5351 15.7716 16.9442 16.9431C15.7728 19.5338 13.1658 21.3361 10.138 21.3361C6.0142 21.3361 2.67126 17.9931 2.67126 13.8694C2.67126 10.8416 4.47355 8.23465 7.06385 7.06292C8.23573 4.47222 10.843 2.66943 13.8713 2.66943ZM11.0713 9.20277H9.2046V10.1361C7.91594 10.1361 6.87126 11.1807 6.87126 12.4694C6.87126 13.7065 7.83404 14.7188 9.05119 14.7978L9.2046 14.8027H11.0713L11.1552 14.8103C11.3728 14.8498 11.538 15.0403 11.538 15.2694C11.538 15.4985 11.3728 15.6891 11.1552 15.7286L11.0713 15.7361H7.33793V17.6027H9.2046V18.5361H11.0713V17.6027C12.3599 17.6027 13.4046 16.5581 13.4046 15.2694C13.4046 14.0323 12.4418 13.0201 11.2247 12.9411L11.0713 12.9361H9.2046L9.12072 12.9286C8.90302 12.8891 8.73793 12.6985 8.73793 12.4694C8.73793 12.2403 8.90302 12.0498 9.12072 12.0103L9.2046 12.0027H12.938V10.1361H11.0713V9.20277ZM13.8713 4.5361C12.2067 4.5361 10.7117 5.26238 9.68597 6.41535C9.83595 6.40728 9.98641 6.40277 10.138 6.40277C14.2617 6.40277 17.6046 9.74571 17.6046 13.8694C17.6046 14.0212 17.6 14.1721 17.5912 14.3216C18.7448 13.2961 19.4713 11.8009 19.4713 10.1361C19.4713 7.0433 16.9641 4.5361 13.8713 4.5361Z"
              fill="#DBDBDB" />
          </svg>
        </div>
        <h1 class="text-4xl max-[400px]:text-3xl">Витрати</h1>
        <div
          class="border-[var(--Red)] border rounded-[34px] text-base p-3 py-2">
          {{ data.count }}
        </div>
      </div>
      <AddCost />
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
