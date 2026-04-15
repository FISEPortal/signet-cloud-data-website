(function() {
  const cv = document.getElementById('ipec');
  const ctx = cv.getContext('2d');
  const wrap = document.getElementById('ipe-wrap');
  function resize() { cv.width = wrap.clientWidth; cv.height = wrap.clientHeight; }
  resize();
  window.addEventListener('resize', resize);
  const W = () => cv.width;
  const H = () => cv.height;

  const C = {
    bg:    '#fefbf8',
    slate: '#6e8291',
    blue:  '#2484C3',
    red:   '#8B0000',
  };

  let t = 0;

  const CHARS = '01ABCDEFabcdef©™℗∂∇∑∏∫∞≠≈±×÷⊕⊗⊘'.split('');

  const RAIN = Array.from({length: 60}, () => ({
    x: Math.random(), y: Math.random(),
    speed: 0.0004 + Math.random() * 0.0006,
    char: CHARS[Math.floor(Math.random() * CHARS.length)],
    swapTimer: 0, swapInterval: 0.4 + Math.random() * 1.2,
    alpha: 0.06 + Math.random() * 0.13,
    size: 10 + Math.random() * 8,
  }));

  const RINGS = [
    { r: 0.21, speed:  0.008, segments: 48, label: 'AES-256',  color: C.slate },
    { r: 0.27, speed: -0.005, segments: 36, label: 'RSA-4096', color: C.blue  },
    { r: 0.33, speed:  0.003, segments: 28, label: 'SHA-3',    color: C.slate },
  ];

  const ASSETS = [
    { icon: '©', angle: 0             },
    { icon: '™', angle: Math.PI*2/5   },
    { icon: 'P', angle: Math.PI*4/5   },
    { icon: '◆', angle: Math.PI*6/5   },
    { icon: '⚿', angle: Math.PI*8/5   },
  ];

  const THREATS = Array.from({length: 8}, (_, i) => ({
    angle: (i / 8) * Math.PI * 2,
    speed: (0.007 + Math.random() * 0.005) * (i % 2 === 0 ? 1 : -1),
    dist:  0.90 + Math.random() * 0.08,
    size:  3 + Math.random() * 2,
    phase: Math.random() * Math.PI * 2,
    repelFlash: 0,
  }));

  const PACKETS = Array.from({length: 12}, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    speed: 0.006 + (i % 3) * 0.002,
    char: CHARS[Math.floor(Math.random() * CHARS.length)],
    swapT: 0,
  }));

  const CORNER_LABELS = [
    { text: 'Unscrapable',  ax: 'left',  ay: 'top'    },
    { text: 'Unbreachable', ax: 'right', ay: 'top'    },
    { text: 'Unstealable',  ax: 'left',  ay: 'bottom' },
    { text: 'Unscannable',  ax: 'right', ay: 'bottom' },
  ];

  function getLabelPos(lb, w, h) {
    const pad = w * 0.03;
    const x = lb.ax === 'left' ? pad : w - pad;
    const y = lb.ay === 'top'  ? h * 0.12 : h * 0.82;
    return { x, y, align: lb.ax };
  }

  function drawRain(w, h) {
    RAIN.forEach(r => {
      r.y += r.speed; r.swapTimer += 0.016;
      if (r.y > 1) { r.y = 0; r.x = Math.random(); }
      if (r.swapTimer > r.swapInterval) {
        r.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        r.swapTimer = 0;
      }
      ctx.save();
      ctx.globalAlpha = r.alpha;
      ctx.font = `${Math.round(r.size)}px monospace`;
      ctx.fillStyle = C.slate;
      ctx.textAlign = 'center';
      ctx.fillText(r.char, r.x * w, r.y * h);
      ctx.restore();
    });
  }

  function drawCipherRings(w, h) {
    const cx = w * 0.5, cy = h * 0.47;
    const b = Math.min(w, h);
    RINGS.forEach((ring, ri) => {
      const r2 = b * ring.r;
      const seg = ring.segments, gap = 0.08;
      const rot = t * ring.speed * 60;
      for (let s = 0; s < seg; s++) {
        const a1 = (s / seg) * Math.PI * 2 + rot;
        const a2 = ((s + 1 - gap) / seg) * Math.PI * 2 + rot;
        const pulse = 0.5 + 0.5 * Math.sin(t * 2.5 + s * 0.7 + ri * 1.1);
        ctx.save();
        ctx.globalAlpha = 0.18 + 0.28 * pulse;
        ctx.strokeStyle = ring.color;
        ctx.lineWidth = 2.5 - ri * 0.4;
        ctx.lineCap = 'round';
        ctx.beginPath(); ctx.arc(cx, cy, r2, a1, a2); ctx.stroke();
        ctx.restore();
      }
      ctx.save();
      ctx.globalAlpha = 0.45 + 0.2 * Math.sin(t * 0.9 + ri);
      ctx.font = `700 ${Math.round(b * 0.022)}px Poppins, monospace`;
      ctx.fillStyle = ring.color;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      const la = Math.PI / 2 + rot;
      ctx.fillText(ring.label, cx + Math.cos(la) * r2, cy + Math.sin(la) * r2);
      ctx.restore();
    });
  }

  function drawPackets(w, h) {
    const cx = w * 0.5, cy = h * 0.47;
    const b = Math.min(w, h);
    PACKETS.forEach((p, i) => {
      p.angle += p.speed * 0.016;
      p.swapT += 0.016;
      if (p.swapT > 0.8 + Math.random()) {
        p.char = CHARS[Math.floor(Math.random() * CHARS.length)];
        p.swapT = 0;
      }
      const px = cx + Math.cos(p.angle) * b * 0.245;
      const py = cy + Math.sin(p.angle) * b * 0.245;
      const pulse = 0.6 + 0.4 * Math.sin(t * 3 + i * 0.8);
      ctx.save(); ctx.globalAlpha = 0.6 * pulse; ctx.fillStyle = C.blue;
      ctx.beginPath(); ctx.arc(px, py, b * 0.014, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.9 * pulse;
      ctx.font = `700 ${Math.round(b * 0.018)}px monospace`;
      ctx.fillStyle = '#fefbf8'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(p.char, px, py); ctx.restore();
    });
  }

  function drawIPCore(w, h) {
    const cx = w * 0.5, cy = h * 0.47;
    const b = Math.min(w, h);
    const cr = b * 0.155;
    const lr = b * 0.038, bw = lr * 1.3, bh = lr;

    ctx.save(); ctx.globalAlpha = 0.1 + 0.04 * Math.sin(t * 1.2); ctx.fillStyle = C.slate;
    ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.fill(); ctx.restore();

    ctx.save(); ctx.globalAlpha = 0.55 + 0.2 * Math.sin(t * 1.2); ctx.strokeStyle = C.slate; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, cr, 0, Math.PI * 2); ctx.stroke(); ctx.restore();

    ctx.save(); ctx.globalAlpha = 0.8 + 0.15 * Math.sin(t * 1.8);
    ctx.strokeStyle = C.slate; ctx.fillStyle = C.slate; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.roundRect(cx - bw/2, cy - lr * 0.1, bw, bh, 2); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy - lr * 0.1, lr * 0.52, Math.PI, 0, false); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy + bh * 0.42, lr * 0.14, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    const orbitR = cr * 0.72;
    ASSETS.forEach((a, i) => {
      const ang = a.angle + t * 0.18;
      const ax = cx + Math.cos(ang) * orbitR;
      const ay = cy + Math.sin(ang) * orbitR;
      const pulse = 0.65 + 0.35 * Math.sin(t * 1.5 + i * 1.3);
      ctx.save(); ctx.globalAlpha = pulse * 0.9;
      ctx.font = `700 ${Math.round(b * 0.025)}px Poppins, sans-serif`;
      ctx.fillStyle = C.slate; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(a.icon, ax, ay); ctx.restore();
    });
  }

  function drawThreats(w, h) {
    const cx = w * 0.5, cy = h * 0.47;
    const b = Math.min(w, h);
    const shieldR = b * RINGS[2].r;
    THREATS.forEach(th => {
      th.angle += th.speed * 0.016;
      th.repelFlash = Math.max(0, th.repelFlash - 0.04);
      const dist = shieldR * th.dist;
      const tx = cx + Math.cos(th.angle) * dist;
      const ty = cy + Math.sin(th.angle) * dist;
      const flicker = 0.4 + 0.6 * Math.sin(t * 4 + th.phase);
      ctx.save(); ctx.globalAlpha = 0.3 * flicker; ctx.fillStyle = C.red;
      ctx.beginPath(); ctx.arc(tx, ty, th.size, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      const ex = cx + Math.cos(th.angle) * shieldR;
      const ey = cy + Math.sin(th.angle) * shieldR;
      if (flicker > 0.85) th.repelFlash = 1;
      if (th.repelFlash > 0) {
        ctx.save(); ctx.globalAlpha = 0.5 * th.repelFlash;
        ctx.strokeStyle = C.slate; ctx.lineWidth = 1.2;
        for (let s = 0; s < 5; s++) {
          const sa = th.angle + (s - 2) * 0.35;
          ctx.beginPath(); ctx.moveTo(ex, ey);
          ctx.lineTo(ex + Math.cos(sa) * 10, ey + Math.sin(sa) * 10); ctx.stroke();
        }
        ctx.restore();
      }
    });
  }

  function drawCornerLabels(w, h) {
    const b = Math.min(w, h);
    const fs = Math.round(b * 0.034);
    const lockR = b * 0.016;
    CORNER_LABELS.forEach((lb, i) => {
      const { x, y, align } = getLabelPos(lb, w, h);
      const pulse = 0.55 + 0.35 * Math.sin(t * 1.1 + i * 2.1);
      ctx.save(); ctx.globalAlpha = pulse;
      ctx.font = `700 ${fs}px Poppins, sans-serif`;
      ctx.fillStyle = C.slate; ctx.textAlign = align; ctx.textBaseline = 'middle';
      ctx.fillText(lb.text, x, y); ctx.restore();
      const lx = align === 'left' ? x + fs * lb.text.length * 0.22 : x - fs * lb.text.length * 0.22;
      const ly = y + b * 0.042;
      const bw = lockR * 1.3, bh = lockR;
      ctx.save(); ctx.globalAlpha = pulse * 0.65;
      ctx.strokeStyle = C.slate; ctx.fillStyle = C.slate; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.roundRect(lx - bw/2, ly, bw, bh, 1); ctx.stroke();
      ctx.beginPath(); ctx.arc(lx, ly, lockR * 0.5, Math.PI, 0, false); ctx.stroke();
      ctx.restore();
    });
  }

  function drawCipherStream(w, h) {
    const b = Math.min(w, h);
    [h * 0.07, h * 0.93].forEach((sy, si) => {
      for (let c = 0; c < 28; c++) {
        const char = CHARS[(Math.floor(t * 8 + c * 3 + si * 7)) % CHARS.length];
        const alpha = 0.08 + 0.07 * Math.sin(t * 3 + c * 0.5);
        ctx.save(); ctx.globalAlpha = alpha;
        ctx.font = `${Math.round(b * 0.018)}px monospace`;
        ctx.fillStyle = C.blue; ctx.textAlign = 'center';
        ctx.fillText(char, (c / 27) * w, sy); ctx.restore();
      }
    });
  }

  function drawBottomLabel(w, h) {
    const b = Math.min(w, h);
    ctx.save(); ctx.globalAlpha = 0.7 + 0.25 * Math.sin(t * 0.9);
    ctx.font = `700 ${Math.round(b * 0.028)}px Poppins, sans-serif`;
    ctx.fillStyle = C.slate; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('IP Protection · Encryption-Enforced', w / 2, h * 0.97);
    ctx.restore();
  }

  function frame() {
    const w = W(), h = H();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    drawCipherStream(w, h);
    drawRain(w, h);
    drawThreats(w, h);
    drawCipherRings(w, h);
    drawPackets(w, h);
    drawIPCore(w, h);
    drawCornerLabels(w, h);
    drawBottomLabel(w, h);
    t += 0.016;
    requestAnimationFrame(frame);
  }
  frame();
})();
