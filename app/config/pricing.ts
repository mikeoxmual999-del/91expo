export type PlanType = "basic" | "premium";
export const PRICING = {
  basic: 39.99,
  premium: 59.99,
};
export const PLAN_LABELS = {
  basic: "永久发布",
  premium: "永久发布 + 置顶推广",
};
export const PLAN_FEATURES = {
  basic: [
    "永久显示在争议记录列表",
    "案件详情页完整展示",
    "接受回应与私信",
    "申请协调功能",
    "可申请下架（需提供证据）",
  ],
  premium: [
    "永久显示在争议记录列表",
    "置顶显示 7 天",
    "首页滚动展示栏优先展示 7 天",
    "专属「置顶」标识",
    "案件详情页完整展示",
    "接受回应与私信",
    "申请协调功能",
    "可申请下架（需提供证据）",
  ],
};
export const DURATION_LABELS = {
  "7": "7 天",
  "30": "30 天",
  "permanent": "永久",
};
