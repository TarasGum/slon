<script setup lang="ts">
import editOrder from "./edit-order.vue";

const props = defineProps<{
  id: number;
  notSendDelete?: boolean;
  item?: any;
  title: string | undefined;
}>();

const emit = defineEmits<{
  deleteItem: [value: number];
}>();

const deleteOrder = async () => {
  emit("deleteItem", props.id);
  if (!props.item.title) {
    if (!props.notSendDelete) {
      const token = useCookie("token");

      await $fetch(`https://api.slooon.shop/api/order-items/${props.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Token ${token.value}`,
        },
      });
    }
  }
};

const isOpen = ref(false);
const showMore = ref(true);
</script>

<template>
  <DropdownMenu
    :open="isOpen"
    @update:open="
      (value) => {
        isOpen = value;
      }
    ">
    <div class="flex w-full dark justify-end">
      <DropdownMenuTrigger>
        <img
          src="@/assets/images/more.svg"
          class="brightness-50 w-8 ml-auto mr-2"
          alt="more icon"
          v-if="showMore"
          @click.stop="isOpen = true" />
      </DropdownMenuTrigger>
    </div>
    <DropdownMenuContent class="mt-2 dark -translate-x-[27%] w-full">
      <div>
        <Dialog>
          <DialogTrigger class="w-full">
            <div
              class="flex text-sm gap-2 p-2 cursor-pointer rounded-md transition hover:bg-muted w-full">
              <img
                src="@/assets/images/delete-bin.svg"
                class="w-4"
                alt="delete icon" />
              <div>Видалити</div>
            </div>
          </DialogTrigger>
          <DialogContent class="dark text-primary">
            <DialogHeader>
              <DialogTitle>Видалити товар з замовлення?</DialogTitle>
              <DialogDescription>
                Ви впевнені що хочете видалити {{ title }} з списку замовлених
                товарів?
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
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<style scoped></style>
