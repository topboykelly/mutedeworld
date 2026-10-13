"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";
import { sizeGuide } from "@/data/store";
import { Modal } from "../ui/Modal";

export function SizeGuide() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted underline-offset-4 transition-colors hover:text-accent hover:underline"
      >
        <Ruler className="size-4" aria-hidden="true" />
        Size guide
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Size Guide">
        <p className="mt-2 text-sm text-muted">{sizeGuide.note}</p>
        <div className="mt-6 flex flex-col gap-6">
          {sizeGuide.tables.map((table) => (
            <div key={table.title}>
              <h3 className="font-semibold">{table.title}</h3>
              <div className="mt-3 overflow-x-auto rounded-2xl border border-ink/10">
                <table className="w-full text-sm">
                  <thead className="bg-paper text-left">
                    <tr>
                      {table.columns.map((col) => (
                        <th key={col} scope="col" className="px-4 py-2.5 font-medium">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.rows.map((row) => (
                      <tr key={row[0]} className="border-t border-ink/5">
                        {row.map((cell, i) =>
                          i === 0 ? (
                            <th key={i} scope="row" className="px-4 py-2.5 text-left font-semibold">
                              {cell}
                            </th>
                          ) : (
                            <td key={i} className="px-4 py-2.5 text-muted tabular-nums">
                              {cell}
                            </td>
                          ),
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
