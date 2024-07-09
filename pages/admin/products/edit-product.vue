<script lang="ts" setup>
const props = defineProps<{
  categories: Category[] | null;
  product: Product;
}>();
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
import { toast, useToast } from "@/components/ui/toast/use-toast";
const emit = defineEmits<{ close: any; mousedown: any }>();
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

const token = useCookie("token");

const formSchema = toTypedSchema(
  z.object({
    title: z
      .string()
      .nonempty({
        message: "Введіть назву товару",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою")
      .optional(),
    slug: z
      .string()
      .nonempty({
        message: "Введіть slug",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою")
      .optional(),
    year: z
      .string()
      .nonempty({
        message: "Введіть рік",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою")
      .optional(),
    description: z
      .string()
      .nonempty({
        message: "Введіть опис",
      })
      .min(2, "мало букав")
      .max(100, "ти написав багато букв і ще одна може стати зайвою")
      .optional(),
    full_description: z
      .string()
      .nonempty({
        message: "Введіть повний опис",
      })
      .min(2, "мало букав")
      .optional(),
  })
);
const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const newProductCategory = ref("" + props.product.category.id);
const existingVariants = ref<Variant[]>(props.product.variants);
const variants = ref<Variant[]>([]);
const existingRecommendations = ref<Recommendation[]>(
  props.product.recommendations
);
const recommendations = ref<Recommendation[]>([]);
const showColorPickers = ref<boolean[]>([]);
const showExistingColorPickers = ref<boolean[]>([]);
const showExistingColorPicker = (index: number) => {
  showExistingColorPickers.value[index] = true;
};
const hideExistingColorPicker = (index: number) => {
  showExistingColorPickers.value[index] = false;
};
const hideAllColorPicker = () => {
  showColorPickers.value = [];
  showExistingColorPickers.value = [];
};
const showColorPicker = (index: number) => {
  showColorPickers.value[index] = true;
};
const hideColorPicker = (index: number) => {
  showColorPickers.value[index] = false;
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
const editProduct = handleSubmit(async (values: any) => {
  let errors: any[] = [];
  try {
    const res = {
      ...values,
      category: newProductCategory.value,
    };
    await Promise.all(
      existingRecommendations.value.map(async (v) => {
        try {
          const { data: recData }: { data: any } = await $fetch(
            `https://api.slooon.shop/api/recommendations/${v.id}/`,
            {
              method: "PATCH",
              body: v,

              headers: {
                Authorization: `Token ${token.value}`,
              },
            }
          );
        } catch (error) {
          console.error("Error updating recommendation:", error);
        }
      })
    );
    const recommendationPromises = recommendations.value.map(async (r) => {
      try {
        const { data: recommendationData }: { data: any } = await $fetch(
          `https://api.slooon.shop/api/recommendations/`,
          {
            method: "POST",
            body: { ...r, product: props.product.id },
            headers: {
              Authorization: `Token ${token.value}`,
            },
          }
        );
        return recommendationData;
      } catch (error) {
        console.error("Помилка при створенні рекомендації:", error);
      }
    });

    try {
      // Очікування завершення всіх запитів на створення рекомендацій
      const recommendationResults = await Promise.all(recommendationPromises);
      // Обробка результатів, якщо потрібно
    } catch (error) {
      // Обробка помилок, якщо вони виникають під час створення рекомендацій
      console.error("Помилка під час створення рекомендацій:", error);
    }

    // Update existing variants
    await Promise.all(
      existingVariants.value.map(async (v) => {
        try {
          const { data: varianData }: { data: any } = await $fetch(
            `https://api.slooon.shop/api/variants/${v.id}/`,
            {
              method: "PATCH",
              body: {
                ...v,
                price: v.price.replaceAll(" ", "").replaceAll("грн", ""),
                packaging: v.packaging + " гр",
              },
              headers: {
                Authorization: `Token ${token.value}`,
              },
              onResponse: ({ response }) => {
                if (response.status !== 200) {
                  errors.push(
                    Object.values(response._data).flatMap(
                      (errorArray) => errorArray
                    )
                  );
                }
              },
            }
          );
        } catch (error) {
          // Handle error for individual variant update
          console.error("Error updating variant:", error);
        }
      })
    );

    // Create new variants
    if (variants.value.length > 0) {
      await Promise.all(
        variants.value.map(async (v) => {
          try {
            const { data: varianData }: { data: any } = await $fetch(
              `https://api.slooon.shop/api/variants/`,
              {
                method: "POST",
                body: {
                  ...v,
                  price: v.price.replaceAll(" ", "").replaceAll("грн", ""),
                  packaging: v.packaging + " гр",
                  product: props.product.id,
                },
                headers: {
                  Authorization: `Token ${token.value}`,
                },
                onResponse: ({ response }) => {
                  if (response.status !== 200) {
                    errors.push(
                      Object.values(response._data).flatMap(
                        (errorArray) => errorArray
                      )
                    );
                  }
                },
              }
            );
          } catch (error) {
            // Handle error for individual variant creation
            console.error("Error creating variant:", error);
          }
        })
      );
    }

    // Update product details
    const { data }: { data: any } = await $fetch(
      `https://api.slooon.shop/api/products/${props.product.id}/`,
      {
        method: "PATCH",
        body: JSON.stringify(res),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token.value}`,
        },
        onResponse: ({ response }) => {
          if (response.status !== 200) {
            errors.push(
              Object.values(response._data).flatMap((errorArray) => errorArray)
            );
          }
        },
      }
    );

    // Upload images if available
    if (images.value.length > 0) {
      let formData = new FormData();
      formData.append("thumbnail", images.value[0]);
      let imageFormData = new FormData();
      images.value.forEach((item) => {
        if (item) {
          imageFormData.append("image", item);
        }
      });
      console.log(props.product.id);

      const { data: imgData }: { data: any } = await $fetch(
        `https://api.slooon.shop/api/products/${props.product.id}/upload-images/`,
        {
          method: "POST",
          body: imageFormData,
          headers: {
            Authorization: `Token ${token.value}`,
          },
          onResponse: ({ response }) => {
            if (response.status !== 200) {
              if (response.status !== 201) {
                errors.push(
                  Object.values(response._data).flatMap(
                    (errorArray) => errorArray
                  )
                );
              }
            }
          },
        }
      );
      refreshNuxtData();
    }

    if (errors.length > 0) {
      throw new Error("bad");
    }
    // Notify success
    toast({ title: "Продукт успішно відредаговано" });
    isOpen.value = false;
    refreshNuxtData();
  } catch (error) {
    // Notify failure
    console.error("Error editing product:", error);
    toast({
      variant: "destructive",
      title: "Щось пішло не так",
    });
    if (errors.length > 0) {
      toast({
        variant: "destructive",
        title: "Щось пішло не так:",
        description: errors.join(","),
      });
    }
  }
});

let existingImages = ref(props.product.images);
let imgs = ref<{ image: string }[]>([]);
let images = ref<any[]>([]);
const onFileChange = (e: any) => {
  const file = e.target.files[0];
  images.value.push(file);

  imgs.value.push({ image: URL.createObjectURL(file) });
};
const deleteImg = (index: number) => {
  imgs.value?.splice(index, 1);
  images.value.splice(index, 1);
};
const deleteExistingImage = async (index: number, id: number) => {
  existingImages.value.splice(index, 1);
  const { data: imgData }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/images/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token.value}`,
      },
    }
  );
};
const deleteVariant = (index: number) => {
  if (existingVariants.value.length + variants.value.length >= 2) {
    variants.value.splice(index, 1);
  } else {
    toast({
      variant: "destructive",
      title: "Не можна видалити єдиний варіант товару",
    });
  }
};
const deleteExistingVariant = async (index: number, id: number | undefined) => {
  if (existingVariants.value.length + variants.value.length >= 2) {
    existingVariants.value.splice(index, 1);
    const { data: imgData }: { data: any } = await $fetch(
      `https://api.slooon.shop/api/variants/${id}/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token.value}`,
        },
      }
    );
  } else {
    toast({
      variant: "destructive",
      title: "Не можна видалити єдиний варіант товару",
    });
  }
};
const deleteRecomendation = (index: number) => {
  recommendations.value.splice(index, 1);
};
const deleteExistingRecomendation = async (
  index: number,
  id: number | undefined
) => {
  existingRecommendations.value.splice(index, 1);
  const { data: imgData }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/recommendations/${id}/`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token.value}`,
      },
    }
  );
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

