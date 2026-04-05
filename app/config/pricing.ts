export type PlanType = "basic" | "premium";
export type DurationType = "7" | "30" | "permanent";
 
export const PRICING = {
  basic: {
    "7": 5,
    "30": 15,
    permanent: 50,
  },
  premium: {
    "7": 15,
    "30": 35,
    permanent: 80,
  },
};
 
export const PLAN_LABELS = {
  basic: "基础发布",
  premium: "置顶推广",
};
 
export const DURATION_LABELS = {
  "7": "7 天",
  "30": "30 天",
  permanent: "永久",
};
 
export const PLAN_FEATURES = {
  basic: [
    "显示在争议记录列表",
    "案件详情页完整展示",
    "接受回应与私信",
    "申请协调功能",
  ],
  premium: [
    "置顶显示在记录列表顶部",
    "首页滚动展示栏优先展示",
    "案件详情页完整展示",
    "接受回应与私信",
    "申请协调功能",
    "专属「推广」标识",
  ],
};