(function() {
  const cv = document.getElementById('dac5c');
  const ctx = cv.getContext('2d');
  const wrap = document.getElementById('dac5-wrap');
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
    red:     '#c0392b',
  };

  let t = 0, totalTime = 0;
  const CYCLE = 20;

  const VAULTS = [
    { fx: 0.60, fy: 0.18, label: 'Personal Data',  color: '#6BC9ED', unlockAt: 2.0,  relockAt: 6.5  },
    { fx: 0.72, fy: 0.33, label: 'Financial',       color: '#2484C3', unlockAt: 5.0,  relockAt: 9.0  },
    { fx: 0.76, fy: 0.53, label: 'Health Records',  color: '#6e8291', unlockAt: 8.0,  relockAt: 12.0 },
    { fx: 0.66, fy: 0.71, label: 'Documents',       color: '#f4fafa', unlockAt: 11.0, relockAt: 15.0 },
    { fx: 0.53, fy: 0.83, label: 'Communications',  color: '#6BC9ED', unlockAt: 14.0, relockAt: 18.5 },
  ];

  const ATTACKER_DEFS = [
    { vaultIdx: 0, label: 'Scraper',  orbitOff: 0.0  },
    { vaultIdx: 0, label: 'Bot',      orbitOff: 1.1  },
    { vaultIdx: 1, label: 'Hacker',   orbitOff: 0.5  },
    { vaultIdx: 1, label: 'Crawler',  orbitOff: 2.0  },
    { vaultIdx: 2, label: 'Probe',    orbitOff: 0.3  },
    { vaultIdx: 3, label: 'Intruder', orbitOff: 1.7  },
    { vaultIdx: 3, label: 'Scanner',  orbitOff: 3.0  },
    { vaultIdx: 4, label: 'Threat',   orbitOff: 0.8  },
  ];

  const ATTACKERS = ATTACKER_DEFS.map((def, i) => ({
    ...def,
    angle:       def.orbitOff,
    orbitSpeed:  (0.012 + Math.random() * 0.008) * (i % 2 === 0 ? 1 : -1),
    dist:        1.9 + Math.random() * 0.4,
    approachSpd: 0.0015 + Math.random() * 0.001,
    recoilV:     0,
    flashTimer:  0,
    phase:       Math.random() * Math.PI * 2,
  }));

  const PARTICLES = Array.from({length: 28}, () => ({
    angle:  Math.random() * Math.PI * 2,
    radius: 0.022 + Math.random() * 0.05,
    speed:  (0.002 + Math.random() * 0.003) * (Math.random() > .5 ? 1 : -1),
    size:   0.8 + Math.random() * 1.3,
    alpha:  0.08 + Math.random() * 0.18,
  }));

  function userPos(w, h)     { return { x: w * 0.26, y: h * 0.50 }; }
  function vaultPos(v, w, h) { return { x: w * v.fx,  y: h * v.fy }; }
  function vaultRadius(w, h) { return Math.min(w, h) * 0.058; }
  function protectR(w, h)    { return Math.min(w, h) * 0.185; }

  function drawKey(kx, ky, size, color, angle, alpha) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = Math.max(1.3, size * 0.10);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.translate(kx, ky); ctx.rotate(angle);
    const bowR = size * 0.26, shaftL = size * 0.70;
    const startX = bowR, endX = bowR + shaftL, tw = size * 0.095;
    const teeth = [
      { ox: endX - tw*1.0, h: size*0.16 },
      { ox: endX - tw*2.2, h: size*0.11 },
      { ox: endX - tw*3.4, h: size*0.14 },
    ];
    ctx.beginPath(); ctx.arc(0,0,bowR,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(0,0,bowR*0.44,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(startX,0); ctx.lineTo(endX,0); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(endX,-size*0.07); ctx.lineTo(endX,size*0.07); ctx.stroke();
    teeth.forEach(({ox,h}) => {
      ctx.beginPath();
      ctx.moveTo(ox,0); ctx.lineTo(ox,h); ctx.lineTo(ox-tw*0.7,h); ctx.lineTo(ox-tw*0.7,0);
      ctx.stroke();
    });
    ctx.restore();
  }

  function drawProtectiveCircle(w, h) {
    const { x, y } = userPos(w, h);
    const r = protectR(w, h);
    for (let i = 2; i >= 1; i--) {
      ctx.save();
      ctx.globalAlpha = 0.04 + 0.02 * Math.sin(t * 1.1 + i * 0.5);
      ctx.strokeStyle = C.privacy; ctx.lineWidth = i * 5;
      ctx.beginPath(); ctx.arc(x, y, r + i * 5, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    const seg = 30, gap = 0.13, rot = t * 0.18;
    for (let s = 0; s < seg; s++) {
      const a1 = (s / seg) * Math.PI * 2 + rot;
      const a2 = ((s + 1 - gap) / seg) * Math.PI * 2 + rot;
      const p  = 0.4 + 0.6 * Math.sin(t * 2.0 + s * 0.55);
      ctx.save();
      ctx.globalAlpha = 0.22 + 0.26 * p;
      ctx.strokeStyle = C.privacy; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(x, y, r, a1, a2); ctx.stroke();
      ctx.restore();
    }
    const seg2 = 18, gap2 = 0.20, rot2 = -t * 0.11;
    for (let s = 0; s < seg2; s++) {
      const a1 = (s / seg2) * Math.PI * 2 + rot2;
      const a2 = ((s + 1 - gap2) / seg2) * Math.PI * 2 + rot2;
      ctx.save();
      ctx.globalAlpha = 0.09 + 0.09 * Math.sin(t * 1.4 + s * 0.9);
      ctx.strokeStyle = C.blue; ctx.lineWidth = 1.0; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(x, y, r * 0.80, a1, a2); ctx.stroke();
      ctx.restore();
    }
    ctx.save();
    ctx.globalAlpha = 0.035 + 0.015 * Math.sin(t * 0.9);
    ctx.fillStyle = C.blue;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  function drawUser(w, h) {
    const { x, y } = userPos(w, h);
    const r = Math.min(w, h) * 0.048;
    ctx.save(); ctx.globalAlpha = 0.9; ctx.fillStyle = C.blue;
    ctx.beginPath(); ctx.arc(x, y - r*0.22, r*0.35, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x, y + r*0.46, r*0.56, Math.PI, 0, false); ctx.fill();
    ctx.restore();
    ctx.save(); ctx.globalAlpha = 0.82; ctx.strokeStyle = C.privacy; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    const fs = Math.round(Math.min(w,h) * 0.023);
    ctx.save(); ctx.globalAlpha = 0.88;
    ctx.font = `700 ${fs}px Poppins, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    ctx.fillStyle = C.privacy;
    ctx.fillText('Authorized User', x, y + r + 7);
    ctx.restore();
  }

  function drawKeyRing(w, h) {
    const { x, y } = userPos(w, h);
    const ringCY = y - Math.min(w,h) * 0.112;
    const orbitR = Math.min(w,h) * 0.032;
    ctx.save(); ctx.globalAlpha = 0.18; ctx.strokeStyle = C.privacy; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.arc(x, ringCY, orbitR, 0, Math.PI*2); ctx.stroke(); ctx.restore();
    VAULTS.forEach((v, i) => {
      const a = (i / VAULTS.length) * Math.PI * 2 + t * 0.22;
      drawKey(x + Math.cos(a)*orbitR, ringCY + Math.sin(a)*orbitR,
              Math.min(w,h)*0.042, v.color, 0, 0.66);
    });
  }

  function drawVault(v, w, h, tc) {
    const { x, y } = vaultPos(v, w, h);
    const r = vaultRadius(w, h);
    const tmod = tc % CYCLE;
    const isUnlocked = tmod >= v.unlockAt && tmod < v.relockAt;
    const unlockFrac = isUnlocked ? Math.min(1,(tmod - v.unlockAt)/0.7) : 0;

    ctx.save(); ctx.globalAlpha = 0.10 + unlockFrac*0.13; ctx.fillStyle = v.color;
    ctx.beginPath(); ctx.roundRect(x-r,y-r,r*2,r*2,6); ctx.fill(); ctx.restore();

    ctx.save(); ctx.globalAlpha = 0.50+unlockFrac*0.36; ctx.strokeStyle = v.color;
    ctx.lineWidth = isUnlocked ? 2.0 : 1.2;
    ctx.beginPath(); ctx.roundRect(x-r,y-r,r*2,r*2,6); ctx.stroke(); ctx.restore();

    for (let s=0;s<8;s++) {
      const sa=(s/8)*Math.PI*2+t*(isUnlocked?0.35:0.05);
      ctx.save(); ctx.globalAlpha=0.08+unlockFrac*0.14; ctx.strokeStyle=v.color; ctx.lineWidth=0.7;
      ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+Math.cos(sa)*r*0.47,y+Math.sin(sa)*r*0.47); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha=0.58; ctx.strokeStyle=v.color; ctx.lineWidth=1.2;
    ctx.beginPath(); ctx.arc(x,y,r*0.47,0,Math.PI*2); ctx.stroke(); ctx.restore();

    const lkr=r*0.19, bw=lkr*1.2, bh=lkr*0.9;
    const lift=unlockFrac*lkr*0.95;
    ctx.save(); ctx.globalAlpha=0.85; ctx.strokeStyle=v.color; ctx.fillStyle=v.color; ctx.lineWidth=1.7;
    ctx.beginPath(); ctx.roundRect(x-bw/2,y-lkr*0.1,bw,bh,2); ctx.stroke();
    ctx.beginPath(); ctx.arc(x,y-lkr*0.1-lift,lkr*0.48,Math.PI,0,false); ctx.stroke();
    if (isUnlocked) { ctx.beginPath(); ctx.arc(x,y+bh*0.36,lkr*0.13,0,Math.PI*2); ctx.fill(); }
    ctx.restore();

    const fs=Math.round(Math.min(w,h)*0.020);
    ctx.save(); ctx.globalAlpha=0.80; ctx.font=`600 ${fs}px Poppins, sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='top'; ctx.fillStyle=v.color;
    ctx.fillText(v.label, x, y+r+6); ctx.restore();

    if (isUnlocked) {
      ctx.save(); ctx.globalAlpha=0.05+0.04*Math.sin(t*2.5);
      ctx.fillStyle=v.color; ctx.beginPath(); ctx.arc(x,y,r*1.45,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  function drawAttackers(w, h) {
    ATTACKERS.forEach((atk) => {
      atk.angle += atk.orbitSpeed * 0.016;
      const v = VAULTS[atk.vaultIdx];
      const { x: vx, y: vy } = vaultPos(v, w, h);
      const vr = vaultRadius(w, h);

      atk.dist -= atk.approachSpd;
      if (atk.dist < 1.55) {
        atk.dist = 1.55;
        atk.recoilV = 0.5;
        atk.flashTimer = 1.0;
      }
      if (atk.recoilV > 0) {
        atk.dist += atk.recoilV * 0.055;
        atk.recoilV *= 0.86;
      }
      if (atk.recoilV < 0.04) {
        if (atk.dist > 2.2) atk.dist = 2.0 + Math.random() * 0.3;
      }
      atk.flashTimer = Math.max(0, atk.flashTimer - 0.028);

      const dist = vr * atk.dist;
      const ax = vx + Math.cos(atk.angle) * dist;
      const ay = vy + Math.sin(atk.angle) * dist;
      if (ax < -20 || ax > w+20 || ay < -20 || ay > h+20) return;

      const flicker = 0.45 + 0.55 * Math.sin(t * 3.5 + atk.phase);
      const isFlashing = atk.flashTimer > 0;
      const tr = Math.min(w,h) * 0.022;

      const ex = vx + Math.cos(atk.angle) * vr * 1.05;
      const ey = vy + Math.sin(atk.angle) * vr * 1.05;
      ctx.save(); ctx.globalAlpha = 0.07 * flicker;
      ctx.strokeStyle = C.red; ctx.lineWidth = 0.8;
      ctx.setLineDash([3,6]);
      ctx.beginPath(); ctx.moveTo(ax,ay); ctx.lineTo(ex,ey); ctx.stroke();
      ctx.setLineDash([]); ctx.restore();

      ctx.save();
      ctx.globalAlpha = (isFlashing ? 0.88 : 0.42) * flicker;
      ctx.strokeStyle = isFlashing ? '#ff4444' : C.red;
      ctx.lineWidth = isFlashing ? 1.8 : 1.2;
      ctx.beginPath(); ctx.arc(ax, ay, tr, 0, Math.PI*2); ctx.stroke();
      ctx.restore();

      const xs = tr * 0.48;
      ctx.save();
      ctx.globalAlpha = (isFlashing ? 0.9 : 0.45) * flicker;
      ctx.strokeStyle = isFlashing ? '#ff4444' : C.red;
      ctx.lineWidth = isFlashing ? 1.8 : 1.2; ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(ax-xs,ay-xs); ctx.lineTo(ax+xs,ay+xs);
      ctx.moveTo(ax+xs,ay-xs); ctx.lineTo(ax-xs,ay+xs);
      ctx.stroke(); ctx.restore();

      const fs = Math.round(Math.min(w,h)*0.018);
      ctx.save(); ctx.globalAlpha = 0.38 * flicker;
      ctx.font = `600 ${fs}px Poppins, sans-serif`;
      ctx.fillStyle = C.red; ctx.textAlign = 'center';
      ctx.textBaseline = ay > vy ? 'top' : 'bottom';
      ctx.fillText(atk.label, ax, ay + (ay > vy ? tr+3 : -tr-3));
      ctx.restore();

      if (isFlashing) {
        ctx.save(); ctx.globalAlpha = 0.65 * atk.flashTimer;
        ctx.strokeStyle = C.privacy; ctx.lineWidth = 1.4; ctx.lineCap = 'round';
        for (let s=0;s<6;s++) {
          const sa = atk.angle + (s-2.5)*0.36;
          const slen = 5 + Math.random()*7;
          ctx.beginPath(); ctx.moveTo(ex,ey);
          ctx.lineTo(ex+Math.cos(sa)*slen, ey+Math.sin(sa)*slen); ctx.stroke();
        }
        ctx.restore();

        ctx.save(); ctx.globalAlpha = 0.30 * atk.flashTimer;
        ctx.strokeStyle = '#ff4444'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(ex,ey,11*atk.flashTimer,0,Math.PI*2); ctx.stroke(); ctx.restore();

        ctx.save(); ctx.globalAlpha = atk.flashTimer * 0.88;
        ctx.font = `700 ${Math.round(Math.min(w,h)*0.020)}px Poppins, sans-serif`;
        ctx.fillStyle = '#ff4444'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('DENIED', ex+Math.cos(atk.angle)*20, ey+Math.sin(atk.angle)*20);
        ctx.restore();
      }
    });
  }

  function drawKeyHandoff(v, w, h, tc) {
    const tmod = tc % CYCLE;
    const tWin = 1.1;
    if (!(tmod >= v.unlockAt - tWin && tmod < v.relockAt)) return;
    const progress = Math.min(1,(tmod-(v.unlockAt-tWin))/tWin);
    const {x:ux,y:uy} = userPos(w,h);
    const {x:vx,y:vy} = vaultPos(v,w,h);
    const cpx=(ux+vx)/2, cpy=(uy+vy)/2-Math.min(w,h)*0.05;
    const bx=(1-progress)*(1-progress)*ux+2*(1-progress)*progress*cpx+progress*progress*vx;
    const by=(1-progress)*(1-progress)*uy+2*(1-progress)*progress*cpy+progress*progress*vy;

    ctx.save(); ctx.globalAlpha=0.08*(1-Math.abs(progress-0.5)*2);
    ctx.strokeStyle=v.color; ctx.lineWidth=1; ctx.setLineDash([3,7]);
    ctx.beginPath(); ctx.moveTo(ux,uy); ctx.quadraticCurveTo(cpx,cpy,vx,vy); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();

    const fa = progress < 0.88 ? 0.90 : 0.90*(1-(progress-0.88)/0.12);
    drawKey(bx,by,Math.min(w,h)*0.048,v.color,0,fa);

    for (let i=1;i<=3;i++) {
      const frac=Math.max(0,progress-i*0.07);
      const tx=(1-frac)*(1-frac)*ux+2*(1-frac)*frac*cpx+frac*frac*vx;
      const ty=(1-frac)*(1-frac)*uy+2*(1-frac)*frac*cpy+frac*frac*vy;
      ctx.save(); ctx.globalAlpha=0.09*(1-i/4); ctx.fillStyle=v.color;
      ctx.beginPath(); ctx.arc(tx,ty,1.7,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  function drawGrid(w,h) {
    const cols=22,rows=13;
    for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
      const gx=(c/(cols-1))*w,gy=(r/(rows-1))*h;
      const f=Math.sin(t*1.0+c*0.6+r*1.1);
      if(f<0.80) continue;
      ctx.save(); ctx.globalAlpha=0.032*(f-0.80)/0.20; ctx.fillStyle=C.blue;
      ctx.beginPath(); ctx.arc(gx,gy,1.1,0,Math.PI*2); ctx.fill(); ctx.restore();
    }
  }

  function drawParticles(w,h) {
    const {x:cx,y:cy}=userPos(w,h);
    PARTICLES.forEach(p=>{
      p.angle+=p.speed;
      const px=cx+Math.cos(p.angle)*p.radius*Math.min(w,h);
      const py=cy+Math.sin(p.angle)*p.radius*Math.min(w,h);
      ctx.save(); ctx.globalAlpha=p.alpha*(0.5+0.5*Math.sin(t*1.8+p.angle*2.5));
      ctx.fillStyle=C.blue; ctx.beginPath(); ctx.arc(px,py,p.size,0,Math.PI*2); ctx.fill(); ctx.restore();
    });
  }

  function drawLabel(w,h) {
    const fs=Math.round(Math.min(w,h)*0.027);
    ctx.save(); ctx.globalAlpha=0.70+0.20*Math.sin(t*0.8);
    ctx.font=`700 ${fs}px Poppins, sans-serif`;
    ctx.textAlign='center'; ctx.textBaseline='bottom';
    ctx.fillStyle=C.blue; ctx.fillText('Data Access Control',w/2,h*0.97); ctx.restore();
  }

  function frame() {
    const w=W(),h=H();
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle=C.bg; ctx.fillRect(0,0,w,h);
    drawGrid(w,h);
    drawParticles(w,h);
    drawProtectiveCircle(w,h);
    drawAttackers(w,h);
    VAULTS.forEach(v=>drawKeyHandoff(v,w,h,totalTime));
    VAULTS.forEach(v=>drawVault(v,w,h,totalTime));
    drawKeyRing(w,h);
    drawUser(w,h);
    drawLabel(w,h);
    t+=0.016; totalTime+=0.016;
    requestAnimationFrame(frame);
  }
  frame();
})();
