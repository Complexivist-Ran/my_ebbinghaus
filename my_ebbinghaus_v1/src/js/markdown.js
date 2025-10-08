/**
 * 简单的 Markdown 解析器
 * 支持基本的 Markdown 语法 - Linus 风格
 */

class SimpleMarkdown {
    /**
     * 解析 Markdown 文本为 HTML
     * @param {string} markdown - Markdown 文本
     * @returns {string} HTML 字符串
     */
    static parse(markdown) {
        if (!markdown) return '';
        
        let html = markdown;
        
        // 转义 HTML 特殊字符
        html = this.escapeHtml(html);
        
        // 处理代码块 (```code```)
        html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
        
        // 处理行内代码 (`code`)
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // 处理粗体 (**text**)
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // 处理斜体 (*text*)
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // 处理标题 (# ## ###)
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // 处理无序列表 (- item)
        html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        
        // 处理有序列表 (1. item)
        html = html.replace(/^\d+\. (.*$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>');
        
        // 处理链接 [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        
        // 处理换行
        html = html.replace(/\n/g, '<br>');
        
        return html;
    }
    
    /**
     * HTML 转义
     * @param {string} text - 原始文本
     * @returns {string} 转义后的文本
     */
    static escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    /**
     * 处理段落
     * @param {string} html - HTML 字符串
     * @returns {string} 处理后的 HTML
     */
    static processParagraphs(html) {
        // 将连续的非空行包装成段落
        const lines = html.split('<br>');
        const paragraphs = [];
        let currentParagraph = [];
        
        for (let line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine === '') {
                if (currentParagraph.length > 0) {
                    paragraphs.push('<p>' + currentParagraph.join('<br>') + '</p>');
                    currentParagraph = [];
                }
            } else {
                currentParagraph.push(line);
            }
        }
        
        if (currentParagraph.length > 0) {
            paragraphs.push('<p>' + currentParagraph.join('<br>') + '</p>');
        }
        
        return paragraphs.join('');
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SimpleMarkdown;
}

