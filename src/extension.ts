import * as vscode from "vscode";
import axios from "axios";
import { GitExtension } from "./@type";
import { throttle } from "./utils/throttle";

type Position = { line: number; char: number };
interface VSCodeStatusData {
  workspaceName: string;
  position: Array<{
    start: Position;
    end: Position;
  }>;
  githubUrl?: string;
}

const getGithubUrl = () => {
  const git =
    vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports;
  if (!git) throw new Error("git extension does not exist!");

  const api = git.getAPI(1);
  return api.repositories[0].state.remotes[0].fetchUrl?.slice(0, -4);
};

const updateData = (body: VSCodeStatusData) => {
  axios.post(
    "https://sharjects-sharlottes.vercel.app/api/vscode/presence",
    body
  );
};

const handleSelectionChanged = (
  editor: vscode.TextEditorSelectionChangeEvent
) => {
  const body: VSCodeStatusData = {
    workspaceName: vscode.workspace.name ?? "",
    position: editor.selections.map((selection) => ({
      start: {
        char: selection.start.character,
        line: selection.start.line,
      },
      end: {
        char: selection.end.character,
        line: selection.end.line,
      },
    })),
    githubUrl: getGithubUrl(),
  };
  updateData(body);
};

export function activate(context: vscode.ExtensionContext) {
  console.log(
    "sharjects presence extension has been activated!\nyour edit line position, github url will be sent to sharjects."
  );
  context.subscriptions.push(
    vscode.window.onDidChangeTextEditorSelection(
      throttle(handleSelectionChanged, 10 * 1000)
    )
  );
}

export function deactivate() {}
