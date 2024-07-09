<script lang="ts" setup>
import { useRoute } from "vue-router";
import { useCartStore } from "~/stores/cart";
import Autoplay from "embla-carousel-autoplay"; // Assuming this is properly imported

const route = useRoute();
const cartStore = useCartStore();

interface Product {
  id: number;
  title: string;
  year: number;
  slug: string;
  description: string;
  category: { id: number; name: string };
  tags: { id: number; name: string }[];
  variants: {
    id: number;
    packaging: string;
    inventory: number;
    price: string;
  }[];
  recommendations: { id: number; title: string; color: string }[];
  thumbnail: string;
  full_description: string;
  images: { id: number; image: string; product: number }[];
}

const id: Ref<string> = ref(route.query.id as string);
const qty: Ref<number> = ref(1);
const overInventory: Ref<boolean> = ref(false);
const activeVariant: Ref<number> = ref(0);

const { data: productData, pending: isLoadingProduct } = await useAPI<Product>(
  `/products/${id.value}`
);

const isLoading: Ref<boolean> = computed(() => isLoadingProduct.value);
const product: Ref<Product | null> = computed(() => productData.value);

if (!productData.value) {
  throw createError({ statusCode: 404, fatal: true });
}

const choosePacking = (idx: number) => {
  activeVariant.value = idx;
  overInventory.value = false;
  qty.value = 1;
};

const minus = () => {
  overInventory.value = false;
  if (qty.value === 0) return;
  else qty.value -= 1;
};

const plus = () => {
  if (qty.value === product.value!.variants[activeVariant.value].inventory) {
    overInventory.value = true;
    return;
  } else qty.value++;
};

const { data: productsData } = await useAPI<Product[]>("/products");

const randomProducts: Ref<Product[] | undefined> = computed(() =>
  productsData.value
    ?.sort(() => Math.random() - 0.5)
    .filter((e: any) => e.id !== product.value?.id)
);

const cartButtonState: Ref<string> = computed(() => {
  const productInCart = cartStore.cartItems.find(
    (item: any) =>
      item.id === product.value!.id &&
      item.currentVariant === activeVariant.value
  );
  return productInCart ? "вже в кошику" : "додати до кошика";
});

const add = () => {
  if (cartButtonState.value === "додати до кошика") {
    cartStore.addToCart(productData.value!, activeVariant.value, qty.value);
  } else {
    cartStore.removeFromCart(productData.value!, activeVariant.value);
  }
};
</script>

<template>
  <div class="container" v-if="product">
    <div class="product">
      <div @click="$router.back()" class="product__close">закрити</div>
      <div class="block">
        <div class="product__grid">
          <Skeleton v-if="isLoading" class="product__thumb-skeleton" />

          <div v-else class="product__images">
            <Carousel
              v-if="product.images && product.images.length"
              class="relative w-full"
              :plugins="[
                Autoplay({
                  delay: 4000,
                }),
              ]">
              <CarouselContent>
                <CarouselItem v-for="image in product.images" :key="image.id">
                  <div class="product__thumb-wrap">
                    <nuxt-img
                      format="webp"
                      :src="image.image"
                      :alt="product.title"
                      class="product__thumb"
                      :placeholder="[300, 500]" />
                  </div>
                </CarouselItem>
              </CarouselContent>
              <CarouselPrevious class="prev" />
              <CarouselNext class="next" />
            </Carousel>

            <img
              v-else-if="product.thumbnail"
              :src="product.thumbnail"
              alt="упакування"
              class="product__thumb" />
            <img
              v-else
              src="../../assets/images/slon.jpg"
              alt="упакування"
              class="product__thumb" />
          </div>

          <div class="product__card">
            <div class="product__badge">
              <div class="badge">{{ product.year }}</div>
            </div>
            <h1 class="product__title">{{ product.title }}</h1>
            <p class="product__text">
              {{ product.description }}
            </p>

            <div
              v-if="product.variants && product.variants.length"
              class="label__wrap">
              <div class="label__row">
                <div
                  v-for="(variant, idx) in product.variants"
                  :key="variant.id"
                  class="label"
                  :class="{ active: idx === activeVariant }">
                  <span @click="choosePacking(idx)">
                    {{ variant.packaging }}
                  </span>
                </div>
              </div>
              <div class="label__text">
                {{ product.variants[activeVariant].price }} грн
              </div>
            </div>
            <div class="qty">
              <div
                class="qty__btn"
                :class="{ disabled: qty <= 1 }"
                @click="minus()">
                <img
                  src="@/assets/images/minus.svg"
                  alt="minus icon"
                  class="qty__icon" />
              </div>

              <div class="qty__num">
                {{ qty }}
                <div v-if="overInventory" class="qty__tooltip">
                  Недостатня кількість товару
                </div>
              </div>
              <div
                class="qty__btn"
                @click="plus()"
                :class="{ disabled: overInventory }">
                <img
                  src="@/assets/images/plus.svg"
                  alt="plus icon"
                  class="qty__icon" />
              </div>
            </div>
            <ClientOnly>
              <div class="btn btn--dark" :disabled="qty === 0" @click="add()">
                {{ cartButtonState }}
              </div></ClientOnly
            >
          </div>
        </div>
      </div>
      <div
        v-if="product.full_description && product.full_description.length"
        class="block product_descripton">
        <div class="subtitle">ОПИС</div>
        <p>
          {{ product.full_description }}
        </p>
      </div>
      <div
        v-if="product.recommendations && product.recommendations.length"
        class="block">
        <div class="subtitle">РЕКОМЕНДАЦІЇ ПО ЗАВАРЮВАННЮ</div>
        <div class="list">
          <div
            v-for="rec in product.recommendations"
            :key="rec.id"
            class="list__item">
            <span
              class="list__icon"
              :style="[
                rec.color
                  ? { background: rec.color }
                  : { background: '#c3c3c3' },
              ]"></span
            >{{ rec.title }}
          </div>
        </div>
      </div>
      <client-only>
        <div class="block block--dark">
          <div class="subtitle">ВАМ ТАКОЖ МОЖЕ СПОДОБАТИСЬ</div>
          <div class="grid-3">
            <Card
              v-for="product in randomProducts?.slice(0, 3)"
              :key="product.id"
              :product="product" />
          </div></div
      ></client-only>
    </div>
  </div>
