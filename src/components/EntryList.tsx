import { Button, Card, Empty, Flex, Popconfirm, Space, Tag, Typography } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ApologyEntry } from "../types/apologyEntry.ts";
import { groupEntriesByDay } from "../utils/aggregates.ts";

const phraseTag = (t: ApologyEntry["phraseType"]) => {
  switch (t) {
    case "prosti":
      return <Tag color="blue">Прости</Tag>;
    case "izvini":
      return <Tag color="purple">Извини</Tag>;
    default:
      return <Tag>Оба</Tag>;
  }
};

type Props = {
  entries: ApologyEntry[];
  onEdit: (entry: ApologyEntry) => void;
  onDelete: (id: string) => void;
};

export function EntryList({ entries, onEdit, onDelete }: Props) {
  const groups = groupEntriesByDay(entries);

  if (entries.length === 0) {
    return (
      <Card title="Записи">
        <Empty description="Пока нет записей за выбранный период — добавьте первую или смените дату." />
      </Card>
    );
  }

  return (
    <Card title="Записи">
      <Space orientation="vertical" size="large" style={{ width: "100%" }}>
        {groups.map(({ dayLabel, items }) => (
          <div key={dayLabel}>
            <Typography.Title level={5} style={{ marginTop: 0 }}>
              {dayLabel}
            </Typography.Title>
            <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
              {items.map((item) => (
                <Flex
                  key={item.id}
                  align="flex-start"
                  justify="space-between"
                  gap="middle"
                  wrap="wrap"
                  style={{
                    padding: "12px 0",
                    borderBottom: "1px solid rgba(0,0,0,0.06)",
                  }}
                >
                  <div style={{ flex: "1 1 240px", minWidth: 0 }}>
                    <Space wrap>
                      {phraseTag(item.phraseType)}
                      <Typography.Text>
                        {item.toWhom ? `Кому: ${item.toWhom}` : "Кому не указано"}
                      </Typography.Text>
                    </Space>
                    <div style={{ marginTop: 8 }}>
                      <Space orientation="vertical" size={4}>
                        {item.reason ? (
                          <Typography.Text type="secondary">Почему: {item.reason}</Typography.Text>
                        ) : null}
                        {item.reflection ? (
                          <Typography.Text>Выводы: {item.reflection}</Typography.Text>
                        ) : null}
                      </Space>
                    </div>
                  </div>
                  <Space>
                    <Button
                      type="text"
                      icon={<EditOutlined />}
                      aria-label="Редактировать"
                      onClick={() => onEdit(item)}
                    />
                    <Popconfirm
                      title="Удалить запись?"
                      okText="Удалить"
                      cancelText="Отмена"
                      onConfirm={() => onDelete(item.id)}
                    >
                      <Button type="text" danger icon={<DeleteOutlined />} aria-label="Удалить" />
                    </Popconfirm>
                  </Space>
                </Flex>
              ))}
            </Space>
          </div>
        ))}
      </Space>
    </Card>
  );
}
