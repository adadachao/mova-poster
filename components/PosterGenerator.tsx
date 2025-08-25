'use client';

import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';

interface PosterGeneratorProps {
  name: string;
  xName: string;
  wechatName: string;
  walletAddress: string;
  userId?: string; // 添加用户ID用于生成邀请链接
  onGenerated: (dataUrl: string) => void;
  onClose: () => void;
  isViewMyPoster: boolean;
}

export default function PosterGenerator({ name, xName, wechatName, walletAddress, userId, onGenerated, onClose, isViewMyPoster = false }: PosterGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string>('');
  const [generatedDataUrl, setGeneratedDataUrl] = useState<string>('');

  useEffect(() => {
    if (name && (xName || wechatName) && walletAddress && !generatedDataUrl) {
      generatePoster();
    }
  }, [name, xName, wechatName, walletAddress, generatedDataUrl]);

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
    ctx.font = 'bold 160px Hero, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加阴影
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // 绘制姓名在框内居中位置
    ctx.fillText(name, width / 2, height * 0.39);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 生成邀请链接二维码（移动到 Telegram 位置）
    if (userId) {
      const inviteUrl = `${window.location.origin}?invite_id=${userId}`;
      await drawQRCode(ctx, width * 0.25 + 10, height * 0.77 + 25, inviteUrl, 'Register');
    } else {
      drawQRPlaceholder(ctx, width * 0.25 + 10, height * 0.77 + 25, 'Register');
    }
  };

  const drawQRPlaceholder = (ctx: CanvasRenderingContext2D, x: number, y: number, label: string) => {
    const size = 395;
    
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
        width: 395,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      return new Promise<void>((resolve) => {
        const qrImg = new Image();
        qrImg.onload = () => {
          const size = 395;
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
              toast.success('Poster downloaded!');
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
        toast.success('Poster downloaded!\n\nOn iPhone: Check the "Files" app for downloaded files\nOn Android: Check the "Downloads" folder\n\nIf not found, try long pressing the image and select "Save Image"');

        // const newWindow = window.open();
        // if (newWindow) {
        //   newWindow.document.write(`
        //     <!DOCTYPE html>
        //     <html>
        //     <head>
        //       <title>MOVA GALA Poster</title>
        //       <meta name="viewport" content="width=device-width, initial-scale=1.0">
        //       <style>
        //         body {
        //           margin: 0;
        //           padding: 20px;
        //           background: #1a1a2e;
        //           color: #C1FF72;
        //           font-family: Arial, sans-serif;
        //           text-align: center;
        //         }
        //         .container {
        //           max-width: 500px;
        //           margin: 0 auto;
        //         }
        //         img {
        //           max-width: 100%;
        //           height: auto;
        //           border-radius: 12px;
        //           box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        //         }
        //         .instructions {
        //           margin-top: 20px;
        //           padding: 15px;
        //           background: rgba(193, 255, 114, 0.1);
        //           border-radius: 8px;
        //           font-size: 14px;
        //           line-height: 1.5;
        //         }
        //         .close-btn {
        //           margin-top: 20px;
        //           padding: 10px 20px;
        //           background: #C1FF72;
        //           color: #000;
        //           border: none;
        //           border-radius: 20px;
        //           font-weight: bold;
        //           cursor: pointer;
        //         }
        //       </style>
        //     </head>
        //     <body>
        //       <div class="container">
        //         <h2>🎉 Your MOVA GALA Poster</h2>
        //         <img src="${dataUrl}" alt="MOVA GALA Poster">
        //         <div class="instructions">
        //           <strong>To save this poster:</strong><br>
        //           📱 <strong>iPhone/iPad:</strong> Long press the image and select "Save Image"<br>
        //           🤖 <strong>Android:</strong> Long press the image and select "Save image"<br>
        //           💻 <strong>Desktop:</strong> Right-click the image and select "Save image as..."
        //         </div>
        //         <button class="close-btn" onclick="window.close()">Close Window</button>
        //       </div>
        //     </body>
        //     </html>
        //   `);
        //   newWindow.document.close();
        //   toast.success('Poster opened in new window. Long press the image to save!');
        // } else {
        //   // 如果弹窗被阻止，直接显示图片
        //   toast.error('Please allow popups to download the poster');
        // }
      } else {
        // 桌面端：使用传统下载方式
        const link = document.createElement('a');
        link.download = `mova-poster-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Poster downloaded to your Downloads folder!');
      }
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('下载失败，请重试');
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
          <p className="text-[#C1FF72] text-sm">{isViewMyPoster ? 'Viewing your poster...' : 'Generating your exclusive poster...'}</p>
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
              <h3 className="text-[#C1FF72] text-xl font-bold mb-4">{isViewMyPoster ? 'View Your Poster' : '🎉 Poster Generated Successfully!'}</h3>
              
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
                  Download Poster
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
                  Close
                </button>
              </div>
              
              <p className="text-white text-xs mt-4 opacity-70">
                You can also long press the image to save to your photo album
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