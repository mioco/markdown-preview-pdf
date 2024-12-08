import { parse } from "marked";
import { Service } from "../common/service";
import * as vscode from 'vscode';
import puppeteer, { Browser, Page } from 'puppeteer';
import type { ExtensionContext } from 'vscode';

export class MarkdownService extends Service {
    page?: Page;
    browser?: Browser;

    constructor(context: ExtensionContext) {
        super(context);
        context.globalState.update('markdownService', this);
        this.browserInit();
    }

    async browserInit() {
        this.browser = await puppeteer.launch();
        this.page = await this.browser.newPage();
    }

    async getHTML() {
        // 获取当前活动的编辑器
        const activeEditor = vscode.window.activeTextEditor;

        if (!activeEditor) {
            return ''; // 没有活动编辑器
        }
        const text = activeEditor.document.getText();
        return parse(text);
    }

    async save(title: string, content: string) {
        const uri = await vscode.window.showSaveDialog({
            defaultUri: vscode.workspace.workspaceFolders?.[0]?.uri && vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0]?.uri, `${title}.pdf`),
            filters: { 'PDF Files': ['pdf'] },
            saveLabel: '保存 PDF 文件',
        });
        if (uri) {
            const pdfBuffer = await this.getPDF(content);
            vscode.workspace.fs.writeFile(uri, pdfBuffer!);
        }
    };

    async getPDF(content: string) {
        const MARGIN = 12;
        await this.page?.setContent(content);
        const pdfBuffer = await this.page?.pdf({
            format: 'A4',
            margin: {
                left: MARGIN,
                bottom: MARGIN,
                right: MARGIN,
                top: MARGIN,
            }
        });
        return pdfBuffer;
    }

    dispose(): void {
        this.browser?.close();
    }
}