import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import UpdateDelete from "./update-delete.vue";

export const columns: ColumnDef<Product>[] = [
  {
    accessorKey: "title",
    cell: (row) =>
      h("div", {
        innerHTML: `
        <div> ${row.row.original.year} | Категорія: ${row.row.original.category.name}</div>
        <div>${row.row.original.title}</div>  `,
      }),
    header: () => h("div", { class: "w-[15vw] " }, "tea"),
  },
  {
    accessorKey: "packaging",
    accessorFn(row) {
      const res = row.variants.map((element) => {
        if (element.packaging !== "гр") {
          return element.packaging;
        } else return "-";
      });

      return res.join("  / ");
    },
    header: () => h("div", { class: "w-[15vw] " }, "weight"),
  },
  {
    accessorKey: "inventory",
    accessorFn(row) {
      const res = row.variants.map((element) => element.inventory + " шт");
      return res.join("  / ");
    },
    header: () => h("div", "availability"),
  },
  {
    accessorKey: "price",
    accessorFn(row) {
      const res = row.variants.map((element) => element.price + " грн");
      return res.join("  / ");
    },
    header: () => h("div", { class: "w-[20vw] " }, "price"),
  },
  {
    accessorKey: "updateDelete",

    cell: (row) =>
      h(UpdateDelete, {
        product: row.row.original,
      }),
    header: () => h("div", { class: "w-[6.5vw]" }, ""),
  },
];
