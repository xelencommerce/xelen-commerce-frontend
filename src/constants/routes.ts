export const routes = {
  login: '/login',
  verification: '/login/verify',
  smsVerification: '/login/verify/sms',
  authenticatorVerification: '/login/verify/authenticator',
  register: '/register',
  forgotPassword: '/forgot-password',
  checkEmail: '/forgot-password/check-email',
  resetPassword: '/reset-password',
  admin: '/admin',
  merchant: '/merchant',
} as const;
