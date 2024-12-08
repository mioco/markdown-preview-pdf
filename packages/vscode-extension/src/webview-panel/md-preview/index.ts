import * as vscode from 'vscode';
import type { MarkdownService } from '../../services/markdown';
import path, { parse } from 'path';
import debounce from 'lodash/debounce';
import webviewHTML from './runtime/preview.html';

export class MarkdownViewer {
    static panels = new Map<string | undefined, vscode.WebviewPanel>();

    activityWebviewPannel?: vscode.WebviewPanel;
    context: vscode.ExtensionContext;
    activityWebviewPannelHTML?: string;

    markdownService?: MarkdownService;

    htmlBuffer?: Uint8Array;

    dispose: () => void;

    constructor({ context }: { context: vscode.ExtensionContext }) {
        this.context = context;

        this.markdownService = this.context.globalState.get<MarkdownService>('markdownService');

        const downloadDispose = vscode.commands.registerCommand('markdown-extension.download-pdf', async () => {

            if (!this.activityWebviewPannel) {
                return;
            }
            this.markdownService?.save(this.activityWebviewPannel!.title, this.activityWebviewPannelHTML!);

            // if (this.htmlBuffer) {
            //     this.activityWebviewPannel?.webview.postMessage({ type: 'print', data: this.htmlBuffer, cache: true });
            //     return;
            // }

            // this.htmlBuffer = await this.markdownService?.getPDF(this.activityWebviewPannelHTML!);

            // this.activityWebviewPannel?.webview.postMessage({ type: 'print', data: this.htmlBuffer });
        });

        const activeDispose = vscode.window.onDidChangeActiveTextEditor(() => {
            const panel = MarkdownViewer.panels.get(vscode.window.activeTextEditor?.document.uri.toString());
            panel?.reveal(void 0, true);
            if (panel?.visible) {
                this.activityWebviewPannel = panel;
            }
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
        const currentActivityPanel = vscode.window.activeTextEditor;
        const panel = vscode.window.createWebviewPanel(id, title, vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.file(this.context.extensionPath), // Restrict access
            ],
        });
        // 获取扩展内的 JS 文件路径
        const scriptPathOnDisk = vscode.Uri.file(
            path.join(this.context.extensionPath, 'dist/runtime.js')
        );

        // 转换为 WebView 可访问的 URI
        const scriptUri = panel.webview.asWebviewUri(scriptPathOnDisk);

        panel.webview.html = webviewHTML.replace('@script@', scriptUri.toString());
        currentActivityPanel?.document && vscode.window.showTextDocument(currentActivityPanel.document, currentActivityPanel.viewColumn);
        MarkdownViewer.panels.set(id, panel);
        this.activityWebviewPannel = panel;
        
        this.activityWebviewPannel?.webview.onDidReceiveMessage((message) => {
            if (message.type === 'ready') {
                this.setHTML();
            }

            if (message.type === 'update') {
                this.activityWebviewPannelHTML = message.data;
            }
        });;

        panel.onDidDispose(() => {
            MarkdownViewer.panels.delete(id);
        });
    }

    setHTML() {
        if (this.activityWebviewPannel) {
            this.markdownService?.getHTML().then((html) => {
                this.activityWebviewPannel?.webview.postMessage({ type: 'html', data: html });
                this.htmlBuffer = void 0;
            });
        }
    }
}