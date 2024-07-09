<script lang="ts" setup>
import { useCartStore } from "~/stores/cart";
definePageMeta({
  layout: "no-cart-badge",
});
const cartStore = useCartStore();
const limitItemsError: boolean = false;

cartStore.cartItems.forEach(async (i) => {
  try {
    await $fetch(`https://api.slooon.shop/api/products/${i.id}/`, {
      onResponse: ({ response }) => {
        if (response.status === 404) {
          cartStore.deleteFullItem(i);
        }
      },
    });
  } catch (error) {
    console.error(`Помилка при запиті для об'єкта з id ${i.id}:`, error);
  }
});
</script>

<template>
  <ClientOnly>
    <div
      v-if="cartStore.cartItems && cartStore.cartItems.length"
      class="container">
      <div class="cart__wrapper">
        <div class="cart__heading">
          <div class="title">Корзина ({{ cartStore.cartItems.length }})</div>
          <!-- <div class="cart__close" @click="$router.back()">
            <img src="@/assets/images/close.svg" alt="close icon" class="cart__icon" />
          </div> -->
          <NuxtLink to="/" class="cart__close">
            <img
              src="@/assets/images/close.svg"
              alt="close icon"
              class="cart__icon" />
          </NuxtLink>
        </div>
        <div class="cart__top">
          <div class="cart__title left">фото</div>
          <div class="cart__title">рік</div>
          <div class="cart__title left">чай</div>
          <div class="cart__title">вага</div>
          <div class="cart__title">кількість</div>
          <div class="cart__title right">ціна</div>
          <div></div>
        </div>
        <div>
          <CartItem
            v-for="(item, index) in cartStore.cartItems"
            :key="
              item.id +
              item.currentVariant +
              item.slug +
              item.variants[item.currentVariant].packaging
            "
            :index="index"
            :item="item" />
        </div>

        <div class="cart__btn">
          <NuxtLink
            to="checkout"
            class="btn btn--dark"
            :disabled="limitItemsError"
            >ПЕРЕЙТИ ДО ЧЕКАУТУ</NuxtLink
          >
        </div>
      </div>
    </div>
    <div v-else class="container">
      <div class="cart__wrapper">
        <div class="cart__heading">
          <div class="title">ваша корзина пуста</div>
          <div class="cart__close" @click="$router.back()">
            <img
              src="@/assets/images/close.svg"
              alt="close icon"
              class="cart__icon" />
          </div>
        </div>

        <div class="cart__btn">
          <NuxtLink to="/" class="btn btn--dark"
            >ПОВЕРНУТИСЬ ДО ПОКУПОК</NuxtLink
          >
        </div>
      </div>
    </div></ClientOnly
  >
</template>
<style lang="scss" scoped></style>
