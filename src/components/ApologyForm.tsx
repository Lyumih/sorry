import { Button, DatePicker, Form, Input, Space, Typography } from "antd";
import type { ApologyDirection, ApologyEntry, NewApologyEntry } from "../types/apologyEntry.ts";
import { useEffect } from "react";
import { useSpeakerPrefsStore } from "../store/useSpeakerPrefsStore.ts";
import {
  apologyVerbFromMe,
  reasonDidWrongPlaceholder,
  reflectionPlaceholder,
} from "../utils/speakerCopy.ts";
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

type DirectionControlProps = {
  value?: ApologyDirection;
  onChange?: (v: ApologyDirection) => void;
};

/** «Я» в начале фразы «Я извинился(лась) перед…» — переключение на «У меня извинился(лась)…». */
function NarrativeDirectionFromMe({ onChange }: DirectionControlProps) {
  return (
    <Button
      variant="dashed"
      color="default"
      size="small"
      htmlType="button"
      className="apology-form-direction-inline"
      onClick={() => onChange?.("said_to_me")}
      aria-label="Сейчас: вы извинились. Нажмите, чтобы отметить, что вам извинялись"
    >
      Я
    </Button>
  );
}

/** «У меня» в начале фразы «У меня извинился(лась)… за…» — возврат к «Я извинился(лась)…». */
function NarrativeDirectionToMe({ onChange }: DirectionControlProps) {
  return (
    <Button
      variant="dashed"
      color="default"
      size="small"
      htmlType="button"
      className="apology-form-direction-inline"
      onClick={() => onChange?.("i_said")}
      aria-label="Сейчас: вам извинялись. Нажмите, чтобы вернуть режим «я извинился»"
    >
      У меня
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
  const speakerGender = useSpeakerPrefsStore((s) => s.speakerGender);

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
          errors: ["Заполните хотя бы одно поле: кто или перед кем / за что / выводы"],
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

  const filledInputProps = {
    variant: "filled" as const,
    className: "apology-form-narrative-input",
  };

  const mainFields = (
    <>
      <Form.Item
        colon={false}
        labelCol={{ flex: "0 0 0" }}
        wrapperCol={{ flex: "1 1 auto" }}
        className="apology-form-narrative-block"
      >
        <div className="apology-form-narrative-flow">
          <div className="apology-form-narrative-body apology-form-narrative-stack">
            {direction === "i_said" ? (
              <>
                <div className="apology-form-narrative-line apology-form-narrative-one-line">
                  <Form.Item name="direction" noStyle>
                    <NarrativeDirectionFromMe />
                  </Form.Item>
                  <span className="apology-form-narrative-text">
                    {" "}
                    {apologyVerbFromMe(speakerGender)} перед{" "}
                  </span>
                  <div className="apology-form-narrative-field-wrap apology-form-narrative-field-wrap--name">
                    <Form.Item name="toWhom" noStyle>
                      <Input
                        {...filledInputProps}
                        placeholder="кем (имя)"
                        aria-label="Перед кем вы извинились"
                      />
                    </Form.Item>
                  </div>
                  <span className="apology-form-narrative-text"> за </span>
                  <div className="apology-form-narrative-field-wrap apology-form-narrative-field-wrap--reason">
                    <Form.Item name="reason" noStyle>
                      <Input
                        {...filledInputProps}
                        placeholder={reasonDidWrongPlaceholder(speakerGender)}
                        aria-label="За что вы извинились"
                      />
                    </Form.Item>
                  </div>
                  <span className="apology-form-narrative-text">.</span>
                </div>
                <div className="apology-form-narrative-line apology-form-narrative-line--reflection apology-form-narrative-one-line">
                  <span className="apology-form-narrative-text">Мои выводы на будущее: </span>
                  <div className="apology-form-narrative-field-wrap apology-form-narrative-field-wrap--reflection">
                    <Form.Item name="reflection" noStyle>
                      <Input
                        {...filledInputProps}
                        placeholder={reflectionPlaceholder(speakerGender)}
                        aria-label="Мои выводы на будущее"
                      />
                    </Form.Item>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="apology-form-narrative-line apology-form-narrative-one-line">
                  <Form.Item name="direction" noStyle>
                    <NarrativeDirectionToMe />
                  </Form.Item>
                  <span className="apology-form-narrative-text"> извинился(лась) </span>
                  <div className="apology-form-narrative-field-wrap apology-form-narrative-field-wrap--name">
                    <Form.Item name="toWhom" noStyle>
                      <Input
                        {...filledInputProps}
                        placeholder="кто (имя)"
                        aria-label="Кто извинялся перед вами"
                      />
                    </Form.Item>
                  </div>
                  <span className="apology-form-narrative-text"> за </span>
                  <div className="apology-form-narrative-field-wrap apology-form-narrative-field-wrap--reason">
                    <Form.Item name="reason" noStyle>
                      <Input
                        {...filledInputProps}
                        placeholder="повод, одной фразой"
                        aria-label="За что извинялись"
                      />
                    </Form.Item>
                  </div>
                  <span className="apology-form-narrative-text">.</span>
                </div>
                <div className="apology-form-narrative-line apology-form-narrative-line--reflection apology-form-narrative-one-line">
                  <span className="apology-form-narrative-text">Мои выводы на будущее: </span>
                  <div className="apology-form-narrative-field-wrap apology-form-narrative-field-wrap--reflection">
                    <Form.Item name="reflection" noStyle>
                      <Input
                        {...filledInputProps}
                        placeholder={reflectionPlaceholder(speakerGender)}
                        aria-label="Мои выводы на будущее"
                      />
                    </Form.Item>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
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
      labelCol={{ flex: "0 0 100px" }}
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
