import { ref } from "vue";
import { defineStore } from "pinia";
import type { Product } from "~/services/products/types";
import type { CartItem } from "./types";
export const useCartStore = defineStore(
  "catrStore",
  () => {
    const cartItems = ref<CartItem[]>([]);
    //todo: ts
    const addToCart = (item: Product, variant: number, qty: number): void => {
      const readyItem: CartItem = {
        ...item,
        qty: qty !== undefined && qty !== null ? qty : 1,
        currentVariant: variant !== undefined && variant !== null ? variant : 0,
      };

      const itemAlreadyInCart = cartItems.value.some(
        (i) => i.id === readyItem.id && i.currentVariant === variant
      );

      if (!itemAlreadyInCart) {
        cartItems.value.push(readyItem);
      }
    };
    const deleteFullItem = (item: Product) => {
      cartItems.value = cartItems.value.filter((e) => item.id !== e.id);
    };
    const removeFromCart = (item: Product, variant: number) => {
      cartItems.value = cartItems.value.filter(
        (e) => item.id !== e.id || variant !== e.currentVariant
      );
    };

    const increaseQty = (item: Product, variant: number) => {
      cartItems.value.forEach((e) => {
        if (item.id === e.id && variant === e.currentVariant) {
          e.qty++;
        }
      });
    };
    const decreaseQty = (item: Product, variant: number) => {
      cartItems.value.forEach((e) => {
        if (item.id === e.id && variant === e.currentVariant) {
          e.qty--;
        }
      });
    };

    const changeCurrentVariant = (index: number, indexItem: number) => {
      cartItems.value[indexItem].currentVariant = index;
    };

    const clearCart = () => {
      cartItems.value = [];
    };

    return {
      cartItems,
      addToCart,
      removeFromCart,
      increaseQty,
      decreaseQty,
      deleteFullItem,
      changeCurrentVariant,
      clearCart,
    };
  },
  {
    persist: {
      storage: persistedState.localStorage,
    },
  }
);
