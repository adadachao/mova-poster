'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import { useIntl } from './IntlProvider';

interface PosterGeneratorProps {
  name: string;
  xName: string;  
  walletAddress: string;
  userId?: string; // 添加用户ID用于生成邀请链接
  onGenerated: (dataUrl: string) => void;
  onClose: () => void;
  isViewMyPoster: boolean;
}

export default function PosterGenerator({ name, xName, walletAddress, userId, onGenerated, onClose, isViewMyPoster = false }: PosterGeneratorProps) {
  const { t } = useIntl();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string>('');

  useEffect(() => {
    if (name && xName && walletAddress && !generatedDataUrl) {
      generatePoster();
    }
  }, [name, xName, walletAddress, generatedDataUrl]);

  const generatePoster = async () => {
    if (!canvasRef.current) return;

    setIsGenerating(true);
    setError('');

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // 加载背景图片
      const backgroundImg = new Image();
      backgroundImg.crossOrigin = 'anonymous';
      
      backgroundImg.onload = async () => {
        // 根据背景图片尺寸设置画布
        canvas.width = backgroundImg.naturalWidth;
        canvas.height = backgroundImg.naturalHeight;
        
        // 绘制背景
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height);
        
      
        
        // 绘制动态内容（异步）
        await drawDynamicContent(ctx, canvas.width, canvas.height);
        
        // 生成海报
        const dataUrl = canvas.toDataURL('image/png');
        handlePosterGenerated(dataUrl);
        setIsGenerating(false);
      };

      backgroundImg.onerror = async () => {
        // 如果背景图片加载失败，使用默认尺寸和背景
        canvas.width = 800;
        canvas.height = 1200;
        drawDefaultBackground(ctx, canvas.width, canvas.height);
        await drawDynamicContent(ctx, canvas.width, canvas.height);
        
        const dataUrl = canvas.toDataURL('image/png');
        handlePosterGenerated(dataUrl);
        setIsGenerating(false);
      };

      // 尝试加载背景图片
      backgroundImg.src = '/static/model.png';
    } catch (err) {
      setError('Failed to generate poster');
      setIsGenerating(false);
    }
  };

  const drawDefaultBackground = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 创建渐变背景
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  };



  const drawDynamicContent = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    // 绘制姓名在 INVITE YOU 下方的框内
    ctx.fillStyle = '#C1FF72';
    ctx.font = 'bold 140px Hero, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 绘制姓名在框内居中位置
    ctx.fillText(name, width / 2, height * 0.19 + 40);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 生成邀请链接二维码（移动到 Telegram 位置）
    if (userId) {
      const inviteUrl = `${window.location.origin}?invite_id=${userId}`;
      await drawQRCode(ctx, width * 0.25, height * 0.32 + 80, inviteUrl, 'Register');
    } else {
      drawQRPlaceholder(ctx, width * 0.25, height * 0.32 + 80, 'Register');
    }
  };

  const drawQRPlaceholder = (ctx: CanvasRenderingContext2D, x: number, y: number, label: string) => {
    const size = 235;
    
    // 绘制二维码背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - size/2, y - size/2, size, size);
    
    // 绘制二维码边框
    ctx.strokeStyle = '#C1FF72';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - size/2, y - size/2, size, size);
  };

  const drawQRCode = async (ctx: CanvasRenderingContext2D, x: number, y: number, text: string, label: string) => {
    try {
      const qr = await QRCode.toDataURL(text, { 
        errorCorrectionLevel: 'H', 
        margin: 2,
        width: 235,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return new Promise<void>((resolve) => {
        const qrImg = new Image();
        qrImg.onload = () => {
          const size = 235;
          ctx.drawImage(qrImg, x - size/2, y - size/2, size, size);
          resolve();
        };
        qrImg.src = qr;
      });
    } catch (err) {
      console.error('Failed to generate QR code:', err);
      drawQRPlaceholder(ctx, x, y, label); // Fallback to placeholder on error
    }
  };

  const downloadPoster = async (dataUrl: string) => {
    try {
      // 检测是否为移动设备
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        // 移动端：尝试使用 Share API（iOS Safari 支持）
        if (navigator.share && navigator.canShare) {
          try {
            // 将 dataURL 转换为 blob
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], `mova-poster-${Date.now()}.png`, { type: 'image/png' });
            
            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: 'MOVA Poster Generated',
                text: 'Check out my exclusive invitation poster',
                files: [file]
              });
              toast.success(t('poster.downloadSuccess'));
              return;
            }
          } catch (shareError) {
            console.log('Share API not supported or failed, falling back to download');
          }
        }
        
        // 备用方案：创建下载链接
        const link = document.createElement('a');
        link.download = `mova-poster-${Date.now()}.png`;
        
        // 在移动端，使用 blob URL
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        
        link.href = blobUrl;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // 清理 blob URL
        setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        
        // 显示提示信息
        toast.success(t('poster.mobileDownloadTip'));
      } else {
        // 桌面端：使用传统下载方式
        const link = document.createElement('a');
        link.download = `mova-poster-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(t('poster.downloadSuccessDesktop'));
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error(t('poster.downloadFailed'));
    }
  };

  const handlePosterGenerated = (dataUrl: string) => {
    onGenerated(dataUrl);
    setGeneratedDataUrl(dataUrl);
  };

  return (
    <div className="w-full">
      {isGenerating && (
        <div className="text-center py-8">
          <div className="border-2 border-[#C1FF72]/30 border-t-[#C1FF72] rounded-full w-8 h-8 animate-spin mx-auto mb-4"></div>
          <p className="text-[#C1FF72] text-sm">{isViewMyPoster ? t('poster.viewingPoster') : t('poster.generatingPoster')}</p>
        </div>
      )}
      
      {error && (
        <div className="text-center py-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      
      {generatedDataUrl && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => {
            setGeneratedDataUrl('');
            setError('');
            setIsGenerating(false);
            onClose();
          }}
        >
          <div 
            className="bg-[#1a1a2e] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <h3 className="text-[#C1FF72] text-xl font-bold mb-4">{isViewMyPoster ? t('poster.viewYourPoster') : t('poster.posterGeneratedSuccess')}</h3>
              
              <div className="mb-6">
                <img 
                  src={generatedDataUrl} 
                  alt="Generated Poster" 
                  className="w-full h-auto rounded-lg shadow-lg border-2 border-[#C1FF72]/30"
                />
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => downloadPoster(generatedDataUrl)}
                  className="w-full bg-[#C1FF72] text-black px-6 py-3 rounded-full font-semibold hover:bg-[#A8E65A] transition-colors"
                >
                  {t('poster.downloadPoster')}
                </button>
                
                <button
                  onClick={() => {
                    setGeneratedDataUrl('');
                    setError('');
                    setIsGenerating(false);
                    onClose();
                  }}
                  className="w-full bg-transparent border border-[#C1FF72] text-[#C1FF72] px-6 py-3 rounded-full font-semibold hover:bg-[#C1FF72]/10 transition-colors"
                >
                  {t('poster.close')}
                </button>
              </div>
              
              <p className="text-white text-xs mt-4 opacity-70">
                {t('poster.longPressTip')}
              </p>
            </div>
          </div>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="hidden" // 隐藏canvas，只用于生成图片
        width={800}
        height={1200}
      />
    </div>
  );
} 