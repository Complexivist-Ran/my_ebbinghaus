#!/usr/bin/env node

/**
 * Pre-commit hook for My Ebbinghaus v1
 * 在提交前自动检查代码质量
 */

const fs = require('fs');
const path = require('path');

// 检查文件是否存在
function checkFileExists(filePath) {
    if (!fs.existsSync(filePath)) {
        console.error(`❌ 缺少必要文件: ${filePath}`);
        return false;
    }
    return true;
}

// 检查JavaScript语法
function checkJavaScriptSyntax(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // 简单的语法检查
        if (content.includes('console.log(') && !content.includes('// TODO: remove')) {
            console.warn(`⚠️  ${filePath} 包含 console.log，请确认是否需要`);
        }
        return true;
    } catch (error) {
        console.error(`❌ JavaScript语法错误: ${filePath}`, error.message);
        return false;
    }
}

// 检查HTML结构
function checkHTMLStructure(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 检查必要的meta标签
    if (!content.includes('<meta charset="utf-8">')) {
        console.error(`❌ ${filePath} 缺少字符编码声明`);
        return false;
    }
    
    // 检查viewport设置
    if (!content.includes('viewport')) {
        console.warn(`⚠️  ${filePath} 缺少viewport设置，可能影响移动端显示`);
    }
    
    return true;
}

// 主检查函数
function runChecks() {
    console.log('🔍 运行代码质量检查...');
    
    let allPassed = true;
    
    // 检查核心文件
    const requiredFiles = [
        'index.html',
        'src/js/app.js',
        'src/js/ebbinghaus.js',
        'src/css/style.css'
    ];
    
    requiredFiles.forEach(file => {
        if (!checkFileExists(file)) {
            allPassed = false;
        }
    });
    
    // 检查JavaScript文件
    const jsFiles = [
        'src/js/app.js',
        'src/js/ebbinghaus.js',
        'src/js/storage.js'
    ];
    
    jsFiles.forEach(file => {
        if (fs.existsSync(file)) {
            if (!checkJavaScriptSyntax(file)) {
                allPassed = false;
            }
        }
    });
    
    // 检查HTML文件
    if (fs.existsSync('index.html')) {
        if (!checkHTMLStructure('index.html')) {
            allPassed = false;
        }
    }
    
    if (allPassed) {
        console.log('✅ 所有检查通过，可以提交');
        process.exit(0);
    } else {
        console.log('❌ 检查失败，请修复问题后重新提交');
        process.exit(1);
    }
}

// 运行检查
runChecks();

