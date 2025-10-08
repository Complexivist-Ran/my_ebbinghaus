/**
 * My Ebbinghaus v1 主应用
 * 简洁、直接、有效 - Linus 风格
 */

class MyEbbinghausApp {
    constructor() {
        this.currentMode = 'list'; // 'list' | 'review'
        this.reviewPoints = [];
        this.currentReviewIndex = 0;
        this.editingPointId = null;
        this.deletingPointId = null;
        
        this.init();
    }
    
    /**
     * 初始化应用
     */
    init() {
        this.bindEvents();
        this.loadKnowledgePoints();
        this.updateUI();
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 导航按钮
        document.getElementById('add-btn').addEventListener('click', () => this.showAddModal());
        document.getElementById('export-btn').addEventListener('click', () => this.exportToMarkdown());
        document.getElementById('review-btn').addEventListener('click', () => this.startReview());
        
        // 搜索和筛选
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('filter-select').addEventListener('change', (e) => this.handleFilter(e.target.value));
        
        // 模态框
        document.getElementById('close-modal-btn').addEventListener('click', () => this.hideModal());
        document.getElementById('close-delete-modal-btn').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('save-point-btn').addEventListener('click', () => this.savePoint());
        document.getElementById('cancel-point-btn').addEventListener('click', () => this.hideModal());
        document.getElementById('confirm-delete-btn').addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancel-delete-btn').addEventListener('click', () => this.hideDeleteModal());
        
        // 复习界面
        document.getElementById('show-content-btn').addEventListener('click', () => this.toggleContent());
        document.getElementById('success-btn').addEventListener('click', () => this.markReviewResult('success'));
        document.getElementById('failure-btn').addEventListener('click', () => this.markReviewResult('failure'));
        document.getElementById('skip-btn').addEventListener('click', () => this.skipReview());
        document.getElementById('exit-review-btn').addEventListener('click', () => this.exitReview());
        document.getElementById('clear-draft-btn').addEventListener('click', () => this.clearDraft());
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
    }
    
    /**
     * 加载知识点列表
     */
    loadKnowledgePoints() {
        this.knowledgePoints = getAllKnowledgePoints();
        this.filteredPoints = [...this.knowledgePoints];
        
        // 调试信息：确保数据正确加载
        console.log('加载知识点数量:', this.knowledgePoints.length);
        console.log('知识点列表:', this.knowledgePoints.map(p => ({ id: p.id, title: p.title, masteryLevel: p.masteryLevel })));
    }
    
    /**
     * 更新UI显示
     */
    updateUI() {
        if (this.currentMode === 'list') {
            this.showListMode();
        } else {
            this.showReviewMode();
        }
    }
    
    /**
     * 显示列表模式
     */
    showListMode() {
        document.getElementById('knowledge-list').classList.remove('hidden');
        document.getElementById('review-interface').classList.add('hidden');
        this.renderPointsList();
    }
    
    /**
     * 显示复习模式
     */
    showReviewMode() {
        document.getElementById('knowledge-list').classList.add('hidden');
        document.getElementById('review-interface').classList.remove('hidden');
        this.renderReviewCard();
    }
    