</template>
<style lang="scss" scoped>
@import "@/assets/scss/variables";
.product {
  position: relative;
  &__close {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(-40px, -50%);
    padding: 6px 20px;
    border-radius: 26px;
    border: 2px solid $dark;
    background: $ivory;
    box-shadow: 3px 4px 0px 0px $dark;
    @include font(24px, $dark, 400, 1.3);
    transition: 0.3s ease-in-out;
    z-index: 2;

    @include large {
      padding: 0.5vh 2vh;
      border-radius: 3vh;
      box-shadow: 0.25vw 0.3vw 0px 0px $dark;
      font-size: 1em;
    }
  }
  &__grid {
    display: grid;
    grid-template-columns: 1.25fr 1fr;
    gap: 30px;

    @media only screen and (max-width: 1200px) {
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
    }
    @include phablet {
      grid-template-columns: 1fr;
    }
    @include large {
      gap: 3vh;
    }
  }

  &__card {
    display: flex;
    position: relative;
    flex-direction: column;
    gap: 20px;
    padding: 20px;
    border-radius: 20px;
    border: 1px solid $dark;
    background: $sand;

    @include mobile {
      padding: 14px;
    }
    @include large {
      padding: 2vh;
      border-radius: 2vh;
    }
  }
  &__text {
    @include font(20px, $dark, 400, 1.3);
    text-transform: none;
    letter-spacing: -0.6px;
    max-height: 130px;
    @include mobile {
      font-size: 16px;
    }
    @include phablet {
      display: none;
    }
    @include large {
      font-size: 1.1em;
    }
  }
  &__title {
    @include font(42px, $dark, 700, 1);

    @include mobile {
      font-size: 28px;
    }
    @include large {
      font-size: 2em;
    }
  }

  &__badge {
    align-self: left;
  }
  &__images {
    height: fit-content;
    overflow: hidden;
    border-radius: 20px;

    @include large {
      border-radius: 2vh !important;
    }
  }
  &__img {
    height: 200px;
    width: 100%;
    object-fit: cover;
    border: 1px solid #ccc;
  }
  &__thumb,
  &__thumb-skeleton {
    height: 500px !important;
    width: 100%;
    object-fit: cover;
    border-radius: 20px;

    @include phablet {
      height: 340px !important;
    }
    @include mobile {
      height: 250px !important;
    }
    @include large {
      height: 50vh !important;
      border-radius: 2vh !important;
    }
  }
  &__thumb-wrap {
    border-radius: 20px;
    overflow: hidden;
  }
}
.product__text_popup {
  top: 117px;
  left: 33%;
  transform: translateX(-33%);
  padding: 10px;
  width: 96%;
  box-shadow: 2px 4px 0px 0px $dark-green;
  background-color: $sand;
  position: absolute;
  @include font(20px, $dark, 400, 1.3);
  text-transform: none;
  letter-spacing: -0.6px;
  border: 2px solid $dark;
  border-radius: 26px;
  overflow: hidden;
  z-index: 20;
  @include mobile {
    font-size: 16px;
  }
  @include large {
    font-size: 1.1em;
  }
}
.product__text_mobile {
  @include font(20px, $dark, 400, 1.3);
  text-transform: none;
  letter-spacing: -0.6px;

  display: none;
  @include mobile {
    font-size: 16px;
  }
  @include phablet {
    display: block;
  }
  @include large {
    font-size: 1.1em;
  }
}
.prev {
  margin-left: 7%;
}

.next {
  margin-right: 7%;
}
// .fade-enter-active,
// .fade-leave-active {
//   transition: opacity 5s;
// }
// .fade-enter {
//   // transition: 2s;
//   // .fade-leave-active {
//   opacity: 0;
//   // transform: translateY(-20%);
// }
</style>
