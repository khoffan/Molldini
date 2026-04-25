import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { auth, provider } from '../../../common/firebase/firebaseConfig';
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { Navigate, Link } from 'react-router';
import { syncUserWithBackend } from '../service/authService'
import type { RootState, AppDispatch } from '../../../store';

const LoginPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { user, loading, error } = useSelector((state: RootState) => state.auth);
    const [localLoading, setLocalLoading] = useState<boolean>(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleEmailLogin = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setFormError(null);

        if (!email.trim() || !password.trim()) {
            setFormError('Please enter both email and password.');
            return;
        }

        setLocalLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            dispatch(syncUserWithBackend(result.user));
        } catch (err: unknown) {
            if (err instanceof FirebaseError) {
                console.log("email login err:", err.message);
                switch (err.code) {
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        setFormError('Invalid email or password.');
                        break;
                    case 'auth/too-many-requests':
                        setFormError('Too many attempts. Please try again later.');
                        break;
                    default:
                        setFormError('Login failed. Please try again.');
                }
            } else {
                setFormError('An unexpected error occurred.');
            }
        } finally {
            setLocalLoading(false);
        }
    };

    const handleGoogleLogin = async (): Promise<void> => {
        setFormError(null);
        try {
            // เปลี่ยนจาก Redirect เป็น Popup
            const result = await signInWithPopup(auth, provider);

            setLocalLoading(true);
            if (result.user) {
                // สั่ง Sync ข้อมูลกับ Backend ทันทีหลังได้ User มาจาก Popup
                await dispatch(syncUserWithBackend(result.user)).unwrap();
            }
        } catch (err: unknown) {
            if (err instanceof FirebaseError) {
                console.error("google error login code:", err.code);
                console.error("google error login message:", err.message);
                switch (err.code) {
                    case 'auth/popup-blocked':
                        await signInWithRedirect(auth, provider)
                        break;
                    case 'auth/popup-closed-in-the-middle':
                        setFormError('Popup closed in the middle.');
                        break;
                    default:
                        setFormError('Login failed. Please try again.');
                }
            } else {
                console.error("else error login:", err);
                setFormError('An unexpected error occurred.');
            }
        } finally {
            setLocalLoading(false);
        }
    };

    if (user) {
        return <Navigate to="/" replace />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-surface rounded-2xl shadow-xl p-8 border border-border-main">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-content">Error</h1>
                        <p className="text-muted mt-2">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    const isLoading = localLoading || loading;

    return (
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Card */}
                <div className="bg-surface/80 backdrop-blur-lg rounded-3xl shadow-2xl shadow-blue-900/5 p-8 sm:p-10 border border-border-main">
                    {/* Logo / Brand */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30 mb-4">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-content tracking-tight">
                            Welcome back
                        </h1>
                        <p className="text-muted mt-1.5 text-sm">
                            Sign in to your account to continue
                        </p>
                    </div>

                    {/* Error Banner */}
                    {formError && (
                        <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl animate-[fadeIn_0.2s_ease-out]">
                            <svg className="w-5 h-5 shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formError}</span>
                        </div>
                    )}

                    {/* Email / Password Form */}
                    <form onSubmit={handleEmailLogin} className="space-y-4">
                        {/* Email Field */}
                        <div className="relative">
                            <label htmlFor="email" className="block text-sm font-medium text-content mb-1.5">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    className="block w-full pl-11 pr-4 py-3 bg-surface-hover border border-border-main rounded-xl text-content placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="relative">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    className="block w-full pl-11 pr-12 py-3 bg-surface-hover border border-border-main rounded-xl text-content placeholder-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all disabled:opacity-50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-muted hover:text-content transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full relative py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:ring-offset-2"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-7">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border-main" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-surface px-3 text-muted font-medium tracking-wider">
                                or continue with
                            </span>
                        </div>
                    </div>

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-surface border border-border-main hover:bg-surface-hover hover:border-content/30 text-content font-medium py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-border-main focus:ring-offset-2"
                    >
                        <img src="https://www.svgrepo.com/show/355037/google.svg" className="w-5 h-5" alt="google" />
                        {isLoading ? 'Connecting...' : 'Continue with Google'}
                    </button>

                    {/* Register Link */}
                    <p className="text-center text-sm text-muted mt-8">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-semibold text-primary hover:text-primary/80 transition-colors"
                        >
                            Create account
                        </Link>
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted mt-6">
                    By signing in, you agree to our{' '}
                    <Link to="/terms" className="underline hover:text-content transition-colors">Terms</Link>{' '}
                    and{' '}
                    <Link to="/policy" className="underline hover:text-content transition-colors">Privacy Policy</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
