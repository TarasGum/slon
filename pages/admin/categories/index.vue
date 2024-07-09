<script lang="ts" setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
import { useDarkStore } from "~/stores/dark";
import { useUserStore } from "~/stores/user";
const userStore = useUserStore();
const darkStore = useDarkStore();
import DataTable from "./DataTable.vue";
import { columns } from "./columns";
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
const { data }: { data: any } = await useAPI("/categories/", {
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
          class="w-8 h-8 rounded-sm flex justify-center items-center bg-[var(--seeblue)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none">
            <path
              d="M21.3333 12.9325V19.4668C21.3333 19.9822 20.9154 20.4001 20.4 20.4001H12.9333V12.9325H21.3333ZM11.0666 12.9325V20.4001H3.59996C3.0845 20.4001 2.66663 19.9822 2.66663 19.4668V12.9325H11.0666ZM11.0666 3.6001V11.0658H2.66663V4.53343C2.66663 4.01797 3.0845 3.6001 3.59996 3.6001H11.0666ZM20.4 3.6001C20.9154 3.6001 21.3333 4.01797 21.3333 4.53343V11.0658H12.9333V3.6001H20.4Z"
              fill="#DBDBDB" />
          </svg>
        </div>
        <h1 class="text-4xl">Категорії</h1>
        <div
          class="border-[var(--seeblue)] border rounded-[34px] text-base p-3 py-2">
          {{ data.length }}
        </div>
      </div>
      <Dialog>
        <DialogTrigger class="h-10" as-child>
          <MyButton
            size="md"
            color="--seeblue"
            iconPosition="left"
            :icon="true">
            Нова категорія
          </MyButton>
        </DialogTrigger>
        <DialogContent
          :class="{ dark: darkStore.isDark }"
          class="sm:max-w-md bg-background border text-primary">
          <DialogHeader>
            <DialogTitle>Додати категорію</DialogTitle>
          </DialogHeader>
          <div class="flex items-center space-x-2">
            <div class="grid flex-1 gap-2">
              <Input
                v-model="newCategoryName"
                id="link"
                placeholder="Введіть назву категорії"
                read-only />
            </div>
          </div>
          <DialogFooter class="sm:justify-start">
            <DialogClose as-child>
              <Button @click="createCategory"> Додати </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      <DataTable :key="data" :columns="columns" :data="data" />
    </div>
  </div>
</template>
