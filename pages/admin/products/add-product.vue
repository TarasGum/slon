<script lang="ts" setup>
const props = defineProps<{
  activeCategory: string;
}>();
import { toast, useToast } from "@/components/ui/toast/use-toast";
import { useDarkStore } from "~/stores/dark";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
const darkStore = useDarkStore();
import { ColorPicker } from "vue-accessible-color-picker";
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCategoriesStore } from "~/stores/categories";
const categoriesStore = useCategoriesStore();
const dark = "dark";
const token = useCookie("token");

const formSchema = toTypedSchema(
  z.object({
    title: z
      .string()
      .nonempty({
        message: "Введіть назву товару",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою"),
    slug: z
      .string()
      .nonempty({
        message: "Введіть slug",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою"),
    year: z
      .string()
      .nonempty({
        message: "Введіть рік",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою"),
    description: z
      .string()
      .nonempty({
        message: "Введіть опис",
      })
      .min(2, "мало букав")
      .max(100, "ти написав багато букв і ще одна може стати зайвою"),
    full_description: z
      .string()
      .nonempty({
        message: "Введіть повний опис",
      })
      .min(2, "мало букав"),
  })
);
const { handleSubmit } = useForm({
  validationSchema: formSchema,
});
const defaultNewCategory = computed(() => {
  const index = categoriesStore.categories?.findIndex(
    (e) => e.id === +props.activeCategory
  );
  if (index != -1 && categoriesStore.categories && index) {
    return categoriesStore.categories[index].id;
  }
});

const newProductCategory = ref("");
watch(defaultNewCategory, () => {
  if (defaultNewCategory.value) {
    newProductCategory.value = "" + defaultNewCategory.value;
  }
});
const variants = ref<Variant[]>([]);
const recommendations = ref<Recommendation[]>([]);
const showColorPickers = ref<boolean[]>([]);
const showColorPicker = (index: number) => {
  showColorPickers.value[index] = true;
};
const hideColorPicker = (index: number) => {
  showColorPickers.value[index] = false;
};

const hideAllColorPicker = () => {
  showColorPickers.value = [];
};
const addVariant = () => {
  showColorPickers.value.push(false);
  variants.value.push({ packaging: "", inventory: 1, price: "" });
};
const addRecomendation = () => {
  recommendations.value.push({ title: "", color: "#000000" });
};
const updateColor = (index: number, eventData: any) => {
  recommendations.value[index].color = eventData.cssColor;
};
const addProduct = handleSubmit(async (values: any) => {
  const res = {
    ...values,
    category: newProductCategory.value,
  };

  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/products/`,
    {
      method: "POST",
      body: JSON.stringify(res),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token.value}`,
      },
      onResponse: async ({ response }) => {
        refreshNuxtData();
        if (response.status === 201) {
          let formData = new FormData();

          formData.append("thumbnail", images.value[0]);

          let imageFormData = new FormData();

          images.value.forEach((item) => {
            if (item) {
              imageFormData.append("image", item);
            }
          });
          try {
            recommendations.value.forEach(async (r) => {
              const { data: recommendationData }: { data: any } = await $fetch(
                `https://api.slooon.shop/api/recommendations/`,
                {
                  method: "POST",
                  body: { ...r, product: response._data.id },
                  headers: {
                    Authorization: `Token ${token.value}`,
                  },
                }
              );
            });
            variants.value.forEach(async (v) => {
              const { data: varianData }: { data: any } = await $fetch(
                `https://api.slooon.shop/api/variants/`,
                {
                  method: "POST",
                  body: {
                    ...v,
                    price: v.price.replaceAll(" ", "").replaceAll("грн", ""),
                    packaging: v.packaging + " гр",
                    product: response._data.id,
                  },
                  headers: {
                    Authorization: `Token ${token.value}`,
                  },
                }
              );
            });

            const { data: imgData }: { data: any } = await $fetch(
              `https://api.slooon.shop/api/products/${response._data.id}/upload-images/`,
              {
                method: "POST",
                body: imageFormData,
                headers: {
                  Authorization: `Token ${token.value}`,
                },
              }
            );
            const { data }: { data: any } = await $fetch(
              `https://api.slooon.shop/api/products/${response._data.id}/upload-thumbnail/`,
              {
                method: "POST",
                body: formData,

                headers: {
                  Authorization: `Token ${token.value}`,
                },
              }
            );
          } catch (error) {
            console.error(error);
          }
          toast({ title: "Продукт успішно створений" });
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
});

let imgs = ref<{ image: string }[]>([]);
let images = ref<any[]>([]);
const onFileChange = (e: any) => {
  const file = e.target.files[0];
  images.value.push(file);

  imgs.value.push({ image: URL.createObjectURL(file) });
};
const deleteImg = (index: number) => {
  imgs.value.splice(index, 1);
  images.value.splice(index, 1);
};
const deleteVariant = (index: number) => {
  variants.value.splice(index, 1);
};
const deleteRecomendation = (index: number) => {
  recommendations.value.splice(index, 1);
};
const minus = (index: number) => {
  if (variants.value[index].inventory === 1) {
    return;
  } else {
    variants.value[index].inventory -= 1;
  }
};

const plus = (index: number) => {
  variants.value[index].inventory += 1;
};

const isProductValid = computed(() => {
  // Перевірка наявності валідних значень для ордера
  return (
    variants.value.length > 0 &&
    variants.value.every((variant) => variant.inventory > 0 && variant.price) &&
    newProductCategory.value &&
    newProductCategory.value.trim() !== ""
  );
});
const clearFormData = () => {
  variants.value = [];
  recommendations.value = [];
  showColorPickers.value = [];
  newProductCategory.value = "";
  imgs.value = [];
  images.value = [];
};

const isOpen = ref(false);
const nameValue = ref("");
const slugValue = ref("");
type UkrainianToTranslitMap = { [key: string]: string };

const transliterate = (ukrainian: string): string => {
  const ukrainianToTranslit: UkrainianToTranslitMap = {
    а: "a",
    б: "b",
    в: "v",
    г: "h",
    ґ: "g",
    д: "d",
    е: "e",
    є: "ye",
    ж: "zh",
    з: "z",
    и: "y",
    і: "i",
    ї: "i",
    й: "i",
    к: "k",
    л: "l",
    м: "m",
    н: "n",
    о: "o",
    п: "p",
    р: "r",
    с: "s",
    т: "t",
    у: "u",
    ф: "f",
    х: "kh",
    ц: "ts",
    ч: "ch",
    ш: "sh",
    щ: "shch",
    ь: "",
    ю: "iu",
    я: "ia",
    А: "A",
    Б: "B",
    В: "V",
    Г: "H",
    Ґ: "G",
    Д: "D",
    Е: "E",
    Є: "Ye",
    Ж: "Zh",
    З: "Z",
    И: "Y",
    І: "I",
    Ї: "Yi",
    Й: "Y",
    К: "K",
    Л: "L",
    М: "M",
    Н: "N",
    О: "O",
    П: "P",
    Р: "R",
    С: "S",
    Т: "T",
    У: "U",
    Ф: "F",
    Х: "Kh",
    Ц: "Ts",
    Ч: "Ch",
    Ш: "Sh",
    Щ: "Shch",
    Ь: "",
    Ю: "Yu",
    Я: "Ya",
    //@ts-ignore
    Ь: "",
    //@ts-ignore
    І: "I",
  };

  return ukrainian
    .split("")
    .map((char: string) => ukrainianToTranslit[char] || char)
    .join("");
};

const generateSlug = (name: string): string => {
  const transliteratedName: string = transliterate(name);
  return transliteratedName
    .toLowerCase()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "");
};

watch(nameValue, () => {
  slugValue.value = generateSlug(nameValue.value);
});
</script>

<template>
  <Sheet
    :open="isOpen"
    @update:open="
      (value) => {
        if (value) {
          isOpen = true;
          clearFormData();
        }
        if (!value) {
          isOpen = false;
        }
      }
    ">
    <SheetTrigger class="h-[40px]" as-child>
      <MyButton size="md" color="--blue" iconPosition="left" :icon="true">
        Новий товар
      </MyButton>
      <!-- <div
        class="border flex gap-3 max-sm:h-[50px] max-[400px]:text-[20px] items-center transition-all translate-z hover:drop-shadow-[3px_4px_0px_var(--blue)] border-[var(--blue)] bg-background cursor-pointer rounded-3xl text-2xl py-2 pr-5 pl-3">
        <div
          class="w-5 h-5 border-[var(--blue)] border bg-[var(--blue)] flex items-center justify-center text-background rounded-full">
          <p class="w-fit mb-1 ml-[2px]">+</p>
        </div>
        <h2>Новий товар</h2>
      </div> -->
    </SheetTrigger>
    <SheetContent
      class="bg-[#23232381] backdrop-blur-[5.5px] !min-w-[70vw] max-sm:!min-w-[100vw] dark border text-primary">
      <SheetHeader>
        <SheetTitle>Додати товар</SheetTitle>
      </SheetHeader>
      <div class="flex items-center">
        <form class="w-full">
          <div class="h-[80vh] overflow-scroll overflow-x-hidden pl-1 pr-4">
            <div class="flex justify-between">
              <FormField v-slot="{ componentField }" name="title">
                <FormItem class="mt-8 w-full mr-5 relative">
                  <FormLabel class="text-lg">Назва товару</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      v-model="nameValue"
                      v-bind="componentField" />
                  </FormControl>
                  <FormMessage class="absolute" />
                </FormItem>
              </FormField>
              <FormField
                v-slot="{ componentField }"
                v-model="slugValue"
                name="slug">
                <FormItem class="mt-8 w-full relative">
                  <FormLabel class="text-lg">SLUG</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="componentField" />
                  </FormControl>
                  <FormMessage class="absolute" />
                </FormItem>
              </FormField>
            </div>

            <div class="flex justify-between">
              <FormField v-slot="{ componentField }" name="year">
                <FormItem class="mt-8 w-full mr-5 relative">
                  <FormLabel class="text-lg">Рік</FormLabel>
                  <FormControl>
                    <Input
                      v-maska
                      data-maska="####"
                      type="text"
                      v-bind="componentField" />
                  </FormControl>
                  <FormMessage class="absolute" />
                </FormItem>
              </FormField>

              <div class="mt-10 w-full relative">
                <h2 class="text-lg">Категорія</h2>
                <Select
                  v-model="newProductCategory"
                  :default-value="'' + defaultNewCategory">
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть категорію" />
                  </SelectTrigger>
                  <SelectContent class="bg-background border dark">
                    <SelectGroup class="my-2">
                      <SelectItem
                        v-for="category in categoriesStore?.categories"
                        :key="category.id"
                        class="hover:bg-muted transition-all"
                        :value="'' + category.id">
                        {{ category.name }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <FormField v-slot="{ componentField }" name="images">
              <FormItem class="mt-8 w-full mr-5 relative">
                <FormLabel class="text-lg">Зображення</FormLabel>
                <FormControl>
                  <div
                    class="flex h-32 w-full rounded-md border border-input overflow-hidden relative p-3">
                    <div
                      v-if="imgs.length"
                      v-for="(img, idx) in imgs"
                      class="relative mr-4">
                      <img
                        :src="img.image"
                        alt="tea"
                        class="border max-w-[100px] max-h-[100px] object-contain" />

                      <img
                        src="@/assets/images/close.svg"
                        alt="close icon"
                        @click="deleteImg(idx)"
                        class="absolute w-5 bg-white rounded-full right-0 top-0 translate-x-1/2 -translate-y-1/3 cursor-pointer" />
                    </div>

                    <p
                      v-if="!imgs.length"
                      class="text-sm absolute top-1/2 -z-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      Перетягніть ваші файли сюди або натисніть щоб вибрати їх
                    </p>

                    <input
                      @change="onFileChange"
                      class="w-full !text-[0px] cursor-pointer px-3 py-2 text-sm ring-offset-background file:border file:hidden file:rounded file:ml-[50%] file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      type="file"
                      v-bind="componentField" />
                  </div>
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="description">
              <FormItem class="mt-8 w-full relative">
                <FormLabel class="text-lg">Короткий опис</FormLabel>
                <FormControl>
                  <Input type="text" v-bind="componentField" />
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="full_description">
              <FormItem class="mt-8 w-full relative">
                <FormLabel class="text-lg">Повний опис</FormLabel>
                <FormControl>
                  <Textarea v-bind="componentField" />
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>

            <div>
              <h2 class="mt-7">Варіація товару</h2>
              <div>
                <div
                  class="border rounded-lg p-2 flex justify-between mt-1 relative"
                  v-for="(variant, idx) in variants">
                  <div class="w-1/3 relative">
                    <Input
                      v-model="variant.packaging"
                      placeholder="Введіть вагу"
                      type="text"
                      class="pr-7"
                      v-maska
                      data-maska="9"
                      data-maska-tokens="9:[0-9]:repeated" />
                    <h2
                      class="text-gray-400 text-sm absolute top-1/2 -translate-y-1/2 right-2">
                      гр
                    </h2>
                  </div>
                  <div class="flex items-center gap-5 border rounded-3xl">
                    <div
                      class="qty__btn brightness-[20]"
                      :class="{ disabled: variant.inventory === 1 }"
                      @click="minus(idx)">
                      <img
                        src="@/assets/images/minus.svg"
                        alt="minus icon"
                        class="qty__icon" />
                    </div>

                    <div>
                      {{ variant.inventory }}
                    </div>
                    <div class="qty__btn brightness-[20]" @click="plus(idx)">
                      <img
                        src="@/assets/images/plus.svg"
                        alt="plus icon"
                        class="qty__icon" />
                    </div>
                  </div>
                  <div class="w-1/3 relative">
                    <Input
                      v-model="variant.price"
                      placeholder="Введіть ціну"
                      type="text"
                      class="pr-7"
                      v-maska
                      data-maska="####.99"
                      data-maska-tokens="9:\d:optional" />
                    <h2
                      class="text-gray-400 text-sm absolute top-1/2 -translate-y-1/2 right-2">
                      грн
                    </h2>
                  </div>
                  <img
                    src="@/assets/images/close.svg"
                    alt="close icon"
                    @click="deleteVariant(idx)"
                    class="absolute bg-white w-5 rounded-full right-0 top-0 translate-x-1/2 -translate-y-1/3 cursor-pointer" />
                </div>
              </div>
              <Button @click="addVariant" type="button" class="w-full mt-2"
                >Додати варіант</Button
              >
            </div>
            <div>
              <h2 class="mt-5">Рекомендація</h2>
              <div>
                <div
                  class="border rounded-lg p-2 flex items-center justify-between relative mt-1"
                  v-for="(recomendation, idx) in recommendations">
                  <div
                    class="absolute -translate-y-2/3 left-0"
                    v-if="showColorPickers[idx]">
                    <ColorPicker
                      :visible-formats="['hex']"
                      :color="recomendation.color"
                      alpha-channel="hide"
                      class="border rounded !text-black"
                      @color-change="
                        (colorChangeDetail) =>
                          updateColor(idx, colorChangeDetail)
                      " />
                    <img
                      src="@/assets/images/close.svg"
                      alt="close icon "
                      @click="hideColorPicker(idx)"
                      class="absolute w-5 right-0 bg-white rounded-full top-0 translate-x-1/2 -translate-y-1/3 cursor-pointer" />
                  </div>
                  <div
                    :style="[`background-color: ${recomendation.color}`]"
                    class="w-10 h-10 border rounded-md mr-2"
                    @click="hideAllColorPicker(), showColorPicker(idx)"></div>
                  <Input
                    v-model="recomendation.title"
                    placeholder="Введіть рекомендацію"
                    type="text"
                    class="w-full" />
                  <img
                    src="@/assets/images/close.svg"
                    alt="close icon"
                    @click="deleteRecomendation(idx)"
                    class="absolute w-5 bg-white rounded-full right-0 top-0 translate-x-1/2 -translate-y-1/3 cursor-pointer" />
                </div>
              </div>
              <Button
                @click="addRecomendation"
                type="button"
                class="w-full mt-2"
                >Додати рекомендацію</Button
              >
            </div>
          </div>
          <SheetFooter class="border-t mt-3">
            <div>
              <Button
                @click="addProduct"
                :disabled="!isProductValid"
                class="mt-4">
                Додати
              </Button>
            </div>
          </SheetFooter>
        </form>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style lang="scss" scoped></style>
