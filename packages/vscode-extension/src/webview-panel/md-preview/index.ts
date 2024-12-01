import * as vscode from 'vscode';
import type { MarkdownService } from '../../services/markdown';
import { parse } from 'path';
import debounce from 'lodash/debounce';

export class MarkdownViewer {
    static panels = new Map();

    context: vscode.ExtensionContext;

    markdownService?: MarkdownService;

    activityPannel?: vscode.WebviewPanel;

    dispose: () => void;

    constructor({ context }: { context: vscode.ExtensionContext }) {
        this.context = context;

        this.markdownService = this.context.globalState.get<MarkdownService>('markdownService');

        const downloadDispose = vscode.commands.registerCommand('markdown-extension.download-pdf', () => {
            if (!this.activityPannel) {
                return;
            }
            this.markdownService?.save(this.activityPannel.title, this.activityPannel.webview.html);
        });

        const activeDispose = vscode.window.onDidChangeActiveTextEditor(() => {
            const panel = MarkdownViewer.panels.get(vscode.window.activeTextEditor?.document.uri.toString());
            panel?.reveal();
            this.activityPannel = panel;
        });

        const changeTextDispose = vscode.workspace.onDidChangeTextDocument(debounce(() => {
            this.setHTML();
        }));
        this.context.subscriptions.push(changeTextDispose);

        this.dispose = () => {
            downloadDispose.dispose();
            activeDispose.dispose();
            changeTextDispose.dispose();
        };
    }

    regist() {
        const id = vscode.window.activeTextEditor?.document.uri.toString()!;
        if (MarkdownViewer.panels.get(id)) {
            return;
        }
        const title = parse(vscode.window.activeTextEditor?.document.uri.path!).name;
        const panel = vscode.window.createWebviewPanel(id, title, vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        MarkdownViewer.panels.set(id, panel);
        this.activityPannel = panel;
        this.setHTML();

        panel.onDidDispose(() => {
            MarkdownViewer.panels.delete(id);
        });
    }

    setHTML() {
        if (this.activityPannel) {
            this.markdownService?.getHTML().then((html) => {
                this.activityPannel!.webview.html = html;
            });
        }
    }
}