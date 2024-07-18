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
const dark = "dark";
const orderStore = useOrdersStore();

const customersData = computed(() => orderStore.customers);

const customerSearch = ref("");

const handleCustomerSearch = () => {
  orderStore.handleCustomerSearch(customerSearch.value);
};
const darkStore = useDarkStore();

const newOrderStatus = ref();
const newOrderClient = ref();
const newOrderMessage = ref();
const newOrderItems = ref<any[]>([]);
const itemsInNewOrder = ref<Product[] | any[]>([]);
const cities = ref<any[]>([]);
const selectedCity = ref("Обери населенний пункт") as Ref<any>;
const selectedDepartment = ref("Обери відділення / поштомат") as Ref<string>;
const shippingType = ref() as Ref<any>;
const selectedRegion = ref<string | undefined>(undefined);
const departments = ref<string[]>([]);
const cityName = ref("") as Ref<string>;
const addToOrderItems = (items: OrderItem[]) => {
  newOrderItems.value = [...items];
  console.log(newOrderItems.value);
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
  const orderItems = newOrderItems.value.map((i) => {
    return {
      amount: i.quantity,
      id: i.variant.id,
    };
  });

  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/orders/`,
    {
      method: "POST",
      body: JSON.stringify({
        customer: newOrderClient.value,
        status: newOrderStatus.value,
        waybill: shippingAddress.value,
        order_items: orderItems,
      }),

      headers: {
        "Content-Type": "application/json",
      },
      onResponse: async ({ response }) => {
        if (response.status === 201) {
          await $fetch(`https://api.slooon.shop/api/comments/`, {
            method: "POST",
            body: JSON.stringify({
              order: response._data.id,
              text: newOrderMessage.value,
            }),

            headers: {
              "Content-Type": "application/json",
            },
          });
          toast({ title: "Замовлення успішно створене" });
          refreshNuxtData();
          isOpen.value = false;
        } else {
          const errors = Object.values(response._data).flatMap(
            (errorArray) => errorArray
          );

          toast({
            variant: "destructive",
            title: "Щось пішло не так:",
            description: errors.join(","),
          });
        }
      },
    }
  );

  clearData();
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

const isOrderValid = computed(() => {
  const isOrderInfoValid =
    newOrderStatus.value &&
    newOrderClient.value &&
    newOrderItems.value.length > 0 &&
    shippingType.value;

  const isNotNpShipping = shippingType.value !== "np";
  const isNpShippingValid =
    shippingType.value === "np" &&
    selectedDepartment.value !== "Обери відділення / поштомат" &&
    cityName.value !== "";

  return isOrderInfoValid && (isNpShippingValid || isNotNpShipping);
});
const changeOrderItem = async (qty: number, id: number) => {};
const deleteItem = (id: number, vId: number) => {
  newOrderItems.value = newOrderItems.value.filter(
    (item: OrderItem) => item.variant.id !== vId
  );
};
const open = ref(false);
const commandValue = ref("");
const clientName = ref("Виберіть клієнта");
const isOpen = ref(false);

const clearData = () => {
  customerSearch.value = "";
  newOrderStatus.value = null;
  newOrderClient.value = null;
  newOrderMessage.value = null;
  newOrderItems.value = [];
  itemsInNewOrder.value = [];
  cities.value = [];
  selectedCity.value = "Обери населенний пункт";
  selectedDepartment.value = "Обери відділення / поштомат";
  shippingType.value = null;
  selectedRegion.value = undefined;
  departments.value = [];
  cityName.value = "";
  searchQuery.value = "";

  commandValue.value = "";
  clientName.value = "Виберіть клієнта";
};
</script>

