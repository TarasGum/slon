<script lang="ts" setup>
const props = defineProps<{
  notSendDelete?: boolean;
  item: any;
  qty?: number;
  isOpenDialog: boolean;
}>();
const currentQty = props.item.quantity;
const emit = defineEmits<{
  deleteItem: [value: number, value: number];
  itemQtyData: [value: number, id: number];
  plus: [value: void];
  minus: [value: void];
}>();

const sendQty = ref(props.isOpenDialog);

const deleteItem = (id: number) => {
  emit("deleteItem", id, props.item.variant.id as number);
};

const qty = ref(props.qty ? props.qty : props.item.quantity);
const price = computed(() => {
  return +props.item.variant?.price * qty.value;
});
import DeleteOrderItem from "./delete-order-item.vue";

watch(
  () => {
    return props.qty;
  },
  () => {
    if (props.qty) {
      qty.value = props.qty;
    }
  }
);

watch(
  () => {
    return props.isOpenDialog;
  },
  () => {
    if (props.isOpenDialog === false) {
      emit("itemQtyData", qty.value, props.item.id);
    }
  }
);

const showTooltip = ref(false);
</script>

<template>
  <div
    class="grid !grid-cols-[1fr_1.5fr_20%_0.7fr_1fr_60px] max-sm:hidden min-h-12 items-center last:border-b-0 border-b text-sm p-2 w-full">
    <div class="border text-center w-fit px-2 border-primary mr-2 rounded-md">
      {{ item.variant?.product?.category.name }}
    </div>
    <div>
      {{ item.variant?.product?.title }} {{ item.variant?.product?.year }}
    </div>
    <div
      class="border self-center text-center w-fit ml-2 mr-2 px-2 py-1.5 rounded-md bg-muted">
      {{ item.variant?.packaging }}
    </div>
    <div
      class="qty qty--small !border-none !m-0 h-2"
      @mouseover="showTooltip = true"
      @mouseleave="showTooltip = false">
      <transition
        v-if="showTooltip && qty >= currentQty + item.variant?.inventory"
        name="tooltip">
        <Tooltip
          :text="`В наявності ${currentQty + item.variant?.inventory} од.`" />
      </transition>
      <div
        class="qty__btn brightness-[20] w-4 h-4"
        :class="{ disabled: qty === 1 }"
        @click="
          () => {
            qty--;
            $emit('minus');
          }
        ">
        <img
          src="@/assets/images/minus.svg"
          alt="minus icon"
          class="qty__icon w-4 h-4" />
      </div>

      <div class="w-10 text-center">{{ qty }} шт</div>

      <div
        class="qty__btn brightness-[20] w-4 h-4"
        :class="{ disabled: qty >= currentQty + item.variant?.inventory }"
        @click="
          () => {
            qty++;
            $emit('plus');
          }
        ">
        <img
          src="@/assets/images/plus.svg"
          alt="plus icon"
          class="qty__icon w-4 h-4" />
      </div>
      <div
        v-if="qty > currentQty + item.variant?.inventory"
        class="qty__tooltip">
        В наявності {{ currentQty + item.variant?.inventory }} од.
      </div>
    </div>

    <div class="mx-auto">{{ price }} грн</div>

    <div>
      <DeleteOrderItem
        :notSendDelete="notSendDelete"
        :item="item"
        @delete-item="deleteItem"
        :id="item.id"
        :title="item.variant.product?.title" />
    </div>
  </div>

  <div
    class="sm:hidden flex flex-col gap-2 min-h-12 items-center last:border-b-0 border-b text-sm p-2 w-full">
    <div class="flex justify-between items-center w-full">
      <div class="flex">
        <div
          class="border text-center w-fit px-2 border-primary mr-2 rounded-md">
          {{ item.variant?.product?.category.name }}
        </div>
        <div>
          {{ item.variant?.product?.title }} {{ item.variant?.product?.year }}
        </div>
      </div>
      <div>
        <DeleteOrderItem
          @delete-item="deleteItem"
          :notSendDelete="notSendDelete"
          :item="item"
          :id="item.id"
          :title="item.variant.product?.title" />
      </div>
    </div>
    <div class="flex justify-between items-center w-full">
      <div class="border text-center w-fit px-2 py-1.5 rounded-md bg-muted">
        {{ item.variant?.packaging }}
      </div>
      <div
        class="qty qty--small !border-none !m-0 h-2"
        @mouseover="showTooltip = true"
        @mouseleave="showTooltip = false">
        <transition
          v-if="showTooltip && qty >= item.quantity + item.variant?.inventory"
          name="tooltip">
          <Tooltip
            :text="`В наявності ${
              item.quantity + item.variant?.inventory
            } од.`" />
        </transition>
        <div
          class="qty__btn brightness-[20] w-4 h-4"
          :class="{ disabled: qty === 1 }"
          @click="
            () => {
              qty--;
              $emit('minus');
            }
          ">
          <img
            src="@/assets/images/minus.svg"
            alt="minus icon"
            class="qty__icon w-4 h-4" />
        </div>

        <div class="w-10 text-center">{{ qty }} шт</div>
        <div
          class="qty__btn brightness-[20] w-4 h-4"
          :class="{ disabled: qty >= item.quantity + item.variant?.inventory }"
          @click="
            () => {
              qty++;
              $emit('plus');
            }
          ">
          <img
            src="@/assets/images/plus.svg"
            alt="plus icon"
            class="qty__icon w-4 h-4" />
        </div>
        <div
          v-if="qty > item.quantity + item.variant?.inventory"
          class="qty__tooltip">
          В наявності {{ item.variant?.inventory }} од.
        </div>
      </div>

      <div class="">{{ price }} грн</div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
