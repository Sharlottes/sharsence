export * from "./git";
type Position = { line: number; char: number };
export interface VSCodeStatusData {
  workspaceName: string;
  position: Array<{
    start: Position;
    end: Position;
  }>;
  githubUrl?: string;
}
