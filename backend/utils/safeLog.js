const SENSITIVE_KEYS = ['password', 'currentPassword', 'newPassword', 'token', 'authorization'];

export const sanitizeForLog = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForLog);

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.includes(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeForLog(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export const logError = (err, req) => {
  const payload = {
    message: err.message,
    statusCode: err.statusCode || 500,
    path: req?.method && req?.originalUrl ? `${req.method} ${req.originalUrl}` : undefined,
  };

  if (process.env.NODE_ENV !== 'production' && err.stack) {
    payload.stack = err.stack;
  }

  if (req?.body && Object.keys(req.body).length > 0) {
    payload.body = sanitizeForLog(req.body);
  }

  console.error('[Error]', payload);
};
