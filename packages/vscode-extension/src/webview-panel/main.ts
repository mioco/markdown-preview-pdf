import { MarkdownViewer } from "./md-preview";
import * as vscode from 'vscode';

export const initialWebviewPanel = (context: vscode.ExtensionContext) => {
	const markdownViewer = new MarkdownViewer({ context });
	vscode.commands.registerCommand('markdown-extension.preview', () => markdownViewer.regist());
};
