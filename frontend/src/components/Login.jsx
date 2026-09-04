import React, { useState } from 'react';
import { Shield, Lock, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [badgeNumber, setBadgeNumber] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const MOCK_USERS = {
        'GP-1001': { password: 'password123', roleKey: 'SUPER_ADMIN', name: 'Inspector V. Jadeja', designation: 'State Police HQ' },
        'GP-2002': { password: 'password123', roleKey: 'OPERATOR', name: 'Operator R. Patel', designation: 'Command & Control Room' },
        'GP-3003': { password: 'password123', roleKey: 'INVESTIGATOR', name: 'Officer S. Mehta', designation: 'Crime Branch / CID' },
        'GP-4004': { password: 'password123', roleKey: 'DEPT_ADMIN', name: 'Admin K. Shah', designation: 'Ahmedabad Traffic Zone' },
        'GP-5005': { password: 'password123', roleKey: 'VIEWER', name: 'Viewer M. Desai', designation: 'Executive Secretariat' }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg('');

        setTimeout(() => {
            const formattedBadge = badgeNumber.trim().toUpperCase();
            const userRecord = MOCK_USERS[formattedBadge];

            if (userRecord && userRecord.password === password) {
                login(userRecord.roleKey, {
                    name: userRecord.name,
                    badgeNumber: formattedBadge,
                    designation: userRecord.designation
                });
            } else {
                setErrorMsg('Invalid Badge ID or Password');
            }
            setIsLoading(false);
        }, 800);
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100vw',
            display: 'flex',
            background: 'linear-gradient(135deg, #00102a 0%, #002045 100%)',
            fontFamily: 'var(--font-headline)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decorative Rings */}
            <div style={{
                position: 'absolute',
                top: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(254, 147, 44, 0.1) 0%, rgba(0, 32, 69, 0) 70%)',
                zIndex: 0
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-30%',
                left: '-15%',
                width: '800px',
                height: '800px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(21, 128, 61, 0.05) 0%, rgba(0, 32, 69, 0) 70%)',
                zIndex: 0
            }} />

            {/* Main Login Card */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
            }}>
                <div style={{
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '48px',
                    borderRadius: '24px',
                    boxShadow: '0 24px 64px rgba(0, 0, 0, 0.4)',
                    width: '100%',
                    maxWidth: '460px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: 'fadeIn 0.6s ease-out'
                }}>
                    {/* Logo / Shield Area */}
                    <div style={{
                        background: 'rgba(254, 147, 44, 0.15)',
                        border: '1px solid rgba(254, 147, 44, 0.3)',
                        borderRadius: '16px',
                        padding: '16px',
                        marginBottom: '24px',
                        boxShadow: '0 8px 32px rgba(254, 147, 44, 0.1)'
                    }}>
                        <Shield size={48} color="#fe932c" />
                    </div>

                    <h1 style={{
                        color: '#fff',
                        fontSize: '32px',
                        fontWeight: 800,
                        letterSpacing: '0.02em',
                        margin: '0 0 8px 0',
                        textAlign: 'center'
                    }}>
                        NETRA-GP
                    </h1>
                    <p style={{
                        color: '#86a0cd',
                        fontSize: '14px',
                        marginBottom: '40px',
                        textAlign: 'center',
                        letterSpacing: '0.04em'
                    }}>
                        GUJARAT POLICE VMS & ANPR PLATFORM
                    </p>

                    {errorMsg && (
                        <div style={{
                            width: '100%',
                            background: 'rgba(186, 26, 26, 0.1)',
                            border: '1px solid rgba(186, 26, 26, 0.3)',
                            color: '#ffdad6',
                            padding: '12px',
                            borderRadius: '8px',
                            marginBottom: '20px',
                            fontSize: '13px',
                            textAlign: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px'
                        }}>
                            <Shield size={16} /> {errorMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ position: 'relative' }}>
                            <label style={{
                                display: 'block',
                                color: '#adc7f7',
                                fontSize: '12px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}>
                                Badge Number / ID
                            </label>
                            <div style={{ position: 'relative' }}>
                                <User size={18} color="#86a0cd" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    required
                                    value={badgeNumber}
                                    onChange={(e) => setBadgeNumber(e.target.value)}
                                    placeholder="e.g., GP-8841"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(134, 160, 205, 0.2)',
                                        borderRadius: '12px',
                                        padding: '14px 16px 14px 44px',
                                        color: '#fff',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease',
                                        fontFamily: 'var(--font-mono)'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#fe932c'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(134, 160, 205, 0.2)'}
                                />
                            </div>
                        </div>

                        <div style={{ position: 'relative' }}>
                            <label style={{
                                display: 'block',
                                color: '#adc7f7',
                                fontSize: '12px',
                                fontWeight: 600,
                                marginBottom: '8px',
                                letterSpacing: '0.05em',
                                textTransform: 'uppercase'
                            }}>
                                Secure Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={18} color="#86a0cd" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(134, 160, 205, 0.2)',
                                        borderRadius: '12px',
                                        padding: '14px 44px',
                                        color: '#fff',
                                        fontSize: '15px',
                                        outline: 'none',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#fe932c'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(134, 160, 205, 0.2)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'transparent',
                                        border: 'none',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        padding: '4px'
                                    }}
                                >
                                    {showPassword ? <EyeOff size={18} color="#86a0cd" /> : <Eye size={18} color="#86a0cd" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                background: isLoading ? 'linear-gradient(90deg, #d47a24 0%, #a65e1b 100%)' : 'linear-gradient(90deg, #fe932c 0%, #f16603 100%)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                padding: '16px',
                                fontSize: '16px',
                                fontWeight: 700,
                                marginTop: '12px',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                boxShadow: '0 8px 24px rgba(254, 147, 44, 0.3)',
                                transition: 'all 0.3s ease',
                                transform: isLoading ? 'scale(0.98)' : 'scale(1)'
                            }}
                        >
                            {isLoading ? (
                                <>Verifying Credentials...</>
                            ) : (
                                <>
                                    Authenticate <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <style dangerouslySetInnerHTML={{
                        __html: `
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}} />
                </div>
            </div>
        </div>
    );
}

