(function() {
  const cv = document.getElementById('dcc');
  const ctx = cv.getContext('2d');
  const wrap = document.getElementById('dc-wrap');
  function resize() { cv.width = wrap.clientWidth; cv.height = wrap.clientHeight; }
  resize();
  window.addEventListener('resize', resize);
  const W = () => cv.width;
  const H = () => cv.height;

  const C = {
    bg:      '#000000',
    privacy: '#6BC9ED',
    blue:    '#2484C3',
    light:   '#f4fafa',
    slate:   '#6e8291',
    gold:    '#c9a84c',
    green:   '#2ecc71',
    dim:     '#0d1a24',
  };

  let t = 0;

  const PILLARS = [
    { label: 'Security',         sub: 'Article 32',  color: C.privacy, angle: -Math.PI/2,               icon: 'shield' },
    { label: 'Permissions',      sub: 'Article 6',   color: C.blue,    angle: -Math.PI/2 + Math.PI*2/5, icon: 'check'  },
    { label: 'Authorized Users', sub: 'Article 25',  color: C.gold,    angle: -Math.PI/2 + Math.PI*4/5, icon: 'user'   },
    { label: 'Privacy',          sub: 'Article 5',   color: C.privacy, angle: -Math.PI/2 + Math.PI*6/5, icon: 'eye'    },
    { label: 'Ownership',        sub: 'Article 17',  color: C.light,   angle: -Math.PI/2 + Math.PI*8/5, icon: 'key'    },
  ];

  const CHECKS = [
    'Data minimisation', 'Consent verified', 'Right to erasure',
    'Encryption active', 'Access logged', 'Breach protocol',
    'DPO notified', 'Retention policy',
  ];
  let checkIdx = 0, checkTimer = 0;
  const CHECK_INTERVAL = 1.4;
  const checkDone = new Array(CHECKS.length).fill(false);

  const SUBJECTS = Array.from({length: 10}, (_, i) => ({
    angle: (i / 10) * Math.PI * 2,
    speed: 0.004 + (i % 3) * 0.002,
    layer: i % 2,
  }));

  const PARTICLES = Array.from({length: 55}, () => ({
    angle:  Math.random() * Math.PI * 2,
    radius: 0.06 + Math.random() * 0.38,
    speed:  (0.002 + Math.random() * 0.004) * (Math.random() > .5 ? 1 : -1),
    size:   1 + Math.random() * 1.8,
    alpha:  0.08 + Math.random() * 0.18,
    color:  Math.random() > 0.5 ? C.blue : C.slate,
  }));

  let scanAngle = 0;

  function cxPos(w) { return w * 0.5; }
  function cyPos(h) { return h * 0.47; }
  function base(w, h) { return Math.min(w, h); }

  function iconShield(px, py, r, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(px, py - r); ctx.lineTo(px + r*0.75, py - r*0.4); ctx.lineTo(px + r*0.75, py + r*0.15);
    ctx.quadraticCurveTo(px + r*0.75, py + r*0.7, px, py + r);
    ctx.quadraticCurveTo(px - r*0.75, py + r*0.7, px - r*0.75, py + r*0.15);
    ctx.lineTo(px - r*0.75, py - r*0.4); ctx.closePath(); ctx.stroke(); ctx.restore();
  }

  function iconCheck(px, py, r, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(px, py, r, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(px - r*0.45, py); ctx.lineTo(px - r*0.1, py + r*0.38); ctx.lineTo(px + r*0.48, py - r*0.32);
    ctx.stroke(); ctx.restore();
  }

  function iconUser(px, py, r, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(px, py - r*0.25, r*0.38, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py + r*0.55, r*0.6, Math.PI, 0, false); ctx.stroke();
    ctx.restore();
  }

  function iconEye(px, py, r, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(px - r, py); ctx.quadraticCurveTo(px, py - r*0.65, px + r, py);
    ctx.quadraticCurveTo(px, py + r*0.65, px - r, py); ctx.stroke();
    ctx.beginPath(); ctx.arc(px, py, r*0.27, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.fill(); ctx.restore();
  }

  function iconKey(px, py, r, color, alpha) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
    const bowR = r*0.32, shaftL = r*0.82;
    ctx.beginPath(); ctx.arc(px - r*0.18, py, bowR, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(px - r*0.18, py, bowR*0.45, 0, Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - r*0.18 + bowR, py); ctx.lineTo(px - r*0.18 + bowR + shaftL, py); ctx.stroke();
    [[0.62, 0.2], [0.44, 0.16]].forEach(([ox, oh]) => {
      const tx = px - r*0.18 + bowR + shaftL*ox;
      ctx.beginPath(); ctx.moveTo(tx, py); ctx.lineTo(tx, py + r*oh); ctx.stroke();
    });
    ctx.restore();
  }

  function drawIcon(icon, px, py, r, color, alpha) {
    switch(icon) {
      case 'shield': iconShield(px, py, r, color, alpha); break;
      case 'check':  iconCheck(px, py, r, color, alpha);  break;
      case 'user':   iconUser(px, py, r, color, alpha);   break;
      case 'eye':    iconEye(px, py, r, color, alpha);    break;
      case 'key':    iconKey(px, py, r, color, alpha);    break;
    }
  }

  function drawGDPRCore(w, h) {
    const X = cxPos(w), Y = cyPos(h), B = base(w, h);
    const cr = B * 0.11, pulse = 0.92 + 0.08 * Math.sin(t * 1.4);
    ctx.save(); ctx.globalAlpha = 0.07 + 0.04 * Math.sin(t * 1.2);
    ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(X, Y, cr*1.6, 0, Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.arc(X, Y, cr*pulse, 0, Math.PI*2); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.85; ctx.strokeStyle = C.gold; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(X, Y, cr*pulse, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.3; ctx.strokeStyle = C.gold; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(X, Y, cr*0.72*pulse, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    const fs = Math.round(B * 0.042);
    ctx.save(); ctx.globalAlpha = 0.95;
    ctx.font = `700 ${fs}px Poppins, sans-serif`;
    ctx.fillStyle = C.gold; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('GDPR', X, Y - fs*0.1); ctx.restore();
    const fs2 = Math.round(B * 0.018);
    ctx.save(); ctx.globalAlpha = 0.55;
    ctx.font = `400 ${fs2}px Poppins, sans-serif`;
    ctx.fillStyle = C.gold; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('Compliant', X, Y + fs*0.65); ctx.restore();
  }

  function drawPillars(w, h) {
    const X = cxPos(w), Y = cyPos(h), B = base(w, h);
    const orbitR = B*0.3, iconR = B*0.042, nodeR = B*0.065;
    const labelFS = Math.round(B*0.026), subFS = Math.round(B*0.017);
    PILLARS.forEach((p, i) => {
      const ang = p.angle + Math.sin(t*0.3 + i)*0.03;
      const px = X + Math.cos(ang)*orbitR, py = Y + Math.sin(ang)*orbitR;
      const pulse = 0.7 + 0.3*Math.sin(t*1.3 + i*1.25);
      ctx.save(); ctx.globalAlpha = 0.18 + 0.12*pulse;
      ctx.strokeStyle = p.color; ctx.lineWidth = 1; ctx.setLineDash([4,6]);
      ctx.beginPath(); ctx.moveTo(X,Y); ctx.lineTo(px,py); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.12 + 0.1*pulse; ctx.fillStyle = p.color;
      ctx.beginPath(); ctx.arc(px,py,nodeR,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.7 + 0.25*pulse; ctx.strokeStyle = p.color; ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(px,py,nodeR,0,Math.PI*2); ctx.stroke(); ctx.restore();
      drawIcon(p.icon, px, py - nodeR*0.15, iconR, p.color, 0.85*pulse);
      const lOff = nodeR + B*0.022, above = py - Y < 0;
      ctx.save(); ctx.globalAlpha = 0.88;
      ctx.font = `700 ${labelFS}px Poppins, sans-serif`;
      ctx.fillStyle = p.color; ctx.textAlign = 'center';
      ctx.textBaseline = above ? 'bottom' : 'top';
      ctx.fillText(p.label, px, py + (above ? -lOff : lOff)); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.5;
      ctx.font = `400 ${subFS}px Poppins, sans-serif`;
      ctx.fillStyle = p.color; ctx.textAlign = 'center';
      ctx.textBaseline = above ? 'bottom' : 'top';
      ctx.fillText(p.sub, px, py + (above ? -lOff - labelFS*1.1 : lOff + labelFS*1.1)); ctx.restore();
    });
  }

  function drawScanRing(w, h) {
    const X = cxPos(w), Y = cyPos(h), B = base(w, h);
    const sr = B*0.3;
    scanAngle += 0.012;
    ctx.save(); ctx.globalAlpha = 0.22; ctx.strokeStyle = C.green; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(X,Y,sr*1.08,scanAngle,scanAngle+Math.PI*0.55); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.08; ctx.strokeStyle = C.green; ctx.lineWidth = 6; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.arc(X,Y,sr*1.08,scanAngle,scanAngle+0.12); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.12; ctx.strokeStyle = C.slate; ctx.lineWidth = 0.8; ctx.setLineDash([3,7]);
    ctx.beginPath(); ctx.arc(X,Y,sr*1.08,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();
  }

  function drawDataSubjects(w, h) {
    const X = cxPos(w), Y = cyPos(h), B = base(w, h);
    const layers = [B*0.2, B*0.38];
    SUBJECTS.forEach((s, i) => {
      s.angle += s.speed * 0.016;
      const sx = X + Math.cos(s.angle)*layers[s.layer];
      const sy = Y + Math.sin(s.angle)*layers[s.layer];
      const pulse = 0.5 + 0.5*Math.sin(t*2.5 + i*0.9);
      const col = s.layer === 0 ? C.privacy : C.blue;
      ctx.save(); ctx.globalAlpha = 0.4*pulse; ctx.fillStyle = col;
      ctx.beginPath(); ctx.arc(sx,sy,B*0.012,0,Math.PI*2); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.6*pulse; ctx.strokeStyle = col; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(sx,sy-B*0.008,B*0.006,0,Math.PI*2); ctx.stroke();
      ctx.beginPath(); ctx.arc(sx,sy+B*0.012,B*0.01,Math.PI,0,false); ctx.stroke();
      ctx.restore();
    });
  }

  function drawChecklist(w, h) {
    const B = base(w, h);
    const fs = Math.round(B*0.022);
    const startX = w*0.03, startY = h*0.18;
    const lineH = B*0.058, visibleCount = 5;
    ctx.save(); ctx.globalAlpha = 0.06; ctx.fillStyle = C.blue;
    ctx.beginPath(); ctx.roundRect(startX-8, startY-12, w*0.22, lineH*visibleCount+20, 6); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.2; ctx.strokeStyle = C.slate; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.roundRect(startX-8, startY-12, w*0.22, lineH*visibleCount+20, 6); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55;
    ctx.font = `700 ${Math.round(B*0.018)}px Poppins, sans-serif`;
    ctx.fillStyle = C.slate; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
    ctx.fillText('Compliance Checks', startX, startY-10); ctx.restore();
    for (let i = 0; i < visibleCount; i++) {
      const idx = (checkIdx - visibleCount + 1 + i + CHECKS.length) % CHECKS.length;
      const done = checkDone[idx];
      const isActive = i === visibleCount-1 && !done;
      const fy = startY + i*lineH + 16;
      const blink = isActive ? (0.4 + 0.6*Math.sin(t*8)) : 1;
      ctx.save(); ctx.globalAlpha = (done ? 0.9 : 0.3)*blink;
      ctx.strokeStyle = done ? C.green : C.slate;
      ctx.fillStyle   = done ? C.green : 'transparent';
      ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(startX+8, fy+fs*0.5, fs*0.44, 0, Math.PI*2);
      if (done) ctx.fill(); else ctx.stroke();
      if (done) {
        ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(startX+4, fy+fs*0.5); ctx.lineTo(startX+7, fy+fs*0.78); ctx.lineTo(startX+13, fy+fs*0.22);
        ctx.stroke();
      }
      ctx.restore();
      ctx.save(); ctx.globalAlpha = (done ? 0.85 : 0.38)*blink;
      ctx.font = `${done ? 600 : 400} ${fs}px Poppins, sans-serif`;
      ctx.fillStyle = done ? C.light : C.slate;
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(CHECKS[idx], startX+22, fy); ctx.restore();
    }
    checkTimer += 0.016;
    if (checkTimer > CHECK_INTERVAL) {
      checkDone[checkIdx] = true;
      checkIdx = (checkIdx+1) % CHECKS.length;
      checkTimer = 0;
      if (checkIdx === 0) checkDone.fill(false);
    }
  }

  function drawParticles(w, h) {
    const X = cxPos(w), Y = cyPos(h), B = base(w, h);
    PARTICLES.forEach(p => {
      p.angle += p.speed;
      const px = X + Math.cos(p.angle)*p.radius*B;
      const py = Y + Math.sin(p.angle)*p.radius*B;
      ctx.save(); ctx.globalAlpha = p.alpha*(0.5+0.5*Math.sin(t*2+p.angle*3));
      ctx.fillStyle = p.color; ctx.beginPath(); ctx.arc(px,py,p.size,0,Math.PI*2); ctx.fill(); ctx.restore();
    });
  }

  function drawGrid(w, h) {
    const cols = 26, rows = 15;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gx=(c/(cols-1))*w, gy=(r/(rows-1))*h;
        const f = Math.sin(t*1.1+c*0.65+r*1.2);
        if (f < 0.8) continue;
        ctx.save(); ctx.globalAlpha = 0.04*(f-0.8)/0.2; ctx.fillStyle = C.blue;
        ctx.beginPath(); ctx.arc(gx,gy,1.2,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
    }
  }

  function drawRegulationBadge(w, h) {
    const B = base(w, h);
    const bx=w*0.78, by=h*0.1, bw=B*0.22, bh=B*0.09;
    const pulse = 0.75+0.25*Math.sin(t*1.1);
    ctx.save(); ctx.globalAlpha = 0.1*pulse; ctx.fillStyle = C.gold;
    ctx.beginPath(); ctx.roundRect(bx-bw/2,by-bh/2,bw,bh,6); ctx.fill(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.55*pulse; ctx.strokeStyle = C.gold; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.roundRect(bx-bw/2,by-bh/2,bw,bh,6); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.9*pulse;
    ctx.font = `700 ${Math.round(B*0.022)}px Poppins, sans-serif`;
    ctx.fillStyle = C.gold; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('EU GDPR · ISO 27001', bx, by); ctx.restore();
  }

  function drawBottomLabel(w, h) {
    const B = base(w, h);
    ctx.save(); ctx.globalAlpha = 0.7+0.2*Math.sin(t*0.9);
    ctx.font = `700 ${Math.round(B*0.03)}px Poppins, sans-serif`;
    ctx.fillStyle = C.light; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText('Data Compliance', w/2, h*0.97); ctx.restore();
  }

  function frame() {
    const w = W(), h = H();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
    drawGrid(w, h);
    drawParticles(w, h);
    drawScanRing(w, h);
    drawDataSubjects(w, h);
    drawPillars(w, h);
    drawGDPRCore(w, h);
    drawChecklist(w, h);
    drawRegulationBadge(w, h);
    drawBottomLabel(w, h);
    t += 0.016;
    requestAnimationFrame(frame);
  }
  frame();
})();
