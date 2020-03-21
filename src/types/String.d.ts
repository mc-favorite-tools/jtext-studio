declare interface String {
    escape(): string;
    unescape(): string;
    addAffix(char?: string): string;
    trimEnd(char?: string): string;
    trimStart(char?: string): string;
    replaceAll(char: string, replaceChar: string): string;
}