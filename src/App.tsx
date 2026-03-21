import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  App as AntApp,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Layout,
  Modal,
  Row,
  Segmented,
  Spin,
  Typography,
} from "antd";
import ruRU from "antd/locale/ru_RU";
import { ApologyForm } from "./components/ApologyForm.tsx";
import { DataWarning } from "./components/DataWarning.tsx";
import { EntryList } from "./components/EntryList.tsx";
import { ExportJsonButton } from "./components/ExportJsonButton.tsx";
import { StatsPanel } from "./components/StatsPanel.tsx";

const FrequencyChart = lazy(async () => {
  const m = await import("./components/FrequencyChart.tsx");
  return { default: m.FrequencyChart };
});
import { dayjs } from "./dayjs.ts";
import type { Dayjs } from "dayjs";
import { useApologyStore } from "./store/useApologyStore.ts";
import type { ApologyEntry } from "./types/apologyEntry.ts";
import {
  filterByPeriod,
  formatPeriodTitle,
  getPeriodDayRange,
  periodLabel,
  type Period,
} from "./utils/period.ts";
import { aggregatePhraseCounts, buildDailyPoints } from "./utils/aggregates.ts";
import "./App.css";

const { Header, Content } = Layout;

function AppContent() {
  const { entries, hydrated, hydrate, add, update, remove } = useApologyStore();
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState<Dayjs>(() => dayjs());
  const [editing, setEditing] = useState<ApologyEntry | null>(null);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  const filtered = useMemo(
    () => filterByPeriod(entries, anchor, period),
    [entries, anchor, period],
  );

  const counts = useMemo(() => aggregatePhraseCounts(filtered), [filtered]);

  const chartPoints = useMemo(() => {
    if (period === "day") {
      return [];
    }
    const [start, end] = getPeriodDayRange(anchor, period);
    return buildDailyPoints(filtered, start, end);
  }, [filtered, anchor, period]);

  const periodTitle = formatPeriodTitle(anchor, period);

  if (!hydrated) {
    return (
      <div className="app-loading">
        <Spin size="large" description="Загрузка записей…" />
      </div>
    );
  }

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Typography.Title level={3} style={{ margin: 0, color: "inherit" }}>
          Прости, Извини
        </Typography.Title>
        <Typography.Text type="secondary" className="app-header-sub">
          Дневник осознанных извинений
        </Typography.Text>
      </Header>
      <Content className="app-content">
        <div className="app-inner">
          <DataWarning />

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} lg={10}>
              <Card title="Новая запись">
                <ApologyForm
                  submitLabel="Сохранить запись"
                  onSubmit={async (p) => {
                    await add(p);
                  }}
                />
              </Card>
              <Card style={{ marginTop: 16 }} title="Данные">
                <ExportJsonButton entries={entries} />
              </Card>
            </Col>
            <Col xs={24} lg={14}>
              <Card
                title="Период"
                styles={{ body: { paddingBottom: 8 } }}
              >
                <Row gutter={[12, 12]} align="middle">
                  <Col flex="auto">
                    <Segmented<Period>
                      value={period}
                      onChange={setPeriod}
                      options={[
                        { label: periodLabel("day"), value: "day" },
                        { label: periodLabel("week"), value: "week" },
                        { label: periodLabel("month"), value: "month" },
                      ]}
                    />
                  </Col>
                  <Col>
                    <DatePicker
                      value={anchor}
                      onChange={(d) => d && setAnchor(d)}
                      picker={period === "month" ? "month" : period === "week" ? "week" : "date"}
                      allowClear={false}
                      format={
                        period === "month"
                          ? "MMMM YYYY"
                          : period === "week"
                            ? "[Неделя] w-я [неделя] YYYY"
                            : "DD.MM.YYYY"
                      }
                    />
                  </Col>
                </Row>
              </Card>

              <div style={{ marginTop: 16 }}>
                <StatsPanel counts={counts} periodTitle={periodTitle} />
              </div>

              {period !== "day" ? (
                <div style={{ marginTop: 16 }}>
                  <Suspense
                    fallback={
                      <Card title={`Частота по дням (${periodLabel(period).toLowerCase()})`}>
                        <Spin />
                      </Card>
                    }
                  >
                    <FrequencyChart
                      points={chartPoints}
                      title={`Частота по дням (${periodLabel(period).toLowerCase()})`}
                    />
                  </Suspense>
                </div>
              ) : null}

              <div style={{ marginTop: 16 }}>
                <EntryList
                  entries={filtered}
                  onEdit={(e) => setEditing(e)}
                  onDelete={(id) => void remove(id)}
                />
              </div>
            </Col>
          </Row>
        </div>
      </Content>

      <Modal
        title="Редактировать запись"
        open={editing !== null}
        onCancel={() => setEditing(null)}
        footer={null}
        destroyOnHidden
        width={560}
      >
        {editing ? (
          <ApologyForm
            key={editing.id}
            initial={editing}
            submitLabel="Сохранить"
            onSubmit={async () => {}}
            onUpdate={async (entry) => {
              await update(entry);
              setEditing(null);
            }}
            onCancel={() => setEditing(null)}
          />
        ) : null}
      </Modal>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider locale={ruRU}>
      <AntApp>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
