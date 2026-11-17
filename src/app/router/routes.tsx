import { Navigate } from 'react-router';
import type { RouteObject } from 'react-router';
import { Loader } from '@/components/feedback/Loader';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { MerchantLayout } from '@/components/layout/MerchantLayout';
import { routes } from '@/constants/routes';
import { NotFoundPage } from './NotFoundPage';
import { RootLayout } from './RootLayout';
import { RouteErrorPage } from './RouteErrorPage';

// Export configuration separately so tests can use the same routes with memory history.
export const routeConfig: RouteObject[] = [
  {
    Component: RootLayout,
    ErrorBoundary: RouteErrorPage,
    hydrateFallbackElement: <Loader label="Loading application…" />,
    children: [
      { index: true, element: <Navigate to={routes.login} replace /> },
      {
        lazy: async () => ({
          Component: (await import('@/features/auth')).AuthShell,
        }),
        children: [
          {
            path: routes.register,
            lazy: async () => ({
              Component: (await import('@/features/auth/signup')).SignupLayout,
            }),
            children: [
              {
                index: true,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .RegisterPage,
                }),
              },
              {
                path: routes.signupVerification,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupVerificationPage,
                }),
              },
              {
                path: routes.signupPhone,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupPhonePage,
                }),
              },
              {
                path: routes.signupSms,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupSmsPage,
                }),
              },
              {
                path: routes.signupAuthenticator,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupAuthenticatorPage,
                }),
              },
              {
                path: routes.signupAuthenticatorCode,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupAuthenticatorCodePage,
                }),
              },
              {
                path: routes.signupBusiness,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupBusinessPage,
                }),
              },
              {
                path: routes.signupIndustry,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupIndustryPage,
                }),
              },
              {
                path: routes.signupDocuments,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupDocumentsPage,
                }),
              },
              {
                path: routes.signupSubmitted,
                lazy: async () => ({
                  Component: (await import('@/features/auth/signup'))
                    .SignupSubmittedPage,
                }),
              },
            ],
          },
          {
            path: routes.login,
            lazy: async () => ({
              Component: (await import('@/features/auth')).LoginPage,
            }),
          },
          {
            path: routes.verification,
            lazy: async () => ({
              Component: (await import('@/features/auth'))
                .VerificationMethodPage,
            }),
          },
          {
            path: routes.smsVerification,
            lazy: async () => ({
              Component: (await import('@/features/auth')).SmsVerificationPage,
            }),
          },
          {
            path: routes.authenticatorVerification,
            lazy: async () => ({
              Component: (await import('@/features/auth'))
                .AuthenticatorVerificationPage,
            }),
          },
          {
            path: routes.forgotPassword,
            lazy: async () => ({
              Component: (await import('@/features/auth')).ForgotPasswordPage,
            }),
          },
          {
            path: routes.checkEmail,
            lazy: async () => ({
              Component: (await import('@/features/auth')).CheckEmailPage,
            }),
          },
          {
            path: routes.resetPassword,
            lazy: async () => ({
              Component: (await import('@/features/auth')).ResetPasswordPage,
            }),
          },
        ],
      },
      {
        Component: AdminLayout,
        children: [
          {
            path: routes.admin,
            lazy: async () => ({
              Component: (await import('@/features/admin')).AdminPage,
            }),
          },
        ],
      },
      {
        Component: MerchantLayout,
        children: [
          {
            path: routes.merchant,
            lazy: async () => ({
              Component: (await import('@/features/merchant')).MerchantPage,
            }),
          },
        ],
      },
      { path: '*', Component: NotFoundPage },
    ],
  },
];
