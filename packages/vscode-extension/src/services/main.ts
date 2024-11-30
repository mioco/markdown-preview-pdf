import { ExtensionContext } from 'vscode';
import { MarkdownService } from './markdown';

export const intialService = (context: ExtensionContext) => {
    context.subscriptions.push(new MarkdownService(context));
};
