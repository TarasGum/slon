<script setup lang="ts">
import statusDropdown from "./statusDropdown.vue";
import UpdateDelete from "./update-delete.vue";
import customerInfo from "./customer-info.vue";
import FullOrder from "./full-order.vue";
const props = defineProps<{
  data: Order[];
}>();

const price = (index: number) => {
  return props.data[index].order_items.reduce((accum: number, item: any) => {
    return accum + +item.price * item.quantity;
  }, 0);
};

const showFullOrder = ref(false);
const currentIndex = ref();
const setFullData = (index: number) => {
  currentIndex.value = index;
  fullOrderData.value = props.data[index];
};

const plusDis = ref(false);
const minusDis = ref(false);

watch(currentIndex, () => {
  if (currentIndex.value == 0) {
    minusDis.value = true;
  }
  if (currentIndex.value == props.data.length - 1) {
    plusDis.value = true;
  }
});

const plus = () => {
  if (currentIndex.value < props.data.length - 1) {
    setFullData(currentIndex.value + 1);
    minusDis.value = false;
  } else {
    plusDis.value = true;
  }
};
const minus = () => {
  if (currentIndex.value > 0) {
    setFullData(currentIndex.value - 1);
    plusDis.value = false;
  } else {
    minusDis.value = true;
  }
};
const fullOrderData = ref();
</script>

<template>
  <div class="flex-col gap-4 max-[900px]:flex hidden">
    <div
      v-for="(item, idx) in data"
      @click="(showFullOrder = true), setFullData(idx)"
      :key="item.id"
      class="border p-5 rounded-3xl cursor-pointer hover:bg-muted text-sm">
      <div class="flex flex-col gap-3 mx-auto items-stretch">
        <div class="flex w-full items-center justify-between">
          <div class="border p-3 w-14 text-center px-4 rounded-xl">
            {{ item.id }}
          </div>
          <UpdateDelete :id="item.id" :order="item" />
        </div>
        <statusDropdown
          :id="item.id"
          class="w-full"
          :current-status="item.status" />

        <customerInfo
          :customer="item.customer"
          is-full
          :waybill="item.waybill" />
        <div
          class="w-full flex pt-2 justify-center items-center max-h-[38px] gap-2.5 rounded-xl border border-[#5c5c5c] min-w-24 pb-2 px-2">
          <div class="text-[var(--green)] font-bold">₴</div>
          {{ price(0) }} грн
        </div>
      </div>
    </div>
    <h3 v-if="data.length === 0" class="mx-auto">No results.</h3>
  </div>
  <FullOrder
    :isOpen="showFullOrder"
    :order="fullOrderData"
    :plusDis="plusDis"
    :minusDis="minusDis"
    @plus="plus()"
    @minus="minus()"
    @updateOpen="(value) => (showFullOrder = value)" />
</template>

<style scoped></style>
