import { Alert } from "antd";

export function DataWarning() {
  return (
    <Alert
      type="warning"
      showIcon
      title="Данные хранятся только в этом браузере"
      description="Очистка сайта или смена профиля могут удалить записи. Регулярно сохраняйте резервную копию через экспорт JSON."
    />
  );
}
