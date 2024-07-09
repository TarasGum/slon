<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import productItem from "./productItem.vue";
import { useDarkStore } from "~/stores/dark";
import { useOrdersStore } from "~/stores/order";
import CategoryDropdown from "./CategoryDropdown.vue";
const emit = defineEmits<{
  emitRes: [value: OrderItem[]];
  plus: [value: number];
  minus: [value: number];
  deleteItem: [value: number];
}>();
const props = defineProps<{
  prettieButton?: boolean;
  currentItems?: any[];
  justIncrease?: boolean;
}>();
const orderStore = useOrdersStore();
const darkStore = useDarkStore();

const dark = "dark";
const productSearch = ref("");

const handleproductSearch = () => {
  orderStore.handleProductSearch(productSearch.value);
};
const addToOrderItems = (item: any) => {
  newOrderItems.value.push(item);
};

const emitRes = () => {
  emit("emitRes", newOrderItems.value);
};

const removeFromOrderItems = (id: any) => {
  const index = newOrderItems.value.findIndex((item) => item.variant.id === id);
  if (index !== -1) {
    emit("deleteItem", id);
    newOrderItems.value.splice(index, 1);
  }
};

const productsData = computed(() => orderStore.products);

const set = ref();

watch(set, () => {
  orderStore.activeCategory = set.value;
});
watch(props, () => {
  newOrderItems.value = JSON.parse(JSON.stringify(props.currentItems));
});
const newOrderItems = ref<any[]>(props.currentItems ? props.currentItems : []);

const currentQty = (id: number | undefined) => {
  const item = newOrderItems.value.find((item) => item.variant?.id === id);
  if (item) {
    const { quantity } = item;
    return quantity;
  } else {
    return 1;
  }
};
</script>

<template>
  <div>
    <Dialog
      class="dark"
      @update:open="
        (value) => {
          if (!value) {
            emitRes();
          }
        }
      ">
      <DialogTrigger class="mt-5 w-full">
        <div
          v-if="!prettieButton"
          class="border rounded-md p-2 w-full hover:brightness-150 transition-all text-sm dark">
          Додати товар
        </div>
        <div
          v-if="prettieButton"
          class="border w-[168px] flex gap-2 -mr-2 -mt-5 h-9 px-3.5 py-2.5 items-center transition-all translate-z hover:drop-shadow-[3px_4px_0px_var(--green)] border-[var(--green)] bg-background cursor-pointer rounded-3xl text-2xl">
          <div class="w-5 h-5 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none">
              <path
                d="M8.00065 14.6668C4.31875 14.6668 1.33398 11.682 1.33398 8.00016C1.33398 4.31826 4.31875 1.3335 8.00065 1.3335C11.6825 1.3335 14.6673 4.31826 14.6673 8.00016C14.6673 11.682 11.6825 14.6668 8.00065 14.6668ZM7.33398 7.3335H4.66732V8.66683H7.33398V11.3335H8.66732V8.66683H11.334V7.3335H8.66732V4.66683H7.33398V7.3335Z"
                fill="white" />
            </svg>
          </div>
          <h2 class="text-lg">Додати товар</h2>
        </div>
      </DialogTrigger>
      <DialogContent
        class="bg-background dark !min-w-[80vw] !rounded-2xl border h-[573px] flex flex-col text-primary">
        <DialogHeader>
          <DialogTitle class="text-2xl">Товари</DialogTitle>
        </DialogHeader>
        <div class="relative h-fit">
          <img
            class="absolute ml-4 top-1/2 -translate-y-1/2"
            src="@/assets/images/search.svg" />
          <input
            class="border w-full px-2 bg-background rounded-3xl text-xl pl-12 h-14 placeholder:tracking-wider placeholder:text-x"
            v-model="productSearch"
            @input="handleproductSearch"
            type="text"
            placeholder="Пошук товару" />
        </div>
        <CategoryDropdown v-model="set" class="w-full" />
        <div class="max-h-[480px] rounded-xl border relative overflow-scroll">
          <div v-if="productsData && productsData.length > 0">
            <div v-for="(product, idx) in productsData" :key="product.id">
              <div v-for="v in product.variants" class="border-b" :key="v.id">
                <productItem
                  :item="product"
                  :currentQty="currentQty(v.id)"
                  :itemInOrder="
                    newOrderItems.some((item) => item.variant.id === v.id)
                  "
                  :just-increase="justIncrease"
                  :variant="v"
                  @minus="$emit('minus', v.id as number)"
                  @plus="$emit('plus', v.id as number)"
                  @remove-from-order="removeFromOrderItems(v.id)"
                  @add-to-order="
                    (qty) => {
                      addToOrderItems({
                        ...product,
                        quantity: qty,
                        variant: {
                          id: v.id,
                          product: {
                            id: product.id,
                            title: product.title,
                            year: product.year,
                            category: product.category,
                          },
                          packaging: v.packaging,
                          inventory: v.inventory,
                          price: v.price,
                        },
                      });
                    }
                  " />
              </div>
            </div>
          </div>
          <div v-else class="p-4">Товарів не знайдено</div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<style scoped></style>
