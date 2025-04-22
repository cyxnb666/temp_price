interface IOption {
  value: number | string;
  label: string;
}
export const USER_TYPE:Array<IOption> = [
  { value: 'VPLY', label: '保司' },
  { value: 'VCITY', label: '城调队' },

]
export const MONTH_LIST:Array<IOption> =[
  { value: '1月', label: '一月' },
  { value: '2月', label: '二月' },
  { value: '3月', label: '三月' },
  { value: '4月', label: '四月' },
  { value: '5月', label: '五月' },
  { value: '6月', label: '六月' },
  { value: '7月', label: '七月' },
  { value: '8月', label: '八月' },
  { value: '9月', label: '九月' },
  { value: '10月', label: '十月' },
  { value: '11月', label: '十一月' },
  { value: '12月', label: '十二月' },
]
export const STALL_STATE:Array<IOption> = [
  { value: '0', label: '临时 ' },
  { value: '1', label: '正式 ' },

]
// 用户类型枚举
export const CONTRACT_STATUS = {
  FAIL: 0,
  AUDIT_PENDING: 1,
  EXEC_PENDING: 2,
  EXECUTING: 3,
  FINISH: 4,
};



// 合同类型枚举
export const CONTRACT_TYPES = {
  MAIN: 0,
  SUB: 1,
  SUPPLEMENT: 2,
};

export const CONTRACT_TYPE_OPTIONS: Array<IOption> = [
  { value: CONTRACT_TYPES.MAIN, label: '主合同' },
  { value: CONTRACT_TYPES.SUB, label: '子合同' },
  { value: CONTRACT_TYPES.SUPPLEMENT, label: '补充合同' },
];

// 合同收付类型枚举
export const CONTRACT_PAYMENT_TYPES = {
  PAYMENT: 0,
  RECEIPT: 1,
};

// 通知的优先级对应的TAG类型
export const NOTIFICATION_TYPES = {
  low: 'primary',
  middle: 'warning',
  high: 'danger',
};
