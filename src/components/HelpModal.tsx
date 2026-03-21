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
      width={640}
      destroyOnHidden
      className="help-modal"
    >
      <Typography>
        <Title level={5}>Описание приложения</Title>
        <Paragraph>
          <strong>Прости, Извини</strong> — это <strong>локальный дневник</strong> на вашем устройстве:
          вы фиксируете случаи, когда говорили «прости» или «извини» — <strong>кому</strong>, в{" "}
          <strong>какой ситуации</strong> и какие <strong>выводы</strong> для себя сделали.
          Регистрации и облака нет: данные хранятся в браузере (IndexedDB). Интерфейс на русском языке.
        </Paragraph>

        <Title level={5}>Как пользоваться</Title>
        <div className="help-modal-block">
          <ol className="help-modal-list">
            <li>
              <strong>Вкладка «Дневник»</strong> — основной экран для быстрой записи. Заполните поля
              (дата и время события, тип фразы — «прости», «извини» или «оба / не различаю», кому,
              почему, анализ) и нажмите «Сохранить». Ниже в блоке <strong>«Недавние записи»</strong>{" "}
              можно развернуть список и при необходимости открыть запись для{" "}
              <strong>редактирования</strong> или <strong>удаления</strong>.
            </li>
            <li>
              <strong>Вкладка «Статистика»</strong> — сводки и аналитика: выберите{" "}
              <strong>период</strong> (день, неделя или месяц) и при необходимости сместите дату,
              чтобы смотреть нужный интервал. Здесь же — <strong>счётчики</strong>,{" "}
              <strong>разбивка по типу фразы</strong>, <strong>график частоты по дням</strong>,{" "}
              <strong>полный список</strong> записей за период с правками, а также{" "}
              <strong>экспорт в JSON</strong> для резервной копии и напоминание, что данные живут
              только в этом браузере.
            </li>
          </ol>
        </div>
        <Paragraph type="secondary" style={{ marginTop: 0 }}>
          Минимум для сохранения записи: хотя бы одно из полей «почему» или «анализ» должно быть
          заполнено.
        </Paragraph>

        <Title level={5}>Чем может быть полезно</Title>
        <div className="help-modal-block">
          <ul className="help-modal-list">
            <li>
              <strong>Осознанность в общении</strong> — не только считать слова, а видеть{" "}
              <strong>контекст</strong> и свои <strong>реакции</strong> (поле анализа помогает
              зафиксировать выводы сразу после разговора).
            </li>
            <li>
              <strong>Паттерны во времени</strong> — сводки за день / неделю / месяц и график
              показывают, <strong>насколько часто</strong> вы обращаетесь к извинениям и как{" "}
              <strong>распределяются</strong> «прости» и «извини».
            </li>
            <li>
              <strong>Работа с границами и привычками</strong> — удобно замечать ситуации, где
              извинение уместно, а где стоит пересмотреть автоматические формулировки.
            </li>
            <li>
              <strong>Конфиденциальность</strong> — дневник не уходит на сервер продукта; при смене
              браузера или очистке данных сайта записи могут пропасть, поэтому периодический{" "}
              <strong>экспорт JSON</strong> снижает риск потери.
            </li>
          </ul>
        </div>
      </Typography>
    </Modal>
  );
}
