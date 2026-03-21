import { Button, DatePicker, Form, Input, Radio, Space } from "antd";
import type { ApologyEntry, NewApologyEntry, PhraseType } from "../types/apologyEntry.ts";
import { useEffect } from "react";
import { dayjs } from "../dayjs.ts";
import type { Dayjs } from "dayjs";

const PHRASE_OPTIONS: { label: string; value: PhraseType }[] = [
  { label: "«Прости»", value: "prosti" },
  { label: "«Извини»", value: "izvini" },
  { label: "Оба / не различаю", value: "both" },
];

type FormValues = {
  createdAt: Dayjs;
  phraseType: PhraseType;
  toWhom: string;
  reason: string;
  reflection: string;
};

function trim(s: string | undefined): string {
  return (s ?? "").trim();
}

function valuesToNewEntry(values: FormValues): NewApologyEntry {
  return {
    createdAt: values.createdAt.toISOString(),
    phraseType: values.phraseType,
    toWhom: trim(values.toWhom),
    reason: trim(values.reason),
    reflection: trim(values.reflection),
  };
}

function entryToFormValues(entry: ApologyEntry): FormValues {
  return {
    createdAt: dayjs(entry.createdAt),
    phraseType: entry.phraseType,
    toWhom: entry.toWhom,
    reason: entry.reason,
    reflection: entry.reflection,
  };
}

type Props = {
  submitLabel: string;
  initial?: ApologyEntry;
  onSubmit: (payload: NewApologyEntry) => Promise<void>;
  onUpdate?: (entry: ApologyEntry) => Promise<void>;
  onCancel?: () => void;
};

export function ApologyForm({ submitLabel, initial, onSubmit, onUpdate, onCancel }: Props) {
  const [form] = Form.useForm<FormValues>();

  useEffect(() => {
    if (initial) {
      form.setFieldsValue(entryToFormValues(initial));
    }
  }, [initial, form]);

  const handleFinish = async (values: FormValues) => {
    const t = trim(values.toWhom);
    const r = trim(values.reason);
    const f = trim(values.reflection);
    if (!t && !r && !f) {
      form.setFields([
        {
          name: "reason",
          errors: ["Заполните хотя бы одно поле: кому, почему или выводы"],
        },
      ]);
      return;
    }
    const base = valuesToNewEntry(values);
    if (initial && onUpdate) {
      await onUpdate({ ...base, id: initial.id });
    } else {
      await onSubmit(base);
      form.resetFields();
      form.setFieldsValue({
        createdAt: dayjs(),
        phraseType: "prosti",
        toWhom: "",
        reason: "",
        reflection: "",
      });
    }
  };

  return (
    <Form<FormValues>
      form={form}
      layout="vertical"
      onFinish={handleFinish}
      initialValues={{
        createdAt: dayjs(),
        phraseType: "prosti" as PhraseType,
        toWhom: "",
        reason: "",
        reflection: "",
      }}
      key={initial?.id ?? "new"}
    >
      <Form.Item
        label="Когда произошло"
        name="createdAt"
        rules={[{ required: true, message: "Укажите дату и время" }]}
      >
        <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item label="Тип фразы" name="phraseType" rules={[{ required: true }]}>
        <Radio.Group optionType="button" options={PHRASE_OPTIONS} />
      </Form.Item>

      <Form.Item label="Кому" name="toWhom">
        <Input placeholder="Например: коллеге, партнёру" allowClear />
      </Form.Item>

      <Form.Item label="Почему / контекст" name="reason">
        <Input.TextArea rows={3} placeholder="Что произошло" allowClear />
      </Form.Item>

      <Form.Item label="Анализ / выводы" name="reflection">
        <Input.TextArea rows={3} placeholder="Что понял, что сделаете иначе" allowClear />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit">
            {submitLabel}
          </Button>
          {onCancel ? (
            <Button htmlType="button" onClick={onCancel}>
              Отмена
            </Button>
          ) : null}
        </Space>
      </Form.Item>
    </Form>
  );
}
