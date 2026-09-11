// pages/calendar/calendar.js
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
    console.log(limitDate)
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
    let true_false = this.isWithinTenDays(date)
    if(true_false) {
      console.log(true_false)
      wx.reLaunch({
        url: '/pages/chengji/chengji?date=' + date
      })
    }
  },
  isWithinTenDays(dateStr) {
    // 1. 获取今天的日期对象（清除时分秒，只保留日期）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    // 2. 处理传入的日期字符串 (兼容 iOS 将 '-' 替换为 '/')
    // 注意：直接 new Date('2026-08-13') 在某些旧版安卓/iOS上可能返回 Invalid Date
    const targetDate = new Date(dateStr.replace(/-/g, '/'));
    targetDate.setHours(0, 0, 0, 0);
  
    // 3. 计算时间差（毫秒）
    const diffTime = targetDate.getTime() - today.getTime();
  
    // 4. 将毫秒转换为天数
    // 1天 = 24小时 * 60分 * 60秒 * 1000毫秒 = 86400000
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
    // 5. 判断逻辑：
    // >= 0 : 排除过去的日期（只能选今天及以后）
    // <= 9 : 包含今天在内的10天（即差值为0到9天）
    return diffDays >= 0 && diffDays <= 9;
  }
})