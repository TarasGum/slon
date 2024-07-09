<script setup lang="ts">
import { useDarkStore } from "~/stores/dark";
import { useCategoriesStore } from "~/stores/categories";
import { useUserStore } from "~/stores/user";

const body = document.querySelector("body");
if (body !== null) {
  body.style.backgroundColor = "#191919";
}

const userStore = useUserStore();
const token = useCookie("token");
const logout = async () => {
  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/api-token-logout/`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token.value}`,
      },
      onResponse: async ({ response }) => {
        if (response.status === 401) {
          const { data }: { data: any } = await $fetch(
            `https://api.slooon.shop/api/api-token-logout/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token.value}`,
              },
            }
          );
          token.value = undefined;
          userStore.loggedUserOut();
          navigateTo("/");
          if (body !== null) {
            body.style.backgroundColor = "#212726";
          }
        }
      },
    }
  );
  token.value = undefined;
  userStore.loggedUserOut();
  navigateTo("/");
  if (body !== null) {
    body.style.backgroundColor = "#212726";
  }
};

const categoriesStore = useCategoriesStore();

const { data: categories }: { data: Ref<Category[] | null> } = await useAPI(
  "/categories/",
  {
    onResponse: ({ response }) => {
      if (response.status === 401) {
        token.value = undefined;
        userStore.loggedUserOut();
        navigateTo("/login");
      }
    },
  }
);
categoriesStore.addCategories(categories.value);

import { useOrdersStore } from "~/stores/order";

const orderStore = useOrdersStore();

const queryCustomer = computed(() => {
  return orderStore.customerSearchQuery;
});

const queryCategories = computed(() => {
  if (orderStore.activeCategory === "all") {
    return "";
  } else return orderStore.activeCategory;
});

const { data: customersData }: { data: any } = await useAPI("/customers/", {
  query: { search: queryCustomer },
  onResponse: ({ response }) => {
    orderStore.addCustomers(response._data);
    if (response.status === 401) {
      token.value = undefined;
      userStore.loggedUserOut();
      navigateTo("/login");
    }
  },
});

const queryProduct = computed(() => {
  return orderStore.productSearchQuery;
});

const { data: productsData }: { data: any } = await useAPI("/products/", {
  query: { search: queryProduct, categories: queryCategories },
  onResponse: ({ response }) => {
    orderStore.addProducts(response._data);

    if (response.status === 401) {
      token.value = undefined;
      userStore.loggedUserOut();
      navigateTo("/login");
    }
  },
});
const darkStore = useDarkStore();
const router = useRouter();
const isShow = computed(() => {
  if (router.currentRoute.value.name === "login") return false;
  else return true;
});
</script>

