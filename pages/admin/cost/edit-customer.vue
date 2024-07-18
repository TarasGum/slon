<script setup lang="ts">
const props = defineProps<{ customer: Customer }>();
import { toast, useToast } from "@/components/ui/toast/use-toast";
import { useDarkStore } from "~/stores/dark";
const darkStore = useDarkStore();
import { useForm } from "vee-validate";
import { toTypedSchema } from "@vee-validate/zod";
import * as z from "zod";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
const emit = defineEmits<{ close: any; mousedown: any }>();

const formSchema = toTypedSchema(
  z.object({
    email: z
      .string()
      .nonempty({
        message: "Введіть пошту",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою")
      .optional(),
    first_name: z
      .string()
      .nonempty({
        message: "Введіть ім'я",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою")
      .optional(),
    last_name: z
      .string()
      .nonempty({
        message: "Введіть прізвище",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою")
      .optional(),
    surname: z
      .string()
      .nonempty({
        message: "Введіть по батькові",
      })
      .min(2, "мало букав")
      .max(50, "ти написав багато букв і ще одна може стати зайвою")
      .optional(),
    phone: z
      .string()
      .nonempty({
        message: "Введіть номер",
      })
      .regex(phoneRegex, "Невірний номер!")
      .optional(),
  })
);

const { handleSubmit } = useForm({
  validationSchema: formSchema,
});

const editCustomer = handleSubmit(async (values: any) => {
  console.log("s");

  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/customers/${props.customer.id}/`,
    {
      method: "PATCH",
      body: JSON.stringify(values),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token.value}`,
      },
      onResponse: ({ response }) => {
        if (response.status === 200) {
          toast({ title: "Клієнта успішно змінено" });
        } else {
          toast({ variant: "destructive", title: "Щось пішло не так" });
        }
      },
    }
  );
  refreshNuxtData();
  isOpen.value = false;
});
const isOpen = ref(false);
</script>

<template>
  <Sheet
    :open="isOpen"
    @update:open="
      (value) => {
        isOpen = value;
        if (!value) {
          emit('close');
        }
      }
    ">
    <SheetTrigger as-child class="w-full">
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
      class="!min-w-[80vw] bg-[#23232381] backdrop-blur-[5.5px] dark border text-primary">
      <SheetHeader>
        <SheetTitle>Редагувати клієнта</SheetTitle>
      </SheetHeader>
      <div class="flex items-center">
        <form class="w-full">
          <div class="flex justify-between">
            <FormField v-slot="{ componentField }" name="first_name">
              <FormItem class="mt-8 w-full mr-5">
                <FormLabel class="text-lg">Імʼя</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    :default-value="customer.first_name"
                    v-bind="componentField" />
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="last_name">
              <FormItem class="mt-8 w-full">
                <FormLabel class="text-lg">Прізвище</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    :default-value="customer.last_name"
                    v-bind="componentField" />
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>
          </div>
          <FormField v-slot="{ componentField }" name="surname">
            <FormItem class="mt-8 w-[calc(50%-10px)]">
              <FormLabel class="text-lg">По батькові</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  :default-value="customer.surname"
                  v-bind="componentField" />
              </FormControl>
              <FormMessage class="absolute" />
            </FormItem>
          </FormField>
          <div class="flex justify-between">
            <FormField v-slot="{ componentField }" name="email">
              <FormItem class="mt-8 w-full mr-5">
                <FormLabel class="text-lg">Пошта</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    :default-value="customer.email"
                    v-bind="componentField" />
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>
            <FormField v-slot="{ componentField }" name="phone">
              <FormItem class="mt-8 w-full">
                <FormLabel class="text-lg">Телефон</FormLabel>
                <FormControl>
                  <Input
                    v-maska
                    data-maska="+380#########"
                    :default-value="customer.phone"
                    type="text"
                    v-bind="componentField" />
                </FormControl>
                <FormMessage class="absolute" />
              </FormItem>
            </FormField>
          </div>
          <DialogFooter class="mt-[43vh]">
            <Button @click="editCustomer" class="mb-4"> Змінити </Button>
          </DialogFooter>
        </form>
      </div>
    </SheetContent>
  </Sheet>
</template>

<style scoped></style>