const isOpen = ref(false);
const nameValue = ref(props.product.title);
const slugValue = ref(props.product.slug);
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
        if (!value) {
          emit('close');
          isOpen = false;
          refreshNuxtData();
        }
      }
    ">
    <SheetTrigger as-child>
      <div @mousedown="$emit('mousedown')" @click.stop="isOpen = true">
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
      class="bg-[#23232381] backdrop-blur-[5.5px] dark !min-w-[70vw] max-sm:!min-w-[100vw] border text-primary">
      <SheetHeader>
        <SheetTitle>Редагувати продукт</SheetTitle>
      </SheetHeader>
      <div class="flex items-center">
        <form class="w-full">
          <div class="h-[80vh] overflow-scroll overflow-x-hidden pl-1 pr-4">
            <div class="flex justify-between">
              <FormField
                v-model="nameValue"
                v-slot="{ componentField }"
                name="title">
                <FormItem class="mt-8 w-full mr-5 relative">
                  <FormLabel class="text-lg">Назва товару</FormLabel>
                  <FormControl>
                    <Input type="text" v-bind="componentField" />
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
                      :default-value="product.year"
                      data-maska="####"
                      type="text"
                      v-bind="componentField" />
                  </FormControl>
                  <FormMessage class="absolute" />
                </FormItem>
              </FormField>

              <div class="mt-10 w-full relative">
                <h2 class="text-lg">Категорія</h2>
                <Select v-model="newProductCategory">
                  <SelectTrigger>
                    <SelectValue placeholder="Оберіть категорію" />
                  </SelectTrigger>
                  <SelectContent class="bg-white">
                    <SelectGroup class="my-2">
                      <SelectItem
                        v-for="category in categories"
                        :key="category.id"
                        class="hover:bg-gray-200 transition-all"
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
                      v-if="imgs?.length"
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

                    <div
                      v-if="existingImages?.length"
                      v-for="(img, idx) in existingImages"
                      class="relative mr-4">
                      <img
                        :src="img.image"
                        alt="tea"
                        class="border max-w-[100px] max-h-[100px] object-contain" />

                      <img
                        src="@/assets/images/close.svg"
                        alt="close icon"
                        @click="deleteExistingImage(idx, img.id)"
                        class="absolute w-5 bg-white rounded-full right-0 top-0 translate-x-1/2 -translate-y-1/3 cursor-pointer" />
                    </div>
                    <p
                      v-if="!imgs?.length && !existingImages.length"
                      class="text-sm absolute top-1/2 -z-10 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      Перетягніть ваші файли сюди або натисніть щоб вибрати їх
                    </p>

                    <input
                      @change="onFileChange"
                      class="w-full !text-[0px] px-3 py-2 text-sm ring-offset-background file:border file:hidden file:rounded file:ml-[50%] file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  <Input
                    type="text"
                    :default-value="product.description"
                    v-bind="componentField" />
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="full_description">
              <FormItem class="mt-8 w-full relative">
                <FormLabel class="text-lg">Повний опис</FormLabel>
                <FormControl>
                  <Textarea
                    v-bind="componentField"
                    :default-value="product.full_description" />
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>

            <div>
              <h2 class="mt-7">Варіація товару</h2>
              <div>
                <div
                  class="border rounded-lg p-2 flex justify-between mt-1 relative"
                  v-for="(variant, idx) in existingVariants">
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
                      @click="
                        () => {
                          variant.inventory--;
                        }
                      ">
                      <img
                        src="@/assets/images/minus.svg"
                        alt="minus icon"
                        class="qty__icon" />
                    </div>

                    <div>
                      {{ variant.inventory }}
                    </div>
                    <div
                      class="qty__btn brightness-[20]"
                      @click="
                        () => {
                          variant.inventory++;
                        }
                      ">
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
                      class="pr-7" />
                    <h2
                      class="text-gray-400 text-sm absolute top-1/2 -translate-y-1/2 right-2">
                      грн
                    </h2>
                  </div>
                  <img
                    src="@/assets/images/close.svg"
                    alt="close icon"
                    @click="deleteExistingVariant(idx, variant.id)"
                    class="absolute bg-white w-5 rounded-full right-0 top-0 translate-x-1/2 -translate-y-1/3 cursor-pointer" />
                </div>
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
                      class="qty__btn"
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
                    <div class="qty__btn" @click="plus(idx)">
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
                      class="pr-7" />
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
                  v-for="(recomendation, idx) in existingRecommendations">
                  <div
                    class="absolute -translate-y-2/3 left-0"
                    v-if="showExistingColorPickers[idx]">
                    <ColorPicker
                      :visible-formats="['hex']"
                      :color="recomendation.color"
                      alpha-channel="hide"
                      class="border rounded !text-black"
                      @color-change="
                        (colorChangeDetail) => {
                          recomendation.color = colorChangeDetail.cssColor;
                        }
                      " />
                    <img
                      src="@/assets/images/close.svg"
                      alt="close icon "
                      @click="hideExistingColorPicker(idx)"
                      class="absolute w-5 right-0 bg-white rounded-full top-0 translate-x-1/2 -translate-y-1/3 cursor-pointer" />
                  </div>
                  <div
                    :style="[`background-color: ${recomendation.color}`]"
                    class="w-10 h-10 border rounded-md mr-2"
                    @click="
                      hideAllColorPicker(), showExistingColorPicker(idx)
                    "></div>
                  <Input
                    v-model="recomendation.title"
                    placeholder="Введіть рекомендацію"
                    type="text"
                    class="w-full" />
                  <img
                    src="@/assets/images/close.svg"
                    alt="close icon"
                    @click="deleteExistingRecomendation(idx, recomendation.id)"
                    class="absolute w-5 bg-white rounded-full right-0 top-0 translate-x-1/2 -translate-y-1/3 cursor-pointer" />
                </div>
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
              <Button @click="editProduct" class="mt-4"> Редагувати </Button>
            </div>
          </SheetFooter>
        </form>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style lang="scss" scoped></style>
