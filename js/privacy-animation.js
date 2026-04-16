(function() {
  const cv = document.getElementById('pbdc');
  const cx = cv.getContext('2d');
  const wrap = document.getElementById('pbd-wrap');

  function resize() { cv.width = wrap.clientWidth; cv.height = wrap.clientHeight; }
  resize();
  window.addEventListener('resize', resize);

  const W = () => cv.width;
  const H = () => cv.height;

  const C = {
    bg:      '#fefbf8',
    privacy: '#6BC9ED',
    blue:    '#2484C3',
    light:   '#f4fafa',
    slate:   '#6e8291',
    ink:     '#1a2530',
    mid:     '#d4eef8',
  };

  let t = 0;

  const LAYERS = [
    { label: 'Interface Layer', color: C.privacy,     depth: 0 },
    { label: 'Logic Layer',     color: C.blue,    depth: 1 },
    { label: 'Access Layer',    color: C.slate,   depth: 2 },
    { label: 'Data Layer',      color: C.ink, depth: 3 },
  ];

  const PULSES = Array.from({length: 18}, (_, i) => ({
    layer: i % 4,
    x: 0.1 + Math.random() * 0.8,
    progress: Math.random(),
    speed: 0.003 + Math.random() * 0.004,
    size: 2.5 + Math.random() * 3,
    alpha: 0.3 + Math.random() * 0.5,
  }));

  function layerRect(layerIdx, w, h) {
    const totalH = h * 0.62;
    const topY = h * 0.12;
    const lh = totalH / 4;
    const lw = w * 0.60;
    const lx = w * 0.14;
    const ly = topY + layerIdx * lh;
    return { lx, ly, lw, lh };
  }

  function drawMiniLock(px, py, r, color, alpha) {
    cx.save();
    cx.globalAlpha = alpha;
    cx.strokeStyle = color;
    cx.lineWidth = 1.8;
    const bw = r * 1.2, bh = r * 0.95;
    cx.beginPath();
    cx.roundRect(px - bw/2, py, bw, bh, 2);
    cx.stroke();
    cx.beginPath();
    cx.arc(px, py, r * 0.5, Math.PI, 0, false);
    cx.stroke();
    cx.beginPath();
    cx.arc(px, py + bh * 0.5, r * 0.14, 0, Math.PI * 2);
    cx.fill();
    cx.restore();
  }

  function drawLayer(layerIdx, w, h, time) {
    const { lx, ly, lw, lh } = layerRect(layerIdx, w, h);
    const layer = LAYERS[layerIdx];
    const shimmer = 0.85 + 0.08 * Math.sin(time * 1.1 + layerIdx * 0.9);

    cx.save();
    cx.globalAlpha = 0.13 * shimmer;
    cx.fillStyle = layer.color;
    cx.beginPath();
    cx.roundRect(lx, ly + 4, lw, lh - 8, 6);
    cx.fill();
    cx.restore();

    cx.save();
    cx.globalAlpha = 0.55 + 0.15 * shimmer;
    cx.strokeStyle = layer.color;
    cx.lineWidth = 1.8;
    cx.beginPath();
    cx.roundRect(lx, ly + 4, lw, lh - 8, 6);
    cx.stroke();
    cx.restore();

    for (let s = 0; s < 9; s++) {
      const sx = lx + (s / 9) * lw;
      cx.save();
      cx.globalAlpha = 0.07 + 0.05 * Math.sin(time * 1.5 + s * 0.7 + layerIdx);
      cx.strokeStyle = layer.color;
      cx.lineWidth = 0.8;
      cx.beginPath();
      cx.moveTo(sx, ly + 4);
      cx.lineTo(sx, ly + lh - 8);
      cx.stroke();
      cx.restore();
    }

    cx.save();
    cx.globalAlpha = 0.85;
    cx.font = `600 ${Math.round(Math.min(w, h) * 0.033)}px Poppins, sans-serif`;
    cx.textAlign = 'left';
    cx.textBaseline = 'middle';
    cx.fillStyle = layer.color;
    cx.fillText(layer.label, lx + lw + 18, ly + lh / 2);
    cx.restore();

    const lr = Math.min(w, h) * 0.025;
    const lockPulse = 0.6 + 0.4 * Math.sin(time * 1.3 + layerIdx * 1.1);
    drawMiniLock(lx + lw * 0.08, ly + lh / 2, lr, layer.color, 0.7 * lockPulse);
  }

  function drawPulse(p, w, h, time) {
    const { lx, ly, lw, lh } = layerRect(p.layer, w, h);
    const px = lx + lw * 0.15 + p.x * lw * 0.7;
    const py = ly + lh / 2 + Math.sin(time * 2 + p.x * 5) * (lh * 0.18);
    const pulse = 0.4 + 0.6 * Math.sin(p.progress * Math.PI);
    cx.save();
    cx.globalAlpha = p.alpha * pulse;
    cx.fillStyle = LAYERS[p.layer].color;
    cx.beginPath();
    cx.arc(px, py, p.size * pulse, 0, Math.PI * 2);
    cx.fill();
    cx.restore();
  }

  function drawVerticalConnectors(w, h, time) {
    for (let i = 0; i < 3; i++) {
      const top = layerRect(i, w, h);
      const bot = layerRect(i + 1, w, h);
      for (let l = 0; l < 3; l++) {
        const x1 = top.lx + top.lw * (0.25 + l * 0.25);
        const y1 = top.ly + top.lh - 4;
        const y2 = bot.ly + 4;
        const fy = y1 + (y2 - y1) * ((time * 0.6 + l * 0.5 + i * 0.3) % 1);

        cx.save();
        cx.globalAlpha = 0.12;
        cx.strokeStyle = LAYERS[i].color;
        cx.lineWidth = 1;
        cx.setLineDash([4, 6]);
        cx.beginPath();
        cx.moveTo(x1, y1);
        cx.lineTo(x1, y2);
        cx.stroke();
        cx.restore();

        cx.save();
        cx.globalAlpha = 0.55;
        cx.fillStyle = LAYERS[i].color;
        cx.beginPath();
        cx.arc(x1, fy, 2.5, 0, Math.PI * 2);
        cx.fill();
        cx.restore();
      }
    }
  }

  function drawShieldOverlay(w, h, time) {
    const shX = w / 2, shY = h * 0.43;
    const shR = Math.min(w, h) * 0.28;
    const alpha = 0.04 + 0.02 * Math.sin(time * 0.7);
    cx.save();
    cx.globalAlpha = alpha;
    cx.strokeStyle = C.privacy;
    cx.lineWidth = 2.5;
    cx.beginPath();
    cx.moveTo(shX, shY - shR);
    cx.lineTo(shX + shR * 0.78, shY - shR * 0.42);
    cx.lineTo(shX + shR * 0.78, shY + shR * 0.18);
    cx.quadraticCurveTo(shX + shR * 0.78, shY + shR * 0.72, shX, shY + shR);
    cx.quadraticCurveTo(shX - shR * 0.78, shY + shR * 0.72, shX - shR * 0.78, shY + shR * 0.18);
    cx.lineTo(shX - shR * 0.78, shY - shR * 0.42);
    cx.closePath();
    cx.stroke();
    cx.restore();
  }

  function drawGrid(w, h, time) {
    const cols = 22, rows = 14;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const flicker = Math.sin(time * 1.2 + c * 0.7 + r * 1.1);
        if (flicker < 0.75) continue;
        cx.save();
        cx.globalAlpha = 0.04 * (flicker - 0.75) / 0.25;
        cx.fillStyle = C.blue;
        cx.beginPath();
        cx.arc((c / (cols - 1)) * w, (r / (rows - 1)) * h, 1.2, 0, Math.PI * 2);
        cx.fill();
        cx.restore();
      }
    }
  }

  function drawFoundationLabel(w, h, time) {
    const { lx, lw } = layerRect(0, w, h);
    const fx = lx + lw / 2;
    const fy = h * 0.12 + h * 0.62 + 28;
    cx.save();
    cx.globalAlpha = (0.7 + 0.3 * Math.sin(time * 0.8)) * 0.9;
    cx.font = `700 ${Math.round(Math.min(w, h) * 0.028)}px Poppins, sans-serif`;
    cx.textAlign = 'center';
    cx.textBaseline = 'top';
    cx.fillStyle = C.privacy;
    cx.fillText('Privacy Built Into Every Layer', fx, fy);
    cx.restore();
  }

  function frame() {
    const w = W(), h = H();
    cx.clearRect(0, 0, w, h);
    cx.fillStyle = C.bg;
    cx.fillRect(0, 0, w, h);
    drawGrid(w, h, t);
    drawShieldOverlay(w, h, t);
    for (let i = 0; i < 4; i++) drawLayer(i, w, h, t);
    drawVerticalConnectors(w, h, t);
    PULSES.forEach(p => {
      p.progress += p.speed;
      if (p.progress > 1) p.progress = 0;
      drawPulse(p, w, h, t);
    });
    drawFoundationLabel(w, h, t);
    t += 0.016;
    requestAnimationFrame(frame);
  }

  frame();
})();
