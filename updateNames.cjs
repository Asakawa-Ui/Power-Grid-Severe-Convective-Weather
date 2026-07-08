const fs = require('fs');
const content = fs.readFileSync('src/utils/weatherPoints.ts', 'utf-8');

const placeNames = [
  "中韩原种场", "南庄作业点", "王村作业点", "十堰武当山站", "深泽县作业点", 
  "桥头镇高炮站", "林家村火箭点", "赵家铺作业点", "东郭村防雹站", "阳平镇作业点", 
  "下口村增雨站", "太平庄高炮站", "大杨树作业点", "三道沟火箭点", "西梁村作业点", 
  "北山林场作业点", "马家窑作业点", "李家湾增雨站", "前营村防雹站", "沙河铺高炮站",
  "郭家屯作业点", "大辛庄火箭点", "白云山作业点", "卧龙台高炮站", "八里庄作业点"
];

let index = 0;
const updated = content.replace(/"name":\s*"[^"]+"/g, (match) => {
  const name = placeNames[index % placeNames.length];
  index++;
  return `"name": "${name}"`;
});

fs.writeFileSync('src/utils/weatherPoints.ts', updated);
console.log('Updated ' + index + ' names');
