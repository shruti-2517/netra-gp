import React, { useState, useEffect } from 'react';
import { Shield, Lock, Eye, EyeOff, User, ArrowRight, Clock, Fingerprint } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [badgeNumber, setBadgeNumber] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [timeStr, setTimeStr] = useState('');

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTimeStr(now.toLocaleTimeString('en-US', { hour12: false }) + ' IST');
        };
        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

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
            flexDirection: 'column',
            background: 'var(--surface)',
            fontFamily: 'var(--font-body)',
        }}>
            {/* Top Authority Banner — matches TopBar */}
            <div style={{
                height: '46px',
                background: '#002045',
                borderBottom: '2px solid #fe932c',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                flexShrink: 0,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        background: '#fe932c',
                        color: '#002045',
                        padding: '4px 6px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800
                    }}>
                        <Shield size={16} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                            fontFamily: 'var(--font-headline)',
                            fontSize: '15px',
                            fontWeight: 700,
                            color: '#ffffff',
                            letterSpacing: '0.04em'
                        }}>
                            NETRA-GP
                        </span>
                        <span style={{
                            background: 'rgba(254, 147, 44, 0.15)',
                            color: '#fe932c',
                            border: '1px solid rgba(254, 147, 44, 0.35)',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '9px',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '2px',
                            letterSpacing: '0.06em'
                        }}>
                            GUJARAT POLICE
                        </span>
                        <span style={{
                            fontSize: '11px',
                            color: '#86a0cd',
                            borderLeft: '1px solid #1a365d',
                            paddingLeft: '8px'
                        }}>
                            VMS & ANPR Platform
                        </span>
                    </div>
                </div>

                {/* Live Clock */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    color: '#adc7f7',
                    background: 'rgba(26, 54, 93, 0.5)',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid rgba(134, 160, 205, 0.2)'
                }}>
                    <Clock size={12} color="#fe932c" />
                    <span>{timeStr || '00:00:00 IST'}</span>
                </div>
            </div>

            {/* Main Content Area */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 20px',
                background: 'var(--surface)',
            }}>
                {/* Login Card — institutional dossier-card style */}
                <div style={{
                    background: 'var(--surface-container-lowest)',
                    border: '1px solid var(--outline-variant)',
                    borderRadius: 'var(--rounded-lg)',
                    boxShadow: 'var(--shadow-modal)',
                    width: '100%',
                    maxWidth: '420px',
                    overflow: 'hidden',
                }}>
                    {/* Card Header Band */}
                    <div style={{
                        background: '#002045',
                        padding: '28px 32px 24px',
                        textAlign: 'center',
                        borderBottom: '2px solid #fe932c',
                    }}>
                        <div style={{
                            background: 'rgba(254, 147, 44, 0.15)',
                            border: '1px solid rgba(254, 147, 44, 0.3)',
                            borderRadius: '8px',
                            padding: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '16px',
                        }}>
                            <Fingerprint size={32} color="#fe932c" />
                        </div>
                        <h1 style={{
                            fontFamily: 'var(--font-headline)',
                            color: '#ffffff',
                            fontSize: '20px',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            margin: '0 0 4px 0',
                        }}>
                            Secure Authentication
                        </h1>
                        <p style={{
                            color: '#86a0cd',
                            fontSize: '11px',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.05em',
                            margin: 0,
                        }}>
                            AUTHORIZED PERSONNEL ONLY
                        </p>
                    </div>

                    {/* Form Body */}
                    <div style={{ padding: '28px 32px 32px' }}>
                        {/* Error Alert */}
                        {errorMsg && (
                            <div style={{
                                background: 'var(--error-container)',
                                border: '1px solid var(--error)',
                                color: 'var(--on-error-container)',
                                padding: '10px 12px',
                                borderRadius: 'var(--rounded-md)',
                                marginBottom: '20px',
                                fontSize: '12px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontFamily: 'var(--font-headline)',
                            }}>
                                <Shield size={14} /> {errorMsg}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                            {/* Badge Number Field */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-headline)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--on-surface-variant)',
                                    marginBottom: '6px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}>
                                    Badge Number / ID
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <User size={16} color="var(--outline)" style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                    }} />
                                    <input
                                        id="badge-input"
                                        type="text"
                                        required
                                        value={badgeNumber}
                                        onChange={(e) => setBadgeNumber(e.target.value)}
                                        placeholder="e.g., GP-8841"
                                        style={{
                                            width: '100%',
                                            background: 'var(--surface-container-lowest)',
                                            border: '1px solid var(--outline-variant)',
                                            borderRadius: 'var(--rounded-md)',
                                            padding: '10px 12px 10px 36px',
                                            color: 'var(--on-surface)',
                                            fontSize: '13px',
                                            fontFamily: 'var(--font-mono)',
                                            outline: 'none',
                                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#1a365d';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(26, 54, 93, 0.15)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--outline-variant)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontFamily: 'var(--font-headline)',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    color: 'var(--on-surface-variant)',
                                    marginBottom: '6px',
                                    letterSpacing: '0.05em',
                                    textTransform: 'uppercase',
                                }}>
                                    Secure Password
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={16} color="var(--outline)" style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        pointerEvents: 'none',
                                    }} />
                                    <input
                                        id="password-input"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        style={{
                                            width: '100%',
                                            background: 'var(--surface-container-lowest)',
                                            border: '1px solid var(--outline-variant)',
                                            borderRadius: 'var(--rounded-md)',
                                            padding: '10px 40px 10px 36px',
                                            color: 'var(--on-surface)',
                                            fontSize: '13px',
                                            fontFamily: 'var(--font-body)',
                                            outline: 'none',
                                            transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#1a365d';
                                            e.target.style.boxShadow = '0 0 0 2px rgba(26, 54, 93, 0.15)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = 'var(--outline-variant)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '2px',
                                            color: 'var(--outline)',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button — accent style */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    background: isLoading
                                        ? '#b06e1a'
                                        : 'linear-gradient(180deg, #fe932c 0%, #e67e17 100%)',
                                    color: '#ffffff',
                                    border: 'none',
                                    borderRadius: 'var(--rounded-md)',
                                    padding: '12px 16px',
                                    fontFamily: 'var(--font-headline)',
                                    fontSize: '13px',
                                    fontWeight: 700,
                                    marginTop: '4px',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    boxShadow: '0 2px 6px rgba(254, 147, 44, 0.35)',
                                    transition: 'all 0.15s ease',
                                    opacity: isLoading ? 0.8 : 1,
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <span style={{
                                            width: '14px',
                                            height: '14px',
                                            border: '2px solid rgba(255,255,255,0.3)',
                                            borderTopColor: '#ffffff',
                                            borderRadius: '50%',
                                            display: 'inline-block',
                                            animation: 'spin 0.6s linear infinite',
                                        }} />
                                        Verifying Credentials...
                                    </>
                                ) : (
                                    <>
                                        Authenticate <ArrowRight size={15} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Security Footer */}
                        <div style={{
                            marginTop: '24px',
                            paddingTop: '16px',
                            borderTop: '1px solid var(--surface-container-high)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px',
                        }}>
                            <Lock size={11} color="var(--outline)" />
                            <span style={{
                                fontSize: '10px',
                                color: 'var(--outline)',
                                fontFamily: 'var(--font-mono)',
                                letterSpacing: '0.04em',
                            }}>
                                AES-256 ENCRYPTED SESSION • RBAC ENFORCED
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Status Bar — matches Footer */}
            <div style={{
                height: '28px',
                background: '#002045',
                borderTop: '1px solid #1a365d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 16px',
                flexShrink: 0,
            }}>
                <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '10px',
                    color: '#86a0cd',
                    letterSpacing: '0.04em',
                }}>
                    NETRA-GP v4.0 • Gujarat Police VMS
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: '#15803d',
                        display: 'inline-block',
                    }} />
                    <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '10px',
                        color: '#86a0cd',
                    }}>
                        SYSTEM ONLINE
                    </span>
                </div>
            </div>

            {/* Keyframe animations */}
            <style dangerouslySetInnerHTML={{
                __html: `
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    input::-ms-reveal,
                    input::-ms-clear,
                    input::-webkit-credentials-auto-fill-button {
                        display: none !important;
                    }
                `}} />
        </div>
    );
}
