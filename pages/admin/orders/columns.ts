import { h } from "vue";
import type { ColumnDef } from "@tanstack/vue-table";
import statusDropdown from "./statusDropdown.vue";
import UpdateDelete from "./update-delete.vue";
import customerInfo from "./customer-info.vue";
export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "status",

    cell: (row) =>
      h(statusDropdown, {
        currentStatus: row.row.original.status,
        id: row.row.original.id,
      }),
  },

  {
    accessorKey: "id",
    cell: ({ row }) =>
      h(
        "div",
        { class: "border p-3 w-14 -translate-x-5 text-center px-4 rounded-xl" },
        row.original.id
      ),
  },

  {
    accessorKey: "customer",
    cell: ({ row }) => {
      return h(customerInfo, {
        customer: row.original.customer,
        waybill: row.original.waybill,
      });
    },
  },
  {
    accessorKey: "price",

    cell: ({ row }) => {
      const res = row.original.order_items.reduce(
        (accum: number, item: any) => {
          return accum + +item.price * item.quantity;
        },
        0
      );

      return h("div", {
        innerHTML:
          "<div class='text-[var(--green)]   font-bold' >₴</div>" +
          res +
          " грн",
        class:
          "w-[8vw]  flex pt-2 justify-center items-center max-h-[38px] gap-2.5 self-stretch flex rounded-xl border border-[#5c5c5c] min-w-24 justify-center items-center gap-2.5 self-stretch pb-2 px-2",
      });
    },
  },
  {
    accessorKey: "updateDelete",

    cell: (row) =>
      h(UpdateDelete, {
        id: row.row.original.id,
        order: row.row.original,
      }),
  },
];
