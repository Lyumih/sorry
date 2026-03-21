import { Button } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import type { ApologyEntry } from "../types/apologyEntry.ts";
import { EXPORT_SCHEMA_VERSION } from "../schema/export.ts";

type Props = {
  entries: ApologyEntry[];
};

export function ExportJsonButton({ entries }: Props) {
  const handleExport = () => {
    const payload = {
      schemaVersion: EXPORT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      entries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prostoy-izvini-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button icon={<DownloadOutlined />} onClick={handleExport}>
      Скачать JSON
    </Button>
  );
}