<template>
  <div class="text-[var(--Grey)]">
    <Sheet
      :open="isOpen"
      @update:open="
        (value) => {
          if (value) {
            isOpen = true;
            clearData();
          }
          if (!value) {
            isOpen = false;
          }
        }
      ">
      <DialogTrigger as-child>
        <MyButton
          size="md"
          color="--Light-Green"
          iconPosition="left"
          :icon="true">
          Нове замовлення
        </MyButton>
        <!-- <div
          class="border flex max-sm:h-[50px] max-[400px]:text-[20px] gap-3 items-center transition-all translate-z hover:drop-shadow-[3px_4px_0px_var(--green)] border-[var(--green)] bg-background cursor-pointer rounded-3xl text-2xl py-2 pr-5 pl-3">
          <div class="w-5 h-5 border-[#63da9d] border rounded-full">
            <img
              src="@/assets/images/greenplus.svg "
              class="scale-105"
              alt="plus icon" />
          </div>
          <h2>Нове замовлення</h2>
        </div> -->
      </DialogTrigger>
      <SheetContent
        class="bg-[#23232381] backdrop-blur-[5.5px] !min-w-[70vw] max-sm:!min-w-[100vw] border rounded-s-3xl py-2 dark pt-8 text-primary">
        <SheetHeader class="border-b pb-4 mb-5 flex flex-row items-center">
          <SheetTitle class="text-[36px] mr-2.5">Нове ЗАМОВЛЕННЯ</SheetTitle>

          <div>
            <Select>
              <SelectTrigger
                have-no-check
                class="w-[156px] py-2 h-[32px] rounded-[10px] flex items-center justify-center"
                :class="{
                  'rounded-[10px] border shadow-[0px_0px_0px_2px] bg-[#191919]': true,
                  'border-[#23A901] text-[#23A901]  shadow-[#32624A]':
                    newOrderStatus === 'completed',
                  'border-[#9B9B9B] text-[var(-White)]  shadow-[rgba(219,219,219,0.20)]':
                    newOrderStatus === 'raw',
                  'border-[#BE2F2F] text-[#BE2F2F]  shadow-[#662D2D]':
                    newOrderStatus === 'failed',
                }">
                <SelectValue placeholder="Статус замовлення" />
              </SelectTrigger>
              <SelectContent
                class="bg-[rgb(25,25,25)] border-[var(--White)] border h-fit flex flex-col rounded-[14px] gap-[10px]">
                <SelectGroup class="my-2">
                  <SelectItem
                    class="hover:brightness-125 text-[var(--White)] transition-all rounded-[10px] border border-[#9B9B9B] bg-[#191919] shadow-[0px_0px_0px_2px_rgba(219,219,219,0.20)] w-[156px] h-[38px] flex items-center justify-center my-2.5"
                    @click="newOrderStatus = 'raw'"
                    value="raw">
                    НЕ ОПРАЦЬОВАНИЙ
                  </SelectItem>
                  <SelectItem
                    class="hover:brightness-125 text-[#23A901] transition-all rounded-[10px] border border-[#23A901] bg-[#191919] shadow-[0px_0px_0px_2px_#32624A] w-[156px] h-[38px] flex items-center justify-center mb-2.5"
                    @click="newOrderStatus = 'completed'"
                    value="completed">
                    ВИКОНАНИЙ
                  </SelectItem>
                  <SelectItem
                    class="hover:brightness-125 text-[#BE2F2F] text-[var(--White)] transition-all rounded-[10px] border border-[#BE2F2F] bg-[#191919] shadow-[0px_0px_0px_2px_#662D2D] w-[156px] h-[38px] flex items-center justify-center mb-2.5"
                    @click="newOrderStatus = 'failed'"
                    value="failed">
                    НЕУСПІШНИЙ
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <MyButton
            size="md"
            color="--Light-Green"
            iconPosition="left"
            :disabled="!isOrderValid"
            @click="getOrder"
            class="ml-auto"
            :icon="true">
            Додати
          </MyButton>
        </SheetHeader>
        <div class="h-[75vh] overflow-scroll pr-4 pl-1">
          <div class="border-b w-full pb-5">
            <div class="flex justify-between w-full">
              <Popover v-model:open="open">
                <PopoverTrigger class="w-full">
                  <Button
                    :variant="null"
                    role="combobox"
                    :aria-expanded="open"
                    :class="{
                      'text-[var(--Grey-Dark)]':
                        clientName.toLowerCase() == 'виберіть клієнта',
                    }"
                    class="w-full h-10 flex items-center text-lg justify-start p-2.5 pl-4 border rounded-[10px] border-[var(--Grey-Dark)]">
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
            </div>
            <div class="mt-5">
              <Textarea
                v-model="newOrderMessage"
                class="placeholder:text-[var(--Grey-Dark)] text-lg"
                placeholder="Коментар" />
            </div>
          </div>

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
          <div class="flex justify-between mt-5 mb-5 items-center">
            <div class="text-[var(--Grey)]">Товар:</div>

            <AddProducts
              prettie-button
              @emit-res="addToOrderItems"
              :current-items="newOrderItems" />
          </div>
          <div class="border rounded-[10px]">
            <OrderItem
              v-for="(item, i) in newOrderItems"
              :key="item.id"
              :item="item"
              :qty="item.quantity"
              :no-last-border="i === newOrderItems.length - 1"
              not-send-delete
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
          </div>
          <div>
            <div class="flex pt-5 items-center">
              <h2 class="text-lg w-1/3 text-[var(--Grey)]">Тип доставки:</h2>

              <Select>
                <SelectTrigger class="w-full rounded-[10px] bg-transparent">
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
            </div>
            <div v-if="shippingType === 'np'" class="mt-2">
              <Select>
                <SelectTrigger class="rounded-[10px] bg-transparent">
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
                  class="mt-2 text-[var(--Grey-Dark)] rounded-[10px] bg-transparent">
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
      </SheetContent>
    </Sheet>
  </div>
</template>
