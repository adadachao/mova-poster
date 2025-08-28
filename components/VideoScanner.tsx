"use client";

import {useEffect, useRef} from 'react';
import jsQR from 'jsqr';

export default function VideoScanner({onResult, onError, onPermanentDenied}:{onResult:(code:string)=>void; onError:()=>void; onPermanentDenied?:()=>void}) {
  const videoRef = useRef<HTMLVideoElement|null>(null);
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>(undefined);
  const stoppedRef = useRef(false);

  useEffect(()=>{
    let stream: MediaStream|undefined;
    const start = async () => {
      try {
        // Check permission state if available
        try {
          // @ts-ignore
          if (navigator.permissions && navigator.permissions.query) {
            // @ts-ignore
            const status = await navigator.permissions.query({name: 'camera' as PermissionName});
            if (status.state === 'denied') {
              onPermanentDenied && onPermanentDenied();
              return;
            }
          }
        } catch {}

        stream = await navigator.mediaDevices.getUserMedia({video: {facingMode: {ideal: 'environment'}}});
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        tick();
      } catch (e:any) {
        if (e?.name === 'NotAllowedError') {
          onPermanentDenied && onPermanentDenied();
        } else {
          onError();
        }
      }
    };
    const tick = () => {
      if (stoppedRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w && h) {
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h);
            const img = ctx.getImageData(0, 0, w, h);
            const code = jsQR(img.data, w, h);
            if (code?.data) {
              stoppedRef.current = true;
              cleanup();
              onResult(code.data);
              return;
            }
          }
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    const cleanup = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (stream) stream.getTracks().forEach(t=>t.stop());
    };
    start();
    return ()=>{ stoppedRef.current = true; cleanup(); };
  }, [onResult, onError, onPermanentDenied]);

  return (
    <div className="w-full">
      <video ref={videoRef} className="w-full rounded-lg" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 