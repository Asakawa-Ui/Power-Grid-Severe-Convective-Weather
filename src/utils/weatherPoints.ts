export type WeatherPointStatus = 'none' | 'ready' | 'operating' | 'completed' | 'canceled';
export type WeatherPointType = 'rocket' | 'gun' | 'vehicle';

export interface WeatherPoint {
  id: string;
  name: string;
  coord: [number, number];
  type: WeatherPointType;
  status: WeatherPointStatus;
  region: string;
}

export const weatherPoints: WeatherPoint[] = [
  {
    "id": "wp-hb-new1",
    "name": "铁山南作业点",
    "coord": [114.89139, 30.19389],
    "type": "gun",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-hb-new2",
    "name": "大冶金湖作业点",
    "coord": [114.87528, 30.07444],
    "type": "rocket",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-hb-new3",
    "name": "刘仁八作业点",
    "coord": [114.84639, 29.94417],
    "type": "rocket",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-hb-new4",
    "name": "沿湖生态园作业点",
    "coord": [115.08306, 30.13500],
    "type": "gun",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-hb-new5",
    "name": "姜祥村作业点",
    "coord": [115.07944, 30.02250],
    "type": "gun",
    "status": "operating",
    "region": "湖北地块"
  },
  {
    "id": "wp-hb-new6",
    "name": "白沙作业点",
    "coord": [115.04722, 29.96778],
    "type": "rocket",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-hb-new7",
    "name": "太子作业点",
    "coord": [115.17083, 30.04750],
    "type": "gun",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-1",
    "name": "中韩原种场",
    "coord": [
      111.1302,
      32.2497
    ],
    "type": "rocket",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-2",
    "name": "南庄作业点",
    "coord": [
      112.7308,
      29.1298
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-3",
    "name": "王村作业点",
    "coord": [
      108.6338,
      30.3674
    ],
    "type": "rocket",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-4",
    "name": "十堰武当山站",
    "coord": [
      113.6136,
      29.838
    ],
    "type": "rocket",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-5",
    "name": "深泽县作业点",
    "coord": [
      115.7809,
      32.2859
    ],
    "type": "gun",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-6",
    "name": "桥头镇高炮站",
    "coord": [
      113.155,
      31.1027
    ],
    "type": "gun",
    "status": "operating",
    "region": "湖北地块"
  },
  {
    "id": "wp-7",
    "name": "林家村火箭点",
    "coord": [
      111.0753,
      31.275
    ],
    "type": "rocket",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-8",
    "name": "赵家铺作业点",
    "coord": [
      111.3418,
      29.6013
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-9",
    "name": "东郭村防雹站",
    "coord": [
      108.9117,
      30.9077
    ],
    "type": "gun",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-10",
    "name": "阳平镇作业点",
    "coord": [
      111.2898,
      29.6306
    ],
    "type": "gun",
    "status": "operating",
    "region": "湖北地块"
  },
  {
    "id": "wp-11",
    "name": "下口村增雨站",
    "coord": [
      112.2221,
      29.3972
    ],
    "type": "gun",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-12",
    "name": "太平庄高炮站",
    "coord": [
      114.7614,
      31.9072
    ],
    "type": "gun",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-13",
    "name": "大杨树作业点",
    "coord": [
      115.1976,
      30.588
    ],
    "type": "vehicle",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-14",
    "name": "三道沟火箭点",
    "coord": [
      113.9703,
      31.6533
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-15",
    "name": "西梁村作业点",
    "coord": [
      108.6046,
      31.5667
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-16",
    "name": "北山林场作业点",
    "coord": [
      108.9675,
      31.0008
    ],
    "type": "gun",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-17",
    "name": "马家窑作业点",
    "coord": [
      109.477,
      30.1802
    ],
    "type": "rocket",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-18",
    "name": "李家湾增雨站",
    "coord": [
      114.7439,
      33.1773
    ],
    "type": "gun",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-19",
    "name": "前营村防雹站",
    "coord": [
      112.83,
      32.0741
    ],
    "type": "gun",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-20",
    "name": "沙河铺高炮站",
    "coord": [
      112.5205,
      32.4063
    ],
    "type": "vehicle",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-21",
    "name": "郭家屯作业点",
    "coord": [
      102.4132,
      33.6276
    ],
    "type": "rocket",
    "status": "completed",
    "region": "四川地块"
  },
  {
    "id": "wp-22",
    "name": "大辛庄火箭点",
    "coord": [
      98.8394,
      29.1953
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "四川地块"
  },
  {
    "id": "wp-23",
    "name": "白云山作业点",
    "coord": [
      102.926,
      32.5673
    ],
    "type": "gun",
    "status": "completed",
    "region": "四川地块"
  },
  {
    "id": "wp-24",
    "name": "卧龙台高炮站",
    "coord": [
      105.1109,
      28.1482
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "四川地块"
  },
  {
    "id": "wp-25",
    "name": "八里庄作业点",
    "coord": [
      100.1441,
      32.348
    ],
    "type": "rocket",
    "status": "completed",
    "region": "四川地块"
  },
  {
    "id": "wp-26",
    "name": "中韩原种场",
    "coord": [
      104.2326,
      33.606
    ],
    "type": "gun",
    "status": "canceled",
    "region": "四川地块"
  },
  {
    "id": "wp-27",
    "name": "南庄作业点",
    "coord": [
      103.2411,
      28.887
    ],
    "type": "gun",
    "status": "canceled",
    "region": "四川地块"
  },
  {
    "id": "wp-28",
    "name": "王村作业点",
    "coord": [
      106.238,
      28.6768
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "四川地块"
  },
  {
    "id": "wp-29",
    "name": "十堰武当山站",
    "coord": [
      106.062,
      29.1507
    ],
    "type": "vehicle",
    "status": "operating",
    "region": "四川地块"
  },
  {
    "id": "wp-30",
    "name": "深泽县作业点",
    "coord": [
      102.333,
      29.0782
    ],
    "type": "rocket",
    "status": "operating",
    "region": "四川地块"
  },
  {
    "id": "wp-31",
    "name": "桥头镇高炮站",
    "coord": [
      104.015,
      33.7387
    ],
    "type": "gun",
    "status": "canceled",
    "region": "四川地块"
  },
  {
    "id": "wp-32",
    "name": "林家村火箭点",
    "coord": [
      105.3772,
      26.6139
    ],
    "type": "gun",
    "status": "ready",
    "region": "四川地块"
  },
  {
    "id": "wp-33",
    "name": "赵家铺作业点",
    "coord": [
      97.5758,
      31.893
    ],
    "type": "vehicle",
    "status": "operating",
    "region": "四川地块"
  },
  {
    "id": "wp-34",
    "name": "东郭村防雹站",
    "coord": [
      105.7157,
      31.6241
    ],
    "type": "gun",
    "status": "none",
    "region": "四川地块"
  },
  {
    "id": "wp-35",
    "name": "阳平镇作业点",
    "coord": [
      99.1375,
      31.1666
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "四川地块"
  },
  {
    "id": "wp-36",
    "name": "下口村增雨站",
    "coord": [
      105.7352,
      29.4563
    ],
    "type": "rocket",
    "status": "none",
    "region": "四川地块"
  },
  {
    "id": "wp-37",
    "name": "太平庄高炮站",
    "coord": [
      99.2398,
      32.8508
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "四川地块"
  },
  {
    "id": "wp-38",
    "name": "大杨树作业点",
    "coord": [
      103.2144,
      33.6722
    ],
    "type": "vehicle",
    "status": "none",
    "region": "四川地块"
  },
  {
    "id": "wp-39",
    "name": "三道沟火箭点",
    "coord": [
      101.1459,
      26.5317
    ],
    "type": "gun",
    "status": "canceled",
    "region": "四川地块"
  },
  {
    "id": "wp-40",
    "name": "西梁村作业点",
    "coord": [
      105.9075,
      27.11
    ],
    "type": "gun",
    "status": "ready",
    "region": "四川地块"
  },
  {
    "id": "wp-41",
    "name": "北山林场作业点",
    "coord": [
      115.9967,
      30.8252
    ],
    "type": "gun",
    "status": "ready",
    "region": "安徽地块"
  },
  {
    "id": "wp-42",
    "name": "马家窑作业点",
    "coord": [
      116.2399,
      32.7614
    ],
    "type": "rocket",
    "status": "ready",
    "region": "安徽地块"
  },
  {
    "id": "wp-43",
    "name": "李家湾增雨站",
    "coord": [
      117.4157,
      32.5958
    ],
    "type": "vehicle",
    "status": "none",
    "region": "安徽地块"
  },
  {
    "id": "wp-44",
    "name": "前营村防雹站",
    "coord": [
      116.0326,
      33.4442
    ],
    "type": "vehicle",
    "status": "ready",
    "region": "安徽地块"
  },
  {
    "id": "wp-45",
    "name": "沙河铺高炮站",
    "coord": [
      115.6923,
      29.7179
    ],
    "type": "rocket",
    "status": "ready",
    "region": "安徽地块"
  },
  {
    "id": "wp-46",
    "name": "郭家屯作业点",
    "coord": [
      116.076,
      30.5628
    ],
    "type": "vehicle",
    "status": "operating",
    "region": "安徽地块"
  },
  {
    "id": "wp-47",
    "name": "大辛庄火箭点",
    "coord": [
      119.0798,
      29.5992
    ],
    "type": "rocket",
    "status": "none",
    "region": "安徽地块"
  },
  {
    "id": "wp-48",
    "name": "白云山作业点",
    "coord": [
      116.4933,
      32.9116
    ],
    "type": "rocket",
    "status": "operating",
    "region": "安徽地块"
  },
  {
    "id": "wp-49",
    "name": "卧龙台高炮站",
    "coord": [
      116.143,
      31.1691
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "安徽地块"
  },
  {
    "id": "wp-50",
    "name": "八里庄作业点",
    "coord": [
      117.1816,
      29.6516
    ],
    "type": "vehicle",
    "status": "none",
    "region": "安徽地块"
  },
  {
    "id": "wp-51",
    "name": "中韩原种场",
    "coord": [
      115.2725,
      34.1958
    ],
    "type": "gun",
    "status": "canceled",
    "region": "安徽地块"
  },
  {
    "id": "wp-52",
    "name": "南庄作业点",
    "coord": [
      116.6983,
      33.3835
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "安徽地块"
  },
  {
    "id": "wp-53",
    "name": "王村作业点",
    "coord": [
      115.7893,
      31.4524
    ],
    "type": "rocket",
    "status": "none",
    "region": "安徽地块"
  },
  {
    "id": "wp-54",
    "name": "十堰武当山站",
    "coord": [
      117.1316,
      33.0162
    ],
    "type": "rocket",
    "status": "ready",
    "region": "安徽地块"
  },
  {
    "id": "wp-55",
    "name": "深泽县作业点",
    "coord": [
      118.1353,
      33.9435
    ],
    "type": "gun",
    "status": "none",
    "region": "安徽地块"
  },
  {
    "id": "wp-56",
    "name": "桥头镇高炮站",
    "coord": [
      115.2592,
      32.3416
    ],
    "type": "vehicle",
    "status": "none",
    "region": "安徽地块"
  },
  {
    "id": "wp-57",
    "name": "林家村火箭点",
    "coord": [
      115.464,
      30.4051
    ],
    "type": "gun",
    "status": "none",
    "region": "安徽地块"
  },
  {
    "id": "wp-58",
    "name": "赵家铺作业点",
    "coord": [
      118.6973,
      29.8365
    ],
    "type": "vehicle",
    "status": "canceled",
    "region": "安徽地块"
  },
  {
    "id": "wp-59",
    "name": "东郭村防雹站",
    "coord": [
      119.3975,
      33.7112
    ],
    "type": "rocket",
    "status": "none",
    "region": "安徽地块"
  },
  {
    "id": "wp-60",
    "name": "阳平镇作业点",
    "coord": [
      117.4767,
      30.0613
    ],
    "type": "vehicle",
    "status": "canceled",
    "region": "安徽地块"
  },
  {
    "id": "wp-61",
    "name": "下口村增雨站",
    "coord": [
      121.1378,
      31.7442
    ],
    "type": "gun",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-62",
    "name": "太平庄高炮站",
    "coord": [
      121.67,
      30.7543
    ],
    "type": "rocket",
    "status": "none",
    "region": "江苏地块"
  },
  {
    "id": "wp-63",
    "name": "大杨树作业点",
    "coord": [
      121.4669,
      34.3844
    ],
    "type": "rocket",
    "status": "none",
    "region": "江苏地块"
  },
  {
    "id": "wp-64",
    "name": "三道沟火箭点",
    "coord": [
      118.6884,
      32.1628
    ],
    "type": "rocket",
    "status": "completed",
    "region": "江苏地块"
  },
  {
    "id": "wp-65",
    "name": "西梁村作业点",
    "coord": [
      116.5318,
      34.4646
    ],
    "type": "rocket",
    "status": "operating",
    "region": "江苏地块"
  },
  {
    "id": "wp-66",
    "name": "北山林场作业点",
    "coord": [
      119.6524,
      33.0777
    ],
    "type": "vehicle",
    "status": "none",
    "region": "江苏地块"
  },
  {
    "id": "wp-67",
    "name": "马家窑作业点",
    "coord": [
      116.8859,
      32.0956
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-68",
    "name": "李家湾增雨站",
    "coord": [
      121.7135,
      34.1379
    ],
    "type": "gun",
    "status": "none",
    "region": "江苏地块"
  },
  {
    "id": "wp-69",
    "name": "前营村防雹站",
    "coord": [
      117.9859,
      33.7961
    ],
    "type": "vehicle",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-70",
    "name": "沙河铺高炮站",
    "coord": [
      118.5568,
      32.7802
    ],
    "type": "gun",
    "status": "ready",
    "region": "江苏地块"
  },
  {
    "id": "wp-71",
    "name": "郭家屯作业点",
    "coord": [
      117.5088,
      34.1028
    ],
    "type": "rocket",
    "status": "completed",
    "region": "江苏地块"
  },
  {
    "id": "wp-72",
    "name": "大辛庄火箭点",
    "coord": [
      118.4078,
      32.5228
    ],
    "type": "gun",
    "status": "completed",
    "region": "江苏地块"
  },
  {
    "id": "wp-73",
    "name": "白云山作业点",
    "coord": [
      117.232,
      34.3519
    ],
    "type": "rocket",
    "status": "ready",
    "region": "江苏地块"
  },
  {
    "id": "wp-74",
    "name": "卧龙台高炮站",
    "coord": [
      119.6017,
      33.3462
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-75",
    "name": "八里庄作业点",
    "coord": [
      116.7478,
      31.1137
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-76",
    "name": "中韩原种场",
    "coord": [
      121.8785,
      30.7162
    ],
    "type": "vehicle",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-77",
    "name": "南庄作业点",
    "coord": [
      120.7155,
      32.8366
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-78",
    "name": "王村作业点",
    "coord": [
      118.3631,
      31.7569
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-79",
    "name": "十堰武当山站",
    "coord": [
      120.1476,
      32.8834
    ],
    "type": "vehicle",
    "status": "canceled",
    "region": "江苏地块"
  },
  {
    "id": "wp-80",
    "name": "深泽县作业点",
    "coord": [
      117.661,
      32.3968
    ],
    "type": "gun",
    "status": "operating",
    "region": "江苏地块"
  },
  {
    "id": "wp-81",
    "name": "桥头镇高炮站",
    "coord": [
      110.8519,
      32.3377
    ],
    "type": "vehicle",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-82",
    "name": "林家村火箭点",
    "coord": [
      111.179,
      30.6012
    ],
    "type": "rocket",
    "status": "operating",
    "region": "湖北地块"
  },
  {
    "id": "wp-83",
    "name": "赵家铺作业点",
    "coord": [
      114.6362,
      28.6957
    ],
    "type": "rocket",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-84",
    "name": "东郭村防雹站",
    "coord": [
      114.3532,
      30.2203
    ],
    "type": "gun",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-85",
    "name": "阳平镇作业点",
    "coord": [
      111.2565,
      31.8193
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-86",
    "name": "下口村增雨站",
    "coord": [
      113.9006,
      30.7673
    ],
    "type": "rocket",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-87",
    "name": "太平庄高炮站",
    "coord": [
      114.1887,
      29.4242
    ],
    "type": "gun",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-88",
    "name": "大杨树作业点",
    "coord": [
      111.1292,
      29.5444
    ],
    "type": "rocket",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-89",
    "name": "三道沟火箭点",
    "coord": [
      112.645,
      30.3772
    ],
    "type": "gun",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-90",
    "name": "西梁村作业点",
    "coord": [
      110.7067,
      32.4117
    ],
    "type": "vehicle",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-91",
    "name": "北山林场作业点",
    "coord": [
      112.2047,
      32.5473
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-92",
    "name": "马家窑作业点",
    "coord": [
      114.33,
      30.2009
    ],
    "type": "rocket",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-93",
    "name": "李家湾增雨站",
    "coord": [
      112.1767,
      32.3343
    ],
    "type": "gun",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-94",
    "name": "前营村防雹站",
    "coord": [
      110.6573,
      32.2746
    ],
    "type": "vehicle",
    "status": "operating",
    "region": "湖北地块"
  },
  {
    "id": "wp-95",
    "name": "沙河铺高炮站",
    "coord": [
      115.035,
      29.7727
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-96",
    "name": "郭家屯作业点",
    "coord": [
      110.6316,
      32.4313
    ],
    "type": "vehicle",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-97",
    "name": "大辛庄火箭点",
    "coord": [
      111.0257,
      30.5688
    ],
    "type": "gun",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-98",
    "name": "白云山作业点",
    "coord": [
      111.2338,
      31.9234
    ],
    "type": "gun",
    "status": "operating",
    "region": "湖北地块"
  },
  {
    "id": "wp-99",
    "name": "卧龙台高炮站",
    "coord": [
      114.4441,
      30.1784
    ],
    "type": "vehicle",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-100",
    "name": "八里庄作业点",
    "coord": [
      109.862,
      33.0914
    ],
    "type": "gun",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-101",
    "name": "中韩原种场",
    "coord": [
      114.7351,
      28.5957
    ],
    "type": "rocket",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-102",
    "name": "南庄作业点",
    "coord": [
      112.9461,
      30.2046
    ],
    "type": "rocket",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-103",
    "name": "王村作业点",
    "coord": [
      112.8749,
      30.9444
    ],
    "type": "gun",
    "status": "operating",
    "region": "湖北地块"
  },
  {
    "id": "wp-104",
    "name": "十堰武当山站",
    "coord": [
      110.9725,
      32.264
    ],
    "type": "rocket",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-105",
    "name": "深泽县作业点",
    "coord": [
      111.9165,
      31.192
    ],
    "type": "rocket",
    "status": "operating",
    "region": "湖北地块"
  },
  {
    "id": "wp-106",
    "name": "桥头镇高炮站",
    "coord": [
      109.9751,
      31.5178
    ],
    "type": "gun",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-107",
    "name": "林家村火箭点",
    "coord": [
      114.9741,
      31.7375
    ],
    "type": "gun",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-108",
    "name": "赵家铺作业点",
    "coord": [
      112.0149,
      31.7976
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-109",
    "name": "东郭村防雹站",
    "coord": [
      111.0126,
      32.4196
    ],
    "type": "gun",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-110",
    "name": "阳平镇作业点",
    "coord": [
      111.266,
      31.5958
    ],
    "type": "rocket",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-111",
    "name": "下口村增雨站",
    "coord": [
      109.0817,
      30.0227
    ],
    "type": "gun",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-112",
    "name": "太平庄高炮站",
    "coord": [
      112.501,
      30.0772
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-113",
    "name": "大杨树作业点",
    "coord": [
      111.8523,
      32.1879
    ],
    "type": "vehicle",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-114",
    "name": "三道沟火箭点",
    "coord": [
      110.6513,
      31.9337
    ],
    "type": "vehicle",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-115",
    "name": "西梁村作业点",
    "coord": [
      110.6045,
      30.4375
    ],
    "type": "rocket",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-116",
    "name": "北山林场作业点",
    "coord": [
      111.2754,
      32.2351
    ],
    "type": "vehicle",
    "status": "completed",
    "region": "湖北地块"
  },
  {
    "id": "wp-117",
    "name": "马家窑作业点",
    "coord": [
      113.8503,
      32.3591
    ],
    "type": "rocket",
    "status": "canceled",
    "region": "湖北地块"
  },
  {
    "id": "wp-118",
    "name": "李家湾增雨站",
    "coord": [
      113.9171,
      32.4853
    ],
    "type": "gun",
    "status": "ready",
    "region": "湖北地块"
  },
  {
    "id": "wp-119",
    "name": "前营村防雹站",
    "coord": [
      110.3935,
      30.4676
    ],
    "type": "vehicle",
    "status": "none",
    "region": "湖北地块"
  },
  {
    "id": "wp-120",
    "name": "沙河铺高炮站",
    "coord": [
      110.5752,
      31.6476
    ],
    "type": "gun",
    "status": "ready",
    "region": "湖北地块"
  }
];
