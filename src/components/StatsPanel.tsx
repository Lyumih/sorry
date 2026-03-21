import { Card, Col, Row, Statistic, Typography } from "antd";
import type { PhraseCounts } from "../utils/aggregates.ts";

type Props = {
  counts: PhraseCounts;
  periodTitle: string;
};

export function StatsPanel({ counts, periodTitle }: Props) {
  return (
    <Card title={`Сводка: ${periodTitle}`}>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Формулировка: «Прости, Извини»
      </Typography.Paragraph>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Statistic title="Записей за период" value={counts.total} />
        </Col>
      </Row>
    </Card>
  );
}
