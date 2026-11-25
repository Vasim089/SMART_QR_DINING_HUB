import React, { useState, useEffect, useRef } from 'react';

// Exact pixel landmarks on the 1024x1024 centered transparent cutout (venky_cutout.png, shifted +14px)
const SRC_SIZE = 1024;
const CANVAS_SIZE = 512;
const SCALE = CANVAS_SIZE / SRC_SIZE;

const LANDMARKS = {
  mouth: {
    cx: 512,
    topY: 395,
    lipTopY: 400,
    lipBottomY: 422,
    chinEndY: 478,
    leftX: 408,
    innerLeftX: 452,
    innerRightX: 572,
    rightX: 626,
    maxDrop: 20,
  },
  leftEye: { x: 430, y: 274, w: 58, h: 26, skinY: 264, skinH: 10 },
  rightEye: { x: 534, y: 272, w: 62, h: 26, skinY: 262, skinH: 10 },
};

const toCanvasX = (x) => x * SCALE;
const toCanvasY = (y) => y * SCALE;

export function VenkyAvatar({
  size = 'lg',
  isListening = false,
  isSpeaking = false,
  getAudioLevel,
  onClick,
}) {
  const canvasRef = useRef(null);
  const imagesRef = useRef({ idle: null, writing: null, loaded: false });
  const stateRef = useRef({ isListening, isSpeaking, getAudioLevel });
  const [fallbackImg, setFallbackImg] = useState(false);

  stateRef.current = { isListening, isSpeaking, getAudioLevel };

  const isSmall = size === 'sm';
  const sizeClasses = isSmall ? 'w-10 h-10 rounded-full overflow-hidden' : 'w-72 h-72 sm:w-80 sm:h-80';

  // Load transparent centered cutouts into memory for 60fps canvas rendering
  useEffect(() => {
    if (isSmall) return;

    const idleImg = new Image();
    const writingImg = new Image();
    let loadedCount = 0;

    const checkLoaded = () => {
      loadedCount += 1;
      if (loadedCount === 2) {
        imagesRef.current = { idle: idleImg, writing: writingImg, loaded: true };
      }
    };

    idleImg.onload = checkLoaded;
    writingImg.onload = checkLoaded;
    idleImg.onerror = () => setFallbackImg(true);
    writingImg.onerror = () => setFallbackImg(true);

    idleImg.src = '/venky_cutout.png';
    writingImg.src = '/venky_writing_cutout.png';
  }, [isSmall]);

  // 60fps Photorealistic Jaw/Lip Warp, Natural Eyelid Blink & Head Motion Loop
  useEffect(() => {
    if (isSmall || fallbackImg) return;

    let animId;
    let smoothOpen = 0;
    let writingBlend = 0;
    let nextBlinkTime = performance.now() + 2600;
    let blinkProgress = -1;

    const renderFrame = (now) => {
      const canvas = canvasRef.current;
      const { idle, writing, loaded } = imagesRef.current;
      if (!canvas || !loaded || !idle || !writing) {
        animId = requestAnimationFrame(renderFrame);
        return;
      }

      const ctx = canvas.getContext('2d');
      const { isListening: listening, isSpeaking: speaking, getAudioLevel: readLevel } = stateRef.current;

      // 1. Smoothly transition between Speaking/Idle and Order-Writing pose
      const targetBlend = listening ? 1 : 0;
      writingBlend += (targetBlend - writingBlend) * 0.14;

      // 2. Compute real-time mouth opening from Web Audio API amplitude (with natural syllable fallback)
      let targetOpen = 0;
      if (speaking && !listening) {
        const liveLevel = readLevel ? readLevel() : 0;
        if (liveLevel > 0.02) {
          targetOpen = Math.min(1, liveLevel * 1.1);
        } else {
          const t = now * 0.001;
          const syllable = Math.max(0, Math.sin(t * 14.0) * 0.52 + Math.sin(t * 22.0) * 0.28 + 0.22);
          const phraseGate = Math.sin(t * 2.1) > -0.65 ? 1 : 0.12;
          targetOpen = Math.min(0.85, syllable * phraseGate);
        }
      }
      const lerpRate = targetOpen > smoothOpen ? 0.38 : 0.24;
      smoothOpen += (targetOpen - smoothOpen) * lerpRate;

      // 3. Compute natural eye blink (every 3.2 - 4.8s, 150ms duration)
      let blinkAmount = 0;
      if (now >= nextBlinkTime && blinkProgress < 0) {
        blinkProgress = 0;
      }
      if (blinkProgress >= 0) {
        blinkProgress += 0.14;
        if (blinkProgress >= 2) {
          blinkProgress = -1;
          nextBlinkTime = now + 3000 + Math.random() * 2000;
        } else {
          blinkAmount = blinkProgress <= 1 ? blinkProgress : 2 - blinkProgress;
        }
      }

      // 4. Compute subtle natural breathing & conversational head tilt/nod
      const tSec = now * 0.001;
      const breatheScale = 1.0 + Math.sin(tSec * 1.5) * 0.005;
      const headTilt = speaking && !listening
        ? Math.sin(tSec * 2.5) * 0.015 * (0.4 + smoothOpen * 0.6)
        : Math.sin(tSec * 1.0) * 0.004;
      const headNodY = speaking && !listening
        ? Math.sin(tSec * 4.8) * 1.6 * (0.3 + smoothOpen)
        : Math.sin(tSec * 1.5) * 0.8;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      ctx.save();

      // Pivot gently around torso/collar base for lifelike head motion
      const pivotX = CANVAS_SIZE * 0.5;
      const pivotY = CANVAS_SIZE * 0.78;
      ctx.translate(pivotX, pivotY + headNodY);
      ctx.rotate(headTilt);
      ctx.scale(breatheScale, breatheScale);
      ctx.translate(-pivotX, -pivotY);

      // Draw transparent centered cutout (idle/speaking)
      if (writingBlend < 0.99) {
        ctx.globalAlpha = 1 - writingBlend;
        ctx.drawImage(idle, 0, 0, SRC_SIZE, SRC_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // 5. PHOTOREALISTIC JAW & LOWER-LIP PIXEL WARP (Moves real photo pixels)
        if (smoothOpen > 0.02 && writingBlend < 0.3) {
          const m = LANDMARKS.mouth;
          const drop = m.maxDrop * smoothOpen;
          const cMouthX = toCanvasX(m.cx);
          const cMouthTopY = toCanvasY(m.topY);
          const cDrop = drop * SCALE;
          const mouthRx = (m.innerRightX - m.innerLeftX) * 0.44 * SCALE;

          // A. Softly feathered dark oral cavity inside parted lips
          ctx.save();
          ctx.beginPath();
          ctx.ellipse(cMouthX, cMouthTopY + cDrop * 0.48, mouthRx, Math.max(1.5, cDrop * 0.56), 0, 0, Math.PI * 2);
          ctx.clip();

          const cavityGrad = ctx.createRadialGradient(
            cMouthX,
            cMouthTopY + cDrop * 0.5,
            1.5,
            cMouthX,
            cMouthTopY + cDrop * 0.5,
            mouthRx
          );
          cavityGrad.addColorStop(0, '#140305');
          cavityGrad.addColorStop(0.75, '#2b090d');
          cavityGrad.addColorStop(1, 'rgba(74, 24, 24, 0.85)');
          ctx.fillStyle = cavityGrad;
          ctx.fillRect(cMouthX - mouthRx - 3, cMouthTopY - 2, mouthRx * 2 + 6, cDrop + 6);

          if (cDrop > 3) {
            const teethGrad = ctx.createLinearGradient(0, cMouthTopY, 0, cMouthTopY + cDrop * 0.4);
            teethGrad.addColorStop(0, 'rgba(242, 236, 232, 0.92)');
            teethGrad.addColorStop(0.6, 'rgba(210, 198, 194, 0.55)');
            teethGrad.addColorStop(1, 'rgba(40, 10, 12, 0)');
            ctx.fillStyle = teethGrad;
            ctx.fillRect(cMouthX - mouthRx * 0.72, cMouthTopY, mouthRx * 1.44, cDrop * 0.42);

            const tongueGrad = ctx.createRadialGradient(
              cMouthX,
              cMouthTopY + cDrop * 0.85,
              1.5,
              cMouthX,
              cMouthTopY + cDrop * 0.85,
              mouthRx * 0.65
            );
            tongueGrad.addColorStop(0, 'rgba(155, 58, 68, 0.75)');
            tongueGrad.addColorStop(1, 'rgba(40, 8, 12, 0)');
            ctx.fillStyle = tongueGrad;
            ctx.fillRect(cMouthX - mouthRx * 0.7, cMouthTopY + cDrop * 0.45, mouthRx * 1.4, cDrop * 0.6);
          }
          ctx.restore();

          // B. Displace real lower-lip & chin strips downward with smooth cosine falloff
          const stripH = 2;
          const sliceW = 6;
          for (let sy = m.lipTopY; sy < m.chinEndY; sy += stripH) {
            let vFalloff = 1.0;
            if (sy > m.lipBottomY) {
              const t = (sy - m.lipBottomY) / (m.chinEndY - m.lipBottomY);
              vFalloff = 0.5 * (1 + Math.cos(Math.PI * t));
            }
            const yShift = drop * vFalloff;

            for (let sx = m.leftX; sx < m.rightX; sx += sliceW) {
              let hFalloff = 1.0;
              if (sx < m.innerLeftX) {
                const t = (sx - m.leftX) / (m.innerLeftX - m.leftX);
                hFalloff = 0.5 * (1 - Math.cos(Math.PI * t));
              } else if (sx > m.innerRightX) {
                const t = (m.rightX - sx) / (m.rightX - m.innerRightX);
                hFalloff = 0.5 * (1 - Math.cos(Math.PI * t));
              }
              if (hFalloff <= 0.02) continue;

              const dy = toCanvasY(sy + yShift * hFalloff);
              const dx = toCanvasX(sx);
              ctx.drawImage(
                idle,
                sx,
                sy,
                sliceW + 1,
                stripH + 1,
                dx,
                dy,
                (sliceW + 1) * SCALE,
                (stripH + 1) * SCALE
              );
            }
          }
        }

        // 6. PHOTOREALISTIC EYELID BLINK (Uses real upper-eyelid skin pixels)
        if (blinkAmount > 0.03 && writingBlend < 0.3) {
          [LANDMARKS.leftEye, LANDMARKS.rightEye].forEach((eye) => {
            const ex = toCanvasX(eye.x);
            const ey = toCanvasY(eye.y);
            const ew = eye.w * SCALE;
            const eh = eye.h * SCALE;
            const lidDrop = eh * blinkAmount;

            ctx.save();
            ctx.beginPath();
            ctx.ellipse(ex + ew * 0.5, ey + eh * 0.5, ew * 0.5, eh * 0.52, 0, 0, Math.PI * 2);
            ctx.clip();

            ctx.drawImage(
              idle,
              eye.x,
              eye.skinY,
              eye.w,
              eye.skinH,
              ex,
              ey - 1.5,
              ew,
              lidDrop + 2.5
            );

            ctx.strokeStyle = 'rgba(28, 16, 10, 0.72)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(ex + 1.5, ey + lidDrop);
            ctx.quadraticCurveTo(ex + ew * 0.5, ey + lidDrop + 2.5, ex + ew - 1.5, ey + lidDrop);
            ctx.stroke();
            ctx.restore();
          });
        }
      }

      // Crossfade to centered Order-Writing Cutout when listening
      if (writingBlend > 0.01) {
        ctx.globalAlpha = writingBlend;
        ctx.drawImage(writing, 0, 0, SRC_SIZE, SRC_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.globalAlpha = 1;
      }

      ctx.restore();
      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [isSmall, fallbackImg]);

  return (
    <div
      onClick={onClick}
      className={`relative select-none ${sizeClasses} cursor-pointer transition-transform duration-300 ${
        isSmall ? 'shrink-0 border border-amber-500/40 bg-slate-900' : 'active:scale-[0.98]'
      }`}
      style={
        !isSmall
          ? {
              WebkitMaskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
              maskImage: 'linear-gradient(to bottom, black 82%, transparent 100%)',
            }
          : undefined
      }
    >
      {isSmall || fallbackImg ? (
        <img
          src={isListening ? '/venky_writing_cutout.png' : '/venky_cutout.png'}
          alt="Waiter Venky"
          className="w-full h-full object-cover object-top"
        />
      ) : (
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
}

export default VenkyAvatar;
