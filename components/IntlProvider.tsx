'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { useTranslations } from 'next-intl';

type Locale = 'en' | 'zh-TW';

interface IntlContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const IntlContext = createContext<IntlContextType | undefined>(undefined);

export function IntlProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');
  
  // 简单的翻译函数
  const t = (key: string): string => {
    const messages = locale === 'zh-TW' ? zhMessages : enMessages;
    return key.split('.').reduce((obj, k) => obj?.[k], messages) || key;
  };

  return (
    <IntlContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </IntlContext.Provider>
  );
}

export function useIntl() {
  const context = useContext(IntlContext);
  if (!context) {
    throw new Error('useIntl must be used within an IntlProvider');
  }
  return context;
}

// 翻译消息
const enMessages = {
  common: {
    loading: 'Loading...',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    confirm: 'Confirm',
    language: 'Language',
    checkIn: 'Check in',
    scanQr: 'Scan QR Code',
    cameraDenied: 'Camera access denied',
    cameraHelpTitle: 'Enable Camera Access',
    cameraHelpBody: 'To scan the QR code, please enable camera access for your browser.',
    cameraHelpStepsIOS: 'iOS Safari: Settings > Safari > Camera > Allow for this site',
    cameraHelpStepsAndroid: 'Android Chrome: Site settings > Permissions > Camera > Allow',
    tryAgain: 'Try again',
    signTimeNotReached: 'Check-in time not reached',
    geoDenied: 'Location access denied',
    geoHelpTitle: 'Enable Location Access',
    geoHelpBody: 'To complete check-in, please enable location access for your browser.',
    geoHelpStepsIOS: 'iOS Safari: Settings > Privacy & Security > Location Services > Safari Websites > While Using',
    geoHelpStepsAndroid: 'Android Chrome: Site settings > Permissions > Location > Allow',
    retry: 'Retry',
    sending: 'Sending...',
    sentSuccess: 'Check-in submitted!',
    sentFailed: 'Check-in failed, please try again',
    checkInInviteLimitTip: 'At least 2 invites are required to check in'
  },
  form: {
    name: 'Name',
    xName: 'X Name',
    walletAddress: 'Wallet Address',
    inviteId: 'Invite ID',
    namePlaceholder: 'Name',
    xNamePlaceholder: 'Twitter / WeChat',
    walletAddressPlaceholder: 'Wallet address',
    required: 'This field is required',
    requiredName: 'Please enter your name',
    requiredXName: 'Please enter your Twitter or WeChat',
    requiredWalletAddress: 'Please enter your wallet address',
    invalidFormat: 'Invalid wallet address format'
  },
  poster: {
    title: 'MOVA Poster Generator',
    description: 'Generate your personalized MOVA poster',
    generate: 'GENERATE YOUR EXCLUSIVE POSTER',
    viewMyPoster: 'VIEW MY POSTER',
    download: 'Download',
    share: 'Share',
    success: 'Poster generated successfully!',
    error: 'Failed to generate poster',
    loading: 'Generating poster...',
    viewingPoster: 'Viewing your poster...',
    generatingPoster: 'Generating your exclusive poster...',
    viewYourPoster: 'View Your Poster',
    posterGeneratedSuccess: '🎉 Poster Generated Successfully!',
    downloadPoster: 'Download Poster',
    close: 'Close',
    longPressTip: 'You can also long press the image to save to your photo album',
    downloadSuccess: 'Poster downloaded!',
    downloadSuccessDesktop: 'Poster downloaded to your Downloads folder!',
    downloadFailed: 'Download failed, please try again',
    mobileDownloadTip: 'Poster downloaded!\n\nOn iPhone: Check the "Files" app for downloaded files\nOn Android: Check the "Downloads" folder\n\nIf not found, try long pressing the image and select "Save Image"'
  },
  event: {
    mainnetActivation: 'Mova Mainnet Activation',
    savorInnovation: 'SAVOR INNOVATION • SIP SPIRIT',
    eventDate: 'Event Date',
    eventDateValue: '29th AUG 2025 • 8:00PM',
    location: 'Location',
    locationValue: 'Pier 1929, HONG KONG',
    locationAddress: '2F, Wan Chai Ferry Pier, Wan Chai Hong Kong',
    proposedGuest: 'PROPOSED GUEST',
    raffleTitle: 'ON-SITE RAFFLE FOR LIMITED-EDITION',
    raffleSubtitle: 'MESSI CUSTOM SNEAKERS',
    aboutGala: 'ABOUT',
    gala: 'GALA',
    invitationText: 'You are cordially invited to the dawn of a new era.',
    introParagraph1: 'Mark your calendars for an evening where the digital future materializes in the most tangible and exhilarating way. The Mova Gala is not merely a launch party; it is the formal debut of the Mova Mainnet, a pivotal moment where vision becomes infrastructure and code becomes community.',
    introParagraph2: 'This is where the architects, the visionaries, and the pioneers of Web3 will gather to celebrate a monumental achievement: the activation of a blockchain built for speed, security, and seamless evolution.',
    eveningEssence: 'The Evening\'s Essence:',
    eventHighlights: 'EVENT HIGHLIGHTS',
    savorInnovationTitle: 'SAVOR INNOVATION',
    savorInnovationDesc: 'Engage in thought-provoking conversations with the brilliant minds behind Mova. Witness live demonstrations of its groundbreaking capabilities. Feel the pulse of a network coming to life, and taste the possibilities of decentralized applications that will redefine industries. We will savor the intricate flavors of technological mastery and the promise of a decentralized future.',
    sipSpiritTitle: 'SIP SPIRIT',
    sipSpiritDesc: 'Raise a glass to the spirit of collaboration, ambition, and relentless innovation that brought Mova to life. This is a toast to the community—the developers, validators, and early adopters whose belief fueled this journey. In an atmosphere of refined celebration, we will sip crafted cocktails and connect, forging the relationships that will propel the Mova ecosystem forward.',
    mainnetMoment: 'THE MAINNET MOMENT',
    mainnetMomentDesc: 'A ceremonial countdown and activation of the Mova blockchain—a moment to be remembered.',
    firesideChats: 'FIRESIDE CHATS',
    firesideChatsDesc: 'Intimate discussions with Mova\'s core founders on the philosophy, technology, and future roadmap.',
    interactiveTechDemos: 'INTERACTIVE TECH DEMOS',
    interactiveTechDemosDesc: 'Experience the power of Mova firsthand through live, interactive showcases of its first dApps.',
    gourmetCulinary: 'GOURMET CULINARY EXPERIENCE',
    gourmetCulinaryDesc: 'A curated menu designed to tantalize the palate, mirroring the innovation we celebrate.',
    signatureCocktail: 'SIGNATURE COCKTAIL BAR',
    signatureCocktailDesc: 'Bespoke cocktails inspired by the themes of blockchain, cryptography, and community.',
    networkingSoiree: 'NETWORKING SOIRÉE',
    networkingSoireeDesc: 'Connect with fellow investors, builders, and creators in an elegant and inspiring setting.'
  },
  guests: {
    title: 'Featured Guests',
    ceo: 'CEO of Mova',
    foundationFounder: 'Foundation Founder of Join the Planet',
    ctoPalmGlobal: 'CTO of Palm Global',
    coFounderAquaLabs: 'Co-Founder of Aqua Labs',
    founderCeoMinax: 'Founder & CEO of Minax Exchange',
    representativeWorldLiberty: 'Representative of World Liberty',
    representativeStandardChartered: 'Representative of Standard Chartered Bank',
    representativePublicInvestment: 'Representative of Public Investment Fund'
  },
  stats: {
    invitedCount: 'Invited Count',
    movaTokens: 'MOVA Tokens',
    totalInvites: 'Total Invites',
    totalTokens: 'Total Tokens',
    peopleInvited: 'People have already been invited through your link',
    usdtWorth: 'USDT-worth $MOVA at the conference venue by presenting this page',
    earnMova: 'EARN $MOVA WORTH UP TO 1000 USDT',
    yourInviteLink: 'Your Invite Link',
    copyInviteLink: 'COPY',
    copySuccess: 'Copied invite link!',
    copyFailed: 'Copy failed, please try again'
  },
  auth: {
    signIn: 'Sign In',
    signOut: 'Sign Out',
    signUp: 'Sign Up',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot Password?',
    rememberMe: 'Remember Me'
  },
  errors: {
    networkError: 'Network error, please try again',
    serverError: 'Server error, please try again later',
    unauthorized: 'Unauthorized access',
    notFound: 'Page not found',
    invalidInviteId: 'Invalid invite ID',
    userNotLoggedIn: 'User not logged in'
  }
};

