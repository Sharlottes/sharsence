import * as vscode from "vscode";
import axios from "axios";
import type { GitExtension, VSCodeStatusData } from "./@type";
import { throttle } from "./utils/throttle";

const getGithubUrl = () =>
  vscode.extensions.getExtension<GitExtension>("vscode.git")?.exports?.getAPI(1)
    .repositories[0].state.remotes[0].fetchUrl;

const handleSelectionChanged = (
  editor: vscode.TextEditorSelectionChangeEvent
) => {
  const body: VSCodeStatusData = {
    workspaceName: `${vscode.workspace.name}/${vscode.workspace.asRelativePath(
      editor.textEditor.document.fileName
    )}`,
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
  axios.post(
    "https://sharjects-sharlottes.vercel.app/api/vscode/presence",
    body
  );
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
