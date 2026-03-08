// 全局变量
let records = []; // 记账记录数组
let categories = []; // 类别数组
let currentView = 'week'; // 当前视图：'week' 或 'month'
let currentChartType = 'pie'; // 当前图表类型：'pie' 或 'line'
let chart = null; // Chart.js 实例

// 初始化应用
function initApp() {
    // 从本地存储加载数据
    loadData();
    
    // 初始化默认类别（如果没有类别）
    if (categories.length === 0) {
        initDefaultCategories();
    }
    
    // 设置默认日期为今天
    document.getElementById('date').valueAsDate = new Date();
    
    // 渲染类别选择器
    renderCategorySelectors();
    
    // 渲染记录列表
    renderRecords();
    
    // 渲染统计数据和图表
    updateStatsAndCharts();
    
    // 绑定事件监听器
    bindEventListeners();
}

// 从本地存储加载数据
function loadData() {
    const savedRecords = localStorage.getItem('budgetTrackerRecords');
    const savedCategories = localStorage.getItem('budgetTrackerCategories');
    
    if (savedRecords) {
        records = JSON.parse(savedRecords);
    }
    
    if (savedCategories) {
        categories = JSON.parse(savedCategories);
    }
}

// 保存数据到本地存储
function saveData() {
    localStorage.setItem('budgetTrackerRecords', JSON.stringify(records));
    localStorage.setItem('budgetTrackerCategories', JSON.stringify(categories));
}

// 初始化默认类别
function initDefaultCategories() {
    categories = [
        '餐饮', '交通', '娱乐', '购物', '医疗', '教育', '住房', '其他'
    ];
    saveData();
}

// 渲染类别选择器
function renderCategorySelectors() {
    const categorySelect = document.getElementById('category');
    const editCategorySelect = document.getElementById('edit-category');
    
    // 清空现有选项
    categorySelect.innerHTML = '<option value="">请选择类别</option>';
    editCategorySelect.innerHTML = '<option value="">请选择类别</option>';
    
    // 添加类别选项
    categories.forEach(category => {
        const option1 = document.createElement('option');
        option1.value = category;
        option1.textContent = category;
        categorySelect.appendChild(option1);
        
        const option2 = document.createElement('option');
        option2.value = category;
        option2.textContent = category;
        editCategorySelect.appendChild(option2);
    });
    
    // 渲染类别管理列表
    renderCategoryList();
}

// 渲染类别管理列表
function renderCategoryList() {
    const categoryList = document.getElementById('category-list');
    categoryList.innerHTML = '';
    
    categories.forEach(category => {
        const categoryItem = document.createElement('div');
        categoryItem.className = 'category-item';
        categoryItem.innerHTML = `
            <span>${category}</span>
            <button class="delete-category-btn" onclick="deleteCategory('${category}')">删除</button>
        `;
        categoryList.appendChild(categoryItem);
    });
}

// 添加类别
function addCategory() {
    const newCategoryInput = document.getElementById('new-category');
    const newCategory = newCategoryInput.value.trim();
    
    if (newCategory && !categories.includes(newCategory)) {
        categories.push(newCategory);
        saveData();
        renderCategorySelectors();
        newCategoryInput.value = '';
    }
}

// 删除类别
function deleteCategory(category) {
    // 确认删除
    if (confirm(`确定要删除类别「${category}」吗？`)) {
        categories = categories.filter(c => c !== category);
        saveData();
        renderCategorySelectors();
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 表单提交事件
    document.getElementById('expense-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addRecord();
    });
    
    // 编辑表单提交事件
    document.getElementById('edit-form').addEventListener('submit', function(e) {
        e.preventDefault();
        updateRecord();
    });
    
    // 视图切换按钮
    document.getElementById('week-btn').addEventListener('click', function() {
        switchView('week');
    });
    
    document.getElementById('month-btn').addEventListener('click', function() {
        switchView('month');
    });
    
    // 图表类型切换按钮
    document.getElementById('pie-chart-btn').addEventListener('click', function() {
        switchChartType('pie');
    });
    
    document.getElementById('line-chart-btn').addEventListener('click', function() {
        switchChartType('line');
    });
    
    // 设置按钮
    document.getElementById('settings-btn').addEventListener('click', function() {
        openModal('settings-modal');
    });
    
    // 添加类别按钮
    document.getElementById('add-category-btn').addEventListener('click', addCategory);
    
    // 导出按钮
    document.getElementById('export-btn').addEventListener('click', exportToCSV);
    
    // 关闭模态框
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            closeModal(this.closest('.modal'));
        });
    });
    
    // 点击模态框外部关闭
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
}

// 打开模态框
function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
}

// 关闭模态框
function closeModal(modal) {
    modal.style.display = 'none';
}

// 切换视图
function switchView(view) {
    currentView = view;
    
    // 更新按钮状态
    document.getElementById('week-btn').classList.toggle('active', view === 'week');
    document.getElementById('month-btn').classList.toggle('active', view === 'month');
    
    // 更新统计数据和图表
    updateStatsAndCharts();
}

// 切换图表类型
function switchChartType(type) {
    currentChartType = type;
    
    // 更新按钮状态
    document.getElementById('pie-chart-btn').classList.toggle('active', type === 'pie');
    document.getElementById('line-chart-btn').classList.toggle('active', type === 'line');
    
    // 更新图表
    updateChart();
}

// 添加记录
function addRecord() {
    const amount = parseFloat(document.getElementById('amount').value);
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;
    
    if (amount && category && date) {
        const record = {
            id: Date.now().toString(),
            amount: amount,
            category: category,
            description: description,
            date: date
        };
        
        records.push(record);
        saveData();
        renderRecords();
        updateStatsAndCharts();
        
        // 重置表单
        document.getElementById('expense-form').reset();
        document.getElementById('date').valueAsDate = new Date();
    }
}

