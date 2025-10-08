/**
 * 本地存储管理
 * 简单、可靠的数据持久化 - Linus 风格
 */

const STORAGE_KEY = 'my_ebbinghaus_knowledge_points';
const SETTINGS_KEY = 'my_ebbinghaus_settings';

/**
 * 知识点数据结构
 * @typedef {Object} KnowledgePoint
 * @property {string} id - 唯一标识
 * @property {string} title - 标题
 * @property {string} content - 内容
 * @property {string} masteryLevel - 掌握程度
 * @property {string} lastReviewed - 上次复习日期
 * @property {string} nextReview - 下次复习日期
 * @property {number} reviewCount - 复习次数
 * @property {string} createdAt - 创建日期
 * @property {string[]} tags - 标签
 */

/**
 * 从localStorage加载知识点
 * @returns {KnowledgePoint[]} 知识点数组
 */
function loadKnowledgePoints() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return [];
        }
        
        const points = JSON.parse(data);
        
        // 验证数据结构
        if (!Array.isArray(points)) {
            console.warn('存储的数据不是数组，重置为空数组');
            return [];
        }
        
        return points;
    } catch (error) {
        console.error('加载知识点失败:', error);
        return [];
    }
}

/**
 * 保存知识点到localStorage
 * @param {KnowledgePoint[]} points - 知识点数组
 * @returns {boolean} 是否保存成功
 */
function saveKnowledgePoints(points) {
    try {
        if (!Array.isArray(points)) {
            throw new Error('知识点数据必须是数组');
        }
        
        // 调试信息：确保数据正确保存
        console.log('保存知识点数量:', points.length);
        console.log('保存的知识点:', points.map(p => ({ id: p.id, title: p.title, masteryLevel: p.masteryLevel })));
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(points));
        return true;
    } catch (error) {
        console.error('保存知识点失败:', error);
        return false;
    }
}

/**
 * 添加新知识点
 * @param {string} title - 标题
 * @param {string} content - 内容
 * @param {string[]} tags - 标签数组
 * @param {string} masteryLevel - 掌握程度
 * @returns {KnowledgePoint} 新创建的知识点
 */
function addKnowledgePoint(title, content, tags = [], masteryLevel = 'struggling') {
    if (!title || !content) {
        throw new Error('标题和内容不能为空');
    }
    
    const points = loadKnowledgePoints();
    
    // 根据掌握程度计算下次复习时间
    const nextReviewDate = calculateNextReviewDate(masteryLevel, getTodayString(), 0);
    
    const newPoint = {
        id: generateId(),
        title: title.trim(),
        content: content.trim(),
        masteryLevel: masteryLevel,
        lastReviewed: null,
        nextReview: nextReviewDate,
        reviewCount: 0,
        createdAt: getTodayString(),
        tags: tags || []
    };
    
    points.push(newPoint);
    
    if (saveKnowledgePoints(points)) {
        return newPoint;
    } else {
        throw new Error('保存知识点失败');
    }
}

/**
 * 更新知识点
 * @param {string} id - 知识点ID
 * @param {Partial<KnowledgePoint>} updates - 要更新的字段
 * @returns {boolean} 是否更新成功
 */
function updateKnowledgePoint(id, updates) {
    const points = loadKnowledgePoints();
    const index = points.findIndex(point => point.id === id);
    
    if (index === -1) {
        console.error(`知识点不存在: ${id}`);
        return false;
    }
    
    const currentPoint = points[index];
    
    // 检查掌握程度是否改变
    if (updates.masteryLevel && updates.masteryLevel !== currentPoint.masteryLevel) {
        // 掌握程度改变，重新计算复习时间
        const newNextReview = calculateNextReviewDate(
            updates.masteryLevel, 
            getTodayString(), 
            currentPoint.reviewCount
        );
        updates.nextReview = newNextReview;
        
        console.log(`掌握程度改变: ${currentPoint.masteryLevel} → ${updates.masteryLevel}, 新复习时间: ${newNextReview}`);
    }
    
    // 合并更新
    points[index] = { ...currentPoint, ...updates };
    
    return saveKnowledgePoints(points);
}

