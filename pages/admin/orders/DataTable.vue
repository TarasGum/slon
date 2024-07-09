<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
  defineProps,
  defineEmits,
  watch,
  nextTick,
} from "vue";
import statusDropdown from "./statusDropdown.vue";
import UpdateDelete from "./update-delete.vue";
import customerInfo from "./customer-info.vue";
import FullOrder from "./full-order.vue";

const props = defineProps<{
  data: Order[];
}>();

const emit = defineEmits(["intersect"]);

const price = (index: number) => {
  return props.data[index].order_items.reduce((accum: number, item: any) => {
    return accum + +item.price * item.quantity;
  }, 0);
};

const showFullOrder = ref(false);
const currentIndex = ref<number | null>(null);
const fullOrderData = ref();

const setFullData = (index: number) => {
  currentIndex.value = index;
  fullOrderData.value = props.data[index];
};

const plusDis = ref(false);
const minusDis = ref(false);

watch(currentIndex, () => {
  if (currentIndex.value !== null) {
    minusDis.value = currentIndex.value === 0;
    plusDis.value = currentIndex.value === props.data.length - 1;
  }
});

const plus = () => {
  if (
    currentIndex.value !== null &&
    currentIndex.value < props.data.length - 1
  ) {
    setFullData(currentIndex.value + 1);
    minusDis.value = false;
  } else {
    plusDis.value = true;
  }
};
const minus = () => {
  if (currentIndex.value !== null && currentIndex.value > 0) {
    setFullData(currentIndex.value - 1);
    plusDis.value = false;
  } else {
    minusDis.value = true;
  }
};

let observer: IntersectionObserver;
let lastObservedElement: Element | null = null;

const observeLastItem = () => {
  setTimeout(() => {
    const lastItem = document.querySelector("#last-item");
    if (lastItem) {
      observer.observe(lastItem);
      lastObservedElement = lastItem;
    }
  }, 200);
};

const handleIntersect = () => {
  if (lastObservedElement) {
    observer.unobserve(lastObservedElement);
    lastObservedElement.removeAttribute("id");
  }
  emit("intersect");
  observeLastItem();
};

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        handleIntersect();
      }
    });
  });
  observeLastItem();
});

watch(
  () => props.data,
  () => {
    observeLastItem();
  }
);

onUnmounted(() => {
  if (observer && lastObservedElement) {
    observer.unobserve(lastObservedElement);
  }
  observer.disconnect();
});
</script>

<template>
  <div
    class="border rounded-[14px] bg-[#191919] text-[18px] h-[500px] overflow-auto">
    <div
      v-for="(item, idx) in data"
      @click="(showFullOrder = true), setFullData(idx)"
      :key="item.id"
      :id="idx === data.length - 10 ? 'last-item' : `item-${idx}`"
      class="item border-b h-[68px] py-2 pl-3 pr-6 relative grid grid-cols-[minmax(120px,150px)_minmax(0,1fr)_minmax(0,1fr)_1fr_32px] items-center cursor-pointer hover:bg-muted text-sm">
      <!-- ID -->
      <div
        class="border px-3 flex w-fit justify-center items-center py-1.5 text-center text-[18px] rounded-xl">
        #{{ item.id }}
      </div>
      <!-- Customer Info -->
      <customerInfo :customer="item.customer" :waybill="item.waybill" />
      <!-- Price -->
      <div
        class="flex justify-center items-center w-fit gap-2.5 rounded-[10px] h-[32px] border border-[var(--Grey)] px-2.5 py-[7px] text-[18px]">
        <div class="text-[var(--green)] font-bold">₴</div>
        {{ price(idx) }} грн
      </div>
      <!-- Status -->
      <div class="max-w-[176px] relative mx-5">
        <statusDropdown :id="item.id" :current-status="item.status" />
      </div>
      <!-- Update/Delete -->
      <UpdateDelete :id="item.id" :order="item" />
    </div>
    <h3 v-if="data.length === 0" class="mx-auto">No results.</h3>
  </div>
  <FullOrder
    :isOpen="showFullOrder"
    :order="fullOrderData"
    :plusDis="plusDis"
    :minusDis="minusDis"
    @plus="plus"
    @minus="minus"
    @updateOpen="(value) => (showFullOrder = value)" />
</template>

<style scoped>
.border {
  border-width: 1px;
}

.overflow-auto {
  overflow-y: auto;
}

.p-2 {
  padding: 8px;
}
</style>
