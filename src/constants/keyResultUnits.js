// واحدهای اندازه‌گیری برای Key Results
export const UNIT_TYPES = {
  number: { label: 'عدد', symbol: '' },
  percent: { label: 'درصد', symbol: '%' },
  currency: { label: 'تومان', symbol: '﷼' },
  hours: { label: 'ساعت', symbol: 'h' },
  days: { label: 'روز', symbol: 'd' },
  users: { label: 'کاربر', symbol: '' },
  items: { label: 'مورد', symbol: '' }
};

export const getUnitSymbol = (unit) => {
  return UNIT_TYPES[unit]?.symbol || '';
};

export const getUnitLabel = (unit) => {
  return UNIT_TYPES[unit]?.label || 'عدد';
};

export const formatValueWithUnit = (value, unit) => {
  const symbol = getUnitSymbol(unit);
  return symbol ? `${value} ${symbol}` : value;
};
