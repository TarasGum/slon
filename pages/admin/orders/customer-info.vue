<script setup lang="ts">
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useDarkStore } from "~/stores/dark";

const darkStore = useDarkStore();
const props = defineProps<{
  isFull?: boolean;
  customer: Customer;
  waybill: string;
}>();

const isOpen = ref(false);
</script>
<template>
  <div>
    <Popover
      :open="isOpen"
      @update:open="
        (value) => {
          if (!value) {
            isOpen = false;
          }
        }
      ">
      <div
        :class="{
          '!min-w-full': isFull,
        }"
        class="max-lg:min-w-[10vw]">
        <PopoverTrigger :class="{ '!min-w-full': isFull, 'w-fit': !isFull }">
          <div :class="{ '!min-w-full': isFull, 'w-fit': !isFull }">
            <div
              :class="{
                '!min-w-full flex justify-center': isFull,
                'w-fit': !isFull,
              }"
              class="uppercase rounded-xl bg-[#202020] border border-solid border-[#5c5c5c] hover:border-[var(--green)] hover:outline hover:outline-[#3db57740] gap-2 flex p-2"
              @click.stop="isOpen = true">
              <img src="@/assets/images/user.svg" />
              {{ customer.last_name }} {{ customer.first_name }}
              {{ customer.surname }}
            </div>
          </div>
        </PopoverTrigger>
      </div>
      <PopoverContent
        :class="{ dark: darkStore.isDark }"
        class="mt-2 w-fit bg-[#1111117e] border backdrop-blur-[7.5px] rounded-xl translate-x-0 text-primary">
        <h2 class="text-sm mb-1 text-muted-foreground">Контакти</h2>
        <div
          class="border p-4 rounded-xl flex bg-[#23232381] backdrop-blur-[7.5px] flex-col gap-2 text-sm">
          <div class="border-b pb-2 flex gap-2">
            <img src="@/assets/images/user.svg" /> {{ customer.last_name }}
            {{ customer.first_name }}
            {{ customer.surname }}
          </div>
          <div class="border-b pb-2 flex gap-2">
            <img src="@/assets/images/phone.svg" />
            {{ customer.phone }}
          </div>
          <div class="border-b flex gap-2 pb-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none">
              <path
                d="M16.666 9.99984C16.666 6.31794 13.6813 3.33317 9.99935 3.33317C6.31745 3.33317 3.33268 6.31794 3.33268 9.99984C3.33268 13.6818 6.31745 16.6665 9.99935 16.6665C11.3675 16.6665 12.6394 16.2543 13.6978 15.5474L14.6223 16.9343C13.2995 17.818 11.7096 18.3332 9.99935 18.3332C5.39697 18.3332 1.66602 14.6022 1.66602 9.99984C1.66602 5.39746 5.39697 1.6665 9.99935 1.6665C14.6017 1.6665 18.3327 5.39746 18.3327 9.99984V11.2498C18.3327 12.8607 17.0268 14.1665 15.416 14.1665C14.4125 14.1665 13.5273 13.6597 13.0025 12.8881C12.2445 13.6761 11.1792 14.1665 9.99935 14.1665C7.69817 14.1665 5.83268 12.301 5.83268 9.99984C5.83268 7.69865 7.69817 5.83317 9.99935 5.83317C10.9375 5.83317 11.8033 6.14325 12.4998 6.6665H14.166V11.2498C14.166 11.9402 14.7257 12.4998 15.416 12.4998C16.1063 12.4998 16.666 11.9402 16.666 11.2498V9.99984ZM9.99935 7.49984C8.6186 7.49984 7.49935 8.61909 7.49935 9.99984C7.49935 11.3806 8.6186 12.4998 9.99935 12.4998C11.3801 12.4998 12.4993 11.3806 12.4993 9.99984C12.4993 8.61909 11.3801 7.49984 9.99935 7.49984Z"
                fill="#5061F9" />
            </svg>
            {{ customer.email }}
          </div>
          <div class="pb-2 w-52 flex gap-2">
            <div class="w-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-min-15 h-5"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none">
                <path
                  d="M17.5 16.6668C17.5 17.127 17.1269 17.5001 16.6667 17.5001H3.33333C2.8731 17.5001 2.5 17.127 2.5 16.6668V7.90768C2.5 7.65052 2.61873 7.40776 2.82172 7.24989L9.48842 2.0647C9.78933 1.83065 10.2107 1.83065 10.5116 2.0647L17.1782 7.24989C17.3812 7.40776 17.5 7.65052 17.5 7.90768V16.6668Z"
                  fill="#BB3BDC" />
              </svg>
            </div>
            {{ waybill }}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>

<style scoped></style>
