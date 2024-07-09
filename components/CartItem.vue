<script setup lang="ts">
import { ref, computed, defineProps } from "vue";
import { useCartStore } from "~/stores/cart";
import type { CartItem } from "~/stores/cart/types";

const cartStore = useCartStore();

// Define props with types
const props = defineProps<{
  item: CartItem;
  index: number;
}>();

const qty = ref<number>(props.item.qty);
const variant = ref(props.item.variants[props.item.currentVariant]);
const overInventory = ref<boolean>(false);
const showTooltip = ref<boolean>(false);

const index = computed(() => {
  return props.item.variants.findIndex((item) => item.id === variant.value.id);
});

const changeVariant = (currentVariant: any) => {
  if (currentVariant !== variant.value) {
    qty.value = 1;
    variant.value = currentVariant;
    cartStore.changeCurrentVariant(index.value, props.index);
  }
};

const minus = (item: CartItem) => {
  if (qty.value === 1) {
    return;
  } else {
    cartStore.decreaseQty(item, index.value);
    qty.value -= 1;
  }
};

const remove = () => {
  cartStore.removeFromCart(props.item, index.value);
};

const plus = (item: CartItem) => {
  if (qty.value < variant.value.inventory) {
    cartStore.increaseQty(item, index.value);
    qty.value++;
  }
};

const isDisabled = (variantItem: any) => {
  const selectedVariant = cartStore.cartItems.find(
    (cartItem: CartItem) =>
      cartItem.id === props.item.id &&
      cartItem.variants[cartItem.currentVariant].packaging ===
        variantItem.packaging
  );

  if (
    selectedVariant &&
    selectedVariant.variants[selectedVariant.currentVariant].packaging ===
      variantItem.packaging
  ) {
    return true;
  } else {
    return false;
  }
};
</script>

<template>
  <ClientOnly>
    <div class="cart">
      <div class="cart__inner">
        <img
          v-if="item.thumbnail"
          :src="item.thumbnail"
          :alt="item.title"
          class="cart__img" />
        <img
          v-else
          src="../assets/images/def.webp"
          alt="packing"
          class="cart__img" />
        <div class="badge">{{ item.year }}</div>

        <div class="cart__text">{{ item.title }} {{ variant.packaging }}</div>

        <div class="cart__checkbox">
          <div v-if="item.variants.length > 1">
            <Select>
              <SelectTrigger class="cart-select-trigger">
                <SelectValue
                  :placeholder="variant.packaging"
                  class="cart-select-value" />
              </SelectTrigger>
              <SelectContent class="cart-select-content">
                <SelectGroup class="cart-select-wrapper">
                  <SelectItem
                    class="cart-select-item"
                    :disabled="
                      isDisabled(variantItem) &&
                      variantItem.packaging !== variant.packaging
                    "
                    :class="{ cart_select_item_active: idx === index }"
                    @click="changeVariant(variantItem)"
                    v-for="(variantItem, idx) in item.variants"
                    :key="variantItem.id"
                    :value="variantItem.packaging">
                    {{ variantItem.packaging }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div v-else class="cart-select-trigger">
            {{ variant.packaging }}
          </div>
        </div>

        <div
          class="qty qty--small"
          @mouseover="showTooltip = true"
          @mouseleave="showTooltip = false">
          <transition
            v-if="showTooltip && qty >= variant.inventory"
            name="tooltip">
            <Tooltip :text="`В наявності ${variant.inventory} од.`" />
          </transition>
          <div
            class="qty__btn"
            :class="{ disabled: qty === 1 }"
            @click="minus(item)">
            <img
              src="@/assets/images/minus.svg"
              alt="minus icon"
              class="qty__icon" />
          </div>

          <div class="qty__num">
            {{ qty }}
          </div>
          <div
            class="qty__btn"
            :class="{ disabled: qty >= variant.inventory }"
            @click="plus(item)">
            <img
              src="@/assets/images/plus.svg"
              alt="plus icon"
              class="qty__icon" />
          </div>
          <div v-if="qty > variant.inventory" class="qty__tooltip">
            В наявності {{ variant.inventory }} од.
          </div>
        </div>

        <div class="cart__total">{{ qty * +variant.price }} грн</div>
        <div class="cart__remove" @click="remove()"></div>
      </div>
      <!-- mobile -->
      <div class="cart__inner cart__inner--mobile">
        <div class="cart__left">
          <div class="badge">{{ item.year }}</div>
          <img
            v-if="item.thumbnail"
            :src="item.thumbnail"
            :alt="item.title"
            class="cart__img" />
          <img
            v-else
            src="../assets/images/def.webp"
            alt="packing"
            class="cart__img" />
        </div>
        <div class="cart__right">
          <div class="cart__text">{{ item.title }}</div>

          <div class="cart__checkbox">
            <Select>
              <SelectTrigger class="cart-select-trigger">
                <SelectValue
                  :placeholder="variant.packaging"
                  class="cart-select-value" />
              </SelectTrigger>
              <SelectContent class="cart-select-content">
                <SelectGroup class="cart-select-wrapper">
                  <SelectItem
                    :disabled="
                      isDisabled(variantItem) &&
                      variantItem.packaging !== variant.packaging
                    "
                    class="cart-select-item"
                    :class="{ cart_select_item_active: idx === index }"
                    @click="changeVariant(variantItem)"
                    v-for="(variantItem, idx) in item.variants"
                    :key="variantItem.id"
                    :value="variantItem.packaging">
                    {{ variantItem.packaging }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="qty qty--small" @touchstart.stop="showTooltip = true">
            <transition
              v-if="showTooltip && qty >= variant.inventory"
              name="tooltip">
              <Tooltip :text="`В наявності ${variant.inventory} од.`" />
            </transition>
            <div class="qty__btn" @click="minus(item)">
              <img
                src="@/assets/images/minus.svg"
                alt="minus icon"
                class="qty__icon" />
            </div>

            <div class="qty__num">{{ qty }}</div>
            <div
              class="qty__btn"
              :class="{ disabled: qty >= variant.inventory }"
              @click="plus(item)">
              <img
                src="@/assets/images/plus.svg"
                alt="plus icon"
                class="qty__icon" />
            </div>
          </div>

          <div class="cart__total">{{ qty * +variant.price }} грн</div>
        </div>

        <div class="cart__remove" @click="remove()"></div>
      </div>
    </div>
  </ClientOnly>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/variables";

.cart-select-trigger {
  width: 90px;
  padding: 8px 16px;
  @include font(18px, $ivory, 700, 1);
  @include large {
    font-size: 1em;
  }
  height: 2em;
  padding: 6px 8px;
  background-color: $dark;
  border-radius: 6px;
  border: 1px solid transparent;
}
.cart-select-content {
  width: 86px;
}
.cart-select-value {
  margin-right: 8px;
}

.cart-select-wrapper {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  background: $beige;
  font-size: 100%;
}
.cart-select-item {
  font-size: 100%;
  &:focus {
    background-color: none;
  }
  &:hover {
    background-color: white;
  }
  &:not(:last-child) {
    margin-bottom: 5px;
  }
}

.cart_select_item_active {
  background-color: rgba(255, 255, 255, 0.665);
}

.tooltip-leave-active,
.tooltip-enter-active {
  transition: 0.3s;
}

.tooltip-enter-from,
.tooltip-leave-to {
  // transition: 0.3s;
  opacity: 0;
}
</style>
