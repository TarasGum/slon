<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  order: Order;
  plusDis: boolean;
  minusDis: boolean;
}>();
const token = useCookie("token");
import { useDarkStore } from "~/stores/dark";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
const darkStore = useDarkStore();

const emit = defineEmits<{
  updateOpen: [value: boolean];
  plus: any;
  minus: any;
}>();
const orderItems = ref();
watch(props, () => {
  if (!orderItems.value) {
    orderItems.value = JSON.parse(JSON.stringify(props.order.order_items));
  }
});

const total = computed(() => {
  return orderItems.value.reduce((accum: number, item: any) => {
    return accum + +item.price * item.quantity;
  }, 0);
});
const addToOrderItems = (items: OrderItem[]) => {
  orderItems.value = [...items];
};
const postAllItems = async () => {
  for (const item of orderItems.value) {
    // Шукаємо відповідний індекс елемента в props.order.order_items
    const existingItemIndex = props.order.order_items.findIndex(
      (oldItem) => oldItem.variant.id === item.variant.id
    );

    // Якщо елемент не знайдено, відправляємо POST запит
    if (existingItemIndex === -1) {
      await fetch(`https://api.slooon.shop/api/order-items/`, {
        method: "POST",
        body: JSON.stringify({
          order: props.order.id,
          variant: item.variant.id,
          price: item.variant.price,
          quantity: item.quantity,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token.value}`,
        },
      });
    }
  }
};

const deleteItem = (id: number, variantId: number) => {
  orderItems.value = orderItems.value.filter(
    (item: OrderItem) => item.variant.id !== variantId
  );
};

const minusOrderItem = (id: number) => {
  const index = orderItems.value.findIndex(
    (item: any) => item.variant.id === id
  );

  if (index !== -1) {
    orderItems.value[index].quantity -= 1;
  }
};
const plusOrderItem = (id: number) => {
  const index = orderItems.value.findIndex(
    (item: any) => item.variant.id === id
  );

  if (index !== -1) {
    orderItems.value[index].quantity += 1;
  }
};

const handleOpen = (value: boolean) => {
  refreshNuxtData();

  emit("updateOpen", value);
};

const plus = () => {
  emit("plus");
};
const minus = () => {
  emit("minus");
};
import statusDropdown from "./statusDropdown.vue";
import OrderItem from "./order-item.vue";
import AddProducts from "./add-products.vue";

const changeOrderItem = async (qty: number, id: number, item: any) => {
  if (item.title) {
    props.order.order_items.forEach((element) => {
      if (element.variant.id === item.variant.id) {
        id = element.id;
      }
    });
  }

  try {
    const { data: orderItemsData }: { data: any } = await $fetch(
      `https://api.slooon.shop/api/order-items/${id}/`,
      {
        method: "PATCH",
        body: {
          quantity: qty,
        },
        headers: {
          Authorization: `Token ${token.value}`,
        },
      }
    );
  } catch (error) {
    // Handle error for individual variant update
    console.error("Error updating variant:", error);
  }
};
const activeTab = ref("order");

const deleteOrder = async (id: number) => {
  let idToDelete = 0;
  props.order.order_items.forEach((element) => {
    if (element.variant.id === id) {
      idToDelete = element.id;
    }
  });
  await $fetch(`https://api.slooon.shop/api/order-items/${idToDelete}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token.value}`,
    },
  });
};
</script>

<template>
  <Sheet
    :open="isOpen"
    @update:open="
      (cond) => {
        handleOpen(cond);
        if (!cond) {
          postAllItems();
          refreshNuxtData();
        }
      }
    ">
    <SheetContent
      :class="{ dark: darkStore.isDark }"
      class="!min-w-[70vw] max-sm:!min-w-[100vw] bg-[#23232381] rounded-s-3xl backdrop-blur-[5.5px] border text-primary">
      <div class="flex w-full">
        <div class="flex gap-2.5 select-none">
          <div
            :class="{
              'brightness-50': minusDis,
              'pointer-events-none': minusDis,
            }"
            class="flex p-2.5 justify-center items-center rounded-lg border border-muted cursor-pointer bg-black hover:brightness-150"
            @click="minus">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none">
              <path
                d="M8.00042 7.2191L4.70062 10.519L3.75781 9.57616L8.00042 5.3335L12.2431 9.57616L11.3003 10.519L8.00042 7.2191Z"
                fill="#DBDBDB" />
            </svg>
          </div>
          <div
            class="flex p-2.5 justify-center items-center rounded-lg border border-muted cursor-pointer bg-black hover:brightness-150"
            :class="{
              'brightness-50': plusDis,
              'pointer-events-none': plusDis,
            }"
            @click="plus">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none">
              <path
                d="M8.00042 8.78077L11.3003 5.48096L12.2431 6.42376L8.00042 10.6664L3.75781 6.42376L4.70062 5.48096L8.00042 8.78077Z"
                fill="#DBDBDB" />
            </svg>
          </div>
        </div>
      </div>
      <SheetHeader
        class="flex justify-between border-t pt-5 select-none mt-5 flex-row">
        <SheetTitle class="select-text">Замовлення {{ order.id }}</SheetTitle>
        <statusDropdown
          class="mr-4"
          :current-status="order.status"
          small
          not-reload-data
          :id="order.id"></statusDropdown>
      </SheetHeader>
      <div class="overflow-scroll">
        <div class="mb-2 p-1 flex flex-wrap gap-2 items-center w-full rounded">
          <div
            class="py-1 cursor-pointer transition-all h-9 flex items-center hover:bg-muted border rounded-3xl text-muted-foreground px-5"
            @click="activeTab = 'order'"
            :class="{
              'outline outline-2 text-primary outline-foreground':
                activeTab === 'order',
            }">
            замовлення
          </div>
          <div
            class="py-1 cursor-pointer h-9 transition-all flex items-center hover:bg-muted border rounded-3xl text-muted-foreground px-5"
            @click="activeTab = 'info'"
            :class="{
              'outline outline-2 text-primary outline-foreground':
                activeTab === 'info',
            }">
            інфо
          </div>
          <AddProducts
            just-increase
            class="ml-auto mr-5 mt-2"
            @delete-item="deleteOrder"
            @emit-res="addToOrderItems"
            @plus="plusOrderItem"
            @minus="minusOrderItem"
            :current-items="orderItems"
            prettie-button />
        </div>
        <div class="h-96 pr-4 pl-1">
          <div class="flex justify-between w-full">
            <div v-if="activeTab === 'order'" class="w-full">
              <div class="w-full">
                <div class="max-h-96 border rounded-xl overflow-scroll">
                  <OrderItem
                    v-for="item in orderItems"
                    :key="item.id"
                    :item="item"
                    :qty="item.quantity"
                    :isOpenDialog="isOpen"
                    @plus="
                      () => {
                        item.quantity += 1;
                      }
                    "
                    @minus="
                      () => {
                        item.quantity -= 1;
                      }
                    "
                    @itemQtyData="
                      (qty) => {
                        changeOrderItem(qty, item.id, item);
                      }
                    "
                    @delete-item="deleteItem" />
                </div>
                <div class="flex justify-between px-2 text-base py-3">
                  <p>Загальна сума замовлення:</p>
                  <div>{{ total }} грн</div>
                </div>
              </div>
              <div v-if="order.comments.length > 0 && order.comments[0].text">
                <div class="my-2 text-[#919C9A] text-[12px]">
                  Коментар клієнта:
                </div>
                <p class="border rounded-xl px-4 py-2">
                  {{ order.comments[0].text }}
                </p>
              </div>
            </div>
            <div v-else-if="activeTab === 'info'" class="w-full">
              <div class="border p-4 rounded-xl flex flex-col gap-2">
                <div class="border-b flex gap-2 pb-2">
                  <img src="@/assets/images/user.svg" />
                  {{ order.customer.last_name }} {{ order.customer.first_name }}
                  {{ order.customer.surname }}
                </div>
                <div class="border-b pb-2 flex gap-2">
                  <img src="@/assets/images/phone.svg" />
                  {{ order.customer.phone }}
                </div>
                <div class="border-b flex gap-2 pb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none">
                    <path
                      d="M16.666 9.99984C16.666 6.31794 13.6813 3.33317 9.99935 3.33317C6.31745 3.33317 3.33268 6.31794 3.33268 9.99984C3.33268 13.6818 6.31745 16.6665 9.99935 16.6665C11.3675 16.6665 12.6394 16.2543 13.6978 15.5474L14.6223 16.9343C13.2995 17.818 11.7096 18.3332 9.99935 18.3332C5.39697 18.3332 1.66602 14.6022 1.66602 9.99984C1.66602 5.39746 5.39697 1.6665 9.99935 1.6665C14.6017 1.6665 18.3327 5.39746 18.3327 9.99984V11.2498C18.3327 12.8607 17.0268 14.1665 15.416 14.1665C14.4125 14.1665 13.5273 13.6597 13.0025 12.8881C12.2445 13.6761 11.1792 14.1665 9.99935 14.1665C7.69817 14.1665 5.83268 12.301 5.83268 9.99984C5.83268 7.69865 7.69817 5.83317 9.99935 5.83317C10.9375 5.83317 11.8033 6.14325 12.4998 6.6665H14.166V11.2498C14.166 11.9402 14.7257 12.4998 15.416 12.4998C16.1063 12.4998 16.666 11.9402 16.666 11.2498V9.99984ZM9.99935 7.49984C8.6186 7.49984 7.49935 8.61909 7.49935 9.99984C7.49935 11.3806 8.6186 12.4998 9.99935 12.4998C11.3801 12.4998 12.4993 11.3806 12.4993 9.99984C12.4993 8.61909 11.3801 7.49984 9.99935 7.49984Z"
                      fill="#5061F9" />
                  </svg>
                  {{ order.customer.email }}
                </div>
                <div class="pb-2 flex gap-2">
                  <div class="w-5">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-min-15 h-5"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none">
                      <path
                        d="M17.5 16.6668C17.5 17.127 17.1269 17.5001 16.6667 17.5001H3.33333C2.8731 17.5001 2.5 17.127 2.5 16.6668V7.90768C2.5 7.65052 2.61873 7.40776 2.82172 7.24989L9.48842 2.0647C9.78933 1.83065 10.2107 1.83065 10.5116 2.0647L17.1782 7.24989C17.3812 7.40776 17.5 7.65052 17.5 7.90768V16.6668Z"
                        fill="#BB3BDC" />
                    </svg>
                  </div>
                  {{ order.waybill }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped></style>
