import { Card, Col, Row, Statistic } from "antd";
import type { PhraseCounts } from "../utils/aggregates.ts";

type Props = {
  counts: PhraseCounts;
  periodTitle: string;
};

export function StatsPanel({ counts, periodTitle }: Props) {
  return (
    <Card title={`Сводка: ${periodTitle}`}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8}>
          <Statistic title="Всего записей" value={counts.total} />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic title="«Прости»" value={counts.prosti} />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic title="«Извини»" value={counts.izvini} />
        </Col>
        <Col xs={12} sm={8}>
          <Statistic title="Оба / не различаю" value={counts.both} />
        </Col>
      </Row>
    </Card>
  );
}
