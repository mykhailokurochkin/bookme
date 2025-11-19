export const validateRequired = (value: any, fieldName: string, res: any) => {
  if (!value) {
    return res.status(400).json({ error: `${fieldName} is required` });
  }
  return null;
};

export const validateArray = (value: any, fieldName: string, res: any) => {
  if (!value || !Array.isArray(value)) {
    return res.status(400).json({ error: `${fieldName} array is required` });
  }
  return null;
};

export const validateRole = (role: string, res: any) => {
  if (!role || !['USER', 'ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Valid role (USER or ADMIN) is required' });
  }
  return null;
};

export const validateEmail = (email: string, res: any) => {
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  return null;
};

export const validateTimeRange = (startTime: string, endTime: string, res: any) => {
  if (!startTime || !endTime) {
    return res.status(400).json({ error: 'Start/End time required' });
  }
  return null;
};
