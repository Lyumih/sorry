import { Button, DatePicker, Form, Input, Space, Typography } from "antd";
import type { ApologyDirection, ApologyEntry, NewApologyEntry } from "../types/apologyEntry.ts";
import { useEffect } from "react";
import { dayjs } from "../dayjs.ts";
import type { Dayjs } from "dayjs";

type FormValues = {
  createdAt: Dayjs;
  direction: ApologyDirection;
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
    direction: values.direction ?? "i_said",
    toWhom: trim(values.toWhom),
    reason: trim(values.reason),
    reflection: trim(values.reflection),
  };
}

type DirectionToggleProps = {
  value?: ApologyDirection;
  onChange?: (v: ApologyDirection) => void;
};

/** Одна кнопка: по нажатию переключает «Я» ↔ «Мне». */
function DirectionToggleButton({ value = "i_said", onChange }: DirectionToggleProps) {
  const next: ApologyDirection = value === "i_said" ? "said_to_me" : "i_said";
  return (
    <Button
      type="text"
      htmlType="button"
      onClick={() => onChange?.(next)}
      aria-pressed={value === "said_to_me"}
      aria-label={
        value === "i_said"
          ? "Сейчас: я извинился. Нажмите, чтобы отметить, что вам сказали извинение"
          : "Сейчас: мне сказали. Нажмите, чтобы отметить, что вы извинились"
      }
    >
      {value === "i_said" ? "Я" : "Мне"}
    </Button>
  );
}

function entryToFormValues(entry: ApologyEntry): FormValues {
  return {
    createdAt: dayjs(entry.createdAt),
    direction: entry.direction,
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
  /** Полная форма (редактирование, экран статистики) или минималистичный ввод (экран дневника). */
  variant?: "full" | "minimal";
};

export function ApologyForm({
  submitLabel,
  initial,
  onSubmit,
  onUpdate,
  onCancel,
  variant = "full",
}: Props) {
  const [form] = Form.useForm<FormValues>();
  const direction = Form.useWatch("direction", form) ?? "i_said";

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
          errors: ["Заполните хотя бы одно поле: кому, почему или анализ"],
        },
      ]);
      return;
    }
    const effective: FormValues =
      variant === "minimal" && !initial
        ? {
            direction: values.direction ?? "i_said",
            toWhom: values.toWhom ?? "",
            reason: values.reason ?? "",
            reflection: values.reflection ?? "",
            createdAt: dayjs(),
          }
        : values;
    const base = valuesToNewEntry(effective);
    if (initial && onUpdate) {
      await onUpdate({ ...base, id: initial.id });
    } else {
      await onSubmit(base);
      form.resetFields();
      form.setFieldsValue({
        createdAt: dayjs(),
        direction: "i_said",
        toWhom: "",
        reason: "",
        reflection: "",
      });
    }
  };

  const metaFields = (
    <Form.Item
      label="Дата"
      name="createdAt"
      required={false}
      rules={[
        {
          validator: async (_, value) => {
            if (!value) {
              throw new Error("Укажите дату и время");
            }
          },
        },
      ]}
    >
      <DatePicker showTime format="DD.MM.YYYY HH:mm" style={{ width: "100%" }} />
    </Form.Item>
  );

  const mainFields = (
    <>
      <Form.Item
        className="apology-form-direction-to-whom-row"
        label={
          <Form.Item name="direction" noStyle>
            <DirectionToggleButton />
          </Form.Item>
        }
        colon={false}
      >
        <Form.Item name="toWhom" noStyle>
          <Input
            placeholder={
              direction === "said_to_me" ? "Кто? Например, коллега" : "Кому? Например, коллеге"
            }
            aria-label={direction === "said_to_me" ? "Кто сказал" : "Кому"}
            allowClear
          />
        </Form.Item>
      </Form.Item>

      <Form.Item label="Почему" name="reason">
        <Input.TextArea rows={2} placeholder="Что произошло" allowClear />
      </Form.Item>

      <Form.Item label="Анализ" name="reflection">
        <Input.TextArea
          rows={2}
          placeholder="Какие выводы — что понял, что сделаете иначе"
          allowClear
        />
      </Form.Item>
    </>
  );

  const heading = !initial ? (
    <header className="apology-form-heading-block">
      <Typography.Title level={2} className="apology-form-heading-title">
        Прости, Извини
      </Typography.Title>
      <div className="apology-form-heading-rule" aria-hidden />
    </header>
  ) : null;

  return (
    <Form<FormValues>
      form={form}
      layout="horizontal"
      labelCol={{ flex: "0 0 88px" }}
      wrapperCol={{ flex: "1 1 auto" }}
      labelAlign="left"
      labelWrap
      onFinish={handleFinish}
      className={variant === "minimal" ? "apology-form apology-form-minimal" : "apology-form"}
      initialValues={{
        createdAt: dayjs(),
        direction: "i_said" satisfies ApologyDirection,
        toWhom: "",
        reason: "",
        reflection: "",
      }}
      key={initial?.id ?? "new"}
    >
      {heading}
      {variant === "minimal" ? (
        <>{mainFields}</>
      ) : (
        <>
          {metaFields}
          {mainFields}
        </>
      )}

      <Form.Item label=" " colon={false}>
        <Space
          orientation={variant === "minimal" ? "vertical" : "horizontal"}
          style={{ width: variant === "minimal" ? "100%" : undefined }}
        >
          <Button type="primary" htmlType="submit" block={variant === "minimal"}>
            {submitLabel}
          </Button>
          {onCancel ? (
            <Button htmlType="button" onClick={onCancel} block={variant === "minimal"}>
              Отмена
            </Button>
          ) : null}
        </Space>
      </Form.Item>
    </Form>
  );
}
