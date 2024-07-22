<script lang="ts" setup>
import { ref, reactive } from "vue";
import type { Category } from "~/services/categories/types";

import type { Product } from "~/services/products/types";

let selectedCategories: number[] = reactive([]);
const queryCategories = computed(() => {
  return selectedCategories.join(",");
});

const { data: productData, pending: isLoadingProducts } = await useFetch(
  "https://api.slooon.shop/api/products",
  {
    query: { categories: queryCategories },
  }
);

let counter = ref(0);
const isLoading = computed(() => {
  if (counter.value <= 1) {
    counter.value++;
    if (isLoadingProducts.value) {
      return true;
    } else {
      return isLoadingProducts.value;
    }
  }
});
const { data: categoryData } = await useFetch(
  "https://api.slooon.shop/api/categories?has_products=true"
);

const relevantCats = computed(() => {
  return categoryData.value as Category[];
});

const reset = () => {
  if (selectedCategories.length > 0) {
  }
  selectedCategories.splice(0, selectedCategories.length);
};

const toggleActive = (id: number) => {
  const newStatus = !selectedCategories.includes(id);
  setCategoryActive(id, newStatus);
};

const removeFromSelected = (id: number) => {
  selectedCategories.forEach((item, index) => {
    if (item === id) {
      selectedCategories.splice(index, 1);
    }
  });
};

const setCategoryActive = (id: number, status: boolean) => {
  if (status) {
    selectedCategories.push(id);
  } else {
    removeFromSelected(id);
  }
};

// watch(categoryData, () => {
//   categoryStore.initCategory(categoryData.value);
// });
</script>

<template>
  <div class="container">
    <div class="heading">
      <div class="heading__block">
        <div class="heading__inner">
          <h1 class="heading__title">Чайна лавка блаблаблабал фвіфів</h1>
          <p class="heading__text">
            Привіт! На зв’язку Максим та Сашко. Ми хочемо поширювати чайну
            культуру в Україні, пропонуємо вам асортимент чаю блаблабл Привіт!
            На зв’язку Максим та Сашко. Ми хочемо поширювати чайну культуру в
            Україні, пропонуємо вам асортимент чаю блаблабл
          </p>
        </div>
      </div>
    </div>
  </div>

  <div>
    <div class="filters__wrap">
      <div class="filters">
        <div
          class="filters__item"
          @click.stop="reset()"
          :class="{ active: !selectedCategories.length }">
          усі
        </div>
        <div
          v-for="category in relevantCats"
          :key="category.id"
          class="filters__item"
          :class="{ active: selectedCategories.includes(category.id) }"
          @click="toggleActive(category.id)">
          <div>{{ category.name }}</div>
        </div>
      </div>
    </div>

    <div class="products__wrapper">
      <div class="products">
        <div class="card-wrap" v-if="isLoading">
          <Card :product="{}" :isLoading="true" />
          <Card :product="{}" :isLoading="true" />
          <Card :product="{}" :isLoading="true" />
        </div>
        <div class="card-wrap" v-else>
          <TransitionGroup name="list">
            <Card
              v-for="(product) in (productData as Product[])"
              :key="product.id"
              :product="product"
              :isLoading="false"
          /></TransitionGroup>
        </div>

        <div class="text-center" v-if="!productData">нема товарів</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/variables";
.heading {
  padding: 80px 80px 100px;
  border-radius: 60px;
  background: url("../assets/images/bg-main.png") bottom right no-repeat, $ivory;
  background-size: contain;
  box-shadow: 0 12px 0 0 $dark-green;

  @include air {
    padding: 40px 40px 60px;
    border-radius: 40px;
  }

  @include mobile {
    padding: 20px 20px 200px;
    border-radius: 30px;
    background-size: 100% 50%;
  }
  @include large {
    padding: 6vh 6vh 8vh;
    border-radius: 6vh;
    box-shadow: 0 1vw 0 0 $dark-green;
  }

  &__inner {
    width: 60%;
    display: flex;
    flex-direction: column;
    gap: 30px;

    @include phablet {
      width: 75%;
    }
    @include mobile {
      width: 100%;
      text-align: center;
    }

    @include large {
      width: 70%;
      gap: 3vh;
    }
  }
  &__text {
    @include font(20px, $dark, 400, 1.3);

    @include mobile {
      font-size: 16px;
      text-transform: none;
    }
    @include large {
      font-size: 1.15em;
    }
  }
  &__title {
    @include font(50px, $dark, 700, 1.2);
    letter-spacing: -1.5px;
    @include air {
      font-size: 40px;
    }
    @include phablet {
      font-size: 36px;
    }
    @include mobile {
      font-size: 28px;
      text-transform: none;
    }
    @include large {
      font-size: 3em;
    }
  }
}

.products {
  @include monitor {
    width: 90%;
    margin: 0 auto;
  }

  &__wrapper {
    padding: 20px;
    background-color: $ivory;
    border-radius: 30px;
    @include large {
      padding: 2vh;
      border-radius: 3vh;
    }
  }
}

.card-wrap {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 30px 20px;
  height: auto;
  @media only screen and (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @include mobile {
    grid-template-columns: 1fr;
    gap: 30px;
  }
  @include large {
    grid-template-columns: repeat(4, 1fr);
    gap: 2vh;
  }
}
.filters {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 14px;
  padding: 10px;
  margin: 30px 0;
  border-radius: 90px;
  background: rgba(216, 207, 173, 0.2);

  @include phablet {
    border-radius: 20px;
  }
  @include large {
    gap: 1.5vh;
    margin: 3vh 0;
    padding: 1vh;
    border-radius: 9vh;
  }

  &__wrap {
    text-align: center;
  }
  &__item {
    position: relative;
    padding: 8px 16px;
    border-radius: 100px;
    border: 1px solid $ivory;
    font-family: Ubuntu Mono;
    @include font(24px, $ivory, 700, 1);
    cursor: pointer;
    transition: 0.2s ease-in-out;

    @include tablet {
      font-size: 18px;
    }
    @include mobile {
      font-size: 16px;
    }
    @include large {
      padding: 0.75vh 1.5vh;
      border-radius: 10vh;
      font-size: 1.25em;
    }
    &.active {
      background: $ivory;
      color: $dark;
    }
    @media only screen and (min-width: 1101px) {
      & {
        &:hover {
          background: $dark-2;
          color: $ivory;
        }
      }
    }
  }
}
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.disabled {
  opacity: 0.5;
}
</style>
