'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Eye, EyeOff, Loader2, ShoppingCart } from 'lucide-react';
import api from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import type { ApiResponse, LoginResponse } from '@/types';

const LoginSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof LoginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const { setAuth } = useAuthStore();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: zodResolver(LoginSchema),
    });

    const onSubmit = async (data: LoginForm) => {
        setIsLoading(true);
        try {
            const response = await api.post<ApiResponse<LoginResponse>>('/auth/login', data);
            const { access_token, user } = response.data.data;
            setAuth(user, access_token);
            toast.success(`Welcome back, ${user.info?.first_name || user.username}!`);
            router.push('/dashboard');
        } catch (error: any) {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex' }}>
            {/* Left Panel */}
            <div style={{
                width: '50%',
                background: '#0a0a1a',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '3rem',
            }} className="hidden lg:flex">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '2.5rem', height: '2.5rem',
                        borderRadius: '0.75rem',
                        background: '#2563eb',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <ShoppingCart size={20} color="white" />
                    </div>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '1.25rem' }}>
            Ryzera POS
          </span>
                </div>

                <div>
                    <h1 style={{ fontSize: '3rem', fontWeight: 700, color: 'white', lineHeight: 1.2, marginBottom: '1.5rem' }}>
                        Manage your<br />
                        <span style={{ color: '#93c5fd' }}>business</span><br />
                        smarter.
                    </h1>
                    <p style={{ color: '#9ca3af', fontSize: '1.125rem' }}>
                        Multi-branch point of sale system designed for modern businesses.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                    {[
                        { label: 'Branches', value: '10+' },
                        { label: 'Products', value: '1K+' },
                        { label: 'Uptime', value: '99.9%' },
                    ].map((stat) => (
                        <div key={stat.label} style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            border: '1px solid rgba(255,255,255,0.1)',
                        }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{stat.value}</div>
                            <div style={{ color: '#9ca3af', fontSize: '0.875rem' }}>{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Panel */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: '#f9f9f9',
            }}>
                <div style={{ width: '100%', maxWidth: '28rem' }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0a0a1a' }}>
                            Welcome back
                        </h2>
                        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
                            Sign in to your account to continue
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {/* Username */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0a0a1a' }}>
                                Username
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your username"
                                {...register('username')}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: `1px solid ${errors.username ? '#ef4444' : '#e5e7eb'}`,
                                    background: 'white',
                                    fontSize: '0.875rem',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                }}
                            />
                            {errors.username && (
                                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                    {errors.username.message}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem', color: '#0a0a1a' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    {...register('password')}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 3rem 0.75rem 1rem',
                                        borderRadius: '0.5rem',
                                        border: `1px solid ${errors.password ? '#ef4444' : '#e5e7eb'}`,
                                        background: 'white',
                                        fontSize: '0.875rem',
                                        outline: 'none',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute', right: '1rem', top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        color: '#6b7280',
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && (
                                <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                background: isLoading ? '#93c5fd' : '#2563eb',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Signing in...
                                </>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        borderRadius: '0.5rem',
                        background: '#f1f2f6',
                        border: '1px solid #e5e7eb',
                    }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                            Demo Credentials
                        </p>
                        {[
                            { role: 'Admin', username: 'admin', password: 'admin123' },
                            { role: 'Manager', username: 'manager_hq', password: 'manager123' },
                            { role: 'Cashier', username: 'cashier_hq', password: 'cashier123' },
                        ].map((cred) => (
                            <div key={cred.role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 500, color: '#0a0a1a' }}>{cred.role}</span>
                                <span style={{ color: '#6b7280', fontFamily: 'monospace' }}>{cred.username} / {cred.password}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}