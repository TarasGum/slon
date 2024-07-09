<script setup lang="ts" generic="TData, TValue">
import type { ColumnDef } from "@tanstack/vue-table";
import { FlexRender, getCoreRowModel, useVueTable } from "@tanstack/vue-table";
import categoryChangeToggle from "./categoryChangeToggle.vue";
const props = defineProps<{
  columns: ColumnDef<TData | any, TValue>[];
  data: TData[];
}>();
const table = useVueTable({
  get data() {
    return props.data;
  },
  get columns() {
    return props.columns;
  },
  getCoreRowModel: getCoreRowModel(),
});
</script>

<template>
  <div class="border rounded-[14px] overflow-hidden w-full">
    <Table>
      <!-- <TableHeader>
        <TableRow
          v-for="headerGroup in table.getHeaderGroups()"
          :key="headerGroup.id">
          <TableHead v-for="header in headerGroup.headers" :key="header.id">
            <FlexRender
              v-if="!header.isPlaceholder"
              :render="header.column.columnDef.header"
              :props="header.getContext()" />
          </TableHead>
        </TableRow>
      </TableHeader> -->
      <TableBody>
        <template v-if="table.getRowModel().rows?.length">
          <TableRow
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="bg-[#191919] relative !h-[68px]"
            :data-state="row.getIsSelected() ? 'selected' : undefined">
            <TableCell
              class="py-0"
              v-for="cell in row.getVisibleCells()"
              :key="cell.id">
              <FlexRender
                :render="cell.column.columnDef.cell"
                :props="cell.getContext()" />
            </TableCell>

            <td
              class="p-4 w-[440px] ml-auto flex justify-end items-end gap-2 [&amp;:has([role=checkbox])]:pr-0">
              <categoryChangeToggle
                :id="row.original.id"
                :name="row.original.name" />
            </td>
          </TableRow>
        </template>
        <template v-else>
          <TableRow>
            <TableCell
              :colSpan="columns.length"
              class="h-24 hover:bg-[#161616] text-center">
              No results.
            </TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>
  </div>
</template>
