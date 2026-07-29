const fs = require('fs');
let code = fs.readFileSync('src/components/Login.tsx', 'utf8');

// Add import
if (!code.includes('useLanguage')) {
    code = code.replace(/import \{ useState \} from 'react';/, "import { useState } from 'react';\nimport { useLanguage } from '../contexts/LanguageContext';");
}

// Add hook
if (!code.includes('const { t } = useLanguage();')) {
    code = code.replace(/export default function Login\(\{ onBack \}: LoginProps\) \{/, "export default function Login({ onBack }: LoginProps) {\n  const { t } = useLanguage();");
}

// Replace texts
code = code.replace(/>\s*돌아가기\s*<\/button>/, ">{t('login.back')}</button>");
code = code.replace(/\{step === 'signup' \? "Create an account" : "Welcome"\}/, "{step === 'signup' ? t('login.title.signup') : t('login.title.login')}");
code = code.replace(/\{step === 'signup' \? "Join us and get started\." : "Enter your email to get started\."\}/, "{step === 'signup' ? t('login.subtitle.signup') : t('login.subtitle.login')}");

code = code.replace(/<label htmlFor="signup-email"[^>]*>Email<\/label>/, '<label htmlFor="signup-email" className="text-sm text-gray-600 font-medium">{t(\'login.email\')}</label>');
code = code.replace(/<label htmlFor="signup-password"[^>]*>비밀번호입력<\/label>/, '<label htmlFor="signup-password" className="text-sm text-gray-600 font-medium">{t(\'login.password\')}</label>');
code = code.replace(/<label htmlFor="signup-confirm-password"[^>]*>새비밀번호입력<\/label>/, '<label htmlFor="signup-confirm-password" className="text-sm text-gray-600 font-medium">{t(\'login.password.confirm\')}</label>');

code = code.replace(/placeholder="you@example.com"/g, 'placeholder={t(\'login.placeholder.email\')}');
code = code.replace(/placeholder="Create a password"/, 'placeholder={t(\'login.placeholder.password.create\')}');
code = code.replace(/placeholder="Confirm your password"/, 'placeholder={t(\'login.placeholder.password.confirm\')}');

code = code.replace(/\{isLoading \? "처리 중\.\.\." : "Sign up"\}/, "{isLoading ? t('login.button.processing') : t('login.button.signup')}");
code = code.replace(/이미 계정이 있으신가요\?/, "{t('login.has_account')}");
code = code.replace(/>로그인<\/button>/, ">{t('login.button.login')}</button>");

code = code.replace(/<label htmlFor="email"[^>]*>Email<\/label>/, '<label htmlFor="email" className="text-sm text-gray-600 font-medium">{t(\'login.email\')}</label>');
code = code.replace(/<p className="text-red-500 text-xs">Please enter a valid email<\/p>/, '<p className="text-red-500 text-xs">{t(\'login.error.email\')}</p>');

code = code.replace(/<label htmlFor="password"[^>]*>Password for \{email\}<\/label>/, '<label htmlFor="password" className="text-sm text-gray-600 font-medium">{t(\'login.password.for\')} {email}</label>');
code = code.replace(/placeholder="Enter your password"/, 'placeholder={t(\'login.placeholder.password.enter\')}');

code = code.replace(/\{isLoading \? "처리 중\.\.\." : \(step === 'email' \? "Let's go" : "Log in"\)\}/, "{isLoading ? t('login.button.processing') : (step === 'email' ? t('login.button.letsgo') : t('login.button.login'))}");
code = code.replace(/계정이 없으신가요\?/, "{t('login.no_account')}");
code = code.replace(/>회원가입<\/button>/, ">{t('login.button.signup')}</button>");

fs.writeFileSync('src/components/Login.tsx', code);
