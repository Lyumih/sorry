import { Modal, Radio, Space, Typography } from "antd";
import { useSpeakerPrefsStore } from "../store/useSpeakerPrefsStore.ts";
import type { SpeakerGender } from "../types/speakerGender.ts";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function SettingsModal({ open, onClose }: Props) {
  const speakerGender = useSpeakerPrefsStore((s) => s.speakerGender);
  const setSpeakerGender = useSpeakerPrefsStore((s) => s.setSpeakerGender);

  return (
    <Modal
      title="Настройки"
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
      width={400}
    >
      <Typography.Paragraph type="secondary" style={{ marginTop: 0 }}>
        Как показывать формулировки о вас в дневнике (извинился или извинилась, подсказки в
        полях).
      </Typography.Paragraph>
      <Radio.Group
        value={speakerGender}
        onChange={(e) => setSpeakerGender(e.target.value as SpeakerGender)}
      >
        <Space orientation="vertical">
          <Radio value="male">Мужчина</Radio>
          <Radio value="female">Женщина</Radio>
        </Space>
      </Radio.Group>
    </Modal>
  );
}
