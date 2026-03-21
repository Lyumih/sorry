import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import {
  App as AntApp,
  Button,
  Card,
  Col,
  Collapse,
  ConfigProvider,
  DatePicker,
  Layout,
  Modal,
  Row,
  Segmented,
  Spin,
} from "antd";
import { appRuLocale } from "./locale/appRuLocale.ts";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { ApologyForm } from "./components/ApologyForm.tsx";
import { EntryList } from "./components/EntryList.tsx";
import { ExportJsonButton } from "./components/ExportJsonButton.tsx";
import { HelpModal } from "./components/HelpModal.tsx";
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

const { Content } = Layout;

type AppView = "journal" | "stats";

function AppContent() {
  const { entries, hydrated, hydrate, add, update, remove } = useApologyStore();
  const [view, setView] = useState<AppView>("journal");
  const [period, setPeriod] = useState<Period>("week");
  const [anchor, setAnchor] = useState<Dayjs>(() => dayjs());
  const [editing, setEditing] = useState<ApologyEntry | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

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
      <div className="app-view-dock">
        <Segmented<AppView>
          value={view}
          onChange={setView}
          options={[
            { label: "Дневник", value: "journal" },
            { label: "Статистика", value: "stats" },
          ]}
        />
        <Button
          type="text"
          aria-label="Справка"
          title="Справка"
          icon={<QuestionCircleOutlined />}
          onClick={() => setHelpOpen(true)}
        />
      </div>
      <Content className="app-content">
        {view === "journal" ? (
          <div className="journal-screen">
            <div className="journal-main">
              <div className="journal-inner">
                <div className="journal-form-wrap">
                  <ApologyForm
                    variant="minimal"
                    submitLabel="Сохранить"
                    onSubmit={async (p) => {
                      await add(p);
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="journal-feed">
              <Collapse
                bordered={false}
                className="journal-feed-collapse"
                expandIcon={() => null}
                items={[
                  {
                    key: "feed",
                    label: `История (${entries.length})`,
                    children: (
                      <EntryList
                        entries={entries}
                        title={false}
                        emptyDescription="Пока нет записей — добавьте первую выше."
                        onEdit={(e) => setEditing(e)}
                        onDelete={(id) => void remove(id)}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>
        ) : (
          <div className="app-inner">
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              <Col xs={24} lg={10}>
                <Card>
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
                <Card title="Период" styles={{ body: { paddingBottom: 8 } }}>
                  <Row gutter={[12, 12]} align="middle">
                    <Col flex="auto">
                      <Segmented<Period>
                        value={period}
                        onChange={setPeriod}
                        options={[
                          { label: periodLabel("day"), value: "day" },
                          { label: periodLabel("week"), value: "week" },
                          { label: periodLabel("month"), value: "month" },
                          { label: periodLabel("year"), value: "year" },
                        ]}
                      />
                    </Col>
                    <Col>
                      <DatePicker
                        value={anchor}
                        onChange={(d) => d && setAnchor(d)}
                        picker={
                          period === "year"
                            ? "year"
                            : period === "month"
                              ? "month"
                              : period === "week"
                                ? "week"
                                : "date"
                        }
                        allowClear={false}
                        format={
                          period === "year"
                            ? "YYYY"
                            : period === "month"
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
        )}
      </Content>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

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
    <ConfigProvider locale={appRuLocale}>
      <AntApp>
        <AppContent />
      </AntApp>
    </ConfigProvider>
  );
}

export default App;