<template>
  <!-- <div class="h-[100vh] bg-black w-full fixed overflow-scroll"> -->
  <div
    class="bg-[var(--Black)] p-[30px] dark text-primary min-h-[100vh] min-w-100vw max-sm:p-2 pr-7 pb-10 w-full flex max-sm:flex-col">
    <div
      v-if="isShow"
      class="flex w-[245px] mr-5 p-[14px] gap-2.5 flex-col h-[95vh] justify-between items-center rounded-[20px] border border-[#2C2C2C] bg-[#202020]">
      <NuxtLink
        to="/admin/orders"
        :class="{
          'border-[var(--green)] bg-[#191919]':
            $router.currentRoute.value.fullPath === '/admin/orders',
          'hover:bg-[var(--Grey-Dark)]':
            $router.currentRoute.value.fullPath !== '/admin/orders',
        }"
        class="border w-full translate-z bg-[#161616] rounded-lg py-1 px-2">
        <div class="flex gap-4 items-center">
          <div
            class="w-5 h-5 flex justify-center items-center rounded-sm bg-[var(--green)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none">
              <path
                d="M5.25 3.50001C5.25 2.53351 6.03347 1.75001 7 1.75001C7.96652 1.75001 8.75 2.53351 8.75 3.50001H5.25ZM4.08333 3.50001H2.33333C2.01117 3.50001 1.75 3.76118 1.75 4.08334V12.25C1.75 12.5722 2.01117 12.8333 2.33333 12.8333H11.6667C11.9888 12.8333 12.25 12.5722 12.25 12.25V4.08334C12.25 3.76118 11.9888 3.50001 11.6667 3.50001H9.91667C9.91667 1.88918 8.61082 0.583344 7 0.583344C5.38917 0.583344 4.08333 1.88918 4.08333 3.50001ZM5.25 5.83334C5.25 6.79987 6.03347 7.58334 7 7.58334C7.96652 7.58334 8.75 6.79987 8.75 5.83334H9.91667C9.91667 7.44416 8.61082 8.75001 7 8.75001C5.38917 8.75001 4.08333 7.44416 4.08333 5.83334H5.25Z"
                fill="#DBDBDB" />
            </svg>
          </div>
          <h2>Замовлення</h2>
        </div>
      </NuxtLink>
      <NuxtLink
        to="/admin/products"
        :class="{
          'border-[var(--blue)] bg-[#191919]':
            $router.currentRoute.value.fullPath === '/admin/products',
          'hover:bg-[var(--Grey-Dark)]':
            $router.currentRoute.value.fullPath !== '/admin/products',
        }"
        class="border w-full translate-z bg-[#161616] rounded-lg py-1 px-2"
        ><div class="flex gap-4 items-center">
          <div
            class="w-5 h-5 rounded-sm flex justify-center items-center bg-[var(--blue)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none">
              <path
                d="M1.74996 5.83333H12.25V11.6692C12.25 11.99 11.9904 12.25 11.6705 12.25H2.32944C2.0094 12.25 1.74996 11.9905 1.74996 11.6692V5.83333ZM5.24996 7V8.16667H8.74996V7H5.24996ZM1.16663 2.33322C1.16663 2.01112 1.43222 1.75 1.74518 1.75H12.2547C12.5743 1.75 12.8333 2.00884 12.8333 2.33322V4.66667H1.16663V2.33322Z"
                fill="#DBDBDB" />
            </svg>
          </div>
          <h2>Товари</h2>
        </div></NuxtLink
      >
      <NuxtLink
        to="/admin/customers"
        class="border w-full translate-z bg-[#161616] rounded-lg py-1 px-2"
        :class="{
          'border-[var(--sand)] bg-[#191919]':
            $router.currentRoute.value.fullPath === '/admin/customers',
          'hover:bg-[var(--Grey-Dark)]':
            $router.currentRoute.value.fullPath !== '/admin/customers',
        }"
        ><div class="flex w-full gap-4 items-center">
          <div
            class="w-5 h-5 rounded-sm flex justify-center items-center bg-[var(--sand)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none">
              <path
                d="M1.16663 12.8333C1.16663 10.256 3.25596 8.16668 5.83329 8.16668C8.41063 8.16668 10.5 10.256 10.5 12.8333H1.16663ZM5.83329 7.58334C3.89954 7.58334 2.33329 6.01709 2.33329 4.08334C2.33329 2.14959 3.89954 0.583344 5.83329 0.583344C7.76704 0.583344 9.33329 2.14959 9.33329 4.08334C9.33329 6.01709 7.76704 7.58334 5.83329 7.58334ZM10.1283 8.88604C11.9281 9.346 13.2812 10.9221 13.4071 12.8333H11.6666C11.6666 11.311 11.0834 9.92478 10.1283 8.88604ZM8.94835 7.5582C9.90076 6.70379 10.5 5.46355 10.5 4.08334C10.5 3.25656 10.2849 2.48 9.90782 1.80652C11.2439 2.07316 12.25 3.25189 12.25 4.66668C12.25 6.27813 10.9448 7.58334 9.33329 7.58334C9.2028 7.58334 9.07429 7.57477 8.94835 7.5582Z"
                fill="#DBDBDB" />
            </svg>
          </div>
          <h2>Клієнти</h2>
        </div></NuxtLink
      >
      <NuxtLink
        to="/admin/categories"
        :class="{
          'border-[var(--seeblue)] bg-[#191919]':
            $router.currentRoute.value.fullPath === '/admin/categories',
          'hover:bg-[var(--Grey-Dark)]':
            $router.currentRoute.value.fullPath !== '/admin/categories',
        }"
        class="border w-full translate-z bg-[#161616] rounded-lg py-1 px-2"
        ><div class="flex gap-4 items-center">
          <div
            class="w-5 h-5 rounded-sm flex justify-center items-center bg-[var(--seeblue)]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none">
              <path
                d="M12.8333 7.58275V11.6667C12.8333 11.9888 12.5721 12.25 12.25 12.25H7.58329V7.58275H12.8333ZM6.41663 7.58275V12.25H1.74996C1.4278 12.25 1.16663 11.9888 1.16663 11.6667V7.58275H6.41663ZM6.41663 1.75V6.41608H1.16663V2.33333C1.16663 2.01117 1.4278 1.75 1.74996 1.75H6.41663ZM12.25 1.75C12.5721 1.75 12.8333 2.01117 12.8333 2.33333V6.41608H7.58329V1.75H12.25Z"
                fill="#DBDBDB" />
            </svg>
          </div>
          <h2>Категорії</h2>
        </div></NuxtLink
      >
      <div
        @click="logout"
        class="border w-full text-[var(--Grey)] hover:bg-[var(--Grey-Dark)] transition-all cursor-pointer rounded-lg mt-auto flex gap-4 items-center bg-[#191919] p-2.5 justify-between h-10">
        <h2>вихід</h2>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none">
          <g clip-path="url(#clip0_397_2110)">
            <path
              d="M9.99996 18.3333C5.39758 18.3333 1.66663 14.6023 1.66663 9.99999C1.66663 5.39761 5.39758 1.66666 9.99996 1.66666C12.726 1.66666 15.1464 2.97564 16.6668 4.99935L14.409 4.99941C13.2339 3.96248 11.6904 3.33332 9.99996 3.33332C6.31806 3.33332 3.33329 6.31809 3.33329 9.99999C3.33329 13.6819 6.31806 16.6667 9.99996 16.6667C11.6908 16.6667 13.2346 16.0372 14.4099 14.9998H16.6674C15.147 17.024 12.7264 18.3333 9.99996 18.3333ZM15.8333 13.3333V10.8333H9.16663V9.16666H15.8333V6.66666L20 9.99999L15.8333 13.3333Z"
              fill="#9B9B9B" />
          </g>
          <defs>
            <clipPath id="clip0_397_2110">
              <rect width="20" height="20" fill="white" />
            </clipPath>
          </defs>
        </svg>
      </div>
    </div>
    <div class="w-full">
      <slot />
    </div>
  </div>
  <!-- </div> -->
</template>

<style scoped></style>
