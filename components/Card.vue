<script setup>
import { ref } from "vue";
import { useCartStore } from "~/stores/cart";
const cartStore = useCartStore();
const props = defineProps({
  product: { type: Object },
  isLoading: { type: Boolean },
});
let activeVariant = ref(0);

//todo: computed

const cartButtonState = computed(() => {
  const productInCart = cartStore.cartItems.find(
    (item) =>
      item.id === props.product.id &&
      item.currentVariant === activeVariant.value
  );
  return productInCart ? "вже в кошику" : "додати до кошика";
});

const add = () => {
  if (cartButtonState.value === "додати до кошика") {
    cartStore.addToCart(props.product, activeVariant.value);
  } else {
    cartStore.removeFromCart(props.product, activeVariant.value);
  }
};

const choosePacking = (idx) => {
  activeVariant.value = idx;
};
</script>

<template>
  <div class="card">
    <NuxtLink
      :to="{
        path: `/product/${product.slug}`,

        query: { id: product.id },
      }"
      class="card__link">
      <Skeleton v-if="isLoading" class="rounded-full h-[1.5em] bg-[#dfd2a5]" />
      <div v-else class="badge">{{ product.year }}</div>

      <Skeleton v-if="isLoading" class="rounded-full h-[1.5em] bg-[#dfd2a5]" />
      <h2 v-else class="card__title">
        {{ product.title }}
      </h2>

      <Skeleton
        v-if="isLoading"
        class="rounded-full card__img-skeleton bg-[#dfd2a5]" />
      <!-- <transition v-else-if="!isLoading && product.thumbnail" name="img" appear> -->
      <nuxt-img
        v-else-if="!isLoading && product.thumbnail"
        :src="product.thumbnail"
        class="card__img loading"
        :alt="product.title" />
      <!-- </transition> -->
      <img
        v-else
        src="../assets/images/slon.jpg"
        alt="упаковка"
        class="card__img" />
    </NuxtLink>
    <Skeleton v-if="isLoading" class="rounded-full h-[1.5em] bg-[#dfd2a5]" />
    <div
      v-else-if="product.variants && product.variants.length"
      class="label__wrap">
      <div class="label__row">
        <div
          v-for="(variant, idx) in product.variants"
          :key="variant.id"
          class="label"
          :class="[{ active: idx === activeVariant }]">
          <span @click="choosePacking(idx)">
            {{ variant.packaging }}
          </span>
        </div>
      </div>

      <div class="label__text">
        {{ product.variants[activeVariant].price }} грн
      </div>
    </div>
    <ClientOnly>
      <!-- ui button -->
      <div class="btn" @click="add()">{{ cartButtonState }}</div></ClientOnly
    >
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/variables";
.card {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
  border: 1px solid $dark;
  border-radius: 28px;
  background: $ivory;
  text-decoration: none;
  transition: 0.3s ease;

  @include mobile {
    padding: 14px;
  }
  @include large {
    padding: 2vh;
    gap: 1.5vh;
    border-radius: 3vh;
  }

  &:hover,
  &:active {
    background: $light;
  }
  &.loading {
    transform: translateX(-0.5%);
    opacity: 0;
  }
  &.loaded {
    transform: translateX(0);
    opacity: 1;
  }

  &__link {
    display: flex;
    flex-direction: column;
    gap: 20px;
    @include large {
      gap: 1.5vh;
    }
  }

  &__img,
  &__img-skeleton {
    display: block;
    height: 240px !important; //for skeleton
    width: 100%;
    object-fit: cover;
    border-radius: 20px;

    @include monitor {
      height: 340px !important;
    }
    @include large {
      height: 25vh !important;
      border-radius: 2vh;
    }
  }

  &__title {
    @include font(28px, $dark, 700, 1);
    letter-spacing: -0.84px;
    text-align: center;

    // @include monitor {
    //   font-size: 1.5em;
    // }
    @include large {
      font-size: 1.5em;
    }
  }
}

.v-leave-active,
.v-enter-active {
  transition: 1s ease;
}

.v-enter-from,
.v-leave-to {
  transition: 1s ease;
  opacity: 0;
}

.img-leave-active,
.img-enter-active {
  transition: 2s;
}

.img-enter-from,
.img-leave-to {
  // transition: 1s ease;
  transform: translateX(-100%);
  opacity: 0;
}
</style>
