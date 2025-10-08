# 代码风格指南

## Linus 风格的代码原则

### 1. 代码质量
- **简洁胜过复杂**：能用简单方法解决的，绝不用复杂方法
- **可读性第一**：代码是给人看的，不是给机器看的
- **一个函数只做一件事**：函数名要清楚表达意图
- **避免过度抽象**：不要为了"优雅"而牺牲可读性

### 2. 命名规范
```javascript
// 变量和函数：camelCase
const masteryLevel = 1;
function calculateNextReview() {}

// 常量：UPPER_SNAKE_CASE
const MASTERY_LEVELS = {
    MASTERED: 'mastered',
    LEARNING: 'learning', 
    STRUGGLING: 'struggling'
};

// 类：PascalCase
class EbbinghausReviewer {}

// 私有方法：下划线前缀
function _calculateInterval() {}
```

### 3. 函数设计
```javascript
// 好的函数：职责单一，参数明确
function calculateNextReviewDate(masteryLevel, lastReview, reviewCount) {
    // 实现逻辑
}

// 避免：参数过多，职责不清
function processEverything(data, options, callback, flags) {
    // 不要这样做
}
```

### 4. 错误处理
```javascript
// 明确处理错误，不要静默失败
function loadKnowledgePoints() {
    try {
        const data = localStorage.getItem('knowledgePoints');
        return data ? JSON.parse(data) : [];
    } catch (error) {
        console.error('Failed to load knowledge points:', error);
        return [];
    }
}
```

### 5. 注释原则
- **为什么，不是是什么**：解释意图，不是实现
- **复杂逻辑必须注释**：算法、业务规则
- **避免废话注释**：`// 设置变量` 这种没用

```javascript
// 好的注释
// 根据艾宾浩斯曲线计算下次复习时间
// 掌握程度越高，间隔越长
function calculateInterval(masteryLevel) {
    // 实现
}

// 避免的注释
// 设置变量
let x = 1;
```

### 6. 数据结构设计
```javascript
// 清晰的数据结构
const knowledgePoint = {
    id: 'unique_id',
    title: '知识点标题',
    content: '详细内容',
    masteryLevel: 'mastered', // 使用字符串，不是数字
    lastReviewed: '2025-01-01',
    nextReview: '2025-01-02',
    reviewCount: 0,
    createdAt: '2025-01-01'
};
```

### 7. 性能考虑
- **避免不必要的DOM操作**：批量更新
- **合理使用事件委托**：减少事件监听器
- **数据缓存**：避免重复计算
- **懒加载**：大量数据时按需加载

### 8. 测试友好
- **纯函数优先**：易于测试
- **依赖注入**：便于mock
- **单一职责**：测试用例清晰

## 代码审查检查点
1. 函数是否只做一件事？
2. 变量名是否清楚表达意图？
3. 是否有不必要的复杂性？
4. 错误处理是否完整？
5. 性能是否有明显问题？

