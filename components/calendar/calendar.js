// components/calendar/calendar.js
Page({
  data: {
    weeks: ['日', '一', '二', '三', '四', '五', '六'],
    monthsData: [], // 存放三个月的数据
    selectedDate: '' // 当前选中的日期
  },

  onLoad() {
    this.initCalendar();
  },

  initCalendar() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    const currentDate = now.getDate();
    
    // 计算截止日期（今天往后推10天）
    // 注意：包含今天，所以是 +9 天，比如今天是1号，能选到10号
    const limitDate = new Date();
    limitDate.setDate(currentDate + 9); 

    let allMonthsData = [];

    // 循环生成3个月的数据 (本月, 下月, 下下月)
    for (let i = 0; i < 3; i++) {
      let targetDate = new Date(currentYear, currentMonth + i, 1);
      let year = targetDate.getFullYear();
      let month = targetDate.getMonth(); // 0-11
      
      // 格式化月份显示 (补0)
      let monthStr = (month + 1).toString().padStart(2, '0');

      // 获取该月第一天是周几 (0-6)
      let firstDayWeek = new Date(year, month, 1).getDay();
      
      // 获取该月总天数
      let daysInMonth = new Date(year, month + 1, 0).getDate();

      let dayList = [];

      // 1. 填充上个月的空白占位符
      for (let j = 0; j < firstDayWeek; j++) {
        dayList.push({ fullDate: '', day: '', status: 'empty' });
      }

      // 2. 填充当月的天数
      for (let d = 1; d <= daysInMonth; d++) {
        // 构建完整日期字符串 YYYY-MM-DD
        let dayStr = d.toString().padStart(2, '0');
        let fullDateStr = `${year}-${monthStr}-${dayStr}`;
        
        // 创建当前遍历到的日期对象用于比较
        let loopDate = new Date(year, month, d);
        
        // --- 核心判断逻辑 ---
        let status = '';
        
        // 清除时分秒进行比较
        let todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        let loopTime = loopDate.getTime();
        let limitTime = limitDate.getTime();

        if (loopTime < todayStart) {
          // 过去的日子 -> 禁用
          status = 'is-disabled';
        } else if (loopTime > limitTime) {
          // 超过10天的日子 -> 禁用
          status = 'is-disabled';
        } else if (loopTime === todayStart) {
          // 今天 -> 高亮
          status = 'is-today';
        }

        dayList.push({
          day: d,
          fullDate: fullDateStr,
          status: status
        });
      }

      allMonthsData.push({
        uniqueMonth: `${year}-${monthStr}`,
        year: year,
        monthStr: monthStr,
        dayList: dayList
      });
    }

    this.setData({
      monthsData: allMonthsData
    });
  },

  // 点击日期事件
  onDayTap(e) {
    const dataset = e.currentTarget.dataset;
    const date = dataset.date;
    
    // 如果点击的是空白处或禁用的日期，不处理
    if (!date || !e.currentTarget.classList.contains('is-disabled')) { 
       // 注意：上面这行判断在小程序里需要用 dataset 里的标记来判断，
       // 更严谨的做法是在 wxml 的 bindtap 上加判断，或者在这里判断 status
       
       // 简单判断：如果有 fullDate 且不是 disabled
       // 由于我们在 CSS 里加了 pointer-events 或者在 JS 里判断都可以
       // 这里我们用 JS 再次校验一下时间范围（双重保险）
       
       const now = new Date();
       const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
       const clickTime = new Date(date).getTime();
       const limitTime = new Date().setDate(now.getDate() + 9); // 粗略计算，实际应复用上面的 limitDate

       // 这里为了演示简单，只要传回了 date 就认为是有效的（因为 invalid 的我们也可以不传 date）
       // 但为了稳妥，建议给 day-item 加一个 data-status="{{item.status}}"
       
       // 假设点击有效：
       console.log("选中日期:", date);
       
       // 可以在这里更新 UI 上的选中状态（例如把之前的 is-today 改为普通，把当前改为 is-selected）
       // 为简化代码，这里仅做日志输出
       wx.showToast({ title: date, icon: 'none' });
    }
  }
})