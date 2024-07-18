<script setup lang="ts">
import editCustomer from "./edit-customer.vue";
import { useDarkStore } from "~/stores/dark";
const darkStore = useDarkStore();

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast, useToast } from "@/components/ui/toast/use-toast";
const props = defineProps<{
  customer: Customer;
}>();
const deleteOrder = async () => {
  const token = useCookie("token");

  await $fetch(`https://api.slooon.shop/api/customers/${props.customer.id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token.value}`,
    },
    onResponse: ({ response }) => {
      console.log(response);

      toast({
        title: "Клієнта успішно видалено",
      });
    },
  });
  refreshNuxtData();
};
const isOpen = ref(false);
const isDeleteOpen = ref(false);
const showMore = ref(true);
const dontClose = ref(false);

const handleClose = () => {
  if (!dontClose.value) {
    isOpen.value = false;
  }
};
onMounted(() => {
  document.querySelector("body")?.addEventListener("mouseover", () => {
    handleClose();
  });
});

onUnmounted(() => {
  document.querySelector("body")?.removeEventListener("mouseover", () => {
    handleClose();
  });
});
</script>

<template>
  <Transition>
    <div v-if="isOpen !== true" class="flex justify-end w-8 h-8">
      <img
        src="@/assets/images/more.svg"
        :class="{ invert: !darkStore.isDark }"
        class="w-10 h-10 p-2 rotate-90 absolute transition top-1/2 right-3.5 -translate-y-1/2 border border-[var(--Grey-Dark)] rounded-[14px]"
        alt="more icon"
        v-if="showMore"
        @mouseover.stop="isOpen = true" />
    </div>
  </Transition>
  <Transition>
    <div
      @mouseover.stop
      @mouseleave="handleClose"
      class="flex items-center justify-between gap-1.5 p-1 w-[78px] bg-[var(--Black)] h-10 absolute transition top-1/2 right-3.5 -translate-y-1/2 border border-[var(--Grey-Dark)] rounded-[14px]"
      v-if="isOpen === true">
      <editCustomer
        @mousedown="dontClose = true"
        @close="
          () => {
            dontClose = false;
            console.log('hi');

            handleClose();
          }
        "
        :customer="customer" />
      <DropdownMenuSeparator />

      <Dialog
        :open="isDeleteOpen"
        @update:open="
          (value) => {
            if (!value) {
              dontClose = false;

              isOpen = false;
              isDeleteOpen = false;
            }
          }
        ">
        <DialogTrigger class="w-full">
          <div
            @click.stop="
              () => {
                isDeleteOpen = true;
                dontClose = true;
              }
            "
            class="text-sm p-2 cursor-pointer w-8 h-8 rounded-[10px] transition hover:bg-muted">
            <img
              src="@/assets/images/delete-bin.svg"
              class="w-4 brightness-200"
              alt="delete icon" />
          </div>
        </DialogTrigger>
        <DialogContent :class="{ dark: darkStore.isDark }">
          <DialogHeader>
            <DialogTitle class="text-primary">Видалити клієнта?</DialogTitle>
            <DialogDescription>
              Ви впевнені що хочете видалити "{{ customer.last_name }}
              {{ customer.first_name }} {{ customer.surname }}" з списку
              клієнтів?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose as-child>
              <Button @click="deleteOrder">Так</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </Transition>
</template>

<style scoped></style>
