import { MarkdownViewer } from "./md-preview";
import * as vscode from 'vscode';

export const initialWebviewPanel = (context: vscode.ExtensionContext) => {
	vscode.commands.registerCommand('markdown-extension.preview', () => new MarkdownViewer({ id: 'preview', context }));
};
