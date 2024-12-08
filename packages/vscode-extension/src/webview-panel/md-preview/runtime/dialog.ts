// 自定义元素：对话框遮罩
class DialogMask extends HTMLElement {
    constructor() {
        super();
    }

    // 连接到 DOM 时显示遮罩
    connectedCallback() {
        this.style.display = 'none';
        // 当点击遮罩时，关闭对话框
        this.addEventListener('click', () => this.closeDialog());
    }

    // 显示对话框
    showDialog() {
        this.style.display = 'initial';
    }

    // 关闭对话框
    closeDialog() {
        this.style.display = 'none';
    }
}

// 自定义元素：对话框内容
class DialogBox extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // 阻止点击内容区域时关闭对话框
        this.addEventListener('click', (e) => e.stopPropagation());
    }
}

// 定义自定义元素
customElements.define('dialog-mask', DialogMask);
customElements.define('dialog-box', DialogBox);

// 获取元素并初始化
export const dialogMask = document.getElementById('dialog-mask') as DialogMask;
