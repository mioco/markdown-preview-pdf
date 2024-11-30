import * as vscode from 'vscode';
import type { MarkdownService } from '../../services/markdown';

export class MarkdownViewer {
    static panels = new Map();

    panel: vscode.WebviewPanel;

    context: vscode.ExtensionContext;

    id: string;

    markdownService?: MarkdownService;

    constructor({ id, context }: { id: string; context: vscode.ExtensionContext }) {
        this.context = context;
        this.id = id;
        this.markdownService = this.context.globalState.get<MarkdownService>('markdownService');
        vscode.commands.executeCommand('setContext', 'view', id);
        this.panel = MarkdownViewer.panels.get(id) ?? vscode.window.createWebviewPanel(id, 'Preview', vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
        });
        MarkdownViewer.panels.set(id, this.panel);

        this._init();
    }

    private _init() {
        this._getHTML();
        this._listenTextChange();

        const download = vscode.commands.registerCommand('markdown-extension.download-pdf', () => {
            vscode.window.showInformationMessage('Custom Action Triggered!');
            this.markdownService?.save(this.panel.title, this.panel.webview.html);
        });
        this.panel.onDidDispose(() => {
            MarkdownViewer.panels.delete(this.id);
            vscode.commands.executeCommand('setContext', 'view', undefined);
            download.dispose();
        });
        this.context.subscriptions.push(download);
    }

    private async _getHTML() {
        this.panel.webview.html = await this.markdownService?.getHTML() ?? '';
    }

    private _listenTextChange() {
        this.context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(() => {
            this._getHTML();
        }));
    }
}