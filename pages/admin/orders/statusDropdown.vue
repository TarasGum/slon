<script setup lang="ts">
const props = defineProps<{
  currentStatus: string;
  id: number;
  small?: boolean;
  notReloadData?: boolean;
}>();
import { useDarkStore } from "~/stores/dark";
const darkStore = useDarkStore();
const statusHandle: Record<string, string> = {
  raw: "Не Опрацьований",
  completed: "Виконано",
  failed: "НЕУСПІШНИЙ",
};

const token = useCookie("token");
const statusOrder = ref(props.currentStatus);

const changeStatus = async (newStatus: string) => {
  const originalStatus = statusOrder.value;
  statusOrder.value = newStatus;

  try {
    const { data }: { data: any } = await $fetch(
      `https://api.slooon.shop/api/orders/${props.id}/`,
      {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token.value}`,
        },
      }
    );
    if (!props.notReloadData) {
      refreshNuxtData();
    }
  } catch (error) {
    statusOrder.value = originalStatus;
    console.error("Failed to update status:", error);
  }
};

watch(statusOrder, (newStatus) => {
  if (newStatus !== props.currentStatus) {
    changeStatus(newStatus);
  }
});
</script>

<template>
  <Select
    v-model="statusOrder"
    class="flex flex-col justify-center items-center bg-[#191919]">
    <SelectTrigger
      v-bind="$attrs"
      have-no-check
      :class="{
        'px-[12px] py-[8px]': small,
        'rounded-[10px] border shadow-[0px_0px_0px_2px] bg-[#191919]': true,
        'border-[#23A901] text-[#23A901]  shadow-[#32624A]':
          statusOrder === 'completed',
        'border-[#9B9B9B] text-[var(-White)]  shadow-[rgba(219,219,219,0.20)]':
          statusOrder === 'raw',
        'border-[#BE2F2F] text-[#BE2F2F]  shadow-[#662D2D]':
          statusOrder === 'failed',
      }"
      class="w-[156px] py-2 h-[32px] rounded-[10px] flex items-center justify-center">
      <SelectValue
        class="text-center"
        :placeholder="statusHandle[statusOrder]" />
    </SelectTrigger>
    <SelectContent
      class="bg-[#191919] border-[var(--White)] border h-fit flex flex-col rounded-[14px] gap-[10px]">
      <SelectGroup>
        <SelectItem
          class="hover:brightness-125 text-[var(--White)] transition-all rounded-[10px] border border-[#9B9B9B] bg-[#191919] shadow-[0px_0px_0px_2px_rgba(219,219,219,0.20)] w-[156px] h-[38px] flex items-center justify-center my-2.5"
          value="raw">
          НЕ ОПРАЦЬОВАНИЙ
        </SelectItem>
        <SelectItem
          class="hover:brightness-125 text-[#23A901] transition-all rounded-[10px] border border-[#23A901] bg-[#191919] shadow-[0px_0px_0px_2px_#32624A] w-[156px] h-[38px] flex items-center justify-center mb-2.5"
          value="completed">
          ВИКОНАНИЙ
        </SelectItem>
        <SelectItem
          class="hover:brightness-125 text-[#BE2F2F] text-[var(--White)] transition-all rounded-[10px] border border-[#BE2F2F] bg-[#191919] shadow-[0px_0px_0px_2px_#662D2D] w-[156px] h-[38px] flex items-center justify-center mb-2.5"
          value="failed">
          НЕУСПІШНИЙ
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>

<style scoped>
.bg-muted:hover {
  background-color: var(--muted-color, #f5f5f5);
}
</style>
