"use client";

import { useActionState } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { importCsvAction } from "@/app/admin/actions";
import type { ImportState, ImportType } from "@/lib/csv-import";

const initialState: ImportState = {};

const titleByType: Record<ImportType, string> = {
  teams: "Import đội",
  challenges: "Import thử thách",
  answers: "Import đáp án"
};

const columnsByType: Record<ImportType, string> = {
  teams: "season_id,team_id,team_name,password",
  challenges: "season_id,door,title,mission,file_url,difficulty,module,is_boss",
  answers: "season_id,team_id,door,key"
};

export function ImportPanel({ type, seasonId }: { type: ImportType; seasonId?: string }) {
  const [state, formAction, pending] = useActionState(importCsvAction, initialState);

  const downloadTemplate = () => {
    const sId = seasonId || "f853dea1-4161-44f9-9b27-b1bf48a4ce4c";
    let content = columnsByType[type] + "\n";
    if (type === "teams") {
      content += `${sId},T01,Doi Sao Vang,123456\n${sId},T02,Doi Kim Dong,123456`;
    } else if (type === "challenges") {
      content += `${sId},1,Khoi dong he thong,Giai ma thong diep an o duoi gam ban,,1,Khoi dong,false\n${sId},2,Cua logic robot,Tim to hop bit 1 va 0 de bat den xanh,,2,Logic,false`;
    } else if (type === "answers") {
      content += `${sId},T01,1,KHOA-RIENG-T01-C1\n${sId},T02,1,KHOA-RIENG-T02-C1`;
    }

    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `template_${type}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="rounded-xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold text-ink">
            <FileSpreadsheet size={19} aria-hidden="true" />
            {titleByType[type]}
          </h3>
          <p className="mt-1 break-all text-xs text-slate-500">{columnsByType[type]}</p>
        </div>
      </div>
      <form action={formAction} className="mt-4 grid gap-3">
        <input type="hidden" name="type" value={type} />
        <input
          className="focus-ring w-full rounded-lg border border-line bg-panel px-3 py-2 text-sm"
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={downloadTemplate}
            className="focus-ring rounded-lg border border-line bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Tải mẫu
          </button>
          <button
            className="focus-ring rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-ink hover:bg-panel disabled:opacity-60"
            name="mode"
            value="preview"
            disabled={pending}
          >
            Xem trước
          </button>
          <button
            className="focus-ring inline-flex items-center gap-2 rounded-lg bg-circuit px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            name="mode"
            value="import"
            disabled={pending}
          >
            <Upload size={16} aria-hidden="true" />
            Nhập
          </button>
        </div>
      </form>
      {state.message ? (
        <div
          className={
            state.ok
              ? "mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800"
              : "mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800"
          }
        >
          {state.message}
        </div>
      ) : null}
      {state.errors?.length ? (
        <ul className="mt-3 space-y-1 text-sm text-red-700">
          {state.errors.slice(0, 8).map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      {state.rows?.length ? (
        <div className="mt-4 overflow-x-auto rounded-lg border border-line">
          <table className="min-w-[560px] text-left text-xs">
            <thead className="bg-panel text-slate-600">
              <tr>
                {Object.keys(state.rows[0]).map((key) => (
                  <th className="px-3 py-2" key={key}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {state.rows.map((row, index) => (
                <tr className="border-t border-line" key={index}>
                  {Object.values(row).map((value, valueIndex) => (
                    <td className="px-3 py-2" key={valueIndex}>
                      {String(value ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
