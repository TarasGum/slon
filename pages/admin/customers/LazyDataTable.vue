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
    <Table class="-mt-[1.8px]">
      <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id">
          <!-- <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()" />
          </TableHead> -->
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="(row, idx) in table.getRowModel().rows"
            :id="idx === table.getRowModel().rows.length - 3 ? 'last-row' : ''"
            class="bg-[#191919] relative border-t-0 border-b !h-[68px]"
            :key="row.id"
            :data-state="row.getIsSelected() ? 'selected' : undefined">
            <TableCell
              class="py-0 px-[14px]"
              v-for="cell in row.getVisibleCells()"
              :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell :colSpan="columns.length" class="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
