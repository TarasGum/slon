<script lang="ts" setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
import { useUserStore } from "~/stores/user";

const userStore = useUserStore();
const token = useCookie("token");
import AddOrder from "./AddOrder.vue";
import DataTable from "./DataTable.vue";
import SmallOrderItem from "./small-order-item.vue";

const activeTab = ref("all");
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

const queryStatus = computed(() => {
  if (activeTab.value === "all") {
    return "";
  } else return activeTab.value;
});
const page = ref(1);
const limit = ref(25);
const offset = ref(0);

const orders = ref<any>([]);
const { data }: { data: any } = await useAPI("/orders", {
  query: {
    status: queryStatus,
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
    offset.value += 30;
  }
};
</script>

<template>
  <div class="border rounded-3xl h-[95vh] bg-[#202020] pb-8">
    <div class="border-b mb-5 p-5 flex justify-between items-start flex-wrap">
      <div class="flex gap-4 items-center mr-9 max-[899px]:mb-4">
        <div
          class="w-8 h-8 flex justify-center items-center rounded-sm bg-[var(--green)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none">
            <path
              d="M9.19998 6.4C9.19998 4.85361 10.4535 3.6 12 3.6C13.5464 3.6 14.8 4.85361 14.8 6.4H9.19998ZM7.33331 6.4H4.53331C4.01785 6.4 3.59998 6.81788 3.59998 7.33334V20.4C3.59998 20.9155 4.01785 21.3333 4.53331 21.3333H19.4666C19.9821 21.3333 20.4 20.9155 20.4 20.4V7.33334C20.4 6.81788 19.9821 6.4 19.4666 6.4H16.6666C16.6666 3.82268 14.5773 1.73334 12 1.73334C9.42265 1.73334 7.33331 3.82268 7.33331 6.4ZM9.19998 10.1333C9.19998 11.6798 10.4535 12.9333 12 12.9333C13.5464 12.9333 14.8 11.6798 14.8 10.1333H16.6666C16.6666 12.7106 14.5773 14.8 12 14.8C9.42265 14.8 7.33331 12.7106 7.33331 10.1333H9.19998Z"
              fill="#DBDBDB" />
          </svg>
        </div>
        <h1 class="text-4xl max-[400px]:text-3xl">Замовлення</h1>
        <div
          class="border-[var(--green)] border rounded-[34px] text-base p-3 py-2">
          {{ data?.count }}
        </div>
      </div>
      <AddOrder class="w-fit self-end" />
    </div>

    <div class="container py-10 mx-auto">
      <div class="flex flex-col">
        <div class="flex justify-between gap-5 items-center flex-wrap mb-4">
          <!-- <Pagination
            v-if="data.count > 0"
            v-model:page="page"
            v-slot="{ page }"
            :total="data.count"
            :itemsPerPage="10"
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
                  <Button class="w-10 h-10 p-0" :variant="'default'">
                    1
                  </Button>
                </PaginationListItem>
                <PaginationEllipsis v-else :key="item.type" :index="index" />
              </template>

              <PaginationNext :disabled="data.next == null" />
              <PaginationLast />
            </PaginationList>
          </Pagination> -->
          <div
            class="flex flex-wrap max-lg:h-full max-lg:min-h-10 h-10 gap-3 ml-auto">
            <MyButton
              size="md"
              class="text-lg"
              noShadow
              @click="(offset = 0), (activeTab = 'all')"
              :class="{
                'border border-[var(--Grey)]': activeTab === 'all',
              }">
              УСІ
            </MyButton>
            <MyButton
              size="md"
              class="text-lg"
              noShadow
              @click="(offset = 0), (activeTab = 'raw')"
              :class="{
                'border border-[var(--Grey)]': activeTab === 'raw',
              }">
              НЕ ОПРАЦЬОВАНІ
            </MyButton>
            <MyButton
              size="md"
              class="text-lg"
              noShadow
              @click="(offset = 0), (activeTab = 'completed')"
              :class="{
                'border border-[var(--Grey)]': activeTab === 'completed',
              }">
              ВИКОНАНІ
            </MyButton>
            <MyButton
              size="md"
              class="text-lg"
              noShadow
              @click="(offset = 0), (activeTab = 'failed')"
              :class="{
                'border border-[var(--Grey)]': activeTab === 'failed',
              }">
              НЕ УCПІШНІ
            </MyButton>
          </div>
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
      </div>

      <DataTable :key="activeTab" @intersect="increaseOffset" :data="orders" />
      <SmallOrderItem :data="orders" />
    </div>
  </div>
</template>
