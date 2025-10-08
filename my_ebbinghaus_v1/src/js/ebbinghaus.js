/**
 * 艾宾浩斯遗忘曲线核心算法
 * 简单、直接、有效 - Linus 风格
 */

// 掌握程度常量
const MASTERY_LEVELS = {
    MASTERED: 'mastered',
    LEARNING: 'learning', 
    STRUGGLING: 'struggling'
};

// 复习间隔配置（天数）
const REVIEW_INTERVALS = {
    [MASTERY_LEVELS.MASTERED]: [1, 3, 7, 15, 30],
    [MASTERY_LEVELS.LEARNING]: [1, 2, 4, 8, 16],
    [MASTERY_LEVELS.STRUGGLING]: [0, 1, 2, 4, 8]
};

/**
 * 计算下次复习时间
 * @param {string} masteryLevel - 掌握程度
 * @param {string} lastReviewDate - 上次复习日期 (YYYY-MM-DD)
 * @param {number} reviewCount - 已复习次数
 * @returns {string} 下次复习日期
 */
function calculateNextReviewDate(masteryLevel, lastReviewDate, reviewCount) {
    if (!masteryLevel || !lastReviewDate) {
        throw new Error('掌握程度和上次复习日期不能为空');
    }
    
    const intervals = REVIEW_INTERVALS[masteryLevel];
    if (!intervals) {
        throw new Error(`未知的掌握程度: ${masteryLevel}`);
    }
    
    // 确定使用哪个间隔
    const intervalIndex = Math.min(reviewCount, intervals.length - 1);
    const daysToAdd = intervals[intervalIndex];
    
    // 计算下次复习日期
    const lastReview = new Date(lastReviewDate);
    const nextReview = new Date(lastReview);
    nextReview.setDate(lastReview.getDate() + daysToAdd);
    
    return formatDate(nextReview);
}

/**
 * 检查是否需要复习
 * @param {string} nextReviewDate - 下次复习日期
 * @returns {boolean} 是否需要复习
 */
function shouldReview(nextReviewDate) {
    const today = new Date();
    const nextReview = new Date(nextReviewDate);
    
    // 重置时间部分，只比较日期
    today.setHours(0, 0, 0, 0);
    nextReview.setHours(0, 0, 0, 0);
    
    return today >= nextReview;
}

/**
 * 处理复习结果
 * @param {string} currentMasteryLevel - 当前掌握程度
 * @param {string} reviewResult - 复习结果 ('success' | 'failure')
 * @returns {string} 新的掌握程度
 */
function processReviewResult(currentMasteryLevel, reviewResult) {
    if (reviewResult === 'success') {
        // 复习成功，保持或提升掌握程度
        return currentMasteryLevel;
    } else {
        // 复习失败，降低掌握程度
        switch (currentMasteryLevel) {
            case MASTERY_LEVELS.MASTERED:
                return MASTERY_LEVELS.LEARNING;
            case MASTERY_LEVELS.LEARNING:
                return MASTERY_LEVELS.STRUGGLING;
            case MASTERY_LEVELS.STRUGGLING:
                return MASTERY_LEVELS.STRUGGLING; // 已经是最低，不再降低
            default:
                return MASTERY_LEVELS.STRUGGLING;
        }
    }
}

/**
 * 获取掌握程度的显示名称
 * @param {string} masteryLevel - 掌握程度
 * @returns {string} 显示名称
 */
function getMasteryDisplayName(masteryLevel) {
    const displayNames = {
        [MASTERY_LEVELS.MASTERED]: '掌握',
        [MASTERY_LEVELS.LEARNING]: '学习中',
        [MASTERY_LEVELS.STRUGGLING]: '困难'
    };
    return displayNames[masteryLevel] || '未知';
}

/**
 * 获取掌握程度的颜色
 * @param {string} masteryLevel - 掌握程度
 * @returns {string} CSS颜色类名
 */
function getMasteryColorClass(masteryLevel) {
    const colorClasses = {
        [MASTERY_LEVELS.MASTERED]: 'mastery-mastered',
        [MASTERY_LEVELS.LEARNING]: 'mastery-learning',
        [MASTERY_LEVELS.STRUGGLING]: 'mastery-struggling'
    };
    return colorClasses[masteryLevel] || 'mastery-unknown';
}

/**
 * 格式化日期为 YYYY-MM-DD
 * @param {Date} date - 日期对象
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * 获取今天的日期字符串
 * @returns {string} 今天的日期 (YYYY-MM-DD)
 */
function getTodayString() {
    return formatDate(new Date());
}

// 导出所有函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        MASTERY_LEVELS,
        calculateNextReviewDate,
        shouldReview,
        processReviewResult,
        getMasteryDisplayName,
        getMasteryColorClass,
        formatDate,
        getTodayString
    };
}

