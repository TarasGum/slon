<script setup lang="ts">
const props = defineProps<{
  product: Product;
}>();
import { useDarkStore } from "~/stores/dark";

const darkStore = useDarkStore();
import { toast, useToast } from "@/components/ui/toast/use-toast";

import EditProduct from "./edit-product.vue";
import { useCategoriesStore } from "~/stores/categories";
const categoriesStore = useCategoriesStore();

const categories = categoriesStore.categories;

const deleteProduct = async () => {
  const token = useCookie("token");

  await $fetch(`https://api.slooon.shop/api/products/${props.product.id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token.value}`,
    },
    onResponse: ({ response }) => {
      toast({
        title: "Товар успішно видалено",
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
      class="flex items-center justify-between gap-1 p-1 w-[78px] bg-[var(--Black)] h-10 absolute transition top-1/2 right-3.5 -translate-y-1/2 border border-[var(--Grey-Dark)] rounded-[14px]"
      v-if="isOpen === true">
      <EditProduct
        @mousedown="dontClose = true"
        :categories="categories"
        @close="
          () => {
            dontClose = false;
            console.log('hi');

            handleClose();
          }
        "
        :product="product" />

      <Dialog
        :open="isDeleteOpen"
        @update:open="
          (value) => {
            if (!value) {
              isOpen = false;
              isDeleteOpen = false;
            }
          }
        ">
        <DialogTrigger class="w-full">
          <div
            @click.stop="isDeleteOpen = true"
            class="text-sm p-2 cursor-pointer w-8 h-8 rounded-[10px] transition hover:bg-muted">
            <img
              src="@/assets/images/delete-bin.svg"
              class="w-4 brightness-200"
              alt="delete icon" />
          </div>
        </DialogTrigger>
        <DialogContent :class="{ dark: darkStore.isDark }">
          <DialogHeader>
            <DialogTitle class="text-primary">Видалити продукт?</DialogTitle>
            <DialogDescription>
              Ви впевнені що хочете видалити "{{ product.title }}" з списку
              товарів?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <DialogClose as-child>
              <Button @click="deleteProduct">Так</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
