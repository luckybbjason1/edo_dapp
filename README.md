<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>汇率转换工具 (KRW/CNY/USDT)</title>
    
    <!-- 1. Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap" rel="stylesheet">
    
    <!-- 2. Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: {
                        sans: ['Inter', 'Noto Sans SC', 'sans-serif'],
                    },
                    colors: {
                        slate: {
                            850: '#151f32', // Custom dark shade
                        }
                    }
                }
            }
        }
    </script>

    <!-- 3. React & ReactDOM & Babel (通过 CDN 加载) -->
    <script type="importmap">
        {
            "imports": {
                "react": "https://esm.sh/react@18.2.0",
                "react-dom/client": "https://esm.sh/react-dom@18.2.0/client"
            }
        }
    </script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 font-sans">

    <!-- React 挂载点 -->
    <div id="root" class="w-full max-w-2xl"></div>

    <!-- 应用程序逻辑 -->
    <script type="text/babel" data-type="module">
        import React, { useState, useEffect } from 'react';
        import { createRoot } from 'react-dom/client';

        // ==========================================
        // File: types.ts
        // ==========================================
        const Currency = {
            KRW: 'KRW',
            CNY: 'CNY',
            USDT: 'USDT'
        };

        // ==========================================
        // File: components/icons/*.tsx (Icon Components)
        // ==========================================
        const KrwIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-6 h-6 text-slate-300">
                <path d="M6 3l3 8 4-8" /><path d="M6 21l3-8 4 8" /><path d="M2 12h20" />
            </svg>
        );

        const CnyIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-6 h-6 text-slate-300">
                <path d="M6 3h12" /><path d="M6 8h12" /><path d="M12 3v18" /><path d="M6 21l12-18" />
            </svg>
        );

        const UsdtIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-6 h-6 text-green-400">
                <path d="M12 2v20" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
        );

        const SettingsIcon = () => (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-4 h-4 mr-2">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
            </svg>
        );
        
        const ExternalLinkIcon = () => (
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="w-4 h-4 ml-2">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
            </svg>
        );

        // ==========================================
        // File: CurrencyInput.tsx
        // ==========================================
        const CurrencyInput = ({ currency, amount, onAmountChange }) => {
            const getIcon = () => {
                switch (currency) {
                    case Currency.KRW: return <KrwIcon />;
                    case Currency.CNY: return <CnyIcon />;
                    case Currency.USDT: return <UsdtIcon />;
                    default: return null;
                }
            };

            const getLabel = () => {
                switch (currency) {
                    case Currency.KRW: return '韩元';
                    case Currency.CNY: return '人民币';
                    case Currency.USDT: return '泰达币';
                    default: return '';
                }
            };

            return (
                <div className="relative group">
                    <div className="flex items-center justify-between h-24 bg-slate-900 rounded-xl px-6 border border-slate-700 transition-all duration-200 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                        {/* Left Side: Icon & Label */}
                        <div className="flex items-center gap-3 select-none">
                            <div className="p-2 bg-slate-800 rounded-full shadow-sm">
                                {getIcon()}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-slate-100 tracking-wide">{currency}</span>
                                <span className="text-xs text-slate-400 font-medium">{getLabel()}</span>
                            </div>
                        </div>

                        {/* Right Side: Input */}
                        <input
                            type="text" // Using text to handle decimals better than number type
                            inputMode="decimal"
                            value={amount}
                            onChange={(e) => onAmountChange(currency, e.target.value)}
                            placeholder="0"
                            className="bg-transparent text-right text-3xl font-bold text-slate-100 outline-none w-full ml-4 placeholder-slate-600"
                        />
                    </div>
                </div>
            );
        };

        // ==========================================
        // File: RateSettings.tsx
        // ==========================================
        const RateSettings = ({ rates, setRates, fee, setFee }) => {
            const handleRateChange = (key, value) => {
                setRates(prev => ({ ...prev, [key]: parseFloat(value) || 0 }));
            };

            return (
                <div className="p-6 bg-slate-850 rounded-xl border border-slate-700/50 space-y-4 mt-4">
                    <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">汇率配置</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* USDT -> KRW */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 block">USDT 对 韩元 (KRW)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">₩</span>
                                <input
                                    type="number"
                                    value={rates.USDT_KRW}
                                    onChange={(e) => handleRateChange('USDT_KRW', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* USDT -> CNY */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 block">USDT 对 人民币 (CNY)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">¥</span>
                                <input
                                    type="number"
                                    value={rates.USDT_CNY}
                                    onChange={(e) => handleRateChange('USDT_CNY', e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-8 pr-3 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        {/* Fee */}
                        <div className="space-y-2">
                            <label className="text-xs text-slate-400 block">交易手续费 (%)</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={fee}
                                    onChange={(e) => setFee(parseFloat(e.target.value) || 0)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-3 pr-8 text-sm text-slate-100 focus:border-cyan-500 outline-none transition-colors"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">%</span>
                            </div>
                        </div>
                    </div>
                </div>
            );
        };

        // ==========================================
        // File: App.tsx
        // ==========================================
        const App = () => {
            // 状态管理
            const [rates, setRates] = useState({ USDT_KRW: 1380, USDT_CNY: 7.3 });
            const [fee, setFee] = useState(0.5); // 0.5%
            const [amounts, setAmounts] = useState({ KRW: '', CNY: '', USDT: '' });
            const [calculatedFee, setCalculatedFee] = useState(0); // 以 USDT 计
            const [settingsVisible, setSettingsVisible] = useState(false);

            // 核心计算逻辑
            const handleAmountChange = (sourceCurrency, valueStr) => {
                // 1. 允许输入空值
                if (valueStr === '' || isNaN(Number(valueStr))) {
                    setAmounts({ KRW: valueStr === '' ? '' : valueStr, CNY: '', USDT: '' });
                    setCalculatedFee(0);
                    // 如果不是空字符串但无效数字，保持输入以便用户修正，其他清空
                    if(valueStr !== '') setAmounts(prev => ({...prev, [sourceCurrency]: valueStr, KRW:'', CNY:'', USDT:''}));
                    else setAmounts({ KRW: '', CNY: '', USDT: '' });
                    return;
                }

                // 2. 过滤非法字符（允许一个小数点）
                const regex = /^\d*\.?\d*$/;
                if (!regex.test(valueStr)) return;

                const inputValue = parseFloat(valueStr);
                if (inputValue === 0) {
                     setAmounts({ KRW: valueStr, CNY: '0', USDT: '0' });
                     setCalculatedFee(0);
                     return;
                }

                // 3. 基准计算 (转为 Gross USDT)
                let baseUsdtBeforeFee = 0;
                if (sourceCurrency === Currency.KRW) {
                    baseUsdtBeforeFee = inputValue / rates.USDT_KRW;
                } else if (sourceCurrency === Currency.CNY) {
                    baseUsdtBeforeFee = inputValue / rates.USDT_CNY;
                } else {
                    baseUsdtBeforeFee = inputValue;
                }

                // 4. 计算手续费
                const feeInUsdt = baseUsdtBeforeFee * (fee / 100);
                setCalculatedFee(feeInUsdt);

                // 5. 扣除手续费后的基准金额 (Net USDT)
                const baseUsdtAfterFee = baseUsdtBeforeFee - feeInUsdt;

                // 6. 反向换算 (Net Amounts)
                // 注意：为了用户体验，输入框本身的数值(Source)我们通常不扣除手续费显示(保持用户输入)，
                // 但根据需求"update all three"，这里我们计算出所有货币的净得值。
                // 为了避免输入框跳变（输入100变成99），我们对Source currency保留原输入字符串，
                // 对Target currencies使用计算后的值。
                
                const newAmounts = {
                    KRW: sourceCurrency === Currency.KRW ? valueStr : (baseUsdtAfterFee * rates.USDT_KRW).toFixed(0),
                    CNY: sourceCurrency === Currency.CNY ? valueStr : (baseUsdtAfterFee * rates.USDT_CNY).toFixed(2),
                    USDT: sourceCurrency === Currency.USDT ? valueStr : baseUsdtAfterFee.toFixed(4)
                };

                setAmounts(newAmounts);
            };

            // 格式化显示的费率
            const formatFee = (val) => {
                return val > 0 ? val.toFixed(4) : '0';
            };

            return (
                <div className="space-y-8">
                    
                    {/* 标题区域 */}
                    <div className="text-center space-y-2">
                        <h1 className="text-4xl font-bold text-slate-100 tracking-tight drop-shadow-lg">
                            汇率转换工具
                        </h1>
                        <p className="text-slate-400 font-medium">
                            在 <span className="text-slate-300">韩元</span>、
                            <span className="text-slate-300">人民币</span> 和 
                            <span className="text-cyan-400"> USDT</span> 之间轻松转换
                        </p>
                        
                        {/* 外部链接按钮 (Naver) */}
                        <div className="pt-2">
                            <a 
                                href="https://m.search.naver.com/search.naver?sm=mtp_sug.top&where=m&query=%ED%85%8C%EB%8D%94%EC%8B%9C%EC%84%B8&ackey=sip1uk14&acq=xpej&acr=3&qdt=0" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-medium rounded-full transition-colors border border-green-500/30 hover:border-green-500/50"
                            >
                                查看实时 Tether (USDT) 价格 - Naver
                                <ExternalLinkIcon />
                            </a>
                        </div>
                    </div>

                    {/* 计算器卡片 */}
                    <div className="bg-slate-800 p-1 rounded-2xl shadow-2xl shadow-black/50">
                        <div className="bg-slate-800 rounded-xl p-6 space-y-4">
                            
                            {/* 输入区域 */}
                            <div className="space-y-4">
                                <CurrencyInput 
                                    currency={Currency.KRW} 
                                    amount={amounts.KRW} 
                                    onAmountChange={handleAmountChange} 
                                />
                                <CurrencyInput 
                                    currency={Currency.CNY} 
                                    amount={amounts.CNY} 
                                    onAmountChange={handleAmountChange} 
                                />
                                <CurrencyInput 
                                    currency={Currency.USDT} 
                                    amount={amounts.USDT} 
                                    onAmountChange={handleAmountChange} 
                                />
                            </div>

                            {/* 信息显示区 */}
                            <div className="px-2 py-3 space-y-2">
                                {/* 手续费 */}
                                <div className={`flex justify-between items-center text-sm transition-opacity duration-300 ${calculatedFee > 0 ? 'opacity-100' : 'opacity-0'}`}>
                                    <span className="text-slate-400">预估手续费 ({fee}%)</span>
                                    <span className="font-mono text-red-400 font-bold">
                                        -{formatFee(calculatedFee)} USDT
                                    </span>
                                </div>
                                
                                {/* 当前汇率简报 */}
                                <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-700/50">
                                    <span>当前参考汇率:</span>
                                    <span className="font-mono">
                                        1 USDT ≈ {rates.USDT_KRW} KRW / {rates.USDT_CNY} CNY
                                    </span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* 设置区域 */}
                    <div className="w-full">
                        <button 
                            onClick={() => setSettingsVisible(!settingsVisible)}
                            className="flex items-center justify-center w-full py-3 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium group"
                        >
                            <SettingsIcon />
                            {settingsVisible ? "收起设置" : "自定义汇率与手续费"}
                            <span className={`ml-2 transition-transform duration-300 ${settingsVisible ? 'rotate-180' : ''}`}>▼</span>
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 ease-in-out ${settingsVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                            <RateSettings 
                                rates={rates} 
                                setRates={setRates} 
                                fee={fee} 
                                setFee={setFee} 
                            />
                        </div>
                    </div>

                    {/* 页脚 */}
                    <footer className="text-center text-slate-600 text-xs pb-8">
                        <p>© 2023 Currency Converter. Exchange rates are for reference only.</p>
                    </footer>

                </div>
            );
        };

        // 渲染应用
        const root = createRoot(document.getElementById('root'));
        root.render(<App />);
    </script>
</body>
</html>
