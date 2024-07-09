<script setup lang="ts">
const props = defineProps<{
  id: number;
  name: string;
}>();
import { useDarkStore } from "~/stores/dark";
const darkStore = useDarkStore();
const showChangeModal = ref(false);
const newCategoryName = ref(props.name);
import { toast, useToast } from "@/components/ui/toast/use-toast";

const token = useCookie("token");

const changeCategory = async () => {
  const { data }: { data: any } = await $fetch(
    `https://api.slooon.shop/api/categories/${props.id}/`,
    {
      method: "PATCH",
      body: JSON.stringify({ name: newCategoryName.value }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${token.value}`,
      },
      onResponse: ({ response }) => {
        console.log(response);
        if (response.status === 200) {
          toast({ title: "Категорію успішно змінено" });
        } else {
          toast({ variant: "destructive", title: "Щось пішло не так" });
        }
      },
    }
  );
  newCategoryName.value = "";
  refreshNuxtData();
};

const deleteCategory = async () => {
  await $fetch(`https://api.slooon.shop/api/categories/${props.id}/`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Token ${token.value}`,
    },
    onResponse: ({ response }) => {
      if (response.status === 204) {
        toast({ title: "Категорію успішно видалено" });
      }
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
  <div class="flex mr-auto" v-if="showChangeModal">
    <Input v-model="newCategoryName" class="w-30 h-8" />
    <Button
      @click="changeCategory(), (showChangeModal = false)"
      class="ml-3 h-8"
      >Підтвердити</Button
    >
  </div>
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
      @mouseleave="handleClose"
      @mouseover.stop
      class="flex items-center justify-between p-1 w-[78px] bg-[var(--Black)] h-10 absolute transition top-1/2 right-3.5 -translate-y-1/2 border border-[var(--Grey-Dark)] rounded-[14px]"
      v-if="isOpen === true">
      <div>
        <div>
          <div>
            <div
              @click="showChangeModal = !showChangeModal"
              :class="{ ['bg-[#9595957e]']: showChangeModal }"
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
        </div>
      </div>

      <div>
        <Dialog>
          <DialogTrigger class="w-full">
            <div
              @click.stop="isDeleteOpen = true"
              class="text-sm p-2 mt-1 cursor-pointer w-8 h-8 rounded-[10px] transition hover:bg-muted">
              <img
                src="@/assets/images/delete-bin.svg"
                class="w-4 brightness-200"
                alt="delete icon" />
            </div>
          </DialogTrigger>
          <DialogContent
            :class="{ dark: darkStore.isDark }"
            class="text-primary">
            <DialogHeader>
              <DialogTitle>Видалити категорію?</DialogTitle>
              <DialogDescription>
                Ви впевнені що хочете видалити "{{ name }}" з списку категорій?
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose as-child>
                <Button @click="deleteCategory">Так</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  </Transition>
</template>

<style scoped></style>