/**
 * 删除知识点
 * @param {string} id - 知识点ID
 * @returns {boolean} 是否删除成功
 */
function deleteKnowledgePoint(id) {
    const points = loadKnowledgePoints();
    const filteredPoints = points.filter(point => point.id !== id);
    
    if (filteredPoints.length === points.length) {
        console.error(`知识点不存在: ${id}`);
        return false;
    }
    
    return saveKnowledgePoints(filteredPoints);
}

/**
 * 获取需要复习的知识点
 * @returns {KnowledgePoint[]} 需要复习的知识点
 */
function getPointsToReview() {
    const points = loadKnowledgePoints();
    const today = getTodayString();
    
    return points.filter(point => {
        // 没有设置下次复习日期的，或者今天需要复习的
        return !point.nextReview || point.nextReview <= today;
    });
}

/**
 * 获取所有知识点
 * @returns {KnowledgePoint[]} 所有知识点
 */
function getAllKnowledgePoints() {
    return loadKnowledgePoints();
}

/**
 * 根据掌握程度筛选知识点
 * @param {string} masteryLevel - 掌握程度
 * @returns {KnowledgePoint[]} 筛选后的知识点
 */
function getPointsByMasteryLevel(masteryLevel) {
    const points = loadKnowledgePoints();
    return points.filter(point => point.masteryLevel === masteryLevel);
}

/**
 * 搜索知识点
 * @param {string} query - 搜索关键词
 * @returns {KnowledgePoint[]} 搜索结果
 */
function searchKnowledgePoints(query) {
    if (!query || query.trim() === '') {
        return getAllKnowledgePoints();
    }
    
    const points = loadKnowledgePoints();
    const lowerQuery = query.toLowerCase();
    
    return points.filter(point => {
        return point.title.toLowerCase().includes(lowerQuery) ||
               point.content.toLowerCase().includes(lowerQuery) ||
               point.tags.some(tag => tag.toLowerCase().includes(lowerQuery));
    });
}

/**
 * 导出数据
 * @returns {string} JSON格式的数据
 */
function exportData() {
    const points = loadKnowledgePoints();
    const settings = loadSettings();
    
    return JSON.stringify({
        knowledgePoints: points,
        settings: settings,
        exportDate: getTodayString(),
        version: '1.0'
    }, null, 2);
}

/**
 * 导入数据
 * @param {string} jsonData - JSON格式的数据
 * @returns {boolean} 是否导入成功
 */
function importData(jsonData) {
    try {
        const data = JSON.parse(jsonData);
        
        if (!data.knowledgePoints || !Array.isArray(data.knowledgePoints)) {
            throw new Error('无效的数据格式');
        }
        
        // 备份当前数据
        const backup = exportData();
        localStorage.setItem('my_ebbinghaus_backup', backup);
        
        // 导入新数据
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.knowledgePoints));
        
        if (data.settings) {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(data.settings));
        }
        
        return true;
    } catch (error) {
        console.error('导入数据失败:', error);
        return false;
    }
}

/**
 * 加载设置
 * @returns {Object} 设置对象
 */
function loadSettings() {
    try {
        const data = localStorage.getItem(SETTINGS_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('加载设置失败:', error);
        return {};
    }
}

/**
 * 保存设置
 * @param {Object} settings - 设置对象
 * @returns {boolean} 是否保存成功
 */
function saveSettings(settings) {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        return true;
    } catch (error) {
        console.error('保存设置失败:', error);
        return false;
    }
}

/**
 * 生成唯一ID
 * @returns {string} 唯一标识符
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 获取今天的日期字符串
 * @returns {string} 今天的日期 (YYYY-MM-DD)
 */
function getTodayString() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 导出所有函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadKnowledgePoints,
        saveKnowledgePoints,
        addKnowledgePoint,
        updateKnowledgePoint,
        deleteKnowledgePoint,
        getPointsToReview,
        getAllKnowledgePoints,
        getPointsByMasteryLevel,
        searchKnowledgePoints,
        exportData,
        importData,
        loadSettings,
        saveSettings
    };
}