const zhMessages = {
  common: {
    loading: '載入中...',
    submit: '提交',
    cancel: '取消',
    save: '儲存',
    edit: '編輯',
    delete: '刪除',
    back: '返回',
    next: '下一步',
    previous: '上一步',
    close: '關閉',
    confirm: '確認',
    language: '語言',
    checkIn: '現場簽到',
    scanQr: '掃描二維碼',
    cameraDenied: '相機權限被拒絕',
    cameraHelpTitle: '啟用相機權限',
    cameraHelpBody: '要掃描二維碼，請為您的瀏覽器啟用相機權限。',
    cameraHelpStepsIOS: 'iOS Safari：設定 > Safari > 相機 > 允許此網站',
    cameraHelpStepsAndroid: 'Android Chrome：網站設定 > 權限 > 相機 > 允許',
    tryAgain: '重試',
    signTimeNotReached: '簽到時間未到',
    geoDenied: '定位權限被拒絕',
    geoHelpTitle: '啟用定位權限',
    geoHelpBody: '完成簽到需要定位，請為您的瀏覽器啟用定位權限。',
    geoHelpStepsIOS: 'iOS Safari：設定 > 隱私與安全性 > 定位服務 > Safari 網站 > 使用期間',
    geoHelpStepsAndroid: 'Android Chrome：網站設定 > 權限 > 位置 > 允許',
    retry: '重試',
    sending: '正在提交...',
    sentSuccess: '簽到已提交！',
    sentFailed: '簽到失敗，請重試',
    checkInInviteLimitTip: '邀請人數不少於 2 人方可簽到'
  },
  form: {
    name: '姓名',
    xName: 'X 用戶名',
    walletAddress: '錢包地址',
    inviteId: '邀請ID',
    namePlaceholder: '請輸入您的姓名',
    xNamePlaceholder: '請輸入您的Twitter或微信用戶名',
    walletAddressPlaceholder: '請輸入您的錢包地址',
    required: '此欄位為必填項',
    requiredName: '請輸入您的姓名',
    requiredXName: '請輸入您的Twitter或微信用戶名',
    requiredWalletAddress: '請輸入您的錢包地址',
    invalidFormat: '錢包地址格式無效'
  },
  poster: {
    title: 'MOVA 海報生成器',
    description: '生成您的個性化MOVA海報',
    generate: '生成專屬海報',
    viewMyPoster: '查看我的海報',
    download: '下載',
    share: '分享',
    success: '海報生成成功！',
    error: '海報生成失敗',
    loading: '正在生成海報...',
    viewingPoster: '正在查看您的海報...',
    generatingPoster: '正在生成您的專屬海報...',
    viewYourPoster: '查看您的海報',
    posterGeneratedSuccess: '🎉 海報生成成功！',
    downloadPoster: '下載海報',
    close: '關閉',
    longPressTip: '您也可以長按圖片保存到相冊',
    downloadSuccess: '海報已下載！',
    downloadSuccessDesktop: '海報已下載到您的下載資料夾！',
    downloadFailed: '下載失敗，請重試',
    mobileDownloadTip: '海報已下載！\n\niPhone：檢查「檔案」應用程式中的下載檔案\nAndroid：檢查「下載」資料夾\n\n如果找不到，請嘗試長按圖片並選擇「儲存圖片」'
  },
  event: {
    mainnetActivation: 'Mova 主網啟動',
    savorInnovation: '品味創新 • 品味精神',
    eventDate: '活動日期',
    eventDateValue: '2025年8月29日 • 晚上8:00',
    location: '地點',
    locationValue: '香港灣仔碼頭1929號',
    locationAddress: '香港灣仔灣仔碼頭2樓',
    proposedGuest: '特邀嘉賓',
    raffleTitle: '現場抽獎限量版',
    raffleSubtitle: '梅西定制運動鞋',
    aboutGala: '關於',
    gala: '晚宴',
    invitationText: '誠摯邀請您見證新時代的曙光。',
    introParagraph1: '請在您的日曆上標記這個夜晚，數位未來將以最具體和最令人興奮的方式實現。Mova晚宴不僅僅是一個發布派對；它是Mova主網的正式首秀，是願景成為基礎設施、代碼成為社區的關鍵時刻。',
    introParagraph2: '這裡是Web3的建築師、遠見者和先驅者聚集慶祝重大成就的地方：啟動一個為速度、安全性和無縫演進而建的區塊鏈。',
    eveningEssence: '夜晚的精髓：',
    eventHighlights: '活動亮點',
    savorInnovationTitle: '品味創新',
    savorInnovationDesc: '與Mova背後的傑出頭腦進行發人深省的對話。見證其突破性能力的現場演示。感受網絡誕生的脈搏，品味將重新定義行業的去中心化應用的可能性。我們將品味技術掌握的精緻風味和去中心化未來的承諾。',
    sipSpiritTitle: '品味精神',
    sipSpiritDesc: '為讓Mova誕生的協作、抱負和無情創新的精神舉杯。這是對社區的致敬——開發者、驗證者和早期採用者，他們的信念推動了這段旅程。在精緻慶祝的氛圍中，我們將品嚐精心調製的雞尾酒並建立聯繫，打造將推動Mova生態系統前進的關係。',
    mainnetMoment: '主網時刻',
    mainnetMomentDesc: 'Mova區塊鏈的儀式性倒計時和啟動——值得銘記的時刻。',
    firesideChats: '爐邊談話',
    firesideChatsDesc: '與Mova核心創始人就哲學、技術和未來路線圖進行親密討論。',
    interactiveTechDemos: '互動技術演示',
    interactiveTechDemosDesc: '通過其首批dApp的現場互動展示，親身體驗Mova的力量。',
    gourmetCulinary: '美食烹飪體驗',
    gourmetCulinaryDesc: '精心策劃的菜單旨在挑逗味蕾，反映我們慶祝的創新。',
    signatureCocktail: '特色雞尾酒吧',
    signatureCocktailDesc: '受區塊鏈、密碼學和社區主題啟發的定制雞尾酒。',
    networkingSoiree: '社交晚宴',
    networkingSoireeDesc: '在優雅和鼓舞人心的環境中與投資者、建設者和創作者建立聯繫。'
  },
  guests: {
    title: '特邀嘉賓',
    ceo: 'Mova 執行長',
    foundationFounder: 'Join the Planet 基金會創始人',
    ctoPalmGlobal: 'Palm Global 技術長',
    coFounderAquaLabs: 'Aqua Labs 共同創始人',
    founderCeoMinax: 'Minax 交易所創始人兼執行長',
    representativeWorldLiberty: '世界自由代表',
    representativeStandardChartered: '渣打銀行代表',
    representativePublicInvestment: '公共投資基金代表'
  },
  stats: {
    invitedCount: '邀請數量',
    movaTokens: 'MOVA 代幣',
    totalInvites: '總邀請數',
    totalTokens: '總代幣數',
    peopleInvited: '已通過您的連結邀請的人數',
    usdtWorth: '在會議現場出示此頁面可獲得價值 USDT 的 $MOVA',
    earnMova: '賺取價值高達 1000 USDT 的 $MOVA',
    yourInviteLink: '您的邀請連結',
    copyInviteLink: '複製',
    copySuccess: '已複製邀請連結！',
    copyFailed: '複製失敗，請重試'
  },
  auth: {
    signIn: '登入',
    signOut: '登出',
    signUp: '註冊',
    email: '信箱',
    password: '密碼',
    forgotPassword: '忘記密碼？',
    rememberMe: '記住我'
  },
  errors: {
    networkError: '網路錯誤，請重試',
    serverError: '伺服器錯誤，請稍後重試',
    unauthorized: '未授權存取',
    notFound: '頁面未找到',
    invalidInviteId: '無效的邀請ID',
    userNotLoggedIn: '用戶未登入'
  }
}; 