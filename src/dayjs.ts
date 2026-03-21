import dayjs from "dayjs";
import "dayjs/locale/ru";
import isBetween from "dayjs/plugin/isBetween";
import weekday from "dayjs/plugin/weekday";

dayjs.extend(isBetween);
dayjs.extend(weekday);
dayjs.locale("ru");

export { dayjs };
