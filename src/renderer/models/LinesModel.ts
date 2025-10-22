import { CursorPosition, ITextModel, ModelEventType } from "../../shared/types";
import { EventEmitter } from "events";

export class LinesModel extends EventEmitter implements ITextModel {
  private lines: string[] = [];
  private cursor: CursorPosition = { line: 0, char: 0 };

  constructor(initialText: string) {
    super();
    this.lines = initialText.split("\n");
  }

  insert(line: number, index: number, text: string): void {
    const currentLine = this.lines[line] || "";
    const newLines = text.split("\n");

    if (newLines.length === 1) {
      this.lines[line] =
        currentLine.slice(0, index) + text + currentLine.slice(index);
      this.setCursor({ line, char: index + text.length });
    } else {
      const remaining = currentLine.slice(index);
      this.lines[line] = currentLine.slice(0, index) + newLines[0];
      this.lines.splice(line + 1, 0, ...newLines.slice(1));
      this.lines[line + newLines.length - 1] += remaining;
      const newCursorLine = line + newLines.length - 1;
      const newCursorChar = newLines[newLines.length - 1].length;
      this.setCursor({ line: newCursorLine, char: newCursorChar });
    }
    this.emit(ModelEventType.CONTENT_CHANGED);
  }

  delete(line: number, index: number, count: number): void {
    const currentLine = this.lines[line];
    this.lines[line] =
      currentLine.slice(0, index - count) + currentLine.slice(index);
    this.setCursor({ line, char: index - count });
    this.emit(ModelEventType.CONTENT_CHANGED);
  }

  getChar(line: number, char: number): string | undefined {
    return this.lines[line]?.[char];
  }

  getLine(line: number): string | undefined {
    return this.lines[line];
  }

  getAll(): string | undefined {
    return this.lines.join("\n");
  }

  getCursor(): CursorPosition {
    return this.cursor;
  }

  setCursor(position: CursorPosition): void {
    if (
      position.line !== this.cursor.line ||
      position.char !== this.cursor.char
    ) {
      this.cursor = position;
      this.emit(ModelEventType.CURSOR_MOVED, this.cursor);
    }
  }

  insertChar(char: string): void {
    this.insert(this.cursor.line, this.cursor.char, char);
  }

  deleteChar(): void {
    if (this.cursor.char > 0) {
      this.delete(this.cursor.line, this.cursor.char, 1);
    } else if (this.cursor.line > 0) {
      const prevLine = this.lines[this.cursor.line - 1];
      const prevLineLength = prevLine.length;
      this.lines[this.cursor.line - 1] += this.lines[this.cursor.line];
      this.lines.splice(this.cursor.line, 1);
      this.setCursor({ line: this.cursor.line - 1, char: prevLineLength });
    }
  }

  moveCursorLeft(): void {
    if (this.cursor.char > 0) {
      this.setCursor({ line: this.cursor.line, char: this.cursor.char - 1 });
    } else if (this.cursor.line > 0) {
      const prevLineLength = this.lines[this.cursor.line - 1].length;
      this.setCursor({ line: this.cursor.line - 1, char: prevLineLength });
    }
  }

  moveCursorRight(): void {
    if (this.cursor.char < this.lines[this.cursor.line].length) {
      this.setCursor({ line: this.cursor.line, char: this.cursor.char + 1 });
    } else if (this.cursor.line < this.lines.length - 1) {
      this.setCursor({ line: this.cursor.line + 1, char: 0 });
    }
  }
}
