interface ITimeObject {
  hour: number;
  minute: number;
  second: number;
}

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

  objectToString() {
    return `${this.hour}:${this.minute}:${this.second}`;
  }
}
