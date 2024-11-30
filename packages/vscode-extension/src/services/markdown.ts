import { parse } from "marked";
import { Service } from "./common/service";
import * as vscode from 'vscode';
import * as fs from 'fs';
import puppeteer from 'puppeteer';
import type { ExtensionContext } from 'vscode';

export class MarkdownService extends Service {
    constructor(context: ExtensionContext) {
        super();
        context.globalState.update('markdownService', this);
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
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setContent(content);
            const pdfBuffer = await page.pdf();
            vscode.workspace.fs.writeFile(uri, pdfBuffer);
            await browser.close();
        }
    };
}