// 编辑记录
function editRecord(id) {
    const record = records.find(r => r.id === id);
    if (record) {
        document.getElementById('edit-id').value = record.id;
        document.getElementById('edit-amount').value = record.amount;
        document.getElementById('edit-category').value = record.category;
        document.getElementById('edit-description').value = record.description;
        document.getElementById('edit-date').value = record.date;
        openModal('edit-modal');
    }
}

// 更新记录
function updateRecord() {
    const id = document.getElementById('edit-id').value;
    const amount = parseFloat(document.getElementById('edit-amount').value);
    const category = document.getElementById('edit-category').value;
    const description = document.getElementById('edit-description').value;
    const date = document.getElementById('edit-date').value;
    
    if (amount && category && date) {
        const index = records.findIndex(r => r.id === id);
        if (index !== -1) {
            records[index] = {
                id: id,
                amount: amount,
                category: category,
                description: description,
                date: date
            };
            
            saveData();
            renderRecords();
            updateStatsAndCharts();
            closeModal(document.getElementById('edit-modal'));
        }
    }
}

// 删除记录
function deleteRecord(id) {
    if (confirm('确定要删除这条记录吗？')) {
        records = records.filter(r => r.id !== id);
        saveData();
        renderRecords();
        updateStatsAndCharts();
    }
}

// 渲染记录列表
function renderRecords() {
    const recordsList = document.getElementById('records-list');
    recordsList.innerHTML = '';
    
    // 按日期降序排序
    const sortedRecords = [...records].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    sortedRecords.forEach(record => {
        const recordItem = document.createElement('div');
        recordItem.className = 'record-item';
        recordItem.innerHTML = `
            <div class="record-info">
                <div class="record-date">${record.date}</div>
                <div class="record-category">${record.category}</div>
                <div class="record-amount">¥${record.amount.toFixed(2)}</div>
                ${record.description ? `<div class="record-description">${record.description}</div>` : ''}
            </div>
            <div class="record-actions">
                <button class="edit-btn" onclick="editRecord('${record.id}')">编辑</button>
                <button class="delete-btn" onclick="deleteRecord('${record.id}')">删除</button>
            </div>
        `;
        recordsList.appendChild(recordItem);
    });
}

// 获取指定时间范围的记录
function getFilteredRecords() {
    const now = new Date();
    let startDate;
    
    if (currentView === 'week') {
        // 本周开始（周一）
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay() + 1);
        if (now.getDay() === 0) startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
    } else {
        // 本月开始
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return records.filter(record => new Date(record.date) >= startDate);
}

// 更新统计数据和图表
function updateStatsAndCharts() {
    const filteredRecords = getFilteredRecords();
    
    // 计算总支出
    const totalExpense = filteredRecords.reduce((sum, record) => sum + record.amount, 0);
    
    // 计算日均支出
    const now = new Date();
    let daysCount;
    
    if (currentView === 'week') {
        // 本周天数
        daysCount = Math.min(now.getDay() || 7, 7);
    } else {
        // 本月天数
        daysCount = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        daysCount = Math.min(now.getDate(), daysCount);
    }
    
    const dailyAverage = totalExpense / daysCount;
    
    // 更新统计卡片
    document.getElementById('total-expense').textContent = `¥${totalExpense.toFixed(2)}`;
    document.getElementById('daily-average').textContent = `¥${dailyAverage.toFixed(2)}`;
    
    // 更新图表
    updateChart();
}

// 更新图表
function updateChart() {
    const filteredRecords = getFilteredRecords();
    const ctx = document.getElementById('chart').getContext('2d');
    
    // 销毁旧图表
    if (chart) {
        chart.destroy();
    }
    
    if (currentChartType === 'pie') {
        // 饼图：分类占比
        const categoryData = {};
        
        filteredRecords.forEach(record => {
            if (categoryData[record.category]) {
                categoryData[record.category] += record.amount;
            } else {
                categoryData[record.category] = record.amount;
            }
        });
        
        const labels = Object.keys(categoryData);
        const data = Object.values(categoryData);
        
        chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
                        '#9966FF', '#FF9F40', '#8AC4D0', '#F8B500'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    title: {
                        display: true,
                        text: `${currentView === 'week' ? '本周' : '本月'}分类支出占比`
                    }
                }
            }
        });
    } else {
        // 折线图：支出趋势
        // 按日期分组
        const dateData = {};
        
        filteredRecords.forEach(record => {
            if (dateData[record.date]) {
                dateData[record.date] += record.amount;
            } else {
                dateData[record.date] = record.amount;
            }
        });
        
        // 排序日期
        const sortedDates = Object.keys(dateData).sort();
        const labels = sortedDates;
        const data = sortedDates.map(date => dateData[date]);
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '支出金额',
                    data: data,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: `${currentView === 'week' ? '本周' : '本月'}支出趋势`
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '¥' + value;
                            }
                        }
                    }
                }
            }
        });
    }
}

// 导出数据为CSV
function exportToCSV() {
    if (records.length === 0) {
        alert('没有数据可导出');
        return;
    }
    
    // CSV 表头
    const headers = ['日期', '类别', '金额', '备注'];
    
    // 转换记录为CSV行
    const rows = records.map(record => [
        record.date,
        record.category,
        record.amount,
        record.description || ''
    ]);
    
    // 组合表头和数据
    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
    
    // 创建Blob对象
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // 创建下载链接
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `budget-tracker-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 页面加载完成后初始化应用
window.addEventListener('DOMContentLoaded', initApp);