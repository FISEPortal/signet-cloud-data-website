(function() {
  const canvas = document.getElementById('c');
  const ctx = canvas.getContext('2d');
  const wrap = document.getElementById('canvas-wrap');

  function resize() {
    canvas.width = wrap.clientWidth;
    canvas.height = wrap.clientHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const W = () => canvas.width;
  const H = () => canvas.height;

  const PALETTE = {
    privacy:  '#6BC9ED',
    security: '#2484C3',
    ownership:'#f4fafa',
    control:  '#6e8291',
    bg:       '#000000',
    ring:     '#1a2a3a',
  };

  let t = 0;

  const LABELS = [
    { text: 'Privacy',   color: PALETTE.privacy,   angle: 0 },
    { text: 'Security',  color: PALETTE.security,   angle: Math.PI/2 },
    { text: 'Ownership', color: PALETTE.ownership,  angle: Math.PI },
    { text: 'Control',   color: PALETTE.control,    angle: 3*Math.PI/2 },
  ];

  const PARTICLES = Array.from({length: 60}, () => ({
    angle: Math.random() * Math.PI * 2,
    radius: 0.18 + Math.random() * 0.18,
    speed: (0.002 + Math.random() * 0.004) * (Math.random() > .5 ? 1 : -1),
    size: 1.2 + Math.random() * 2.2,
    alpha: 0.18 + Math.random() * 0.55,
    colorIdx: Math.floor(Math.random() * 4),
  }));

  const COLORS_ARR = [PALETTE.privacy, PALETTE.security, PALETTE.ownership, PALETTE.control];

  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `${r},${g},${b}`;
  }

  function drawCloud(cx, cy, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    const bumps = [
      [0, 0, r*0.55],
      [-r*0.42, r*0.12, r*0.38],
      [r*0.42, r*0.12, r*0.38],
      [-r*0.18, -r*0.18, r*0.42],
      [r*0.18, -r*0.16, r*0.42],
      [0, r*0.28, r*0.38],
    ];
    bumps.forEach(([bx,by,br]) => {
      ctx.moveTo(cx+bx+br, cy+by);
      ctx.arc(cx+bx, cy+by, br, 0, Math.PI*2);
    });
    ctx.fill();
    ctx.restore();
  }

  function drawShield(cx, cy, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r);
    ctx.lineTo(cx + r*0.75, cy - r*0.45);
    ctx.lineTo(cx + r*0.75, cy + r*0.2);
    ctx.quadraticCurveTo(cx + r*0.75, cy + r*0.7, cx, cy + r);
    ctx.quadraticCurveTo(cx - r*0.75, cy + r*0.7, cx - r*0.75, cy + r*0.2);
    ctx.lineTo(cx - r*0.75, cy - r*0.45);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  function drawLock(cx, cy, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    const bw = r * 1.1, bh = r * 0.9;
    ctx.strokeRect(cx - bw/2, cy - r*0.1, bw, bh);
    ctx.beginPath();
    ctx.arc(cx, cy - r*0.1, r*0.45, Math.PI, 0, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + r*0.35, r*0.13, 0, Math.PI*2);
    ctx.stroke();
    ctx.restore();
  }

  function drawKey(cx, cy, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx - r*0.2, cy, r*0.38, 0, Math.PI*2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r*0.18, cy);
    ctx.lineTo(cx + r, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r*0.7, cy);
    ctx.lineTo(cx + r*0.7, cy + r*0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + r*0.9, cy);
    ctx.lineTo(cx + r*0.9, cy + r*0.2);
    ctx.stroke();
    ctx.restore();
  }

  function drawDataNodes(cx, cy, baseR, t2) {
    const count = 8;
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2 + t2 * 0.3;
      const nx = cx + Math.cos(a) * baseR * 0.68;
      const ny = cy + Math.sin(a) * baseR * 0.68;
      const col = COLORS_ARR[i % 4];
      const pulse = 0.5 + 0.5 * Math.sin(t2 * 2 + i * 1.3);
      ctx.save();
      ctx.globalAlpha = 0.22 + pulse * 0.25;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(nx, ny, 4 + pulse * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.globalAlpha = 0.08 + pulse * 0.1;
      ctx.strokeStyle = col;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawRings(cx, cy, baseR, t2) {
    for (let i = 0; i < 3; i++) {
      const r2 = baseR * (0.52 + i * 0.18);
      const alpha = 0.06 + 0.04 * Math.sin(t2 + i);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = PALETTE.privacy;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.arc(cx, cy, r2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawEncryptLines(cx, cy, baseR, t2) {
    const segs = 24;
    for (let i = 0; i < segs; i++) {
      const a1 = (i / segs) * Math.PI * 2;
      const a2 = ((i + 0.4) / segs) * Math.PI * 2;
      const phase = Math.sin(t2 * 1.5 + i * 0.8);
      if (phase < 0.1) continue;
      const r1 = baseR * 0.5;
      const r2 = baseR * (0.5 + 0.06 * phase);
      ctx.save();
      ctx.globalAlpha = 0.18 * phase;
      ctx.strokeStyle = PALETTE.security;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a1)*r1, cy + Math.sin(a1)*r1);
      ctx.lineTo(cx + Math.cos(a2)*r2, cy + Math.sin(a2)*r2);
      ctx.stroke();
      ctx.restore();
    }
  }

  function draw() {
    const w = W(), h = H();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const baseR = Math.min(w, h) * 0.33;

    PARTICLES.forEach(p => {
      p.angle += p.speed;
      const px = cx + Math.cos(p.angle) * p.radius * Math.min(w, h);
      const py = cy + Math.sin(p.angle) * p.radius * Math.min(w, h);
      const col = COLORS_ARR[p.colorIdx];
      ctx.save();
      ctx.globalAlpha = p.alpha * (0.5 + 0.5 * Math.sin(t * 2 + p.angle * 3));
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(px, py, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    drawRings(cx, cy, baseR, t);
    drawEncryptLines(cx, cy, baseR, t);
    drawDataNodes(cx, cy, baseR, t);

    const cloudPulse = 0.82 + 0.06 * Math.sin(t * 1.2);
    drawCloud(cx, cy - baseR * 0.08, baseR * 0.38 * cloudPulse, PALETTE.privacy, 0.13);
    drawCloud(cx, cy - baseR * 0.08, baseR * 0.34 * cloudPulse, PALETTE.privacy, 0.18);

    const shieldAlpha = 0.55 + 0.2 * Math.sin(t * 0.9);
    drawShield(cx, cy - baseR * 0.05, baseR * 0.32, PALETTE.security, shieldAlpha);

    const lockAlpha = 0.45 + 0.2 * Math.sin(t * 1.1 + 1);
    drawLock(cx, cy - baseR * 0.03, baseR * 0.14, PALETTE.ownership, lockAlpha);

    const keyAlpha = 0.35 + 0.2 * Math.sin(t * 0.8 + 2);
    drawKey(cx + baseR * 0.1, cy + baseR * 0.24, baseR * 0.16, PALETTE.control, keyAlpha);

    LABELS.forEach((lbl, i) => {
      const orbit = baseR * 0.9;
      const a = lbl.angle + t * 0.15 + (i % 2 === 0 ? Math.sin(t*0.4)*0.04 : -Math.sin(t*0.4)*0.04);
      const lx = cx + Math.cos(a) * orbit;
      const ly = cy + Math.sin(a) * orbit;

      const pulse = 0.7 + 0.3 * Math.sin(t * 1.4 + i * 1.5);
      ctx.save();
      ctx.globalAlpha = pulse;
      ctx.font = `700 ${Math.round(baseR * 0.115)}px Poppins, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = lbl.color;
      ctx.fillText(lbl.text, lx, ly);
      ctx.restore();
    });

    const gridCount = 7;
    for (let gx = 0; gx < gridCount; gx++) {
      for (let gy = 0; gy < gridCount; gy++) {
        const dotx = (gx / (gridCount-1)) * w;
        const doty = (gy / (gridCount-1)) * h;
        const dist = Math.hypot(dotx - cx, doty - cy);
        if (dist < baseR * 1.3) continue;
        const flicker = Math.sin(t * 1.5 + gx * 2.1 + gy * 1.7);
        if (flicker < 0.6) continue;
        ctx.save();
        ctx.globalAlpha = 0.07 * (flicker - 0.6) / 0.4;
        ctx.fillStyle = '#6BC9ED';
        ctx.beginPath();
        ctx.arc(dotx, doty, 1.5, 0, Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }

    t += 0.018;
    requestAnimationFrame(draw);
  }

  draw();
})();
