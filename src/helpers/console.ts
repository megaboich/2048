export class ConsoleHelper {
  private formats: string[] = [];
  private strings: string[] = [];

  public write(text: string, format?: { color: string; bgColor: string }) {
    if (format) {
      const color = format.color || "inherit";
      const bgColor = format.bgColor || "inherit";
      this.formats.push("%c%s%c");
      this.strings.push(`color:${color};background-color:${bgColor};`);
      this.strings.push(text);
      this.strings.push("color:inherit;background-color:inherit;");
    } else {
      this.formats.push("%s");
      this.strings.push(text);
    }
  }

  public newLine() {
    this.formats.push("%s");
    this.strings.push("\r\n");
  }

  public flush() {
    console.log(this.formats.join(""), ...this.strings);
    this.formats.length = 0;
    this.strings.length = 0;
  }
}
