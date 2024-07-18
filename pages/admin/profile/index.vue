<script lang="ts" setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});

import { useUserStore } from "~/stores/user";
const userStore = useUserStore();

import { toast, useToast } from "@/components/ui/toast/use-toast";

const newCategoryName = ref("");
const createCategory = async () => {
  const token = useCookie("token");

  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/categories/`,
    {
      method: "POST",
      body: JSON.stringify({ name: newCategoryName.value }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token.value}`,
      },
      onResponse: ({ response }) => {
        if (response.status === 401) {
          token.value = undefined;
          userStore.loggedUserOut();
          navigateTo("/login");
        }

        if (response.status === 201) {
          toast({ title: "Категорію успішно створено" });
        } else {
          toast({ variant: "destructive", title: "Щось пішло не так" });
        }
      },
    }
  );
  newCategoryName.value = "";
  refreshNuxtData();
};

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
// const page = ref(1);
// const limit = ref(5);
// const offset = computed(() => {
//   return (page.value - 1) * limit.value;
// });
const { data }: { data: any } = await useAPI("/users/", {
  query: { search: querySearch },
});
// watch(data, () => {
//   if (
//     data.value.results &&
//     data.value.results.length === 0 &&
//     data.value.count !== 0
//   ) {
//     page.value = page.value - 1;
//   }
// });
</script>

<template>
  <div class="border rounded-3xl h-[95vh] bg-[#202020] pb-8 w-full">
    <div class="border-b mb-5 p-5 flex justify-between">
      <div
        class="flex gap-4 max-sm:h-[50px] max-[400px]:text-[20px] items-center">
        <div
          class="w-8 h-8 rounded-sm flex justify-center items-center bg-[var(--Violet)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none">
            <path
              d="M12 16.6665C15.4182 16.6665 18.4073 18.1366 20.0333 20.3296L18.3141 21.1428C16.9909 19.5745 14.6576 18.5332 12 18.5332C9.34241 18.5332 7.00911 19.5745 5.6859 21.1428L3.96741 20.3287C5.59347 18.1362 8.58219 16.6665 12 16.6665ZM12 2.6665C14.5773 2.6665 16.6667 4.75585 16.6667 7.33317V10.1332C16.6667 12.7105 14.5773 14.7998 12 14.7998C9.42267 14.7998 7.33333 12.7105 7.33333 10.1332V7.33317C7.33333 4.75585 9.42267 2.6665 12 2.6665Z"
              fill="#DBDBDB" />
          </svg>
        </div>
        <h1 class="text-4xl">Профайл</h1>
      </div>
    </div>
    <div class="container flex flex-col py-10 mx-auto">
      <!-- <div class="flex justify-end mb-4 items-center h-12">
        <Pagination
          v-if="data.count > 0"
          v-model:page="page"
          v-slot="{ page }"
          :total="data.count"
          :itemsPerPage="5"
          :sibling-count="1"
          show-edges
          :default-page="1">
          <PaginationList
            v-slot="{ items }"
            class="w-full flex items-center gap-1 justify-center">
            <PaginationFirst />
            <PaginationPrev />

            <template v-for="(item, index) in items">
              <PaginationListItem
                v-if="item.type === 'page'"
                :key="index"
                :disabled="items.length === 1"
                :value="item.value"
                as-child>
                <Button
                  class="w-10 h-10 p-0"
                  :variant="item.value === page ? 'default' : 'outline'">
                  {{ item.value }}
                </Button>
              </PaginationListItem>
              <PaginationEllipsis v-else :key="item.type" :index="index" />
            </template>

            <PaginationNext :disabled="data.next == null" />
            <PaginationLast />
          </PaginationList>
        </Pagination>
        <Pagination
          v-else
          :total="5"
          :itemsPerPage="5"
          :sibling-count="1"
          show-edges
          :default-page="1">
          <PaginationList
            v-slot="{ items }"
            class="w-full flex items-center gap-1 justify-center">
            <PaginationFirst />
            <PaginationPrev />

            <template v-for="(item, index) in items">
              <PaginationListItem
                v-if="item.type === 'page'"
                :key="index"
                :disabled="true"
                :value="item.value"
                as-child>
                <Button class="w-10 h-10 p-0" :variant="'default'"> 1 </Button>
              </PaginationListItem>
              <PaginationEllipsis v-else :key="item.type" :index="index" />
            </template>

            <PaginationNext :disabled="data.next == null" />
            <PaginationLast />
          </PaginationList>
        </Pagination>
      </div> -->
    </div>
  </div>
</template>
