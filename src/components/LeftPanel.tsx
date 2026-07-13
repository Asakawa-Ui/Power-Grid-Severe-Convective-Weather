import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import {
  Satellite,
  Radar,
  Activity,
  CloudRain,
  LineChart,
  CloudLightning,
  AlertTriangle
} from 'lucide-react';

interface ChildProduct {
  name: string;
  desc: string;
  unit?: string;
  range?: string;
  levels?: string[];
}

interface SubCategory {
  name: string;
  products: ChildProduct[];
}

const mainCategories = [
  { id: 'satellite', name: '卫星', icon: Satellite },
  { id: 'radar', name: '雷达', icon: Radar },
  { id: 'actual', name: '天气实况', icon: Activity },
  { id: 'rain', name: '灾害天气', icon: CloudRain },
  { id: 'forecast', name: '预报', icon: LineChart },
  { id: 'lightning', name: '闪电', icon: CloudLightning },
  { id: 'warning', name: '预警信息', icon: AlertTriangle },
];

const hierarchicalData: Record<string, SubCategory[]> = {
  satellite: [
    {
      name: '葵花9号卫星数据',
      products: [
        { name: '可见光反射率', desc: '葵花9号卫星可见光反射率产品，展现高分辨率反射特征，用于白天云系及强对流精细监测。', unit: '%', range: '0 - 100%', levels: ['低反射', '中反射', '强反射'] },
        { name: '近红外反射率', desc: '葵花9号卫星近红外反射率产品，对地面植被、水体及云雪区分具有重要指示作用。', unit: '%', range: '0 - 100%', levels: ['低反射', '中反射', '强反射'] },
        { name: '短波红外反射率', desc: '葵花9号卫星短波红外反射率，用于夜间云相态分类与冰雪、过冷水滴识别。', unit: '%', range: '0 - 100%', levels: ['低反射', '中反射', '强反射'] },
        { name: '中波红外亮温', desc: '葵花9号卫星中波红外通道等效黑体温度（亮温），对地表热源及高温点高度敏感。', unit: 'K', range: '200 - 350 K', levels: ['极冷', '中等', '极热'] },
        { name: '水汽亮温', desc: '葵花9号卫星水汽吸收通道亮温，反映对流层中上部的水汽含量与气流运动特征。', unit: 'K', range: '190 - 280 K', levels: ['干燥区', '过渡区', '湿润区'] },
        { name: '长波红外亮温', desc: '葵花9号卫星红外窗区通道亮温，全天候不间断监测云顶高度、厚度与温度演变。', unit: 'K', range: '180 - 320 K', levels: ['极冷', '中等', '暖区'] }
      ]
    },
    {
      name: '风云4号卫星数据',
      products: [
        { name: '太阳总辐射', desc: '风云四号地表下行太阳总辐射估算产品，服务于太阳能资源评估与电网负荷预估。', unit: 'W/m²', range: '0 - 1200 W/m²', levels: ['弱辐射', '中等', '极强辐射'] },
        { name: '直射辐射', desc: '风云四号地表直射太阳辐射产品，精确解析透光度，辅助特殊输电通道光热效益分析。', unit: 'W/m²', range: '0 - 1000 W/m²', levels: ['弱', '中等', '强'] },
        { name: '散射辐射', desc: '风云四号地表太阳散射辐射分量产品，评估多云或多雾天气下的环境光照强度。', unit: 'W/m²', range: '0 - 600 W/m²', levels: ['弱', '中等', '强'] },
        { name: '风流场产品', desc: '风云四号云导风产品，反演中高空大气流场，掌握高空大风与急流带走向特征。', unit: 'm/s', range: '0 - 60 m/s', levels: ['微风', '大风', '急流'] },
        { name: '地表温度产品', desc: '风云四号红外通道反演地表皮肤温度，监测地表强烈辐射及电网地基微气候。', unit: '℃', range: '-20 - 65 ℃', levels: ['冰冻', '常温', '极端炎热'] },
        { name: '降水估计产品', desc: '风云四号基于红外水汽组合特征计算得到的实时降水估计，提供小时级降雨量监测。', unit: 'mm/h', range: '0 - 80 mm/h', levels: ['无雨', '中雨', '大暴雨'] },
        { name: '强对流初生识别产品', desc: '风云四号动态捕捉对流云团初期亮温骤降区域，超前预警强对流系统的初生。', unit: '置信度', range: '0 - 100%', levels: ['低可能性', '中度潜势', '强对流初生'] },
        { name: '雾/低云信息', desc: '风云四号利用多通道红外温差算法自动反演夜间及大范围近地表浓雾、低云覆盖区。', unit: '能见度', range: '0 - 10 km', levels: ['大雾', '薄雾', '无雾'] },
        { name: '沙尘信息', desc: '风云四号大范围沙尘轨迹监测与沙尘强度反演产品，评估高压绝缘子积尘闪络风险。', unit: '指数', range: '0 - 10', levels: ['清洁', '浮尘', '强沙尘暴'] },
        { name: '火点信息', desc: '风云四号基于中红外通道热异常点高频筛查，实时监测高压线路走廊周边的山火隐患。', unit: '置信度', range: '0 - 100%', levels: ['无异常', '疑似火点', '高置信度火点'] }
      ]
    }
  ],
  radar: [
    {
      name: '雷达实况',
      products: [
        { name: '全国组网组合反射率', desc: '全国多普勒天气雷达网三维反射率因子拼图，是监测雹暴、飑线与强降雨的绝对核心。', unit: 'dBZ', range: '0 - 75 dBZ', levels: ['<30 弱回波', '30-45 局地降雨', '45-55 强雷雨', '>55 冰雹大风'] }
      ]
    },
    {
      name: '雷达外推',
      products: [
        { name: '全国组网组合反射率外推', desc: '基于光流法与深度学习外推算法，预测未来0-2小时全国反射率移动。', unit: '分钟', range: '0 - 120 min', levels: ['15分钟', '45分钟', '90分钟', '120分钟'] }
      ]
    }
  ],
  actual: [
    {
      name: '1km网格数据',
      products: [
        { name: '气温', desc: '1千米精细化地面气温分析格点场，高精度还原复杂地形下的气温。', unit: '℃', range: '-15 - 45 ℃', levels: ['极寒', '舒适', '酷热'] },
        { name: '湿度', desc: '1千米精细化相对湿度分析格点场，精细掌握输电线路凝露关键参数。', unit: '%', range: '0 - 100%', levels: ['干燥', '舒适', '潮湿'] },
        { name: '风速', desc: '1千米格点地面10米风速实况，支撑输电塔风偏稳定性评估。', unit: 'm/s', range: '0 - 45 m/s', levels: ['微风', '强风', '飓风'] },
        { name: '阵风', desc: '1千米地面最大瞬时阵风实况，对局地突发大风事件提供秒级精细保障。', unit: 'm/s', range: '0 - 60 m/s', levels: ['轻微', '大风', '破坏性阵风'] },
        { name: '降水量', desc: '1千米时段累积降水量格点实况，精细追踪局地极端暴雨分布。', unit: 'mm', range: '0 - 100 mm', levels: ['小雨', '大雨', '极端暴雨'] },
        { name: '气压', desc: '1千米本站气压格点实况，配合流场研判尺度天气锋面演变。', unit: 'hPa', range: '900 - 1050', levels: ['低气压', '标准压', '高气压'] },
        { name: '辐射', desc: '1千米精细地表太阳总辐射网格，为特高压光伏消纳提供参考。', unit: 'W/m²', range: '0 - 1100', levels: ['弱', '中等', '极强光照'] }
      ]
    },
    {
      name: '5km网格数',
      products: [
        { name: '降雨', desc: '5千米地面常规累计降雨网格数据，适用于全省或区域大面积雨情综合研判。', unit: 'mm', range: '0 - 120 mm', levels: ['微量', '小到中雨', '大到暴雨'] },
        { name: '温度', desc: '5千米地表温度常规格点实况，适用于大范围高温或寒潮监测。', unit: '℃', range: '-20 - 45 ℃', levels: ['冰冻区', '温和区', '高温区'] },
        { name: '经向风', desc: '5千米南北向水平风速分量（V风），反映冷空气南下或暖湿气流北上风速。', unit: 'm/s', range: '-40 - 40 m/s', levels: ['偏北风', '微风', '偏南风'] },
        { name: '纬向风', desc: '5千米东西向水平风速分量（U风），反映西风带或季风系统横向推进强度。', unit: 'm/s', range: '-40 - 40 m/s', levels: ['偏西风', '微风', '偏东风'] },
        { name: '湿度', desc: '5千米相对湿度格点场，全域大气环境湿度诊断。', unit: '%', range: '0 - 100%', levels: ['干燥', '温和', '饱和'] },
        { name: '能见度', desc: '5千米地面水平能见度格点实况，重点识别高速、电网大雾及烟尘。', unit: 'km', range: '0 - 30 km', levels: ['强浓雾', '大雾', '清晰'] }
      ]
    },
    {
      name: '城市气象',
      products: [
        { name: '最高温度', desc: '城市各气象监测点近24小时监测的最大气温极值。', unit: '℃', range: '-10 - 45 ℃', levels: ['低温', '常温', '高温'] },
        { name: '平均温度', desc: '城市监测网日平均温度统计，反映地表及近地面平均热能。', unit: '℃', range: '-15 - 40 ℃', levels: ['寒冷', '凉爽', '炎热'] },
        { name: '最低温度', desc: '城市各气象监测点近24小时监测的最低气温极值。', unit: '℃', range: '-20 - 35 ℃', levels: ['严寒', '温凉', '暖热'] },
        { name: '相对湿度', desc: '城市网相对空气湿度指数，与城市雾霾、凝露等事件密切关联。', unit: '%', range: '0 - 100%', levels: ['极干燥', '舒适区', '高湿区'] },
        { name: '降水量（降雪量）', desc: '城市网累积降雨量或换算降雪量，提供城市内涝与防冻支持。', unit: 'mm', range: '0 - 150 mm', levels: ['小雨雪', '大到暴雪', '内涝级'] },
        { name: '风速', desc: '城市主要观测点10米高平均风速，用于评估风暴扫掠城市群时的阻力。', unit: 'm/s', range: '0 - 35 m/s', levels: ['清风', '强风', '烈风级'] },
        { name: '风向', desc: '城市水平风流向方位，精细判识城市风道效应。', unit: '度 (°)', range: '0 - 360°', levels: ['偏北', '偏东', '偏南', '偏西'] },
        { name: '辐照度', desc: '城市区域水平总日射辐照度，可服务分布式屋顶光伏功率追踪。', unit: 'W/m²', range: '0 - 1100', levels: ['极微', '中等', '高强度'] },
        { name: '温湿指数', desc: '结合温度和湿度算法评估人体对于气象环境的综合热压力。', unit: '指数', range: '0 - 100', levels: ['舒适', '闷热', '极度不适'] },
        { name: '人体舒适度', desc: '根据温度、湿度、风速计算出的综合舒适评价。', unit: '等级', range: '1 - 9', levels: ['冷', '舒适', '热'] },
        { name: '体感温度', desc: '结合风寒效应、环境湿度等多因子修正后的真实皮肤感知温度。', unit: '℃', range: '-25 - 50 ℃', levels: ['冰冷', '宜人', '酷暑'] },
        { name: '总云量', desc: '城市上空被云遮蔽的面积占比，评估天空透光度。', unit: '%', range: '0 - 100%', levels: ['晴朗', '多云', '阴天'] },
        { name: '大气压强', desc: '城市网修正海平面气压实况，用于分析微尺度天气压强波动。', unit: 'hPa', range: '960 - 1040', levels: ['低压', '常压', '高压'] }
      ]
    },
    {
      name: '国家气象标准站小时',
      products: [
        { name: '10分钟平均风速', desc: '过去10分钟滑动平均风速，国家标准气象站常规核心整点观测产品。', unit: 'm/s', range: '0 - 45 m/s', levels: ['微风', '大风', '暴风'] },
        { name: '10分钟平均风向', desc: '过去10分钟内的平均主导风向方位。', unit: '度 (°)', range: '0 - 360°', levels: ['北向', '东向', '南向', '西向'] },
        { name: '2分钟平均风速', desc: '过去2分钟滑动平均风速，快速反应近地面风力波动。', unit: 'm/s', range: '0 - 45 m/s', levels: ['微风', '大风', '暴风'] },
        { name: '2分钟平均风向', desc: '过去2分钟滑动平均主导风向方位。', unit: '度 (°)', range: '0 - 360°', levels: ['北向', '东向', '南向', '西向'] },
        { name: '过去1小时降水量', desc: '过去1小时累计降水量，是发布短时强降雨预警的主要实况标准。', unit: 'mm', range: '0 - 100 mm', levels: ['小雨', '暴雨', '特大暴雨'] },
        { name: '过去3小时降水量', desc: '过去3小时累计降水量，评估连续强降水。', unit: 'mm', range: '0 - 150 mm', levels: ['常规累计', '防御级', '红色警报'] },
        { name: '极大风速', desc: '时段内出现的最大瞬时风速，对工程抗风、设备防倒至关重要。', unit: 'm/s', range: '0 - 65 m/s', levels: ['疾风', '狂风', '极端风暴'] },
        { name: '极大风速的风向', desc: '极大风速发生时的瞬间风向方位。', unit: '度 (°)', range: '0 - 360°', levels: ['北向', '东向', '南向', '西向'] },
        { name: '气压', desc: '国家级标准气象站测定的标准气压，并经海平面修正。', unit: 'hPa', range: '950 - 1050', levels: ['低气压', '正常', '高气压'] },
        { name: '瞬时风速', desc: '当前瞬时抽样秒级风速。', unit: 'm/s', range: '0 - 55 m/s', levels: ['微风', '强风', '台风级'] },
        { name: '瞬时风向', desc: '当前瞬时抽样风向方位.并提供极小分度级指向。', unit: '度 (°)', range: '0 - 360°', levels: ['北向', '东向', '南向', '西向'] },
        { name: '气温', desc: '国家站标准测定的地面空气温度。', unit: '℃', range: '-30 - 50 ℃', levels: ['极寒', '常温', '酷热'] },
        { name: '相对湿度', desc: '国家站测定的空气相对湿度。', unit: '%', range: '0 - 100%', levels: ['干燥', '舒适', '潮湿'] },
        { name: '最大风速', desc: '日/时段最大平均风速极值。', unit: 'm/s', range: '0 - 50 m/s', levels: ['微风', '大风', '暴风'] },
        { name: '最大风速的风向', desc: '最大平均风速对应的风向。', unit: '度 (°)', range: '0 - 360°', levels: ['北向', '东向', '南向', '西向'] },
        { name: '最低气温', desc: '气象站观测到的滑动时段内最低气温。', unit: '℃', range: '-35 - 30 ℃', levels: ['严寒', '凉爽', '常温'] },
        { name: '最高气温', desc: '气象站观测到的滑动时段内最高气温。', unit: '℃', range: '-10 - 48 ℃', levels: ['常温', '炎热', '酷暑'] },
        { name: '最小相对湿度', desc: '时段内测得的最小空气相对湿度。', unit: '%', range: '0 - 100%', levels: ['极度干燥', '偏干', '正常'] }
      ]
    }
  ],
  rain: [
    {
      name: '极端灾害天气监测',
      products: [
        { name: '城市极端灾害天气', desc: '针对大风、冰雹、短时强降雨、暴雪等城市高风险极端灾害天气进行多模式融合高频实时监测与诊断分析。', unit: '等级', range: '1 - 4级', levels: ['关注', '蓝色防御', '黄色戒备', '橙红极危'] }
      ]
    }
  ],
  forecast: [
    {
      name: '短临气象数值预报',
      products: [
        { name: '降水', desc: '未来0-6小时高分辨率雷达外推与数值模式融合的短时临近累计降水量预报。', unit: 'mm', range: '0 - 80 mm', levels: ['小雨', '中雨', '大到暴雨'] },
        { name: '降雪', desc: '短临地表固态降水物累计量（雪量）数值预估，服务于高压走廊覆冰防融雪。', unit: 'mm', range: '0 - 50 mm', levels: ['无雪', '小雪', '暴雪'] },
        { name: '温度', desc: '短临地面逐小时精细气温变化预测，提前感知急剧降温/升温节点。', unit: '℃', range: '-20 - 45 ℃', levels: ['冰冻区', '常温区', '热度区'] },
        { name: '10m风', desc: '未来6小时地面10米高度处水平风速与风向预报。', unit: 'm/s', range: '0 - 40 m/s', levels: ['微风', '强风区', '极高大风'] }
      ]
    },
    {
      name: '全国3x3公里数值预',
      products: [
        { name: '风速', desc: '全国3×3公里网格高分辨率气象预报地面平均风速。', unit: 'm/s', range: '0 - 45 m/s', levels: ['微风', '大风', '暴风'] },
        { name: '风向', desc: '全国3×3公里数值预报地面主导风向矢量。', unit: '度 (°)', range: '0 - 360°', levels: ['北向', '东向', '南向', '西向'] },
        { name: '平均温度', desc: '全国3×3公里网格逐24小时日平均温度预报值。', unit: '℃', range: '-20 - 45 ℃', levels: ['严寒', '常温', '炎热'] },
        { name: '高温', desc: '全国3×3公里高精度预测的日间最高气温。', unit: '℃', range: '-15 - 48 ℃', levels: ['较凉', '温暖', '极端酷暑'] },
        { name: '低温', desc: '全国3×3公里高精度预测的夜间最低气温。', unit: '℃', range: '-25 - 35 ℃', levels: ['奇冷', '温和', '偏热'] },
        { name: '相对湿度', desc: '全国3×3公里中尺度预报相对湿度格点值。', unit: '%', range: '0 - 100%', levels: ['干燥', '舒适', '饱和'] },
        { name: '降水（雪）量', desc: '全国3×3公里网格累计液态及固态降水总当量预估。', unit: 'mm', range: '0 - 120 mm', levels: ['小雨雪', '中大雨雪', '极端大暴雪'] },
        { name: '气压', desc: '全国3×3公里网格预报地面气压。', unit: 'hPa', range: '900 - 1050', levels: ['低气压', '正常气压', '高气压'] },
        { name: '能见度', desc: '全国3×3公里水平大气能见度公里级预报。', unit: 'km', range: '0 - 35 km', levels: ['强浓雾', '常规雾', '能见度佳'] },
        { name: '云量', desc: '全国3×3公里网格预报天空总云覆比例。', unit: '%', range: '0 - 100%', levels: ['晴天', '多云', '阴天'] },
        { name: '雪厚', desc: '全国3×3公里高分辨率地面积雪累积物理厚度预测。', unit: 'cm', range: '0 - 60 cm', levels: ['无积雪', '中度覆雪', '危急覆冰积雪'] }
      ]
    },
    {
      name: '高精度预报网格数据',
      products: [
        { name: '降水', desc: '百米级超精细化天气预报网格累计降水量。', unit: 'mm', range: '0 - 100 mm', levels: ['无雨', '中小雨', '特大暴雨'] },
        { name: '温度', desc: '百米级超精细化网格气温预报，为区域线路巡视提供超精细指导。', unit: '℃', range: '-20 - 45 ℃', levels: ['冰冻区', '常温区', '热度峰值'] },
        { name: '风速', desc: '百米级超精细化网格近地面风速矢量演变预估。', unit: 'm/s', range: '0 - 50 m/s', levels: ['微风', '大风区', '极高风险风速'] },
        { name: '湿度', desc: '百米级超精细化网格空气相对湿度，监测极小凝结参数。', unit: '%', range: '0 - 100%', levels: ['干爽', '中等', '饱和凝露'] }
      ]
    },
    {
      name: 'EC数值预报',
      products: [
        { name: 'CAPE', desc: '对流可用位能（Convective Available Potential Energy），评估雷暴、大风、冰雹等强对流爆发热力不稳定的核心物理量。', unit: 'J/kg', range: '0 - 4000 J/kg', levels: ['弱不稳定', '中度对流储能', '极端狂暴对流'] },
        { name: 'CP', desc: '对流降水（Convective Precipitation）分量，诊断由于不均匀热对流所产生的骤雨及雹暴降水量。', unit: 'mm', range: '0 - 80 mm', levels: ['小雨强', '大骤雨', '短时局地洪涝'] },
        { name: 'HOC', desc: '过冷水含量/结冰高度指数（Height of Convective cloud base / 0℃ isotherm height），分析高空输电线路高能覆冰、积冰和冰冻的危险边界。', unit: '米', range: '0 - 6000 m', levels: ['安全低空', '中度冰冻区', '重度高空结冰带'] },
        { name: 'SP', desc: '地表气压（Surface Pressure），诊断分析高空大范围低槽冷锋移动及气流辐合辐散动态。', unit: 'hPa', range: '900 - 1050', levels: ['强低气压槽', '平衡带', '高气压嵴'] },
        { name: 'TEM500', desc: '500hPa等压面（约5500米高空）温度预测，用于诊断中高空冷涡、高空槽与槽后冷平流发展。', unit: '℃', range: '-45 - -5 ℃', levels: ['冷心云团', '中高空常温', '槽前暖湿区'] },
        { name: 'TEM700', desc: '700hPa等压面（约3000米高空）温度预测，重点监测暖湿气流输送与中层不稳定层结。', unit: '℃', range: '-30 - 15 ℃', levels: ['中层冷空气', '过度过渡带', '中层急流暖舌'] },
        { name: 'TEM850', desc: '850hPa等压面（约1500米高度）温度预测，是分析超低空急流、下坡增温及逆温层厚度的主导参数。', unit: '℃', range: '-20 - 25 ℃', levels: ['逆温层底', '低空暖平流', '急流暖舌区'] },
        { name: 'TEM925', desc: '925hPa等压面（约700米近地面边界层）温度，精确感知边界层低空增温、热浪边界与寒潮近地层风道。', unit: '℃', range: '-15 - 35 ℃', levels: ['边界层冷锋', '常规带', '近地温升带'] }
      ]
    }
  ],
  lightning: [
    {
      name: '闪电定位仪数据',
      products: [
        { name: '闪电监测', desc: '基于地基闪电定位网纳秒级实时探测，实时动态追踪云地放电落点、强度与正负极性，并智能展示在电子沙盘上。', unit: 'kA', range: '-250 - +250 kA', levels: ['弱雷击', '高能落雷', '极端雷暴中心'] }
      ]
    }
  ],
  warning: [
    {
      name: '气象灾害预警',
      products: [
        { name: '暴雨预警', desc: '基于气象台发布的实时暴雨蓝色、黄色、橙色、红色预警信号，动态展示暴雨覆盖落区及对输电线路的影响。', unit: '级别', range: '蓝 - 红', levels: ['蓝色预警', '黄色预警', '橙色预警', '红色预警'] },
        { name: '大风预警', desc: '实时发布陆地及湖面大风预警信息，支撑电网防风偏、防漂浮物闪络专项保障。', unit: '级别', range: '蓝 - 红', levels: ['蓝色预警', '黄色预警', '橙色预警', '红色预警'] },
        { name: '雷电预警', desc: '追踪雷电预警发布动态，对强对流高发区域电力设施开展防雷电安全隐患排查。', unit: '级别', range: '黄 - 红', levels: ['黄色预警', '橙色预警', '红色预警'] },
        { name: '覆冰预警', desc: '冬季线路覆冰风险预警，结合温度、湿度和风速多因子评估输电线路、绝缘子覆冰厚度潜势。', unit: '厚度', range: '0 - 30 mm', levels: ['轻度覆冰', '中度覆冰', '重度冰冻'] }
      ]
    }
  ]
};

