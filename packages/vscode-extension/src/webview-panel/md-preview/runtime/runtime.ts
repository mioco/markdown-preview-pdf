// import pdf from './pdf';

const main = () => {
    const vscode = acquireVsCodeApi();

    window.onload = () => {
        vscode.postMessage({ type: 'ready' });
    };
    window.addEventListener('message', event => {
        const message = event.data;
        switch(message.type) {
            case 'html':
                document.getElementById('content')!.innerHTML = message.data;
                vscode.postMessage({ type: 'update', data: document.body.outerHTML });
                break;
            // TODO: print preview
            // case 'print':
            //     pdf(message.data, message.cache);
            //     break;
            default:
                return;
        }
    });
};

main();
