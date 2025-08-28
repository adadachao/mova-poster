'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import PosterGenerator from '../components/PosterGenerator';
import toast from 'react-hot-toast';
import { IntlProvider, useIntl } from '../components/IntlProvider';
import LanguageSwitcher from '../components/LanguageSwitcher';
import VideoScanner from '../components/VideoScanner';

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zilwwyrgetjplvwcowjl.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppbHd3eXJnZXRqcGx2d2Nvd2psIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4ODI5NTQsImV4cCI6MjA3MTQ1ODk1NH0.iLGNdvqD1fuwUJjgbzhe4Mz_jbkIl3K_bCYroCs3QCE';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

function HomeContent() {
    const { t } = useIntl();
    const [name, setName] = useState('');
    const [xName, setXName] = useState('');
    const [walletAddress, setWalletAddress] = useState(''); // 钱包地址字段
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [userInvitedCount, setUserInvitedCount] = useState(0);
    const [userMovaTokens, setUserMovaTokens] = useState(0);
    const [user, setUser] = useState<any>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authError, setAuthError] = useState<string>('');
    const [showPoster, setShowPoster] = useState(false);
    const [inviteId, setInviteId] = useState<string>('');
    const [missingInviteId, setMissingInviteId] = useState(false);
    const [showViewMyPosterButton, setShowViewMyPosterButton] = useState(false);
    const [showViewMyPoster, setShowViewMyPoster] = useState(false);
    const [myPosterData, setMyPosterData] = useState<any>(null);
    const [showCheckIn, setShowCheckIn] = useState(false);
    const [showCameraHelp, setShowCameraHelp] = useState(false);
    const [showGeoHelp, setShowGeoHelp] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [signTimeRange, setSignTimeRange] = useState<{ starttime: string, endtime: string } | null>(null);

    const guests = [{
        id: 1,
        name: 'Wael Muhaisen',
        position: t('guests.ceo'),
        avatar: '/static/images/guest1.png',
    }, {
        id: 2,
        name: 'Favio Sposito',
        position: t('guests.foundationFounder'),
        avatar: '/static/images/guest2.png',
    }, {
        id: 3,
        name: 'Edward Du',
        position: t('guests.ctoPalmGlobal'),
        avatar: '/static/images/guest3.png',
    }, {
        id: 4,
        name: 'Bobby Zhou',
        position: t('guests.coFounderAquaLabs'),
        avatar: '/static/images/guest4.png',
    }, {
        id: 5,
        name: 'Deng Di',
        position: t('guests.founderCeoMinax'),
        avatar: '/static/images/guest5.png',
    }, {
        id: 6,
        name: '',
        position: t('guests.representativeWorldLiberty'),
        avatar: '/static/images/guest6.png',
    }, {
        id: 7,
        name: '',
        position: t('guests.representativeStandardChartered'),
        avatar: '/static/images/guest7.png',
    }, {
        id: 8,
        name: '',
        position: t('guests.representativePublicInvestment'),
        avatar: '/static/images/guest8.png',
    }]
    // 读取URL参数
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const inviteIdParam = urlParams.get('invite_id') || '8a650653-064d-4247-8e19-daa75b312691';

        // if (!inviteIdParam) {
        //     setMissingInviteId(true);
        //     return;
        // }

        setInviteId(inviteIdParam);

        // 读取其他URL参数并自动填充表单
        const nameParam = urlParams.get('name');
        const xNameParam = urlParams.get('x_name');
        const walletAddressParam = urlParams.get('wallet_address');

        if (nameParam) {
            setName(nameParam);
        }

        // 如果有x_name，优先使用x_name
        if (xNameParam) {
            setXName(xNameParam);
        }

        if (walletAddressParam) {
            setWalletAddress(walletAddressParam);
        }
    }, []);

    // 自动匿名登录
    useEffect(() => {
        // if (missingInviteId) return; // 如果没有邀请ID，不进行登录

        const signInAnonymously = async () => {
            try {
                setAuthLoading(true);

                // 检查是否已经有用户会话
                const { data: { session } } = await supabase.auth.getSession();

                if (session?.user) {
                    // 如果已有会话，直接使用
                    setUser(session.user);
                    console.log('Existing session found:', session.user.id);
                } else {
                    // 如果没有会话，进行匿名登录
                    const { data, error } = await supabase.auth.signInAnonymously();

                    if (error) {
                        console.error('Anonymous sign-in error:', error);
                        setAuthError('Authentication failed. Please refresh the page.');
                    } else {
                        setUser(data.user);
                        console.log('Anonymous sign-in successful:', data.user.id);
                    }
                }
            } catch (error) {
                console.error('Authentication error:', error);
                setAuthError('Authentication failed. Please refresh the page.');
            } finally {
                setAuthLoading(false);
            }
        };

        signInAnonymously();
    }, [missingInviteId]);

    // 获取签到时间范围
    useEffect(() => {
        const getSignTimeRange = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (!session) return;

                const resp = await fetch(`${supabaseUrl}/functions/v1/sign_time_range`, {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                });

                if (resp.ok) {
                    const timeRange = await resp.json();
                    setSignTimeRange(timeRange);
                }
            } catch (error) {
                console.error('Failed to get sign time range:', error);
            }
        };
        getSignTimeRange();
    }, [user]);

    // 获取用户邀请数量
    const fetchUserInvitedCount = async () => {
        if (!user?.id) return;
        console.log('user.id', user.id);

        try {
            const { data, error } = await supabase
                .from('invitation')
                .select('*')
                .eq('inviter_id', user.id);

            if (error) {
                console.error('Error fetching user invited count:', error);
                return;
            }

            console.log('data', data);

            const invitedCount = data?.length || 0;
            setUserInvitedCount(invitedCount);

            // 计算 MOVA token：每邀请一个人 +10，最多1000
            const movaTokens = Math.min(invitedCount * 10, 1000);
            setUserMovaTokens(movaTokens);

            const { data: invitationData, error: invitationError } = await supabase
                .from('invitation')
                .select('*')
                .eq('user_id', user.id)

            if (invitationData && invitationData.length > 0) {
                console.log('invitationData', invitationData);
                setShowViewMyPosterButton(true);
                setMyPosterData(invitationData[0]);

                setName(invitationData[0].real_name);
                setXName(invitationData[0].x_name);
                setWalletAddress(invitationData[0].wallet_address);
            }
        } catch (error) {
            console.error('Error fetching user invited count:', error);
        }
    };

    // 更新统计数据
    useEffect(() => {
        if (user) {
            fetchUserInvitedCount(); // 获取用户邀请数量
        }
    }, [user]);

    // 钱包地址校验函数
    const isValidWalletAddress = (address: string): boolean => {
        // 检查长度是否为42位（0x + 40位十六进制）
        if (address.length !== 42) return false;

        // 检查是否以0x开头
        if (!address.startsWith('0x')) return false;

        // 检查剩余40位是否为有效的十六进制字符
        const hexRegex = /^[0-9a-fA-F]{40}$/;
        return hexRegex.test(address.slice(2));
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            toast.error(t('errors.userNotLoggedIn'));
            return;
        }

        if (!inviteId) {
            toast.error(t('errors.invalidInviteId'));
            return;
        }

        if (!name) {
            toast.error(t('form.requiredName'));
            return;
        }

        if (!xName) {
            toast.error(t('form.requiredXName'));
            return;
        }


        if (!walletAddress) {
            toast.error(t('form.requiredWalletAddress'));
            return;
        }

        if (!isValidWalletAddress(walletAddress)) {
            toast.error(t('form.invalidFormat'));
            return;
        }

        setLoading(true);
        setSuccess(false);
        setShowPoster(false);

        try {
            // 获取当前会话
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                toast.error(t('errors.userNotLoggedIn'));
                return;
            }

            let response = null;

            // 如果用户已经生成过一次海报（通过查询invitation表里user_id=user.id, 字段invite_id来判断）, 调用change-info函数
            const { data: invitationData, error: invitationError } = await supabase
                .from('invitation')
                .select('*')
                .eq('user_id', user.id);
            // .eq('inviter_id', inviteId)

            if (invitationData && invitationData.length > 0) {
                response = await fetch(`${supabaseUrl}/functions/v1/change_info`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        name: name,
                        wallet_address: walletAddress,
                        x_name: xName,
                    })
                });
            } else {
                // 调用Edge Function
                response = await fetch(`${supabaseUrl}/functions/v1/activity_invite`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        invite_id: inviteId,
                        name: name,
                        wallet_address: walletAddress,
                        x_name: xName,
                    })
                });
            }


            if (response.ok) {
                const result = await response.json();
                setShowPoster(true);
                setSuccess(true);
                setLoading(false);

                toast.success(t('poster.success'));

                // 更新用户邀请数量
                fetchUserInvitedCount();

                // 3秒后隐藏成功消息
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            } else {
                const result = await response.json();
                throw new Error(result.error || 'Error processing invitation');
            }

        } catch (error: any) {
            console.error('Error:', error);
            setLoading(false);
            toast.error(error.message || t('errors.serverError'));
        }
    };

    const handleViewMyPoster = () => {
        setShowViewMyPoster(true);
    }

    // 海报生成完成回调
    const handlePosterGenerated = (dataUrl: string) => {
        // console.log('dataUrl', dataUrl);
    };

    const handlePosterClose = () => {
        setShowPoster(false);
        setShowViewMyPoster(false);
        setSuccess(false);
    };

    // Cross-browser copy helper
    const copyToClipboard = async (text: string) => {
        const ua = typeof navigator !== 'undefined' ? navigator.userAgent || '' : '';
        const isWeChat = /MicroMessenger/i.test(ua);
        try {
            if (typeof navigator !== 'undefined' && 'clipboard' in navigator && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch {}
        // WeChat JS-SDK (if available)
        try {
            // @ts-ignore
            const wx = (window as any).wx;
            if (isWeChat && wx && typeof wx.setClipboardData === 'function') {
                await new Promise<void>((resolve, reject) => {
                    try {
                        wx.setClipboardData({
                            data: text,
                            success: () => {
                                // 某些版本需要再调用 getClipboardData 以触发系统更新
                                try { wx.getClipboardData && wx.getClipboardData({ success: () => resolve() }); } catch { resolve(); }
                                resolve();
                            },
                            fail: () => reject(new Error('wx-fail'))
                        });
                    } catch (e) { reject(e as any); }
                });
                return true;
            }
        } catch {}
        // Fallback: use copy-to-clipboard library
        try {
            const mod = await import('copy-to-clipboard');
            const copied = mod.default(text, {
                format: 'text/plain',
                message: 'copy',
                debug: false
            });
            if (copied) return true;
        } catch {}
        // Fallback 2: improved input method (often better on iOS)
        try {
            const input = document.createElement('input');
            input.value = text;
            input.setAttribute('readonly', '');
            input.style.position = 'fixed';
            input.style.top = '0';
            input.style.left = '0';
            input.style.opacity = '0';
            input.style.pointerEvents = 'none';
            input.style.zIndex = '-1';
            document.body.appendChild(input);
            input.focus();
            input.select();
            input.setSelectionRange(0, input.value.length);
            const ok = document.execCommand('copy');
            document.body.removeChild(input);
            if (ok) return true;
        } catch {}
        // Fallback 3: contentEditable + Selection API (some older iOS/WebViews)
        try {
            const div = document.createElement('div');
            div.contentEditable = 'true';
            div.innerText = text;
            div.style.position = 'fixed';
            div.style.top = '0';
            div.style.left = '0';
            div.style.opacity = '0';
            div.style.pointerEvents = 'none';
            div.style.zIndex = '-1';
            document.body.appendChild(div);
            const range = document.createRange();
            range.selectNodeContents(div);
            const sel = window.getSelection();
            sel && sel.removeAllRanges();
            sel && sel.addRange(range);
            const ok2 = document.execCommand('copy');
            sel && sel.removeAllRanges();
            document.body.removeChild(div);
            if (ok2) return true;
        } catch {}
        return false;
    };

    const handleCopyInviteLink = async () => {
        try {
            // 如果没生成过海报 先调用生成海报函数
            const { data: invitationData, error: invitationError } = await supabase
                .from('invitation')
                .select('*')
                .eq('user_id', user.id)

            if (!invitationData || invitationData.length === 0) {
                const { data: { session } } = await supabase.auth.getSession();

                if (!session) {
                    toast.error(t('errors.userNotLoggedIn'));
                    return;
                }

                if (!inviteId) {
                    toast.error(t('errors.invalidInviteId'));
                    return;
                }

                if (!name) {
                    toast.error(t('form.requiredName'));
                    return;
                }

                if (!xName) {
                    toast.error(t('form.requiredXName'));
                    return;
                }


                if (!walletAddress) {
                    toast.error(t('form.requiredWalletAddress'));
                    return;
                }

                if (!isValidWalletAddress(walletAddress)) {
                    toast.error(t('form.invalidFormat'));
                    return;
                }
                const response = await fetch(`${supabaseUrl}/functions/v1/activity_invite`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`
                    },
                    body: JSON.stringify({
                        invite_id: inviteId,
                        name: name,
                        wallet_address: walletAddress,
                        x_name: xName,
                    })
                });

                if (response.ok) {
                    const result = await response.json();
                    console.log('result', result);

                    const finalInviteId = user?.id;
                    alert('513 finalInviteId:' + finalInviteId);
                    if (!finalInviteId) throw new Error('no-invite-id');
                    const inviteLink = `${window.location.origin}/?invite_id=${finalInviteId}`;
                    alert('inviteLink:' + inviteLink);
                    const ok = await copyToClipboard(inviteLink);
                    if (ok) {
                        toast.success(t('stats.copySuccess'));
                    } else {
                        toast.error(t('stats.copyFailed'));
                    }
                } else {
                    throw new Error('Error processing invitation');
                }
            } else {
                const finalInviteId = user?.id;
                alert('finalInviteId:' + finalInviteId);
                if (!finalInviteId) throw new Error('no-invite-id');
                const inviteLink = `${window.location.origin}/?invite_id=${finalInviteId}`;
                const ok = await copyToClipboard(inviteLink);
                if (ok) {
                    toast.success(t('stats.copySuccess'));
                } else {
                    toast.error(t('stats.copyFailed'));
                }
            }

        } catch (e) {
            alert('copy failed:' + e);
            toast.error(t('stats.copyFailed'));
        }
    }

    // 通用：提交簽到
    const submitCheckIn = async (code: string) => {
        try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                if (!navigator.geolocation) return reject(new Error('geo'));
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
            });
            setIsSending(true);
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) throw new Error('no-session');
            const resp = await fetch(`${supabaseUrl}/functions/v1/sign`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ user_id: user?.id, qr_code: code, latitude: pos.coords.latitude, longitude: pos.coords.longitude })
            });
            const result = await resp.json();
            setIsSending(false);
            if (result.success) {
                toast.success(t('common.sentSuccess'));
                setShowCheckIn(false);
            } else {
                setShowCheckIn(false);
                toast.error(t('common.sentFailed') + ': ' + result.message, { duration: 5000 });
            }
        } catch (err: any) {
            setIsSending(false);
            if (err?.code === err?.PERMISSION_DENIED) toast.error(t('common.geoDenied'));
            else toast.error(t('common.sentFailed'));
        }
    };

    // 如果正在认证中，显示加载状态
    if (authLoading) {
        return (
            <div className="min-h-screen text-white flex items-center justify-center safe-area">
                <div className="text-center safe-area-padding">
                    <div className="border-2 border-[#C1FF72]/30 border-t-[#C1FF72] rounded-full w-12 h-12 animate-spin mx-auto mb-4"></div>
                    <p className="text-lg">{t('common.loading')}</p>
                </div>
            </div>
        );
    }

    // 如果认证失败，显示错误信息
    if (authError && !user) {
        return (
            <div className="min-h-screen text-white flex items-center justify-center safe-area">
                <div className="text-center safe-area-padding">
                    <p className="text-red-400 text-lg mb-4">{authError}</p>
                    <button
                        onClick={() => {
                            setAuthError('');
                            setAuthLoading(true);
                            window.location.reload();
                        }}
                        className="bg-[#C1FF72] text-black px-6 py-2 rounded-lg font-bold hover:bg-[#C1FF72]/80"
                    >
                        {t('common.confirm')}
                    </button>
                </div>
            </div>
        );
    }

    // 如果缺失邀请ID，显示错误提示
    // if (missingInviteId) {
    //     return (
    //         <div className="min-h-screen text-white flex items-center justify-center safe-area">
    //             <div className="text-center max-w-md mx-auto px-6 safe-area-padding">
    //                 <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-8 mb-6">
    //                     <h1 className="text-2xl font-bold text-red-400 mb-4">Access Denied</h1>
    //                     <p className="text-red-300 text-lg leading-relaxed">
    //                         Error: Missing invitation ID. Please access through a valid invitation link.
    //                     </p>
    //                 </div>
    //                 <p className="text-gray-400 text-sm">
    //                     This page requires a valid invitation link to access. Please check your invitation email or contact the event organizers.
    //                 </p>
    //             </div>
    //         </div>
    //     );
    // }

    return (
        <div className="min-h-screen text-white overflow-x-hidden relative safe-area">
            {/* 语言切换器 */}
            <LanguageSwitcher />

            {/* 背景图片 */}
            <div
                className="absolute w-full h-[50.75rem] top-0 left-0 inset-0 bg-cover bg-center bg-no-repeat z-10"
                style={{ backgroundImage: 'url(/static/home_bg.png)' }}
            ></div>

            {/* 背景渐变遮罩 - 上下过渡效果 */}
            <div className="absolute w-full h-[50.75rem] top-0 left-0 inset-0 z-15 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>

            <div className="relative z-30 max-w-6xl mx-auto p-6 pt-20 safe-area-padding">
                {/* 顶部品牌区域 */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2">
                        {/* Bitcoin 图标 */}
                        <img src="/static/bitcoin-logo.svg" alt="Bitcoin" width={98} height={24} />
                        <img src="/static/mova-logo.svg" alt="MOVA" width={75} height={28} />
                    </div>
                </div>

                {/* 用户状态提示 */}
                {/* {user && (
                    <div className="text-center absolute top-0 right-1/2 translate-x-1/2">
                        {inviteId && (
                            <div className="mt-2">
                                <span className="text-gray-400 text-xs">Invite ID: </span>
                                <span className="text-[#C1FF72] text-xs font-mono">{inviteId}</span>

                                <div className="text-gray-400 text-xs mt-2">
                                    User ID: {user.id}
                                </div>
                            </div>
                        )}
                    </div>
                )} */}

                {/* 主要内容区域 */}
                <div className="flex flex-col items-center">
                    {/* 标题区域 */}
                    <div className="text-center mb-18">
                        <h1 className="text-5xl font-bold flex flex-row items-center justify-center">
                            <span className="text-white">THE </span>
                            <img src="/static/mova-logo.svg" alt="MOVA" width={248} height={92} />
                        </h1>

                        {/* 徽章 */}
                        <div className="flex flex-row items-center justify-center gap-2">
                            <h2 className="text-5xl font-bold leading-tight text-white">GALA</h2>
                            <div className='flex flex-col items-center justify-center gap-1'>
                                <div className="inline-block bg-[#C1FF72] text-[#1E1E1E] px-4 py-1 rounded-full font-bold text-sm">
                                    {t('event.mainnetActivation')}
                                </div>
                                <p className="text-white text-xs">{t('event.savorInnovation')}</p>
                            </div>

                        </div>
                    </div>

                    {/* 中间内容区域 - 使用网格布局 */}
                    <div className="grid grid-cols-1 gap-4 w-full max-w-5xl mb-12">

                        {/* 右侧事件详情 */}
                        <div className="lg:col-span-1 text-right">
                            <div className="mb-6">
                                <div className="text-white text-xs mb-1">{t('event.eventDate')}</div>
                                <div className="text-[#C1FF72] text-sm font-semibold">{t('event.eventDateValue')}</div>
                            </div>
                            <div>
                                <div className="text-white text-xs mb-1">{t('event.location')}</div>
                                <div className="text-[#C1FF72] text-sm font-semibold">{t('event.locationValue')}</div>
                                <div className="text-[#C1FF72] text-xs mt-1">{t('event.locationAddress')}</div>
                            </div>
                        </div>


                        {/* 中间表单区域 */}
                        <div className="lg:col-span-1">
                            <form onSubmit={handleSubmit} className="space-y-2 flex flex-col items-center justify-center" lang='en-us'>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder={t('form.namePlaceholder')}
                                    maxLength={26}
                                    className="w-full px-4 py-3 bg-[#C1FF724D] rounded-full text-white text-sm transition-all focus:outline-none focus:border-none placeholder-white"
                                />
                                {/* X (Twitter) 输入框 */}
                                <input
                                    type="text"
                                    value={xName}
                                    onChange={(e) => setXName(e.target.value)}
                                    placeholder={t('form.xNamePlaceholder')}
                                    maxLength={50}
                                    className="w-full px-4 py-3 bg-[#C1FF724D] rounded-full text-white text-sm transition-all focus:outline-none focus:border-none placeholder-white"
                                />

                                <input
                                    type="text"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    placeholder={t('form.walletAddressPlaceholder')}
                                    className={`w-full px-4 py-3 bg-[#C1FF724D] rounded-full text-white text-sm transition-all focus:outline-none focus:border-none placeholder-white ${walletAddress && !isValidWalletAddress(walletAddress)
                                        ? 'border-2 border-red-500'
                                        : ''
                                        }`}
                                />
                                {walletAddress && !isValidWalletAddress(walletAddress) && (
                                    <p className="text-red-400 text-xs mt-1 ml-2">
                                        {t('form.invalidFormat')}
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-3 py-4 mt-4 mb-0 bg-[#C1FF72] min-w-80 text-black border-none rounded-full text-sm font-bold cursor-pointer transition-all hover:transform hover:-translate-y-1 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? t('poster.loading') : t('poster.generate')}
                                </button>

                                {
                                    showViewMyPosterButton && (
                                        <button type="button" onClick={handleViewMyPoster} className="px-3 py-4 mt-4 text-[#C1FF72] min-w-80 border border-[#C1FF72] rounded-full text-sm font-bold cursor-pointer transition-all hover:transform hover:-translate-y-1 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none">
                                            {t('poster.viewMyPoster')}
                                        </button>
                                    )
                                }
                            </form>

                            {/* 加载状态 */}
                            {loading && (
                                <div className="text-center mt-4">
                                    <div className="border-2 border-[#C1FF72]/30 border-t-[#C1FF72] rounded-full w-6 h-6 animate-spin mx-auto mb-2"></div>
                                    <p className="text-gray-300 text-sm">{t('poster.loading')}</p>
                                </div>
                            )}

                            {/* 成功消息 */}
                            {success && (
                                <div className="bg-[#C1FF72]/10 border-2 border-[#C1FF72] text-[#C1FF72] p-3 rounded-lg mt-4 text-center text-sm">
                                    <p>✅ {t('poster.success')}</p>
                                </div>
                            )}

                            {/* 错误消息 */}
                            {/* {error && ( // Removed error state
                                <div className="bg-red-500/10 border-2 border-red-500 text-red-500 p-3 rounded-lg mt-4 text-center text-sm">
                                    <p>❌ {error}</p>
                                </div>
                            )} */}

                            {/* 海报生成器 */}
                            {showPoster && (
                                <div className="mt-6">
                                    <PosterGenerator
                                        name={name}
                                        xName={xName}
                                        walletAddress={walletAddress}
                                        userId={user?.id}
                                        onGenerated={handlePosterGenerated}
                                        onClose={handlePosterClose}
                                        isViewMyPoster={false}
                                    />
                                </div>
                            )}

                            {
                                showViewMyPoster && myPosterData && (
                                    <div className="mt-6">
                                        <PosterGenerator
                                            name={myPosterData.real_name}
                                            xName={myPosterData.x_name}
                                            walletAddress={myPosterData.wallet_address}
                                            userId={myPosterData.user_id}
                                            onGenerated={handlePosterGenerated}
                                            onClose={handlePosterClose}
                                            isViewMyPoster={true}
                                        />
                                    </div>
                                )
                            }

                            {/* 生成的海报显示 */}
                            {/* {posterUrl && (
                                <div className="mt-6 text-center">
                                    <div className="bg-[#C1FF72]/10 border-2 border-[#C1FF72] rounded-lg p-4">
                                        <h3 className="text-[#C1FF72] font-bold text-lg mb-4">Your Exclusive Poster</h3>
                                        <div className="flex justify-center mb-4">
                                            <img
                                                src={posterUrl}
                                                alt="Generated Poster"
                                                className="max-w-full h-auto rounded-lg shadow-lg"
                                                style={{ maxHeight: '400px' }}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const link = document.createElement('a');
                                                link.download = `mova-gala-poster-${name}.png`;
                                                link.href = posterUrl;
                                                link.click();
                                            }}
                                            className="bg-[#C1FF72] text-black px-6 py-3 rounded-full font-bold hover:bg-[#C1FF72]/80 transition-all"
                                        >
                                            Download Poster
                                        </button>
                                    </div>
                                </div>
                            )} */}
                        </div>

                        {/* 邀請連結顯示與複製 */}
                        <div className="flex flex-col items-center justify-center gap-2">
                            <div className="text-center text-white/70 text-xs">{t('stats.yourInviteLink')}</div>
                            <div className="flex items-center w-[19.83rem] rounded-full border border-[#C1FF72] overflow-hidden">
                                <div className="px-3 py-4 text-white text-xs truncate flex-1">
                                    {typeof window !== 'undefined' && user?.id ? `${window.location.origin}/?invite_id=${user.id}` : ''}
                                </div>
                                <button
                                    onClick={() => handleCopyInviteLink()}
                                    className="bg-[#C1FF72] text-black px-5 h-full text-sm font-semibold"
                                >
                                    {t('stats.copyInviteLink')}
                                </button>
                            </div>
                        </div>

                        {(() => {
                            const now = new Date();
                            const isInTimeRange = signTimeRange &&
                                new Date(signTimeRange.starttime) <= now &&
                                now <= new Date(signTimeRange.endtime);

                            return isInTimeRange && (
                                <>
                                    <button
                                        type="button"
                                        disabled={userInvitedCount <= 1}
                                        onClick={async () => {
                                            if (userInvitedCount <= 1) return;
                                            try {
                                                // 优先从 URL 参数读取 sign_code
                                                const urlParams = new URLSearchParams(window.location.search);
                                                const urlSignCode = urlParams.get('sign_code');

                                                // 预检查定位权限；若已拒绝，先弹出帮助
                                                // @ts-ignore
                                                if (navigator.permissions && navigator.permissions.query) {
                                                    // @ts-ignore
                                                    const status = await navigator.permissions.query({ name: 'geolocation' });
                                                    if (status.state === 'denied') {
                                                        setShowGeoHelp(true);
                                                        return;
                                                    }
                                                }

                                                if (urlSignCode) {
                                                    // 有 sign_code，直接提交，不拉起攝像頭
                                                    await submitCheckIn(urlSignCode);
                                                    return;
                                                }
                                            } catch { }
                                            // 無 sign_code，打開掃碼
                                            setShowCheckIn(true);
                                        }}
                                        className="px-3 py-4 mb-0 bg-[#C1FF72] w-[19.83rem] mx-auto text-black border-none rounded-full text-sm font-bold cursor-pointer transition-all hover:transform hover:-translate-y-1 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:transform-none"
                                    >
                                        {t('common.checkIn')}
                                    </button>
                                    {userInvitedCount <= 1 && (
                                        <div className="text-red-400 text-xs text-center w-[19.83rem] mx-auto">
                                            {t('common.checkInInviteLimitTip')}
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        {/* Check-in Scanner Modal */}
                        {showCheckIn && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCheckIn(false)}>
                                <div className="bg-[#1a1a2e] rounded-2xl p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-[#C1FF72] text-lg font-bold mb-3">{t('common.scanQr')}</h3>
                                    <VideoScanner onPermanentDenied={() => setShowCameraHelp(true)} onError={() => toast.error(t('common.cameraDenied'))} onResult={async (code: string) => {
                                        await submitCheckIn(code);
                                    }} />
                                    {isSending && <div className="text-white text-sm mt-2">{t('common.sending')}</div>}
                                    <button className="mt-3 w-full bg-transparent border border-[#C1FF72] text-[#C1FF72] px-4 py-2 rounded-full" onClick={() => setShowCheckIn(false)}>{t('common.close')}</button>
                                </div>
                            </div>
                        )}

                        {/* Camera help modal */}
                        {showCameraHelp && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowCameraHelp(false)}>
                                <div className="bg-[#1a1a2e] rounded-2xl p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-[#C1FF72] text-lg font-bold mb-2">{t('common.cameraHelpTitle')}</h3>
                                    <p className="text-white/90 text-sm mb-2">{t('common.cameraHelpBody')}</p>
                                    <ul className="text-white/70 text-xs list-disc pl-5 space-y-1">
                                        <li>{t('common.cameraHelpStepsIOS')}</li>
                                        <li>{t('common.cameraHelpStepsAndroid')}</li>
                                    </ul>
                                    <button className="mt-3 w-full bg-[#C1FF72] text-black px-4 py-2 rounded-full font-semibold" onClick={() => { setShowCameraHelp(false); setShowCheckIn(true); }}>{t('common.tryAgain')}</button>
                                </div>
                            </div>
                        )}

                        {/* Geolocation help modal */}
                        {showGeoHelp && (
                            <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setShowGeoHelp(false)}>
                                <div className="bg-[#1a1a2e] rounded-2xl p-4 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                                    <h3 className="text-[#C1FF72] text-lg font-bold mb-2">{t('common.geoHelpTitle')}</h3>
                                    <p className="text-white/90 text-sm mb-2">{t('common.geoHelpBody')}</p>
                                    <ul className="text-white/70 text-xs list-disc pl-5 space-y-1">
                                        <li>{t('common.geoHelpStepsIOS')}</li>
                                        <li>{t('common.geoHelpStepsAndroid')}</li>
                                    </ul>
                                    <button className="mt-3 w-full bg-[#C1FF72] text-black px-4 py-2 rounded-full font-semibold" onClick={() => { setShowGeoHelp(false); setShowCheckIn(true); }}>{t('common.retry')}</button>
                                </div>
                            </div>
                        )}

                        {/* 统计区域 */}
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className=" lg:col-span-1 text-left">
                                <div className="flex items-center gap-2 mb-4 text-md">
                                    <span className="border border-[#C1FF72] text-white px-3 py-1 font-semibold min-w-12 text-center text-md">
                                        {userInvitedCount}
                                    </span>
                                    <span className="text-white text-xs">{t('stats.peopleInvited')}</span>
                                </div>
                                <div className="flex items-center gap-3 mb-4 text-md">
                                    <span className="border border-[#C1FF72] text-white px-3 py-1 font-semibold min-w-12 text-center text-md">
                                        {userMovaTokens}
                                    </span>
                                    <span className="text-white text-xs">{t('stats.usdtWorth')}</span>
                                </div>
                            </div>

                            <button className="bg-[#C1FF724D] mx-auto text-white px-4 py-2 font-semibold text-xs">
                                {t('stats.earnMova')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* 新增：嘉宾展示部分 */}
            <div className='relative'>
                <div
                    className="absolute w-full h-[51.06rem] top-56 left-0 inset-0 bg-cover bg-center bg-no-repeat z-10"
                    style={{ backgroundImage: 'url(/static/guest_bg.png)' }}
                ></div>

                <img src="/static/logos.png" alt="MOVA" className='w-full lg:max-w-6xl mx-auto relative z-29' width={100} height={277} />

                {/* 嘉宾背景渐变遮罩 - 上下过渡效果 */}
                <div className="absolute w-full h-[51.06rem] top-56 left-0 inset-0 z-15 bg-gradient-to-b from-black/90 via-transparent to-black/80"></div>

                <div className="relative z-29 max-w-6xl mx-auto px-2 pb-12">
                    {/* PROPOSED GUEST 横幅 */}
                    <div className="text-center my-8 lg:my-12">
                        <div className="inline-block bg-[#C1FF72] text-black px-16 py-1 rounded-full font-bold text-md">
                            {t('event.proposedGuest')}
                        </div>
                    </div>

                    {/* 五个小嘉宾圆形 */}
                    <div className="flex flex-wrap justify-center gap-x-2 gap-y-4 mb-10">
                        {guests.map((guest) => (
                            <div key={guest.id} className="text-center w-[4.06rem] lg:w-50">
                                {/* 嘉宾头像占位符 */}
                                <div className="w-[3.63rem] h-[3.63rem] lg:w-20 lg:h-20 rounded-full mx-auto mb-2 flex items-center justify-center">
                                    <img src={guest.avatar} alt={guest.name} className="w-full h-full object-cover rounded-full" />
                                </div>
                                {/* 嘉宾姓名 */}
                                <div className="text-white font-bold text-[0.56rem] lg:text-xs leading-tight mb-1 whitespace-nowrap">{guest.name}</div>
                                {/* 嘉宾职位 */}
                                <div className="text-[#C1FF72] text-[0.44rem] lg:text-xs mx-auto leading-tight">{guest.position}</div>
                            </div>
                        ))}
                    </div>

                    {/* 中央大圆形占位符 */}
                    <div className="text-center mb-2">
                        <div className="w-full h-auto mx-auto flex items-center justify-center">
                            <img src="/static/images/Messi.png" alt="MOVA" className="w-full h-full" />
                        </div>
                    </div>

                    {/* 底部抽奖信息 */}
                    <div className="text-center">
                        <div className="text-[#C1FF72] font-bold text-base leading-tight">
                            <p>{t('event.raffleTitle')}</p>
                            <p>{t('event.raffleSubtitle')}</p>
                        </div>
                    </div>

                    {/* 主标题 */}
                    <div className="text-center my-8">
                        <h1 className="text-xl font-bold text-white mb-4 flex flex-row items-center justify-center gap-2">
                            <span className="text-white">{t('event.aboutGala')}</span>
                            <img src="/static/mova-logo.svg" alt="MOVA" width={129} height={48} />
                            <span className="text-white">{t('event.gala')}</span>
                        </h1>
                        <p className="text-xs text-white text-center max-w-3xl mx-auto">
                            {t('event.invitationText')}
                        </p>
                    </div>

                    {/* 介绍文本 */}
                    <div className="text-white text-xs leading-relaxed mb-4 mx-auto">
                        <p className="mb-6 text-center">
                            {t('event.introParagraph1')}
                        </p>
                        <p className="mb-6 text-center">
                            {t('event.introParagraph2')}
                        </p>
                        <p className="mb-6 text-center">
                            {t('event.eveningEssence')}
                        </p>
                    </div>

                    {/* 夜晚精髓部分 */}
                    <div className="text-center mb-4">

                        {/* 分隔按钮 */}
                        <div className="inline-block bg-[#C1FF72] text-black px-6 py-1 rounded-full font-bold text-sm mb-6">
                            {t('event.savorInnovation')}
                        </div>

                        {/* SAVOR INNOVATION 部分 */}
                        <div className="mb-6">
                            <h3 className="text-[#C1FF72] text-sm font-bold mb-2">{t('event.savorInnovationTitle')}</h3>
                            <p className="text-white text-xs leading-relaxed">
                                {t('event.savorInnovationDesc')}
                            </p>
                        </div>

                        {/* SIP SPIRIT 部分 */}
                        <div className="mb-6">
                            <h3 className="text-[#C1FF72] text-sm font-bold mb-2">{t('event.sipSpiritTitle')}</h3>
                            <p className="text-white text-xs leading-relaxed">
                                {t('event.sipSpiritDesc')}
                            </p>
                        </div>

                        <div className="inline-block bg-[#C1FF72] text-black px-6 py-1 rounded-full font-bold text-sm mb-6">
                            {t('event.eventHighlights')}
                        </div>

                        <div className="space-y-4 max-w-4xl mx-auto pb-10">
                            {/* THE MAINNET MOMENT */}
                            <div className="border border-[#C1FF72] rounded-[20px] overflow-hidden">
                                <div className="bg-[#C1FF724D] px-4 py-2">
                                    <h3 className="text-white font-bold text-sm">{t('event.mainnetMoment')}</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-white text-xs">{t('event.mainnetMomentDesc')}</p>
                                </div>
                            </div>

                            {/* FIRESIDE CHATS */}
                            <div className="border border-[#C1FF72] rounded-[20px] overflow-hidden">
                                <div className="bg-[#C1FF724D] px-4 py-2">
                                    <h3 className="text-white font-bold text-sm">{t('event.firesideChats')}</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-white text-xs">{t('event.firesideChatsDesc')}</p>
                                </div>
                            </div>

                            {/* INTERACTIVE TECH DEMOS */}
                            <div className="border border-[#C1FF72] rounded-[20px] overflow-hidden">
                                <div className="bg-[#C1FF724D] px-4 py-2">
                                    <h3 className="text-white font-bold text-sm">{t('event.interactiveTechDemos')}</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-white text-xs">{t('event.interactiveTechDemosDesc')}</p>
                                </div>
                            </div>

                            {/* GOURMET CULINARY EXPERIENCE */}
                            <div className="border border-[#C1FF72] rounded-[20px] overflow-hidden">
                                <div className="bg-[#C1FF724D] px-4 py-2">
                                    <h3 className="text-white font-bold text-sm">{t('event.gourmetCulinary')}</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-white text-xs">{t('event.gourmetCulinaryDesc')}</p>
                                </div>
                            </div>

                            {/* SIGNATURE COCKTAIL BAR */}
                            <div className="border border-[#C1FF72] rounded-[20px] overflow-hidden">
                                <div className="bg-[#C1FF724D] px-4 py-2">
                                    <h3 className="text-white font-bold text-sm">{t('event.signatureCocktail')}</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-white text-xs">{t('event.signatureCocktailDesc')}</p>
                                </div>
                            </div>

                            {/* NETWORKING SOIRÉE */}
                            <div className="border border-[#C1FF72] rounded-[20px] overflow-hidden">
                                <div className="bg-[#C1FF724D] px-4 py-2">
                                    <h3 className="text-white font-bold text-sm">{t('event.networkingSoiree')}</h3>
                                </div>
                                <div className="px-4 py-3">
                                    <p className="text-white text-xs">{t('event.networkingSoireeDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full h-10 bg-[#C1FF72]"></footer>
        </div>
    );
}

export default function Home() {
    return (
        <IntlProvider>
            <HomeContent />
        </IntlProvider>
    );
} 