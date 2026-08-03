# 人工影响天气效果评估与指挥系统 (Weather Modification Effect Evaluation & Command System)

## 项目布局规范与开发说明

### 1. 2026年6月18日湖北黄石个例 (Layout Standard)
> **注意**：除用户明确指示修改外，请勿改变 `2026年6月18日湖北黄石个例` 的界面四列+中下阵列布局结构。

- **左侧面板 (`w-[320px]`)**：
  - 上部分：作业范围与作业信息统计 (`EffectEvaluationLeftScopeAndStats`)
  - 下部分：作业点效果统计表格 (`EffectEvaluationLeftTable`)
- **中间区域 (`flex-1`)**：
  - 上部分：3D 雷达与地理地图 + 物理弹道/RHI剖面分析图表 (`EffectEvaluationRightCharts`, `w-[360px]`)
  - 下部分：实况 vs 外推雷达回波序列矩阵 (`EffectEvaluationBottom`, 跨中间两列)
- **右侧面板 (`w-[280px]`)**：
  - 贯穿全高的历史作业信息列表 (`EffectEvaluationHistoryList`)，支持单页 5 条数据垂直滚动与分页。

### 2. 实况模式与其他个例
- 采用 3 列独立布局架构。
