import { DateTime } from "luxon";

export function getESTEndOfDayUTC(dateString: string) {
  const dt = DateTime.fromISO(dateString, { zone: "America/New_York" }).set({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  });
  return dt.toUTC().toJSDate();
}
