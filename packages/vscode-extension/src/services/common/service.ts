import type { ExtensionContext } from "vscode";

export abstract class Service {
    extensionPath: string;
    constructor(context: ExtensionContext) {
        context.globalState.update('markdownService', this);
        this.extensionPath = context.extensionPath;
    }
    dispose() {}
}
