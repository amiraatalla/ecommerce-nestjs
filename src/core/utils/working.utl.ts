import { Schedule } from "src/Entities/classes/schedule.class";
import { DaysIndexed } from "src/Entities/enum/days.enum";



export function isWorkingTime(schedule: Schedule[] = []) {
  let isOpen = false;

  for (const day of schedule) {
    const now = new Date().toUTCString().substring(17, 22);
    let timeFrom = day.from.toUTCString().substring(17, 22);
    const timeTo = day.to.toUTCString().substring(17, 22);

    if (timeFrom >= timeTo) {
      const [, hours, minutes] = timeFrom.match(/^(\d{1,2}):(\d{2})$/);
      timeFrom = `${String(24 - Number(hours)).padStart(2, '0')}:${minutes}`;
    }

    const isWorkingDay = day.day === DaysIndexed[new Date().getUTCDay()];
    const isWorkingHour = now >= timeFrom && now <= timeTo;

    // Today is a working day
    if (isWorkingDay && isWorkingHour) {
      isOpen = true;
    }
  }

  return isOpen;
}
