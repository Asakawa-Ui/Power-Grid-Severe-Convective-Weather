# AGENTS.md - AI Coding Instructions & Project Constraints

## Critical UI Layout Rule
- **2026年6月18日湖北黄石个例 layout protection**:
  - **原则**：如非用户特别明确指定要求修改，**严禁修改** `2026年6月18日湖北黄石个例` (`isCaseMode && activeCaseId === '2026-06-18'`) 的界面布局结构。
  - **指定布局结构**：
    - **左侧列（宽 320px，全高）**：上半部分为作业范围与作业信息统计（`EffectEvaluationLeftScopeAndStats`），下半部分为作业点效果统计表格（`EffectEvaluationLeftTable`）。
    - **中间区域（跨中间两列，全高 Flex 容器）**：
      - 上层：左侧为 3D 雷达地图（`Map3D`），右侧为物理弹道与 RHI 回波对比图表（`EffectEvaluationRightCharts`，宽 360px）。
      - 下层：外推与实况雷达阵列对比卡片（`EffectEvaluationBottom`，高 175px，跨中间两列宽度）。
    - **右侧列（宽 280px，全高）**：历史作业信息列表（`EffectEvaluationHistoryList`，支持每页 5 条数据与垂直滚动）。
- **实况模式与其他历史个例**：
  - 保持标准的 3 列布局（左侧综合面板、中间地图+底部阵列卡片、右侧历史列表+雷达回波变化统计图表）。
