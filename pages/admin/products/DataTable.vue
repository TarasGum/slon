<script setup lang="ts" generic="TData, TValue">
import {
  ref,
  onMounted,
  onUnmounted,
  defineProps,
  defineEmits,
  watch,
} from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import { FlexRender, getCoreRowModel, useVueTable } from "@tanstack/vue-table";

const props = defineProps<{
  columns: ColumnDef<TData | any, TValue>[];
  data: TData[];
}>();

const emit = defineEmits<{ (e: "intersect"): void }>();

let table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getCoreRowModel: getCoreRowModel(),
});

watch(props.data, () => {
  table = useVueTable({
    get data() {
      return props.data;
    },
    get columns() {
      return props.columns;
    },
    getCoreRowModel: getCoreRowModel(),
  });
});

// Intersection Observer
let observer: IntersectionObserver;
let lastObservedElement: Element | null = null;

const observeLastRow = () => {
  setTimeout(() => {
    const lastRow = document.querySelector("#last-row");
    if (lastRow) {
      observer.observe(lastRow);
      lastObservedElement = lastRow;
    }
  }, 200);
};

const handleIntersect = () => {
  if (lastObservedElement) {
    observer.unobserve(lastObservedElement);
    lastObservedElement.removeAttribute("id");
  }
  emit("intersect");
  observeLastRow();
};

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        handleIntersect();
      }
    });
  });
  observeLastRow();
});

watch(
  () => props.data,
  () => {
    observeLastRow();
  }
);

onUnmounted(() => {
  if (observer && lastObservedElement) {
    observer.unobserve(lastObservedElement);
  }
  observer.disconnect();
});
</script>

<template>
  <div class="border rounded-[14px] h-[60vh] overflow-scroll w-full">
    <Table>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="(row, idx) in table.getRowModel().rows"
            :id="idx === table.getRowModel().rows.length - 3 ? 'last-row' : ''"
            :key="row.id"
            class="bg-[#191919] relative"
            :data-state="row.getIsSelected() ? 'selected' : undefined">
            <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell
              :colSpan="columns.length"
              class="h-24 hover:bg-transparent text-center">
              No results.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>