// Module-level cache to persist selection state across component unmounts/remounts (e.g., when switching top navigation tabs)
let cachedActiveMain = 'satellite';
let cachedExpandedSubCats: string[] = [];
export let cachedSelectedProductKey: string | null = null;
let cachedIsPopupOpen = true;

export default function LeftPanel() {
  const [activeMain, setActiveMainState] = useState(cachedActiveMain);
  const [expandedSubCats, setExpandedSubCatsState] = useState<string[]>(cachedExpandedSubCats);
  const [selectedProductKey, setSelectedProductKeyState] = useState<string | null>(cachedSelectedProductKey);
  const [isPopupOpen, setIsPopupOpenState] = useState(cachedIsPopupOpen);

  // Layout states for window collision avoidance
  const [popupTop, setPopupTop] = useState(0);
  const [popupMaxHeight, setPopupMaxHeight] = useState(380);
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Custom setters that synchronize both React state and module-level caches
  const setActiveMain = (val: string) => {
    cachedActiveMain = val;
    setActiveMainState(val);
  };

  const setExpandedSubCats = (val: string[] | ((prev: string[]) => string[])) => {
    if (typeof val === 'function') {
      setExpandedSubCatsState((prev) => {
        const next = val(prev);
        cachedExpandedSubCats = next;
        return next;
      });
    } else {
      cachedExpandedSubCats = val;
      setExpandedSubCatsState(val);
    }
  };

  const setSelectedProductKey = (val: string | null) => {
    cachedSelectedProductKey = val;
    setSelectedProductKeyState(val);
    window.dispatchEvent(new CustomEvent('product-select-changed', { detail: val }));
  };

  const setIsPopupOpen = (val: boolean) => {
    cachedIsPopupOpen = val;
    setIsPopupOpenState(val);
  };

  // Sync active states when changing main category
  const handleMainSelect = (catId: string) => {
    if (activeMain === catId && isPopupOpen) {
      // Toggle collapse if clicking the active open category
      setIsPopupOpen(false);
    } else {
      setActiveMain(catId);
      setIsPopupOpen(true);
      
      const targetSubCats = hierarchicalData[catId] || [];
      const matchingSubCat = targetSubCats.find(sc => 
        selectedProductKey && sc.products.some(p => `${catId}|${sc.name}|${p.name}` === selectedProductKey)
      );
      if (matchingSubCat) {
        setExpandedSubCats([matchingSubCat.name]);
      } else {
        // Expand the first sub-category if none contains the selected product
        if (targetSubCats.length > 0) {
          setExpandedSubCats([targetSubCats[0].name]);
        } else {
          setExpandedSubCats([]);
        }
      }
    }
  };

  const currentSubCatList = hierarchicalData[activeMain] || [];

  const handleSubCatClick = (subCatName: string) => {
    const isExpanded = expandedSubCats.includes(subCatName);
    if (isExpanded) {
      // Collapse it
      setExpandedSubCats(prev => prev.filter(name => name !== subCatName));
    } else {
      // Expand it
      // Get the sub-category object containing the selected sub-product (if any)
      const activeSubCatObj = currentSubCatList.find(sc => 
        selectedProductKey && sc.products.some(p => `${activeMain}|${sc.name}|${p.name}` === selectedProductKey)
      );
      
      // Keep only the sub-category that has the currently selected product, collapse the rest
      const keptExpanded = activeSubCatObj && expandedSubCats.includes(activeSubCatObj.name)
        ? [activeSubCatObj.name]
        : [];
        
      setExpandedSubCats([...keptExpanded, subCatName]);
    }
  };

  const handleProductSelect = (productName: string, subCatName: string) => {
    const key = `${activeMain}|${subCatName}|${productName}`;
    if (selectedProductKey === key) {
      // Toggle off / deselect
      setSelectedProductKey(null);
    } else {
      // Select new product
      setSelectedProductKey(key);
      // Keep its parent sub-category expanded
      setExpandedSubCats([subCatName]);
    }
  };

  const activeIndex = mainCategories.findIndex(cat => cat.id === activeMain);

  // Find which main category contains the currently selected product
  const activeProductMainCatId = selectedProductKey ? selectedProductKey.split('|')[0] : null;

  // Sync state when product-select-changed event is fired externally (e.g. from data layers panel deletion)
  useEffect(() => {
    const handleProductChange = (e: Event) => {
      const customEvent = e as CustomEvent<string | null>;
      if (customEvent.detail !== selectedProductKey) {
        cachedSelectedProductKey = customEvent.detail;
        setSelectedProductKeyState(customEvent.detail);
      }
    };
    window.addEventListener('product-select-changed', handleProductChange);
    return () => window.removeEventListener('product-select-changed', handleProductChange);
  }, [selectedProductKey]);

  // 1. Listen to window resize to get the dynamic viewport height
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Click outside detection to automatically close the popup
  useEffect(() => {
    if (!isPopupOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  // 3. Dynamic adjustment of popup top and max-height to avoid window collision/overflow
  useEffect(() => {
    if (!popupRef.current || !isPopupOpen) return;

    // LeftPanel is absolutely positioned at top-24 (96px).
    // Let's set a safety margin at the bottom of the viewport (24px).
    const maxBottom = windowHeight - 96 - 24;
    const targetTop = activeIndex * 88; // Default alignment top matching button offset (80px height + 8px gap)

    // Measure actual scrollHeight or offsetHeight of the popup
    const height = popupRef.current.scrollHeight || popupRef.current.offsetHeight || 300;

    if (targetTop + height > maxBottom) {
      // Shift upwards so the bottom of the popup aligns exactly with maxBottom
      const adjustedTop = Math.max(0, maxBottom - height);
      setPopupTop(adjustedTop);
    } else {
      setPopupTop(targetTop);
    }

    // Set high-precision max-height to ensure it is fully within bounds and scrollable if needed
    const calculatedMaxHeight = Math.max(200, windowHeight - 96 - 48);
    setPopupMaxHeight(calculatedMaxHeight);
  }, [activeMain, expandedSubCats, windowHeight, activeIndex, isPopupOpen]);

  return (
    <div className="absolute top-24 left-6 z-40 flex flex-col gap-3 w-[304px] pointer-events-none font-sans animate-fade-in">
      {/* 2 & 3: Main Categories and Pop-up Sub Products Column Row */}
      <div ref={panelRef} className="relative flex gap-2 pointer-events-auto shrink-0 select-none">
        {/* Main Categories Column */}
        <div className="flex flex-col gap-2 w-24 max-h-[580px] overflow-y-auto scrollbar-none">
          {mainCategories.map((cat) => {
            const isActive = activeMain === cat.id;
            const isCurrentlyOverlaidInCat = activeProductMainCatId === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                id={`main-cat-${cat.id}`}
                onClick={() => handleMainSelect(cat.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 h-20 bg-white/95 backdrop-blur shadow-md border-l-4 transition-all duration-200 rounded-r-lg rounded-l-none relative",
                  isActive && isPopupOpen
                    ? "border-blue-500 text-blue-600 bg-slate-50/80" 
                    : "border-transparent text-slate-600 hover:bg-slate-50 hover:text-blue-500"
                )}
              >
                {/* Overlay status indicator light on category tab */}
                {selectedProductKey && isCurrentlyOverlaidInCat && (
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                )}
                <Icon className={cn("w-6 h-6 mb-1", isActive && isPopupOpen ? "text-blue-500" : "text-slate-400")} />
                <span className="text-xs font-bold text-center leading-tight">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
 
        {/* Dynamic Fly-out / Pop-up Sub Products Column, absolutely aligned with active category button */}
        {isPopupOpen && (
          <div 
            ref={popupRef}
            id="sub-products-popup"
            className="absolute left-[104px] w-48 bg-white/95 backdrop-blur-sm shadow-lg p-2 rounded-lg border border-slate-100 flex flex-col gap-2 overflow-y-auto scrollbar-none transition-all duration-300 ease-out z-50 animate-fade-in"
            style={{ 
              top: `${popupTop}px`,
              maxHeight: `${popupMaxHeight}px`
            }}
          >
            <div className="flex flex-col gap-1.5">
              {currentSubCatList.map((subCat) => {
                const isSubCatActive = expandedSubCats.includes(subCat.name);
                const hasSelectedProduct = selectedProductKey && subCat.products.some(p => `${activeMain}|${subCat.name}|${p.name}` === selectedProductKey);
                return (
                  <div key={subCat.name} className="flex flex-col gap-1" id={`subcat-container-${subCat.name}`}>
                    {/* Sub-category Header (Accordion Trigger) */}
                    <button
                      id={`subcat-btn-${subCat.name}`}
                      onClick={() => handleSubCatClick(subCat.name)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs rounded transition-all duration-150 flex items-center justify-between font-bold",
                        isSubCatActive 
                          ? "bg-blue-50 text-blue-700 border border-blue-200/50" 
                          : "bg-slate-50/80 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      )}
                    >
                      <span>{subCat.name}</span>
                      <span className={cn(
                        "w-1.5 h-1.5 rounded-full transition-all duration-200", 
                        hasSelectedProduct 
                          ? "bg-blue-600 scale-125 ring-2 ring-blue-300" 
                          : isSubCatActive 
                            ? "bg-blue-400" 
                            : "bg-slate-300"
                      )} />
                    </button>

                    {/* Accordion Content: Child Products (Visible only when sub-category is expanded) */}
                    {isSubCatActive && (
                      <div className="flex flex-col gap-1 pl-2.5 border-l-2 border-blue-100/60 py-1 transition-all duration-200 animate-fade-in">
                        {subCat.products.map((p) => {
                          const isProductActive = selectedProductKey === `${activeMain}|${subCat.name}|${p.name}`;
                          return (
                            <button
                              key={p.name}
                              id={`product-btn-${p.name}`}
                              onClick={() => handleProductSelect(p.name, subCat.name)}
                              className={cn(
                                "w-full text-left px-2 py-1 text-[11px] rounded transition-all duration-150 flex items-center justify-between",
                                isProductActive 
                                  ? "bg-blue-500 text-white font-bold shadow-sm" 
                                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              )}
                            >
                              <span>{p.name}</span>
                              {isProductActive && (
                                <span className="w-1 h-1 rounded-full bg-white" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
