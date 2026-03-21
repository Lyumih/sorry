import { Modal, Typography } from "antd";

const { Title, Paragraph } = Typography;

type HelpModalProps = {
  open: boolean;
  onClose: () => void;
};

export function HelpModal({ open, onClose }: HelpModalProps) {
  return (
    <Modal
      title="Справка"
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      destroyOnHidden
      className="help-modal"
    >
      <Typography>
        <Title level={5}>О приложении</Title>
        <Paragraph>
          <strong>Прости, Извини</strong> — дневник для тех случаев, когда в разговоре звучит «прости» или
          «извини». Вы отмечаете, <strong>вы сами извинились</strong> или <strong>вам сказали извинение</strong>,
          перед кем или от кого это было, что произошло и какие для себя сделали выводы. Всё хранится только на
          вашем устройстве, без регистрации и облака.
        </Paragraph>

        <Title level={5}>Как пользоваться</Title>
        <Paragraph>
          На вкладке <strong>«Дневник»</strong> быстро создаёте запись: выбираете «Я» или «Мне», заполняете поля
          и сохраняете. Ниже можно открыть недавние записи, изменить или удалить их.
        </Paragraph>
        <Paragraph style={{ marginBottom: 0 }}>
          На вкладке <strong>«Статистика»</strong> смотрите записи за выбранный период, сводки и график, при
          необходимости правите записи и скачиваете резервную копию, чтобы не потерять дневник при смене
          устройства или очистке данных.
        </Paragraph>
      </Typography>
    </Modal>
  );
}
