import { Modal, Typography } from "antd";
import { psychologyNote } from "../content/psychologyNote.ts";

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
          и сохраняете. Под формой — предупреждение о локальных данных и кнопка экспорта JSON. Ниже можно открыть
          историю записей, изменить или удалить их.
        </Paragraph>
        <Paragraph>
          На вкладке <strong>«Статистика»</strong> — сводки за период, график и полный список записей с
          возможностью правок. Новые записи и резервная копия — только на «Дневнике».
        </Paragraph>

        <Title level={5}>О смысле подсчётов</Title>
        <Paragraph strong style={{ marginBottom: 4 }}>
          {psychologyNote.tooManyTitle}
        </Paragraph>
        <Paragraph type="secondary">{psychologyNote.tooManyBody}</Paragraph>
        <Paragraph strong style={{ marginTop: 12, marginBottom: 4 }}>
          {psychologyNote.analysisTitle}
        </Paragraph>
        <Paragraph type="secondary" style={{ marginBottom: 0 }}>
          {psychologyNote.analysisBody}
        </Paragraph>
      </Typography>
    </Modal>
  );
}
