import { Card, Empty } from "antd";
import { Line } from "@ant-design/charts";
import type { DailyPoint } from "../utils/aggregates.ts";

type Row = { label: string; type: string; count: number };

function toChartData(points: DailyPoint[]): Row[] {
  return points.flatMap((p) => [
    { label: p.label, type: "Прости", count: p.prosti },
    { label: p.label, type: "Извини", count: p.izvini },
    { label: p.label, type: "Оба", count: p.both },
  ]);
}

type Props = {
  points: DailyPoint[];
  title: string;
};

export function FrequencyChart({ points, title }: Props) {
  if (points.length === 0) {
    return (
      <Card title={title}>
        <Empty description="Нет данных для графика" />
      </Card>
    );
  }

  const data = toChartData(points);

  return (
    <Card title={title}>
      <Line
        data={data}
        xField="label"
        yField="count"
        seriesField="type"
        smooth
        animation={{
          appear: {
            animation: "path-in",
            duration: 500,
          },
        }}
        legend={{ position: "top" }}
        height={320}
      />
    </Card>
  );
}
