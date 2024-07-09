<script setup lang="ts">
import { ref, computed, defineProps } from "vue";

// Define props with types
const props = defineProps<{
  item: Product;
  variant: any;
  itemInOrder: boolean;
  currentQty: number;
  justIncrease?: boolean;
}>();
const emit = defineEmits(["addToOrder", "removeFromOrder", "minus", "plus"]);

const addToOrder = () => {
  emit("addToOrder", qty.value);
};
const removeFromOrder = () => {
  emit("removeFromOrder");
};
const qty = ref<number>(props.currentQty ? props.currentQty : 1);
const variant = ref(props.variant);
const overInventory = ref<boolean>(false);
const showTooltip = ref<boolean>(false);
const index = ref(0);

const minus = () => {
  if (props.justIncrease) {
    emit("minus");
    qty.value -= 1;
  } else if (qty.value === 1) {
    return;
  } else {
    emit("minus");
    emit("removeFromOrder");
    qty.value -= 1;
    emit("addToOrder", qty.value);
  }
};

const plus = () => {
  if (props.justIncrease) {
    emit("plus");
    qty.value += 1;
  } else if (qty.value < variant.value.inventory) {
    emit("plus");

    emit("removeFromOrder");
    qty.value += 1;
    emit("addToOrder", qty.value);
  }
};
</script>

<template>
  <ClientOnly>
    <div class="cart">
      <div
        v-bind="$attrs"
        class="cart__inner !border-b-0 px-2 !grid-cols-[80px_5fr_2fr_2fr_2fr_80px] hover:bg-muted transition-all">
        <img
          v-if="item.thumbnail"
          :src="item.thumbnail"
          :alt="item.title"
          class="cart__img ml-2" />
        <img
          v-else
          src="@/assets/images/slon.jpg"
          alt="упакування"
          class="h-full w-full ml-2 cart__img" />

        <div>
          <div>{{ item.year }} | Категорія: {{ item.category.name }}</div>
          <div>{{ item.title }}</div>
        </div>

        <div
          class="border self-center text-center w-fit mx-auto px-2 py-1.5 rounded-md bg-muted">
          {{ variant.packaging }}
        </div>

        <!-- <div
          class="qty qty--small"
          @mouseover="showTooltip = true"
          @mouseleave="showTooltip = false">
          <transition
            v-if="showTooltip && qty >= variant.inventory"
            name="tooltip">
            <Tooltip :text="`В наявності ${variant.inventory} од.`" />
          </transition>
          <div class="qty__btn" :class="{ disabled: qty === 1 }" @click="minus">
            <img
              src="@/assets/images/minus.svg"
              alt="minus icon"
              class="qty__icon w-4 h-4" />
          </div>

          <div>
            {{ qty }}
          </div>
          <div
            class="qty__btn"
            :class="{ disabled: qty >= variant.inventory }"
            @click="plus()">
            <img
              src="@/assets/images/plus.svg"
              alt="plus icon"
              class="qty__icon w-4 h-4" />
          </div>
          <div v-if="qty > variant.inventory" class="qty__tooltip">
            В наявності {{ variant.inventory }} од.
          </div>
        </div> -->
        <div
          class="qty qty--small !border-none !m-0"
          @mouseover="showTooltip = true"
          @mouseleave="showTooltip = false">
          <transition
            v-if="showTooltip && qty >= variant.inventory"
            name="tooltip">
            <Tooltip
              class="!-translate-y-3.5"
              :text="`В наявності ${variant.inventory} од.`" />
          </transition>
          <div
            class="qty__btn brightness-[20] w-5 h-5"
            :class="{ disabled: qty === 1 }"
            @click="minus()">
            <img
              src="@/assets/images/minus.svg"
              alt="minus icon"
              class="qty__icon w-5 h-5" />
          </div>

          <div>{{ qty }} шт</div>
          <div
            class="qty__btn brightness-[20] w-5 h-5"
            :class="{ disabled: qty >= variant.inventory }"
            @click="plus()">
            <img
              src="@/assets/images/plus.svg"
              alt="plus icon"
              class="qty__icon w-5 h-5" />
          </div>
          <div v-if="qty > variant.inventory" class="qty__tooltip">
            В наявності {{ variant.inventory }} од.
          </div>
        </div>
        <div class="ml-8">{{ qty * +variant.price }} грн</div>

        <div
          v-if="itemInOrder"
          @click="removeFromOrder"
          class="check_icon flex hover:border-[#BE2F2F] hover:outline-[rgba(198,47,47,0.40)] w-fit justify-center items-center rounded-lg border border-[--green] outline-2 outline-[rgba(61,181,119,0.40)] outline cursor-pointer bg-black hover:brightness-150"></div>
        <div
          v-if="!itemInOrder"
          @click="addToOrder"
          class="flex p-2.5 w-fit justify-center items-center rounded-lg border border-muted cursor-pointer bg-black hover:brightness-150">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none">
            <path
              d="M7.33398 7.3335V3.3335H8.66732V7.3335H12.6673V8.66683H8.66732V12.6668H7.33398V8.66683H3.33398V7.3335H7.33398Z"
              fill="#DBDBDB" />
          </svg>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
.check_icon {
  width: 10px;
  height: 10px;
  padding: 18px;
  background-size: 50%;
  background-position: center;
  background-repeat: no-repeat;
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6.66647 10.1141L12.7947 3.98584L13.7375 4.92865L6.66647 11.9997L2.42383 7.75709L3.36664 6.81429L6.66647 10.1141Z" fill="%233DB577"/></svg>');
  &:hover {
    background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.33398 7.3335V8.66683H12.6673V7.3335H3.33398Z" fill="%23BE2F2F"/></svg>');
  }
}
</style>
