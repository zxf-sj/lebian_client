function withData(param){
  return param < 10 ? '0' + param : '' + param;
}
function withDataYear(param){
  return param < 10 ? '0' + param+"年": '' + param+"年";
}
function withDataYue(param){
  return param < 10 ? '0' + param+"月" : '' + param+"月";
}
function withDataRi(param){
  return param < 10 ? '0' + param+"日" : '' + param+"日";
}
function withDataShi(param){
  return param < 10 ? '0' + param+"时" : '' + param+"时";
}
function withDataFen(param){
  return param < 10 ? '0' + param+"分" : '' + param+"分";
}
function getLoopArray(start,end){
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withData(i));
  }
  return array;
}
function getLoopArrayYear(start,end){
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withDataYear(i));
  }
  return array;
}
function getLoopArrayYue(start,end){
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withDataYue(i));
  }
  return array;
}
function getLoopArrayRi(start,end){
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withDataRi(i));
  }
  return array;
}
function getLoopArrayShi(start,end){
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withDataShi(i));
  }
  return array;
}
function getLoopArrayFen(start,end){
  var start = start || 0;
  var end = end || 1;
  var array = [];
  for (var i = start; i <= end; i++) {
    array.push(withDataFen(i));
  }
  return array;
}
function getMonthDay(year,month){
  var flag = year % 400 == 0 || (year % 4 == 0 && year % 100 != 0), array = null;
  switch (month) {
    case '01月':
    case '03月':
    case '05月':
    case '07月':
    case '08月':
    case '10月':
    case '12月':
      array = getLoopArrayRi(1, 31)
      break;
    case '04月':
    case '06月':
    case '09月':
    case '11月':
      array = getLoopArrayRi(1, 30)
      break;
    case '02月':
      array = flag ? getLoopArrayRi(1, 29) : getLoopArrayRi(1, 28)
      break;
    default:
      array = '月份格式不正确，请重新输入！'
  }
  return array;
}
function getNewDateArry(){
  // 当前时间的处理
  var newDate = new Date();
  var year = withDataYear(newDate.getFullYear()),
      mont = withDataYue(newDate.getMonth() + 1),
      date = withDataRi(newDate.getDate()),
      hour = withDataShi(newDate.getHours()),
      minu = withDataFen(newDate.getMinutes());
     // seco = withData(newDate.getSeconds());
      return [year, mont, date, hour, minu];
}
function dateTimePicker(startYear,endYear,date) {
  // 返回默认显示的数组和联动数组的声明
 // var dateTime = [], dateTimeArray = [[],[],[],[],[],[]];
  var dateTime = [], dateTimeArray = [[],[],[],[],[]];
  var start = startYear || 1978;
  var end = endYear || 2100;
  // 默认开始显示数据
  var defaultDate = date ? [...date.split(' ')[0].split('-'), ...date.split(' ')[1].split(':')] : getNewDateArry();
  // 处理联动列表数据
  /*年月日 时分秒*/ 
  dateTimeArray[0] = getLoopArrayYear(start,end);
  dateTimeArray[1] = getLoopArrayYue(1, 12);
  dateTimeArray[2] = getMonthDay(defaultDate[0], defaultDate[1]);
  dateTimeArray[3] = getLoopArrayShi(0, 23);
  dateTimeArray[4] = getLoopArrayFen(0, 59);
  //dateTimeArray[5] = getLoopArray(0, 59);

  dateTimeArray.forEach((current,index) => {
    dateTime.push(current.indexOf(defaultDate[index]));
  });

  return {
    dateTimeArray: dateTimeArray,
    dateTime: dateTime
  }
}
module.exports = {
  dateTimePicker: dateTimePicker,
  getMonthDay: getMonthDay
}