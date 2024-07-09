<script setup lang="ts">
import { computed, reactive, ref, onMounted } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, email } from "@vuelidate/validators";
import { useCartStore } from "~/stores/cart";
import type { CartItem } from "~/stores/cart/types";

definePageMeta({
  layout: "no-cart-badge",
});

const stateForm = reactive({
  email: "" as string,
});
const rules = reactive({
  email: { required, email } as { required: any; email: any },
});
const v$ = useVuelidate(rules, stateForm);
const cartStore = useCartStore();

const cartItems = ref<CartItem[]>(cartStore.cartItems);
const cities = ref<any[]>([]);
const selectedCity = ref("Обери населенний пункт") as Ref<any>;
const selectedDepartment = ref("Обери відділення / поштомат") as Ref<string>;
const shippingType = ref("ВИБЕРІТЬ ТИП ДОСТАВКИ") as Ref<any>;
const selectedRegion = ref<string | undefined>(undefined);
const departments = ref<string[]>([]);
const firstName = ref("") as Ref<string>;
const lastName = ref("") as Ref<string>;
const surname = ref("") as Ref<string>;
const message = ref("") as Ref<string>;
const cityName = ref("") as Ref<string>;

let debounceTimer: NodeJS.Timeout;
const handleInput = () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    getNPCities();
  }, 500); // Таймер дебаунсу - 500 мілісекунд
};
const getNPCities = async () => {
  try {
    if (cityName.value) {
      const { data: NPCities }: { data: any } = await useFetch(
        "https://api.novaposhta.ua/v2.0/json/",
        {
          method: "POST",
          body: JSON.stringify({
            apiKey: process.env.NOVAPOSHTA_API_KEY,
            modelName: "Address",

            calledMethod: "getCities",
            methodProperties: {
              FindByString: cityName.value,
            },
          }),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      cities.value =
        NPCities.value.data.map((r: any, idx: number) => {
          let modifyName = r.Description.split(" (")[0];
          modifyName = `${modifyName} - (${r.AreaDescription} обл.)`;

          return {
            Description: `${r.Description.split(" (")[0]}-${idx}`,
            Ref: r.Ref,
            AreaDescription: r.AreaDescription,
            modifyName: modifyName,
          };
        }) || [];
    }
  } catch (error) {
    console.error("Error fetching Nova Poshta cities:", error);
  }
};

const phone = ref("") as Ref<string>;
const deliveries = ref([
  { id: "01", title: "ВИБЕРІТЬ ТИП ДОСТАВКИ", slug: "none" },
  { id: "02", title: "САМОВИВІЗ З МІСТА РІВНЕ", slug: "self" },
  { id: "03", title: "ДОСТАВКА НОВОЮ ПОШТОЮ", slug: "np" },
]);

const chooseDep = async (newCity: any) => {
  selectedCity.value = newCity;
  selectedDepartment.value = "Обери відділення / поштомат";
  try {
    const { data: NPDep }: { data: any } = await useFetch(
      "https://api.novaposhta.ua/v2.0/json/",
      {
        method: "POST",
        body: JSON.stringify({
          apiKey: process.env.NOVAPOSHTA_API_KEY,
          modelName: "Address",
          calledMethod: "getWarehouses",
          methodProperties: {
            CityRef: selectedCity.value.Ref,
            FindByString: selectedCity.value.name,
          },
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    departments.value = NPDep?.value.data.map((r: any) => r.Description);
  } catch (error) {
    console.error("Error fetching Nova Poshta departments:", error);
  }
};
const selectDepartment = (department: string) => {
  selectedDepartment.value = department;
};

const shippingAddress = computed(() => {
  if (shippingType.value.title === "САМОВИВІЗ З МІСТА РІВНЕ") {
    return shippingType.value.title;
  } else {
    if (selectedCity.value && selectedDepartment.value) {
      return `${selectedCity.value.modifyName}, ${selectedDepartment.value}`;
    }
  }
  return shippingType.value;
});

const getOrder = async () => {
  const result = await v$.value.$validate();

  if (result) {
    const { data }: { data: any } = await $fetch(
      `https://api.slooon.shop/api/customers/`,
      {
        method: "POST",
        body: JSON.stringify({
          last_name: lastName.value,
          first_name: firstName.value,
          surname: surname.value,
          phone: phone.value
            .replaceAll(" ", "")
            .replaceAll("(", "")
            .replaceAll(")", ""),
          email: stateForm.email,
        }),
        onResponse: async ({ response }) => {
          const order_items = cartItems.value.map((e) => {
            return { id: e.variants[e.currentVariant].id, amount: e.qty };
          });

          const { data }: { data: any } = await $fetch(
            `https://api.slooon.shop/api/orders/`,
            {
              method: "POST",
              body: JSON.stringify({
                customer: response._data.id,
                status: "raw",
                waybill: shippingAddress.value,
                order_items,
              }),
              onResponse: async ({ response }) => {
                const { data: messageData }: { data: any } = await $fetch(
                  `https://api.slooon.shop/api/comments/`,
                  {
                    method: "POST",
                    body: JSON.stringify({
                      order: response._data.id,
                      text: message.value,
                    }),

                    headers: {
                      "Content-Type": "application/json",
                    },
                  }
                );
              },
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    navigateTo("/");
    cartStore.clearCart();
  }
};

const searchQuery = ref("") as Ref<string>;

const filteredDepartments = computed(() => {
  if (!searchQuery.value) {
    return departments.value;
  }
  const searchTerm = searchQuery.value.toLowerCase();
  return departments.value.filter((department) =>
    department.toLowerCase().includes(searchTerm)
  );
});
</script>

<template>
  <div class="container">
    <div class="cart__wrapper">
      <div v-if="cartItems && cartItems.length">
        <div class="cart__heading">
          <NuxtLink to="/cart" class="title__wrapper">
            <img src="@/assets/images/arrow-back.svg" alt="arrow icon" />
            <div class="title">Оформлення замовлення</div>
          </NuxtLink>
          <NuxtLink to="/cart" class="cart__close" @click="$router.back()">
            <img
              src="@/assets/images/close.svg"
              alt="close icon"
              class="cart__icon" />
          </NuxtLink>
        </div>
        <div class="blocks">
          <div class="block block--dark">
            <h2 class="subtitle">1. Контактні дані</h2>
            <div class="inputs">
              <input
                v-model="firstName"
                type="text"
                class="input"
                placeholder="Ваше Ім’я" />
              <input
                v-model="lastName"
                type="text"
                class="input"
                placeholder="ваше ПРІЗВИЩЕ" />
              <input
                v-model="surname"
                type="text"
                class="input"
                placeholder="ваше по-батькові" />
              <input
                v-model="phone"
                v-maska
                data-maska="+380 (##) ### ####"
                type="tel"
                class="input"
                placeholder="ВАШ ТЕЛЕФОН" />
              <input
                v-model="stateForm.email"
                type="email"
                class="input"
                placeholder="ВАШ EMAIL" />

              <div v-if="v$.$errors.length > 0" class="form__error">
                введіть коректний email
              </div>
            </div>
          </div>

          <div class="block block--dark">
            <h2 class="subtitle">2. Доставка</h2>
            <div class="inputs">
              <select v-model="shippingType" class="input input--select">
                <option
                  v-for="d in deliveries.slice(0, 1)"
                  :key="d.id"
                  disabled>
                  {{ d.title }}
                </option>
                <option v-for="d in deliveries.slice(1)" :key="d.id" :value="d">
                  {{ d.title }}
                </option>
              </select>
              <div v-if="shippingType.slug === 'self'" class="green">
                <img src="@/assets/images/smile.svg" alt="icon smile" />
                СУПЕР! МИ Зв’яжемось з вами найближчим часом для узгодження
                деталей
                <img src="@/assets/images/smile.svg" alt="icon smile" />
              </div>

              <div v-else-if="shippingType.slug === 'np'" class="inputs__row">
                <Select class="checkout-select overflow-scroll">
                  <SelectTrigger class="checkout-select-trigger">
                    <SelectValue
                      :placeholder="selectedCity"
                      class="checkout-select-value" />
                  </SelectTrigger>
                  <SelectContent class="checkout-select-content">
                    <div class="input__wrapper">
                      <input
                        v-model="cityName"
                        @input="handleInput"
                        type="text"
                        class="select_filter"
                        placeholder="Введіть назву населенного пункту" />
                    </div>
                    <SelectGroup class="checkout-select-wrapper">
                      <SelectItem
                        class="checkout-select-item"
                        :class="{
                          checkout_select_item_active: city === selectedCity,
                        }"
                        @touchstart="chooseDep(city)"
                        @click="chooseDep(city)"
                        v-for="city in cities"
                        :key="city.CityID"
                        :value="city.Description">
                        {{ city.modifyName }}
                      </SelectItem>
                      <div v-if="cityName && (!cities || !cities.length)">
                        Міст не знайдено
                      </div>
                    </SelectGroup>
                  </SelectContent>
                </Select>

                <Select :key="selectedCity">
                  <SelectTrigger
                    :disabled="departments.length === 0"
                    class="checkout-select-trigger">
                    <SelectValue
                      :placeholder="selectedDepartment"
                      class="checkout-select-value" />
                  </SelectTrigger>
                  <SelectContent class="checkout-select-content">
                    <div class="input__wrapper">
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="select_filter"
                        placeholder="Пошук відділення" />
                    </div>
                    <SelectGroup class="checkout-select-wrapper">
                      <SelectItem
                        class="checkout-select-item"
                        :class="{
                          checkout_select_item_active:
                            department === selectedDepartment,
                        }"
                        v-for="(department, idx) in filteredDepartments"
                        :key="idx"
                        @click="selectDepartment(department)"
                        :value="department">
                        {{ department }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>

              <textarea
                v-model="message"
                class="input input--textarea"
                placeholder="КОМЕНТАР ДО ЗАМОВЛЕННЯ"></textarea>
            </div>
          </div>
        </div>

        <div class="cart__btn">
          <div
            class="btn btn--dark"
            :disabled="!firstName || !lastName || !phone || !shippingAddress"
            @click="getOrder()">
            ПІДТВЕДЖЕННЯ ЗАМОВЛЕННЯ
          </div>
        </div>
      </div>

      <div v-else>
        <div class="cart__heading">
          <div class="title">ваша корзина пуста</div>
          <NuxtLink to="/" class="cart__close">
            <img
              src="@/assets/images/close.svg"
              alt="close icon"
              class="cart__icon" />
          </NuxtLink>
        </div>

        <NuxtLink to="/" class="btn btn--dark">ПОВЕРНУТИСЬ ДО ПОКУПОК</NuxtLink>
        <NuxtLink to="/" class="btn btn--dark">ПОВЕРНУТИСЬ ДО ПОКУПОК</NuxtLink>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "@/assets/scss/variables";

.checkout-select-trigger {
  border-radius: 12px;
  border: 1px solid $beige;
  background: $beige;
  height: 70px;
  transition: 0.3s ease-in-out;
  min-width: 100px;
  &:hover,
  &:active {
    border-color: transparent;
  }
  display: flex;
  align-items: center;
  padding: 0 24px 0 30px;
  margin-right: 5px;
  font-family: "Anonymous Pro", monospace;
  @include font(30px, #8c8d7c, 700, 1);
  border-radius: 12px;

  @include tablet {
    height: 60px;
    font-size: 24px;
  }
  @include phablet {
    font-size: 20px;
  }
  @include mobile {
    height: 44px;
    padding: 0 0px 0 14px;
  }
  @include large {
    height: 2.5vw;
    padding: 0 0.75vw;
    border-radius: 1vh;
    font-size: 1em;
  }
}

.checkout-select-value {
  padding-left: 1px;
}

.checkout-select-wrapper {
  background: $beige;
}
.checkout-select-item {
  height: 50px;
  font-size: 100%;
  @include phablet {
    width: calc(var(--radix-select-trigger-width) - 20px);
  }

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
@media (max-width: 370px) {
  .checkout-select-item {
    height: 100%;
  }
}
.input__wrapper {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  z-index: 5;
  background: $beige;
  height: 60px;
  padding-top: -15px;
}
.select_filter {
  width: 100%;

  border-radius: 5px;
  padding: 5px;
  height: 40px;
  margin-bottom: 5px;
}
.checkout_select_item_active {
  background-color: rgba(255, 255, 255, 0.665);
}

.green {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 14px 30px;
  border-radius: 12px;
  background: $light-green;
  @include font(30px, $dark, 700, 1);
  text-align: center;

  @include tablet {
    font-size: 22px;
  }

  & img {
    width: 24px;
    object-fit: contain;
  }
}
</style>