    /**
     * 渲染知识点列表
     */
    renderPointsList() {
        const container = document.getElementById('points-container');
        
        if (this.filteredPoints.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>暂无知识点</h3>
                    <p>点击"添加知识点"开始创建你的第一个知识点</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.filteredPoints.map(point => this.createPointCard(point)).join('');
    }
    
    /**
     * 创建知识点卡片HTML
     */
    createPointCard(point) {
        const masteryDisplay = getMasteryDisplayName(point.masteryLevel);
        const masteryClass = getMasteryColorClass(point.masteryLevel);
        const tagsHtml = point.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        return `
            <div class="point-card">
                <div class="point-header">
                    <div>
                        <div class="point-title">${this.escapeHtml(point.title)}</div>
                        <div class="point-meta">
                            <span class="mastery-badge ${masteryClass}">${masteryDisplay}</span>
                            <span>复习次数: ${point.reviewCount}</span>
                            ${point.nextReview ? `<span>下次复习: ${point.nextReview}</span>` : ''}
                        </div>
                    </div>
                    <div class="point-actions">
                        <button class="btn btn-secondary" onclick="app.editPoint('${point.id}')">编辑</button>
                        <button class="btn btn-danger" onclick="app.deletePoint('${point.id}')">删除</button>
                    </div>
                </div>
                <div class="point-content">${this.escapeHtml(point.content)}</div>
                ${tagsHtml ? `<div class="point-tags">${tagsHtml}</div>` : ''}
            </div>
        `;
    }
    
    /**
     * 开始复习
     */
    startReview() {
        this.reviewPoints = getPointsToReview();
        
        if (this.reviewPoints.length === 0) {
            alert('当前没有需要复习的知识点！');
            return;
        }
        
        this.currentReviewIndex = 0;
        this.currentMode = 'review';
        this.updateUI();
    }
    
    /**
     * 渲染复习卡片
     */
    renderReviewCard() {
        if (this.currentReviewIndex >= this.reviewPoints.length) {
            this.showReviewComplete();
            return;
        }
        
        const point = this.reviewPoints[this.currentReviewIndex];
        const progressText = `${this.currentReviewIndex + 1} / ${this.reviewPoints.length}`;
        
        document.getElementById('progress-text').textContent = progressText;
        document.getElementById('review-title').textContent = point.title;
        
        // 使用 Markdown 解析内容
        const markdownHtml = SimpleMarkdown.parse(point.content);
        document.getElementById('review-content').innerHTML = markdownHtml;
        
        // 确保内容默认隐藏
        document.getElementById('review-content').classList.add('hidden');
        document.getElementById('show-content-btn').textContent = '显示内容';
        
        // 清空草稿输入框
        document.getElementById('draft-input').value = '';
    }
    
    /**
     * 切换内容显示/隐藏
     */
    toggleContent() {
        const contentElement = document.getElementById('review-content');
        const button = document.getElementById('show-content-btn');
        
        if (contentElement.classList.contains('hidden')) {
            contentElement.classList.remove('hidden');
            button.textContent = '隐藏内容';
        } else {
            contentElement.classList.add('hidden');
            button.textContent = '显示内容';
        }
    }
    
    /**
     * 清空草稿输入框
     */
    clearDraft() {
        document.getElementById('draft-input').value = '';
        document.getElementById('draft-input').focus();
    }
    
    /**
     * 标记复习结果
     */
    markReviewResult(result) {
        const point = this.reviewPoints[this.currentReviewIndex];
        
        // 更新掌握程度
        const newMasteryLevel = processReviewResult(point.masteryLevel, result);
        
        let updateData = {
            masteryLevel: newMasteryLevel
        };
        
        if (result === 'success') {
            // 复习成功：增加复习次数，设置上次复习时间，计算下次复习时间
            const nextReviewDate = calculateNextReviewDate(
                newMasteryLevel, 
                getTodayString(), 
                point.reviewCount + 1
            );
            
            updateData.lastReviewed = getTodayString();
            updateData.nextReview = nextReviewDate;
            updateData.reviewCount = point.reviewCount + 1;
        } else {
            // 复习失败：重置复习间隔，保持当天复习（对于困难等级）
            const nextReviewDate = calculateNextReviewDate(
                newMasteryLevel, 
                getTodayString(), 
                0  // 重置复习次数
            );
            
            updateData.nextReview = nextReviewDate;
            updateData.reviewCount = 0;  // 重置复习次数
            // 不设置 lastReviewed，表示这次复习没有成功
        }
        
        // 更新知识点
        updateKnowledgePoint(point.id, updateData);
        
        // 进入下一个知识点
        this.nextReview();
    }
    
    /**
     * 跳过复习
     */
    skipReview() {
        this.nextReview();
    }
    
    /**
     * 下一个复习项目
     */
    nextReview() {
        this.currentReviewIndex++;
        
        // 重新加载复习队列，包含新加入的知识点
        this.reviewPoints = getPointsToReview();
        
        // 如果当前索引超出范围，重新开始
        if (this.currentReviewIndex >= this.reviewPoints.length) {
            this.currentReviewIndex = 0;
        }
        
        this.renderReviewCard();
    }
    
    /**
     * 显示复习完成
     */
    showReviewComplete() {
        // 重新检查是否有新的知识点需要复习
        const newReviewPoints = getPointsToReview();
        
        if (newReviewPoints.length > 0) {
            // 有新知识点需要复习，继续复习
            this.reviewPoints = newReviewPoints;
            this.currentReviewIndex = 0;
            this.renderReviewCard();
        } else {
            // 真的完成了所有复习
            document.getElementById('review-interface').innerHTML = `
                <div class="review-complete">
                    <h2>🎉 复习完成！</h2>
                    <p>你已经完成了所有需要复习的知识点</p>
                    <button class="btn btn-primary" onclick="app.exitReview()">返回列表</button>
                </div>
            `;
        }
    }
    
    /**
     * 退出复习
     */
    exitReview() {
        this.currentMode = 'list';
        this.loadKnowledgePoints();
        this.updateUI();
    }
    
    /**
     * 显示添加模态框
     */
    showAddModal() {
        this.editingPointId = null;
        document.getElementById('modal-title').textContent = '添加知识点';
        document.getElementById('point-form').reset();
        document.getElementById('point-modal').classList.remove('hidden');
    }
    
    /**
     * 编辑知识点
     */
    editPoint(id) {
        const point = this.knowledgePoints.find(p => p.id === id);
        if (!point) return;
        
        this.editingPointId = id;
        document.getElementById('modal-title').textContent = '编辑知识点';
        document.getElementById('point-title').value = point.title;
        document.getElementById('point-content').value = point.content;
        document.getElementById('point-tags').value = point.tags.join(', ');
        document.getElementById('point-mastery').value = point.masteryLevel;
        document.getElementById('point-modal').classList.remove('hidden');
    }
    
    /**
     * 保存知识点
     */
    savePoint() {
        const title = document.getElementById('point-title').value.trim();
        const content = document.getElementById('point-content').value.trim();
        const tags = document.getElementById('point-tags').value.split(',').map(t => t.trim()).filter(t => t);
        const masteryLevel = document.getElementById('point-mastery').value;
        
        if (!title || !content) {
            alert('标题和内容不能为空！');
            return;
        }
        
        try {
            if (this.editingPointId) {
                // 编辑现有知识点
                updateKnowledgePoint(this.editingPointId, {
                    title,
                    content,
                    tags,
                    masteryLevel
                });
            } else {
                // 添加新知识点
                addKnowledgePoint(title, content, tags, masteryLevel);
            }
            
            this.hideModal();
            this.loadKnowledgePoints();
            this.updateUI();
        } catch (error) {
            alert('保存失败：' + error.message);
        }
    }
    
    /**
     * 删除知识点
     */
    deletePoint(id) {
        this.deletingPointId = id;
        document.getElementById('delete-modal').classList.remove('hidden');
    }
    
    /**
     * 确认删除
     */
    confirmDelete() {
        if (this.deletingPointId) {
            deleteKnowledgePoint(this.deletingPointId);
            this.hideDeleteModal();
            this.loadKnowledgePoints();
            this.updateUI();
        }
    }
    
    /**
     * 隐藏模态框
     */
    hideModal() {
        document.getElementById('point-modal').classList.add('hidden');
    }
    
    /**
     * 隐藏删除模态框
     */
    hideDeleteModal() {
        document.getElementById('delete-modal').classList.add('hidden');
    }
    
    /**
     * 处理搜索
     */
    handleSearch(query) {
        this.filteredPoints = searchKnowledgePoints(query);
        this.applyFilter();
    }
    
    /**
     * 处理筛选
     */
    handleFilter(masteryLevel) {
        this.currentFilter = masteryLevel;
        this.applyFilter();
    }
    
    /**
     * 应用筛选
     */
    applyFilter() {
        let points = [...this.knowledgePoints];
        
        // 应用搜索过滤
        const searchQuery = document.getElementById('search-input').value;
        if (searchQuery) {
            points = searchKnowledgePoints(searchQuery);
        }
        
        // 应用掌握程度过滤
        if (this.currentFilter) {
            points = points.filter(p => p.masteryLevel === this.currentFilter);
        }
        
        this.filteredPoints = points;
        this.renderPointsList();
    }
    
    /**
     * 处理键盘事件
     */
    handleKeyboard(e) {
        if (this.currentMode === 'review') {
            // 检查是否在草稿输入框中
            const isInDraftInput = document.activeElement && document.activeElement.id === 'draft-input';
            
            if (e.ctrlKey && e.key === 'l' && isInDraftInput) {
                // Ctrl+L 清空草稿
                e.preventDefault();
                this.clearDraft();
                return;
            }
            
            // 如果不在草稿输入框中，处理其他快捷键
            if (!isInDraftInput) {
                switch(e.key) {
                    case ' ': // 空格键显示/隐藏内容
                        e.preventDefault();
                        this.toggleContent();
                        break;
                    case '1': // 数字1标记成功
                        this.markReviewResult('success');
                        break;
                    case '2': // 数字2标记失败
                        this.markReviewResult('failure');
                        break;
                    case '3': // 数字3跳过
                        this.skipReview();
                        break;
                    case 'Escape': // ESC退出复习
                        this.exitReview();
                        break;
                }
            }
        }
    }
    
    /**
     * 导出为Markdown文件
     */
    exportToMarkdown() {
        try {
            const points = this.filteredPoints.length > 0 ? this.filteredPoints : this.knowledgePoints;
            
            if (points.length === 0) {
                alert('没有知识点可以导出！');
                return;
            }
            
            const markdown = this.generateMarkdownContent(points);
            this.downloadMarkdown(markdown);
            
        } catch (error) {
            console.error('导出失败:', error);
            alert('导出失败：' + error.message);
        }
    }
    
    /**
     * 生成Markdown内容
     */
    generateMarkdownContent(points) {
        const today = getTodayString();
        const masteryDisplayNames = {
            'mastered': '掌握',
            'learning': '学习中', 
            'struggling': '困难'
        };
        
        let markdown = `# My Ebbinghaus 知识点导出\n\n`;
        markdown += `**导出时间：** ${today}\n`;
        markdown += `**知识点数量：** ${points.length}\n\n`;
        markdown += `---\n\n`;
        
        // 按掌握程度分组
        const groupedPoints = {
            'mastered': points.filter(p => p.masteryLevel === 'mastered'),
            'learning': points.filter(p => p.masteryLevel === 'learning'),
            'struggling': points.filter(p => p.masteryLevel === 'struggling')
        };
        
        // 生成各掌握程度的知识点
        Object.keys(groupedPoints).forEach(level => {
            const levelPoints = groupedPoints[level];
            if (levelPoints.length > 0) {
                markdown += `## ${masteryDisplayNames[level]} (${levelPoints.length}个)\n\n`;
                
                levelPoints.forEach((point, index) => {
                    markdown += `### ${index + 1}. ${point.title}\n\n`;
                    
                    // 基本信息
                    markdown += `**掌握程度：** ${masteryDisplayNames[point.masteryLevel]}\n`;
                    markdown += `**复习次数：** ${point.reviewCount}\n`;
                    markdown += `**创建时间：** ${point.createdAt}\n`;
                    if (point.lastReviewed) {
                        markdown += `**上次复习：** ${point.lastReviewed}\n`;
                    }
                    markdown += `**下次复习：** ${point.nextReview}\n`;
                    
                    // 标签
                    if (point.tags && point.tags.length > 0) {
                        markdown += `**标签：** ${point.tags.join(', ')}\n`;
                    }
                    
                    markdown += `\n**内容：**\n\n`;
                    markdown += `${point.content}\n\n`;
                    markdown += `---\n\n`;
                });
            }
        });
        
        // 添加统计信息
        markdown += `## 统计信息\n\n`;
        markdown += `- **掌握：** ${groupedPoints.mastered.length} 个\n`;
        markdown += `- **学习中：** ${groupedPoints.learning.length} 个\n`;
        markdown += `- **困难：** ${groupedPoints.struggling.length} 个\n`;
        markdown += `- **总计：** ${points.length} 个\n\n`;
        
        // 添加复习提醒
        const todayPoints = points.filter(p => p.nextReview && p.nextReview <= today);
        if (todayPoints.length > 0) {
            markdown += `## 今日复习提醒\n\n`;
            markdown += `今天需要复习的知识点：\n\n`;
            todayPoints.forEach(point => {
                markdown += `- ${point.title} (${masteryDisplayNames[point.masteryLevel]})\n`;
            });
            markdown += `\n`;
        }
        
        markdown += `---\n\n`;
        markdown += `*此文件由 My Ebbinghaus v1 自动生成*`;
        
        return markdown;
    }
    
    /**
     * 下载Markdown文件
     */
    downloadMarkdown(content) {
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `my_ebbinghaus_export_${getTodayString()}.md`;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理URL对象
        URL.revokeObjectURL(url);
    }
    
    /**
     * HTML转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 初始化应用
const app = new MyEbbinghausApp();
