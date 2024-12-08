import type { RenderParameters } from 'pdfjs-dist/types/src/display/api';
import { dialogMask } from './dialog';

// If absolute URL from the remote server is provided, configure the CORS
// header on that server.
const pdf = (url: Uint8Array, cache?: boolean) => {
    if (cache) {
        dialogMask.showDialog();
        return;
    }
    const pdfjsLib = globalThis.pdfjsLib;

    // The workerSrc property shall be specified.
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs';

    // Asynchronous download of PDF
    var loadingTask = pdfjsLib.getDocument(url);

    loadingTask.promise.then(function (pdf) {
        dialogMask.showDialog();
        // Fetch the first page
        const scale = window.devicePixelRatio;

        for (let p = 1; p <= pdf.numPages; ++p) {
            pdf.getPage(p).then(function (page) {
                var viewport = page.getViewport({ scale });

                // Prepare canvas using PDF page dimensions
                var canvas = document.createElement('canvas');
                canvas.id = String(p);

                document.getElementById(String(p)) ? document.getElementById(String(p))?.replaceWith() : document.querySelector('dialog-box')?.appendChild(canvas);

                var context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                canvas.style.width = '100%';
                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                } as RenderParameters;
                var renderTask = page.render(renderContext);
            });
        }
    }, function (reason) {
        // PDF loading error
        console.error(reason);
    });
};

export default pdf;
