import * as PDFjs from 'pdfjs-dist';

declare global {
    var pdfjsLib: typeof PDFjs;
    var content: HTMLDivElement;

    function acquireVsCodeApi(): {
        postMessage: (message: any) => void; // 用于向扩展发送消息
        setState: (state: any) => void;      // 保存 WebView 的状态
        getState: () => any;                 // 获取保存的状态
    };
}

export { };
