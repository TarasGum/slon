<script lang="ts" setup>
import { useDarkStore } from "~/stores/dark";
import AddProducts from "./add-products.vue";
import { useOrdersStore } from "~/stores/order";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { toast, useToast } from "@/components/ui/toast/use-toast";
import OrderItem from "./order-item.vue";
const token = useCookie("token");
const props = defineProps<{ order: Order }>();
const dark = "dark";
const orderStore = useOrdersStore();
const emit = defineEmits<{ close: any }>();
const customersData = computed(() => orderStore.customers);

const customerSearch = ref("");

const handleCustomerSearch = () => {
  orderStore.handleCustomerSearch(customerSearch.value);
};
const darkStore = useDarkStore();

const newOrderStatus = ref<string | null>(props.order.status);
const newOrderClient = ref<any>(props.order.customer);
const newOrderMessage = ref<string | number | undefined>(
  props.order.comments[0]?.text
);
const newOrderItems = ref<any[]>(
  JSON.parse(JSON.stringify(props.order.order_items))
);
const itemsInNewOrder = ref<Product[] | any[]>([]);
const cities = ref<any[]>([]);
const selectedCity = ref("Обери населенний пункт") as Ref<any>;
const selectedDepartment = ref("Обери відділення / поштомат") as Ref<string>;
const shippingType = ref(
  props.order.waybill === "САМОВИВІЗ З МІСТА РІВНЕ" ? "self" : "np"
) as Ref<any>;
const selectedRegion = ref<string | undefined>(undefined);
const departments = ref<string[]>([]);
const cityName = ref("") as Ref<string>;
const addToOrderItems = (items: OrderItem[]) => {
  newOrderItems.value = [...items];
};
const removeFromOrderItems = (variantId: number) => {};

const getQtyOfItem = (id: number) => {
  const existingItemIndex = newOrderItems.value.findIndex(
    (item) => item.id === id
  );
  return newOrderItems.value[existingItemIndex]?.amount;
};

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
  if (!selectedCity.value.modifyName) {
    return "САМОВИВІЗ З МІСТА РІВНЕ";
  } else if (shippingType.value.title === "САМОВИВІЗ З МІСТА РІВНЕ") {
    return shippingType.value.title;
  } else {
    if (selectedCity.value && selectedDepartment.value) {
      return `${selectedCity.value.modifyName}, ${selectedDepartment.value}`;
    }
  }

  return shippingType.value;
});

