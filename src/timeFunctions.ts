import { CalculatedRoute } from "./algorithm";

/**
 * Converts a Date object to a string in the format of HH:MM:SS
 */
export class TimeObject {
  hour: number = 0;
  minute: number = 0;
  second: number = 0;

  constructor(hhmmss: string) {
    const timeArr: string[] = hhmmss.split(":");
    this.hour = +timeArr[0] || 0;
    this.minute = +timeArr[1] || 0;
    this.second = +timeArr[2] || 0;
  }

  addTime(time: TimeObject) {
    this.hour += time.hour % 24;
    this.minute += time.minute % 60;
    this.second += time.second % 60;
    return this;
  }

  addHours(hours: number) {
    this.hour += hours % 24;
    return this;
  }

  objectToString(): string {
    return `${addLeadingZeros(this.hour)}:${addLeadingZeros(
      this.minute
    )}:${addLeadingZeros(this.second)}`;
  }
}

function addLeadingZeros(num: number, totalLength = 2) {
  return String(num).padStart(totalLength, "0");
}

/**
 * Compares two routes by their total time
 * @param rotue1 - first route to compare
 * @param rotue2 - second route to compare
 * @returns -1 if rotue1 is shorter, 1 if rotue2 is shorter, 0 if they are equal
 */
export function compareRoutes(
  rotue1: CalculatedRoute,
  rotue2: CalculatedRoute
) {
  if (rotue1.totalTime < rotue2.totalTime) {
    return -1;
  }
  if (rotue1.totalTime > rotue2.totalTime) {
    return 1;
  }
  return 0;
}
