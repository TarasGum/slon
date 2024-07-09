<script setup>
import { useCartStore } from "~/stores/cart";
const cartStore = useCartStore();
</script>

<template>
  <NuxtLink to="/cart">
    <div class="cart-label" :class="{ active: cartStore.cartItems.length > 0 }">
      Корзина ({{ cartStore.cartItems?.length }})
    </div>
  </NuxtLink>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/variables.scss";
.cart-label {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translate(-50%);
  display: inline-flex;
  padding: 14px 30px;
  border-radius: 44px;
  border: 6px solid $dark;
  background: $ivory;
  box-shadow: 3px 4px 0px 0px #3f483d;
  font-family: Ubuntu Mono;
  @include font(34px, $dark-2, 700, 1);
  letter-spacing: -1.02px;
  z-index: 10;
  transition: 0.3s;

  &.active {
    background: $light-green;
  }

  @include tablet {
    font-size: 24px;
  }
  @include mobile {
    font-size: 24px;
  }
  @include mini {
    padding: 12px 24px;
    font-size: 20px;
    border-width: 4px;
  }
  @include large {
    bottom: 3vh;
    padding: 1.5vh 3vh;
    border-radius: 5vh;
    font-size: 1.85em;
    box-shadow: 0.25vw 0.3vw 0px 0px #3f483d;
  }
}
</style>