const getOrder = async () => {
  postAllItems();
  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/orders/${props.order.id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({
        customer: newOrderClient.value.id,
        status: newOrderStatus.value,
        waybill: changeShipping ? shippingAddress.value : undefined,
      }),

      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token.value}`,
      },
      onResponse: async ({ response }) => {
        if (response.status === 200) {
          if (props.order.comments[0].id) {
            await $fetch(
              `https://api.slooon.shop/api/comments/${props.order.comments[0].id}/`,
              {
                method: "PATCH",
                body: JSON.stringify({
                  text: newOrderMessage.value,
                }),

                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Token ${token.value}`,
                },
              }
            );
          } else {
            await $fetch(`https://api.slooon.shop/api/comments/`, {
              method: "POST",
              body: JSON.stringify({
                order: props.order.id,
                text: newOrderMessage.value,
              }),

              headers: {
                "Content-Type": "application/json",
                Authorization: `Token ${token.value}`,
              },
            });
          }
          toast({ title: "Замовлення успішно змінене" });
        } else {
          toast({ variant: "destructive", title: "Щось пішло не так" });
        }
      },
    }
  );
  refreshNuxtData();
  clearOrderData();
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
const deleteOrder = async (id: number) => {
  let idToDelete = 0;
  props.order.order_items.forEach((element) => {
    if (element.variant.id === id) {
      idToDelete = element.id;
    }
  });
  await $fetch(`https://api.slooon.shop/api/order-items/${idToDelete}/`, {
    method: "DELETE",
    headers: {
      Authorization: `Token ${token.value}`,
    },
  });
};
const clearOrderData = () => {
  newOrderStatus.value = null;
  newOrderClient.value = null;
  newOrderMessage.value = undefined;
  newOrderItems.value = [];

  cities.value = [];
  shippingType.value = null;
  selectedDepartment.value = "Обери відділення / поштомат";
  departments.value = [];
  cityName.value = "";
};
const postAllItems = async () => {
  console.log(props.order.order_items);

  for (const item of newOrderItems.value) {
    console.log(item);
    // Шукаємо відповідний індекс елемента в props.order.order_items
    const existingItemIndex = props.order.order_items.findIndex(
      (oldItem) => oldItem.variant.id === item.variant.id
    );
    console.log(existingItemIndex);

    // Якщо елемент не знайдено, відправляємо POST запит
    if (existingItemIndex === -1) {
      await fetch(`https://api.slooon.shop/api/order-items/`, {
        method: "POST",
        body: JSON.stringify({
          order: props.order.id,
          variant: item.variant.id,
          price: item.variant.price,
          quantity: item.quantity,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token.value}`,
        },
      });
    }
  }
};
const isOrderValid = computed(() => {
  const isOrderInfoValid =
    newOrderStatus.value &&
    newOrderClient.value &&
    newOrderItems.value.length > 0 &&
    shippingType.value;

  // const isNotNpShipping = shippingType.value !== "np";
  // const isNpShippingValid =
  //   shippingType.value === "np" &&
  //   selectedDepartment.value !== "Обери відділення / поштомат" &&
  //   cityName.value !== "";

  return isOrderInfoValid;
  // return isOrderInfoValid && (isNpShippingValid || isNotNpShipping);
});
const changeOrderItem = async (qty: number, id: number, item: any) => {
  if (item.title) {
    props.order.order_items.forEach((element) => {
      if (element.variant.id === item.variant.id) {
        id = element.id;
      }
    });
  }

  try {
    const { data: orderItemsData }: { data: any } = await $fetch(
      `https://api.slooon.shop/api/order-items/${id}/`,
      {
        method: "PATCH",
        body: {
          quantity: qty,
        },
        headers: {
          Authorization: `Token ${token.value}`,
        },
      }
    );
  } catch (error) {
    // Handle error for individual variant update
    console.error("Error updating variant:", error);
  }
};
const deleteItem = (id: number, vId: number) => {
  newOrderItems.value = newOrderItems.value.filter(
    (item: OrderItem) => item.variant.id !== vId
  );
};
const open = ref(false);
const commandValue = ref("");
const clientName = ref(
  props.order.customer.last_name +
    " " +
    props.order.customer.first_name +
    " " +
    props.order.customer.surname +
    "(ID:" +
    props.order.customer.id +
    ")"
);
const isOpen = ref(false);
const changeShipping = ref(false);
</script>

<template>
  <div>
    <Sheet
      :open="isOpen"
      @update:open="
        (value) => {
          if (!value) {
            isOpen = false;
            emit('close');
          }
        }
      ">
      <SheetTrigger as-child>
        <div @click.stop="isOpen = true">
          <div
            class="flex justify-center items-center text-sm cursor-pointer w-8 h-8 rounded-[10px] transition hover:bg-muted transitions">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none">
              <path
                d="M13.1066 7.98024L11.9281 6.80173L4.16667 14.5632V15.7417H5.34517L13.1066 7.98024ZM14.2851 6.80173L15.4636 5.62322L14.2851 4.4447L13.1066 5.62322L14.2851 6.80173ZM6.03553 17.4083H2.5V13.8728L13.6958 2.67694C14.0213 2.3515 14.5489 2.3515 14.8743 2.67694L17.2314 5.03396C17.5568 5.35939 17.5568 5.88704 17.2314 6.21247L6.03553 17.4083Z"
                fill="#D4D4D4" />
            </svg>
          </div>
        </div>
      </SheetTrigger>
      <SheetContent
        class="bg-[#23232381] backdrop-blur-[5.5px] !min-w-[70vw] max-sm:!min-w-[100vw] border rounded-s-3xl py-2 dark pt-8 text-primary">
        <SheetHeader class="mb-10">
          <SheetTitle>Змінити замовлення {{ order.id }}</SheetTitle>
        </SheetHeader>
        <div class="h-[75vh] overflow-scroll pr-4 pl-1 pb-5">
          <div class="flex justify-between w-full">
            <Popover v-model:open="open">
              <PopoverTrigger class="w-[30%]">
                <Button
                  variant="outline"
                  role="combobox"
                  :aria-expanded="open"
                  class="w-full">
                  <div>
                    {{ clientName }}
                  </div></Button
                >
              </PopoverTrigger>
              <PopoverContent class="bg-background mt-2 w-full border dark">
                <Command v-model="commandValue">
                  <!-- <CommandInput
                    v-model="customerSearch"
                    @input="handleCustomerSearch"
                    type="text"
                    placeholder="Пошук клієнтів" /> -->

                  <div class="mt-2">
                    <input
                      v-model="customerSearch"
                      @input="handleCustomerSearch"
                      type="text"
                      class="border w-full px-2 bg-background rounded"
                      placeholder="Введіть імʼя користувача" />
                  </div>

                  <CommandGroup class="my-2"
                    ><div
                      class="flex justify-center items-center"
                      v-if="!customersData || customersData.length === 0">
                      Клієнтів не знайдено.
                    </div>
                    <CommandItem
                      v-for="customer in customersData"
                      :key="customer.id"
                      class="hover:bg-muted cursor-pointer transition-all"
                      :value="'' + customer.id"
                      @click="
                        (newOrderClient = customer.id),
                          (clientName =
                            customer.last_name +
                            ' ' +
                            customer.first_name +
                            ' ' +
                            customer.surname +
                            '(ID:' +
                            customer.id +
                            ')'),
                          (open = false)
                      ">
                      {{ customer.last_name }} {{ customer.first_name }}
                      {{ customer.surname }} (ID:{{ customer.id }})
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
            <Select :default-value="newOrderStatus as string">
              <SelectTrigger class="w-[180px]">
                <SelectValue placeholder="Статус замовлення" />
              </SelectTrigger>
              <SelectContent class="bg-background border dark">
                <SelectGroup class="my-2">
                  <SelectItem
                    class="hover:bg-muted transition-all"
                    @click="newOrderStatus = 'raw'"
                    value="raw">
                    НЕ ОПРАЦЬОВАНИЙ
                  </SelectItem>
                  <SelectItem
                    class="hover:bg-muted transition-all"
                    @click="newOrderStatus = 'completed'"
                    value="completed">
                    ВИКОНАНИЙ
                  </SelectItem>
                  <SelectItem
                    class="hover:bg-muted transition-all"
                    @click="newOrderStatus = 'failed'"
                    value="failed">
                    НЕУСПІШНИЙ
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div class="mt-5">
            <h2 class="text-lg mb-1">Коментар</h2>
            <Textarea
              v-model="newOrderMessage"
              placeholder="Введіть коментар" />
          </div>

          <OrderItem
            v-for="item in newOrderItems"
            :key="item.id"
            :item="item"
            :qty="item.quantity"
            :isOpenDialog="true"
            @minus="
              () => {
                --item.quantity;
              }
            "
            @plus="
              () => {
                ++item.quantity;
              }
            "
            @itemQtyData="changeOrderItem"
            @delete-item="deleteItem" />
          <!-- <div
            v-for="item in itemsInNewOrder"
            :key="item.variantId"
            class="items-center my-5 gap-5 grid grid-cols-[80px_6fr_1.5fr_3fr_2fr_80px]">
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

            <div>
              <div>{{ item.year }} | Категорія: {{ item.category.name }}</div>
              <div>{{ item.title }}</div>
            </div>
            <div class="border py-1 px-2 rounded">
              {{ item.weight }}
            </div>

            <div>
              {{ getQtyOfItem(item.variantId) }} шт / {{ item.inventory }} шт
            </div>
            <div>{{ getQtyOfItem(item.variantId) * item.price }} грн</div>
            <Button @click="removeFromOrderItems(item.variantId)"
              >Видалити</Button
            >
          </div> -->
          <AddProducts
            @emit-res="addToOrderItems"
            just-increase
            @delete-item="deleteOrder"
            :current-items="newOrderItems" />
          <div>
            <h2 class="text-lg mt-5">Тип доставки</h2>
            <div v-if="!changeShipping">
              <div v-if="order.waybill === 'САМОВИВІЗ З МІСТА РІВНЕ'">
                {{ order.waybill }}
              </div>
              <div v-else>
                Доставка новою поштою за адресою: {{ order.waybill }}
              </div>
            </div>
            <Button
              v-if="!changeShipping"
              variant="outline"
              @click="changeShipping = true"
              class="mt-4 mb-2 hover:bg-transparent w-full hover:brightness-150">
              Змінити доставку
            </Button>
            <div v-if="changeShipping">
              <Button
                v-if="changeShipping"
                @click="changeShipping = false"
                variant="outline"
                class="mt-4 mb-2 hover:bg-transparent w-full hover:brightness-150">
                Відмінити зміни
              </Button>
              <Select :default-value="shippingType">
                <SelectTrigger class="mt-1">
                  <SelectValue placeholder="Виберіть тип доставки" />
                </SelectTrigger>
                <SelectContent class="bg-background border dark">
                  <SelectGroup>
                    <SelectItem
                      class="hover:bg-muted transition-all my-2"
                      v-for="d in deliveries.slice(1)"
                      :key="d.id"
                      :value="d.slug"
                      @click="shippingType = d.slug">
                      {{ d.title }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>

              <div v-if="shippingType === 'np'" class="mt-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Виберіть місто" />
                  </SelectTrigger>
                  <SelectContent class="bg-background border py-2 dark">
                    <div class="my-2">
                      <input
                        v-model="cityName"
                        @input="handleInput"
                        type="text"
                        class="border w-full bg-background px-2 rounded"
                        placeholder="Введіть назву населенного пункту" />
                    </div>
                    <SelectGroup class="bg-background border dark">
                      <SelectItem
                        class="checkout-select-item hover:bg-muted transition-all mt-2"
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
                    class="mt-2">
                    <SelectValue
                      placeholder="Виберіть відділення"
                      class="checkout-select-value" />
                  </SelectTrigger>
                  <SelectContent class="bg-background border py-2 dark">
                    <div class="my-2">
                      <input
                        v-model="searchQuery"
                        type="text"
                        class="border w-full bg-background px-2 rounded"
                        placeholder="Пошук відділення" />
                    </div>
                    <SelectGroup class="checkout-select-wrapper">
                      <SelectItem
                        class="checkout-select-item hover:bg-muted transition-all mt-2"
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
            </div>
          </div>
        </div>

        <SheetFooter class="border-t">
          <DialogClose as-child>
            <Button @click="getOrder" class="mt-4 mb-2"> Змінити </Button>
          </DialogClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  </div>
</template>
