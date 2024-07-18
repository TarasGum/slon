<script setup lang="ts">
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
const token = useCookie("token");
const phoneRegex = new RegExp(/^(\+?3?8)?(0\d{9})$/);

const formSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .nonempty({
        message: "Введіть пошту",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою"),
    first_name: z
      .string()
      .nonempty({
        message: "Введіть ім'я",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою"),
    last_name: z
      .string()
      .nonempty({
        message: "Введіть прізвище",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою"),
    surname: z
      .string()
      .nonempty({
        message: "Введіть по батькові",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою"),
    phone: z
      .string()
      .nonempty({
        message: "Введіть номер",
      })
      .regex(phoneRegex, "Невірний номер!"),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const addCustomer = handleSubmit(async (values: any) => {
  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/customers/`,
    {
      method: "POST",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token.value}`,
      },
      onResponse: ({ response }) => {
        if (response.status === 201) {
          toast({ title: "Клієнта успішно створено" });
        } else {
          toast({ variant: "destructive", title: "Щось пішло не так" });
        }
      },
    }
  );
  refreshNuxtData();
});
</script>

<template>
  <Sheet>
    <SheetTrigger class="h-10" as-child>
      <MyButton size="md" color="--Red" iconPosition="left" :icon="true">
        Додати витрату
      </MyButton>
      <!-- <div
        class="border flex gap-3 max-sm:h-[50px] max-[400px]:text-[20px] items-center transition-all hover:drop-shadow-[3px_4px_0px_var(--sand)] translate-z border-[var(--sand)] bg-background cursor-pointer rounded-3xl text-2xl py-2 pr-5 pl-3">
        <div
          class="w-5 h-5 border-[var(--sand)] border bg-[var(--sand)] flex items-center justify-center text-background rounded-full">
          <p class="w-fit mb-1 ml-[2px]">+</p>
        </div>
        <h2>Новий клієнт</h2>
      </div> -->
    </SheetTrigger>
    <SheetContent
      class="bg-[#23232381] rounded-s-[20px] backdrop-blur-[5.5px] !min-w-[70vw] max-sm:!min-w-[100vw] dark border text-primary">
      <SheetHeader
        class="flex border-b pb-5 flex-row items-center justify-between">
        <SheetTitle class="text-[36px] mr-2.5 leading-[100%]"
          >Новий клієнт</SheetTitle
        >
        <MyButton
          size="md"
          @click="addCustomer"
          color="--sand"
          iconPosition="left"
          :icon="true">
          Додати
        </MyButton>
      </SheetHeader>
      <div class="flex text-lg items-center">
        <form @submit="addCustomer" class="w-full">
          <div class="">
            <FormField v-slot="{ componentField }" name="first_name">
              <FormItem
                class="mt-5 text-[var(--Grey)] flex items-center w-full">
                <FormLabel class="text-lg w-1/5">Імʼя:</FormLabel>

                <div class="w-full">
                  <FormControl>
                    <Input
                      placeholder="Введіть імʼя"
                      class="py-2.5 px-5 rounded-[10px] text-lg placeholder:text-lg placeholder:text-[var(--Grey-Dark)] !m-0 h-10"
                      type="text"
                      v-bind="componentField" />
                  </FormControl>
                  <FormMessage class="absolute" />
                </div>
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="last_name">
              <FormItem
                class="mt-5 text-[var(--Grey)] flex items-center w-full">
                <FormLabel class="text-lg w-1/5">Прізвище</FormLabel>
                <div class="w-full">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Введіть прізвище"
                      class="py-2.5 px-5 rounded-[10px] text-lg placeholder:text-lg placeholder:text-[var(--Grey-Dark)] !m-0 h-10"
                      v-bind="componentField" />
                  </FormControl>
                  <FormMessage class="absolute" />
                </div>
              </FormItem>
            </FormField>
          </div>
          <FormField v-slot="{ componentField }" name="surname">
            <FormItem class="mt-5 text-[var(--Grey)] flex items-center w-full">
              <FormLabel class="text-lg w-1/5">По батькові</FormLabel>
              <div class="w-full">
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Введіть по батькові"
                    class="py-2.5 px-5 rounded-[10px] text-lg placeholder:text-lg placeholder:text-[var(--Grey-Dark)] !m-0 h-10"
                    v-bind="componentField" />
                </FormControl>
                <FormMessage class="absolute" />
              </div>
            </FormItem>
          </FormField>
          <div class="border-t mt-5 pt-5">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem class="text-[var(--Grey)] flex items-center w-full">
                <FormLabel class="text-lg w-1/5">Пошта</FormLabel>
                <div class="w-full">
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Введіть пошту"
                      class="py-2.5 px-5 rounded-[10px] text-lg placeholder:text-lg placeholder:text-[var(--Grey-Dark)] !m-0 h-10"
                      v-bind="componentField" />
                  </FormControl>
                  <FormMessage class="absolute" />
                </div>
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="phone">
              <FormItem
                class="mt-5 text-[var(--Grey)] flex items-center w-full">
                <FormLabel class="text-lg w-1/5">Номер</FormLabel>
                <div class="w-full">
                  <FormControl>
                    <Input
                      v-maska
                      data-maska="+380#########"
                      type="text"
                      placeholder="Введіть номер"
                      class="py-2.5 px-5 rounded-[10px] text-lg placeholder:text-lg placeholder:text-[var(--Grey-Dark)] !m-0 h-10"
                      v-bind="componentField" />
                  </FormControl>
                  <FormMessage class="absolute" />
                </div>
              </FormItem>
            </FormField>
          </div>
        </form>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped></style>
