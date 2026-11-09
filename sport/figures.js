// Dessins animés des exercices (personnage + machine), vue de profil sauf mention.
// Chaque exercice : position de départ (a) et d'arrivée (b), ou fonction de cycle (fn).
// Les positions donnent la hanche, l'angle du buste et la cible des mains / pieds ;
// les coudes et genoux se placent tout seuls (cinématique inverse à deux segments).
(function () {
  const L = { torso: 38, neck: 13, ua: 22, fa: 20, th: 28, sh: 28, ft: 10 };
  const rad = d => d * Math.PI / 180, deg = r => r * 180 / Math.PI;
  const dir = (a, l) => [Math.cos(rad(a)) * l, Math.sin(rad(a)) * l];
  const add = (p, v) => [p[0] + v[0], p[1] + v[1]];
  const ang = (p, q) => deg(Math.atan2(q[1] - p[1], q[0] - p[0]));
  function ik(root, target, l1, l2, s) {
    const dx = target[0] - root[0], dy = target[1] - root[1];
    const d = Math.min(Math.max(Math.hypot(dx, dy), 1), l1 + l2 - 0.01);
    const base = deg(Math.atan2(dy, dx)), al = deg(Math.acos((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)));
    const j = add(root, dir(base - s * al, l1));
    return [j, add(j, dir(ang(j, target), l2))];
  }
  // Calcule les articulations à partir d'une position
  function solve(p) {
    const hip = p.hip, sho = add(hip, dir(p.torso, L.torso)), head = add(sho, dir(p.head ?? p.torso, L.neck));
    const J = { hip, sho, head };
    const arm = (W, wr, s, k) => {
      const t = W || (wr && add(sho, wr)); if (!t) return;
      const [e, w] = ik(sho, t, L.ua, L.fa, s ?? -1); J['e' + k] = e; J['w' + k] = w;
    };
    const leg = (A, th, kn, s, ft, k) => {
      let kj, an;
      if (A) [kj, an] = ik(hip, A, L.th, L.sh, s ?? 1);
      else if (th != null) { kj = add(hip, dir(th, L.th)); an = add(kj, dir(kn, L.sh)); }
      else return;
      J['k' + k] = kj; J['a' + k] = an; J['t' + k] = add(an, dir(ft ?? 0, L.ft));
    };
    arm(p.W, p.wr, p.ws, ''); arm(p.W2, p.wr2, p.ws2, '2');
    leg(p.A, p.th, p.kn, p.as, p.ft, ''); leg(p.A2, p.th2, p.kn2, p.as2, p.ft2, '2');
    return J;
  }
  // Interpolation de deux positions (nombres et points)
  function lerp(a, b, t) {
    const o = {};
    for (const k in a) {
      const x = a[k], y = b[k] ?? x;
      o[k] = Array.isArray(x) ? [x[0] + (y[0] - x[0]) * t, x[1] + (y[1] - x[1]) * t] : typeof x === 'number' ? x + (y - x) * t : x;
    }
    for (const k in b) if (!(k in o)) o[k] = b[k];
    return o;
  }
  const P = pts => pts.map(p => p.join(',')).join(' ');
  const line = (p, q, w, c, extra = '') => `<line x1="${p[0].toFixed(1)}" y1="${p[1].toFixed(1)}" x2="${q[0].toFixed(1)}" y2="${q[1].toFixed(1)}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" ${extra}/>`;
  const circ = (p, r, c, extra = '') => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r}" fill="${c}" ${extra}/>`;
  const M = 'var(--mach)', MD = 'var(--mach2)', B = 'var(--body)', H = 'var(--hot)';

  // Dessine le personnage (profil)
  function body(J, hot, ghost) {
    const hc = k => hot.includes(k) ? H : B;
    let s = '';
    const back = ghost ? '' : 'opacity="0.42"';
    // membres arrière (plus pâles)
    if (J.k2) s += `<g ${back}>` + line(J.hip, J.k2, 10, hc('thigh2')) + line(J.k2, J.a2, 8, hc('shin2')) + line(J.a2, J.t2, 5, B) + '</g>';
    if (J.e2) s += `<g ${back}>` + line(J.sho, J.e2, 7, hc('arm2')) + line(J.e2, J.w2, 6, hc('arm2')) + '</g>';
    s += line(J.hip, J.sho, 14, hc('torso'));
    s += circ(J.head, 8.5, B);
    if (hot.includes('glute')) s += circ(J.hip, 7.5, H);
    if (J.k) s += line(J.hip, J.k, 10, hc('thigh')) + line(J.k, J.a, 8, hc('shin')) + line(J.a, J.t, 5, B);
    if (J.e) s += line(J.sho, J.e, 7, hc('arm')) + line(J.e, J.w, 6, hc('arm')) + circ(J.w, 3.4, B);
    return s;
  }

  // ---------- Personnage de face / de dos (points donnés directement) ----------
  function front(p, hot, opt = {}) {
    const hc = k => hot.includes(k) ? H : B;
    let s = '';
    s += `<polygon points="${P([p.sl, p.sr, p.hr, p.hl])}" fill="${hc('torso')}" stroke="${hc('torso')}" stroke-width="6" stroke-linejoin="round"/>`;
    s += line([110, 48], [110, 52], 7, B) + circ([110, 40], 9, B);
    for (const side of ['l', 'r']) {
      s += line(p['s' + side], p['e' + side], 7, hc('arm')) + line(p['e' + side], p['w' + side], 6, hc('arm')) + circ(p['w' + side], 3.4, B);
      if (p['k' + side]) s += line(p['h' + side], p['k' + side], 11, hc('thigh')) + line(p['k' + side], p['a' + side], 8, hc('shin'));
      if (opt.pads) s += circ(add(p['k' + side], [side === 'l' ? -opt.pads : opt.pads, 0]), 5.5, MD);
      if (opt.handles) s += line(add(p['w' + side], [0, -6]), add(p['w' + side], [0, 6]), 4, MD);
    }
    return s;
  }
  const seatedFront = (spread) => ({
    sl: [97, 57], sr: [123, 57], hl: [103, 95], hr: [117, 95],
    el: [90, 78], wl: [92, 97], er: [130, 78], wr: [128, 97],
    hl2: 0,
    kl: spread ? [82, 101] : [103, 103], al: spread ? [88, 132] : [101, 132],
    kr: spread ? [138, 101] : [117, 103], ar: spread ? [132, 132] : [119, 132],
  });
  function fixHips(p) { p.hl = [103, 95]; p.hr = [117, 95]; return p; }

  const ground = (y = 135) => line([8, y + 2], [212, y + 2], 2, 'var(--line)');
  const rect = (x, y, w, h, c = M, r = 3) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${c}"/>`;
  const arrow = (pts, c = H) => `<path d="M${P(pts).replace(/ /g, ' L')}" fill="none" stroke="${c}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#ah)" opacity=".9"/>`;

  // ---------- Exercices ----------
  const F = {
    presse: {
      a: { hip: [80, 100], torso: -135, head: -118, W: [86, 102], A: [113, 81], ft: -120 },
      b: { hip: [80, 100], torso: -135, head: -118, W: [86, 102], A: [126.8, 73], ft: -120 },
      hot: ['thigh', 'glute'], effort: 'ab',
      bg: () => line([118, 92], [182, 55], 5, MD) + line([46, 70], [79, 106], 9, M) + line([70, 110], [98, 110], 7, M) + line([82, 112], [82, 136], 5, MD) + line([150, 74], [150, 136], 5, MD),
      fg: J => { const c = add(J.a, dir(-30, 6)); return line(add(c, dir(60, 20)), add(c, dir(-120, 20)), 6, M); },
      arrow: [[132, 96], [146, 88]],
    },
    legcurl: {
      a: { hip: [95, 95], torso: -95, W: [104, 99], A: [143, 113], ft: -46 },
      b: { hip: [95, 95], torso: -95, W: [104, 99], A: [112, 124], ft: 20 },
      hot: ['thigh'], effort: 'ab',
      bg: () => line([74, 103], [128, 103], 7, M) + line([80, 52], [82, 98], 8, M) + line([82, 106], [82, 136], 5, MD) + line([124, 106], [124, 136], 5, MD),
      fg: J => circ([119, 84], 5.5, M) + circ(add(J.a, dir(ang(J.k, J.a) + 90, 7)), 5.5, M),
      arrow: [[156, 118], [150, 132], [134, 138]],
    },
    pont: {
      a: { hip: [100, 126], torso: 180, W: [102, 127], A: [136, 129], ft: -5, as: 1 },
      b: { hip: [96.4, 110], torso: 155, head: 175, W: [102, 127], A: [136, 129], ft: -5, as: 1 },
      hot: ['glute', 'thigh'], effort: 'ab',
      bg: () => rect(28, 134, 150, 4, MD, 2),
      arrow: [[86, 102], [86, 86]],
    },
    abducteurs: { front: true, a: fixHips(seatedFront(false)), b: fixHips(seatedFront(true)), hot: ['thigh'], effort: 'ab', pads: 9, label: 'vue de face',
      bg: () => rect(90, 34, 40, 62, M, 6) + rect(86, 93, 48, 8, M, 3) + line([110, 101], [110, 136], 5, MD),
      arrow2: [[[78, 82], [64, 82]], [[142, 82], [156, 82]]] },
    adducteurs: { front: true, a: fixHips(seatedFront(true)), b: fixHips(seatedFront(false)), hot: ['thigh'], effort: 'ab', pads: -9, label: 'vue de face',
      bg: () => rect(90, 34, 40, 62, M, 6) + rect(86, 93, 48, 8, M, 3) + line([110, 101], [110, 136], 5, MD),
      arrow2: [[[66, 82], [80, 82]], [[154, 82], [140, 82]]] },
    mollets: {
      a: { hip: [112, 70], torso: -90, W: [131, 74], A: [112, 125], ft: -12 },
      b: { hip: [114, 61], torso: -90, W: [131, 74], A: [114, 116], ft: 42 },
      hot: ['shin'], effort: 'ab',
      bg: () => rect(104, 123, 44, 13, M) + line([136, 40], [136, 136], 5, MD),
      arrow: [[96, 112], [96, 96]],
    },
    tirage: {
      a: { hip: [100, 100], torso: -100, W: [97, 22], ws: 1, A: [128, 133], ft: 0 },
      b: { hip: [100, 100], torso: -100, W: [104, 56], ws: 1, A: [128, 133], ft: 0 },
      hot: ['arm', 'torso'], effort: 'ab',
      bg: () => circ([100, 6], 4.5, MD) + line([76, 105], [116, 105], 7, M) + line([92, 108], [92, 136], 5, MD) + line([64, 6], [64, 136], 5, MD) + line([64, 6], [100, 6], 4, MD),
      fg: J => line(J.w, [100, 6], 1.6, MD) + line(add(J.w, [-18, 2]), add(J.w, [16, 2]), 4.5, M) + circ(add(J.k, [-4, -9]), 5.5, M),
      arrow: [[136, 24], [136, 52]],
    },
    developpe: {
      a: { hip: [90, 100], torso: -90, W: [104, 63], ws: -1, A: [120, 133] },
      b: { hip: [90, 100], torso: -90, W: [130, 63], ws: -1, A: [120, 133] },
      hot: ['torso', 'arm'], effort: 'ab',
      bg: () => line([82, 54], [82, 100], 9, M) + line([74, 105], [108, 105], 7, M) + line([90, 108], [90, 136], 5, MD) + circ([150, 22], 4.5, MD) + line([150, 22], [150, 136], 5, MD),
      fg: J => line(J.w, [150, 22], 4, MD) + line(add(J.w, [0, -7]), add(J.w, [0, 7]), 5, M),
      arrow: [[118, 46], [140, 46]],
    },
    rowing: {
      a: { hip: [88, 100], torso: -88, W: [132, 70], ws: 1, A: [128, 133] },
      b: { hip: [88, 100], torso: -88, W: [102, 82], ws: 1, A: [128, 133] },
      hot: ['torso', 'arm'], effort: 'ab',
      bg: () => line([103, 60], [103, 92], 9, M) + line([72, 105], [104, 105], 7, M) + line([88, 108], [88, 136], 5, MD) + rect(162, 30, 14, 106, M) + circ([169, 72], 4, MD),
      fg: J => line(J.w, [169, 72], 1.6, MD) + line(add(J.w, [0, -6]), add(J.w, [0, 6]), 5, M),
      arrow: [[146, 56], [120, 56]],
    },
    epaules: {
      a: { hip: [95, 100], torso: -90, W: [104, 60], ws: 1, A: [125, 133] },
      b: { hip: [95, 100], torso: -90, W: [101, 22], ws: 1, A: [125, 133] },
      hot: ['arm'], effort: 'ab',
      bg: () => line([87, 46], [87, 100], 9, M) + line([79, 105], [113, 105], 7, M) + line([95, 108], [95, 136], 5, MD),
      fg: J => line(add(J.w, [-8, 0]), add(J.w, [8, 0]), 5, M),
      arrow: [[124, 58], [124, 30]],
    },
    oiseau: { front: true, label: 'vu de dos', hot: ['arm', 'torso'], effort: 'ab', handles: true,
      a: { sl: [97, 57], sr: [123, 57], hl: [103, 95], hr: [117, 95], el: [100, 64], wl: [104, 62], er: [120, 64], wr: [116, 62] },
      b: { sl: [97, 57], sr: [123, 57], hl: [103, 95], hr: [117, 95], el: [76, 59], wl: [56, 61], er: [144, 59], wr: [164, 61] },
      bg: () => rect(86, 93, 48, 8, M, 3) + line([110, 101], [110, 136], 5, MD),
      arrow2: [[[88, 46], [64, 46]], [[132, 46], [156, 46]]] },
    stepup: {
      a: { hip: [104, 83], torso: -78, wr: [6, 40], wr2: [-4, 40], A: [130, 111], ft: 0, A2: [96, 133], ft2: 0 },
      b: { hip: [128, 58], torso: -90, wr: [2, 41], wr2: [-2, 41], A: [130, 111], ft: 0, A2: [123, 104], ft2: 20 },
      hot: ['thigh', 'glute'], effort: 'ab',
      bg: () => rect(116, 113, 48, 23, M, 4),
      arrow: [[90, 70], [104, 50]],
    },
    squat: {
      a: { hip: [106, 78], torso: -90, wr: [12, 14], ws: -1, A: [110, 133], ft: 0 },
      b: { hip: [90, 100], torso: -55, head: -70, wr: [14, 10], ws: -1, A: [110, 133], ft: 0 },
      hot: ['thigh', 'glute'], effort: 'ba',
      bg: () => rect(58, 107, 36, 29, M, 4),
      fg: J => rect(J.w[0] - 3, J.w[1] - 7, 6, 14, MD, 2),
      arrow: [[140, 96], [140, 66]],
    },
    rowhaltere: {
      a: { hip: [80, 80], torso: -10, W: [124, 116], ws: 1, W2: [116, 113], ws2: 1, th: 90, kn: 180, ft: 180, A2: [96, 133], ft2: 0 },
      b: { hip: [80, 80], torso: -10, W: [104, 86], ws: 1, W2: [116, 113], ws2: 1, th: 90, kn: 180, ft: 180, A2: [96, 133], ft2: 0 },
      hot: ['arm', 'torso'], effort: 'ab',
      bg: () => rect(42, 112, 84, 7, M, 3) + line([50, 119], [50, 136], 5, MD) + line([118, 119], [118, 136], 5, MD),
      fg: J => rect(J.w[0] - 7, J.w[1] - 3, 14, 6, MD, 2),
      arrow: [[138, 112], [138, 86]],
    },
    pompes: {
      a: { hip: [89.6, 93.4], torso: -45, W: [141, 100], ws: 1, A: [50, 133], ft: 25 },
      b: { hip: [97.5, 103.3], torso: -32, W: [141, 100], ws: 1, A: [50, 133], ft: 25 },
      hot: ['torso', 'arm'], effort: 'ba',
      bg: () => rect(126, 101, 50, 7, M, 3) + line([132, 108], [132, 136], 5, MD) + line([170, 108], [170, 136], 5, MD),
      arrow: [[120, 50], [128, 66]],
    },
    legext: {
      a: { hip: [90, 98], torso: -95, W: [98, 102], A: [114, 125], ft: 10 },
      b: { hip: [90, 98], torso: -95, W: [98, 102], A: [145, 92], ft: -80 },
      hot: ['thigh'], effort: 'ab',
      bg: () => line([70, 105], [120, 105], 7, M) + line([77, 54], [79, 100], 8, M) + line([76, 108], [76, 136], 5, MD) + line([116, 108], [116, 136], 5, MD),
      fg: J => circ(add(J.a, dir(ang(J.k, J.a) - 90, 7)), 5.5, M),
      arrow: [[132, 126], [150, 110]],
    },
    planche: {
      a: { hip: [104.3, 122.1], torso: -18.7, head: -10, W: [160, 132], ws: -1, th: 161.3, kn: 180, ft: 175 },
      b: { hip: [104.3, 121.1], torso: -18.2, head: -10, W: [160, 132], ws: -1, th: 161.3, kn: 180, ft: 175 },
      hot: ['torso'], effort: 'hold',
      bg: () => rect(30, 136, 150, 3, MD, 2),
      fg: () => line([74, 119], [146, 96], 1.5, 'var(--good)', 'stroke-dasharray="4 4"'),
    },
    deadbug: {
      a: { hip: [108, 126], torso: 180, wr: [2, -40], ws: 1, wr2: [2, -40], A: [136, 98], ft: -90, A2: [136, 98], ft2: -90 },
      b: { hip: [108, 126], torso: 180, wr: [-40, -6], ws: 1, wr2: [2, -40], A: [136, 98], ft: -90, A2: [162, 118], ft2: -80 },
      hot: ['torso', 'arm', 'thigh2', 'shin2'], effort: 'ab',
      bg: () => rect(20, 134, 160, 4, MD, 2),
      arrow: [[64, 74], [36, 104]],
    },
    birddog: {
      a: { hip: [80, 97], torso: 0, head: -5, W: [121, 131], ws: 1, W2: [117, 131], ws2: 1, th: 90, kn: 176, ft: 176, th2: 90, kn2: 176, ft2: 176 },
      b: { hip: [80, 97], torso: 0, head: -10, W: [160, 92], ws: 1, W2: [117, 131], ws2: 1, th: 90, kn: 176, ft: 176, th2: 180, kn2: 180, ft2: 180 },
      hot: ['arm', 'thigh2', 'shin2', 'torso'], effort: 'ab',
      bg: () => rect(20, 133, 160, 4, MD, 2),
      arrow: [[150, 118], [168, 102]],
    },
    equilibre: {
      a: { hip: [110, 77], torso: -90, W: [133, 70], wr2: [-3, 41], A: [110, 133], ft: 0, A2: [108, 133], ft2: 0 },
      b: { hip: [110, 77], torso: -90, W: [133, 70], wr2: [-3, 41], A: [110, 133], ft: 0, A2: [124, 108], ft2: 60 },
      hot: ['shin', 'thigh', 'glute'], effort: 'hold',
      bg: () => line([138, 20], [138, 136], 6, MD),
    },
    // ---------- Versions sans appui sur les genoux ----------
    planchebanc: {
      a: { hip: [89.6, 93.4], torso: -45, W: [141, 100], ws: 1, A: [50, 133], ft: 25 },
      b: { hip: [89.6, 92.6], torso: -44.5, W: [141, 100], ws: 1, A: [50, 133], ft: 25 },
      hot: ['torso'], effort: 'hold',
      bg: () => rect(126, 101, 50, 7, M, 3) + line([132, 108], [132, 136], 5, MD) + line([170, 108], [170, 136], 5, MD),
      fg: () => line([46, 120], [130, 54], 1.5, 'var(--good)', 'stroke-dasharray="4 4"'),
    },
    birddogdebout: {
      a: { hip: [100, 77], torso: -40, head: -30, W: [148, 93], ws: 1, W2: [144, 93], ws2: 1, A: [106, 133], ft: 0, A2: [100, 133], ft2: 0 },
      b: { hip: [100, 77], torso: -40, head: -30, W: [170, 42], ws: 1, W2: [144, 93], ws2: 1, A: [106, 133], ft: 0, A2: [48, 98], ft2: 180 },
      hot: ['arm', 'thigh2', 'shin2', 'glute'], effort: 'ab',
      bg: () => line([134, 95], [158, 95], 6, M) + line([152, 95], [152, 136], 5, MD) + line([156, 95], [156, 60], 5, MD),
      arrow: [[66, 124], [44, 112]],
    },
    rowdebout: {
      a: { hip: [80, 80], torso: -20, W: [112, 108], ws: 1, W2: [126, 103], ws2: 1, A: [94, 133], ft: 0, A2: [62, 133], ft2: 0 },
      b: { hip: [80, 80], torso: -20, W: [98, 80], ws: 1, W2: [126, 103], ws2: 1, A: [94, 133], ft: 0, A2: [62, 133], ft2: 0 },
      hot: ['arm', 'torso'], effort: 'ab',
      bg: () => rect(118, 104, 56, 6, M, 3) + line([124, 110], [124, 136], 5, MD) + line([168, 110], [168, 136], 5, MD),
      fg: J => rect(J.w[0] - 7, J.w[1] - 3, 14, 6, MD, 2),
      arrow: [[104, 122], [104, 98]],
    },
    // ---------- Cardio (cycles) ----------
    tapis: {
      cycle: 1.2,
      fn: t => { const s = Math.sin(t * 2 * Math.PI); return { hip: [110, 74 - Math.abs(Math.cos(t * 2 * Math.PI)) * 1.5], torso: -86, wr: [8 * s + 2, 38], ws: 1, wr2: [-8 * s + 2, 38], ws2: 1, A: [110 + 17 * s, 127 - Math.max(0, -Math.cos(t * 2 * Math.PI)) * 0], ft: 0, A2: [110 - 17 * s, 127], ft2: 0 }; },
      hot: ['thigh', 'shin'],
      bg: () => `<polygon points="${P([[56, 130], [168, 124], [170, 133], [56, 138]])}" fill="${M}"/>` + line([160, 126], [168, 58], 5, MD) + line([150, 54], [176, 60], 6, M),
    },
    velo: {
      cycle: 1.4,
      fn: t => { const a = t * 360, c = [116, 116]; return { hip: [92, 82], torso: -58, head: -40, W: [140, 66], ws: 1, A: add(c, dir(a, 13)), ft: 10, A2: add(c, dir(a + 180, 13)), ft2: 10, as: 1, as2: 1 }; },
      hot: ['thigh'],
      bg: () => line([86, 84], [100, 84], 6, M) + line([93, 86], [116, 116], 5, MD) + line([116, 116], [140, 68], 5, MD) + line([134, 66], [146, 66], 5, M) + line([116, 116], [100, 136], 5, MD) + line([116, 116], [136, 136], 5, MD) + `<circle cx="116" cy="116" r="13" fill="none" stroke="${MD}" stroke-width="2" stroke-dasharray="3 3"/>`,
    },
    ellip: {
      cycle: 1.6,
      fn: t => { const a = t * 360, c = [112, 120]; const f1 = add(c, [Math.cos(rad(a)) * 18, Math.sin(rad(a)) * 5]), f2 = add(c, [Math.cos(rad(a + 180)) * 18, Math.sin(rad(a + 180)) * 5]); return { hip: [110, 68 + Math.sin(rad(a)) * 1], torso: -88, W: [128 + Math.cos(rad(a + 180)) * 9, 70], ws: 1, W2: [128 + Math.cos(rad(a)) * 9, 70], ws2: 1, A: f1, A2: f2, ft: 0, ft2: 0 }; },
      hot: ['thigh', 'arm'],
      bg: () => `<ellipse cx="112" cy="126" rx="22" ry="7" fill="none" stroke="${MD}" stroke-width="2" stroke-dasharray="3 3"/>` + line([150, 136], [150, 50], 6, MD) + rect(70, 132, 92, 5, M, 2),
    },
  };
  // Étirements (une seule position)
  const ST = {
    'st-mollets': { p: { hip: [100, 78], torso: -68, head: -60, W: [150, 52], ws: 1, W2: [148, 56], ws2: 1, A: [124, 133], ft: 0, A2: [66, 133], ft2: 0 }, hot: ['shin2'], bg: () => line([156, 10], [156, 136], 6, MD) },
    'st-quadri': { p: { hip: [110, 77], torso: -90, W: [138, 58], ws: 1, W2: [96, 96], ws2: -1, A: [110, 133], ft: 0, A2: [96, 92], as2: -1, ft2: -100 }, hot: ['thigh2'], bg: () => line([144, 10], [144, 136], 6, MD) },
    'st-ischios': { p: { hip: [80, 102], torso: -48, head: -30, W: [116, 106], ws: 1, A: [133, 126], ft: -70, A2: [100, 133], ft2: 0 }, hot: ['thigh'], bg: () => rect(52, 107, 38, 29, M, 4) },
    'st-fessiers': { p: { hip: [106, 126], torso: 180, W: [92, 100], ws: -1, th: -128, kn: -8, ft: -100, A2: [160, 129], ft2: -80 }, hot: ['glute'], bg: () => rect(28, 134, 150, 4, MD, 2) },
    'st-poitrine': { p: { hip: [110, 77], torso: -86, W: [90, 18], ws: -1, A: [126, 133], ft: 0, A2: [100, 133], ft2: 0 }, hot: ['torso', 'arm'], bg: () => rect(80, 4, 6, 132, MD, 2) },
    'st-dos': { p: { hip: [80, 102], torso: -45, head: 30, W: [116, 126], ws: 1, A: [112, 133], ft: 0 }, hot: ['torso'], bg: () => rect(52, 107, 36, 29, M, 4) },
    'st-enfant': { p: { hip: [82, 120], torso: -6, head: 25, W: [160, 129], ws: 1, th: 16, kn: 180, ft: 185 }, hot: ['torso'], bg: () => rect(30, 134, 150, 4, MD, 2) },
  };
  Object.assign(F, Object.fromEntries(Object.entries(ST).map(([k, v]) => [k, { a: v.p, b: v.p, hot: v.hot, bg: v.bg, effort: 'static' }])));
  F['warm-tapis'] = F.tapis; F['warm-ellip'] = F.ellip;

  const DEFS = '<defs><marker id="ah" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="4.5" markerHeight="4.5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--hot)"/></marker></defs>';
  const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  // Temps → avancement 0..1 (départ → arrivée) et consigne de respiration
  function phase(f, time) {
    if (f.effort === 'static') return { t: 0, cue: 'Tenez 30 s, respirez calmement' };
    if (f.effort === 'hold') { const c = (time / 5000) % 1; const t = c < 0.2 ? ease(c / 0.2) : c < 0.85 ? 1 : 1 - ease((c - 0.85) / 0.15); return { t, cue: c < 0.2 ? 'Mettez-vous en place' : c < 0.85 ? 'Tenez… respirez normalement' : 'Relâchez' }; }
    const c = (time / 4200) % 1; let t, up;
    if (c < 0.12) { t = 0; up = null; } else if (c < 0.42) { t = ease((c - 0.12) / 0.3); up = true; } else if (c < 0.54) { t = 1; up = null; } else { t = 1 - ease((c - 0.54) / 0.46); up = false; }
    const effortNow = up === null ? null : (f.effort === 'ab' ? up : !up);
    return { t, cue: effortNow === null ? (t ? 'Pause' : 'Position de départ') : effortNow ? 'Soufflez 💨 pendant l\'effort' : 'Inspirez, revenez lentement' , hard: effortNow };
  }
  function draw(id, time, still) {
    const f = F[id]; if (!f) return '';
    let s = DEFS + (f.front ? '' : ground(id.startsWith('st-') || ['pont', 'deadbug', 'planche', 'birddog'].includes(id) ? 135 : 135));
    s += f.bg ? f.bg() : '';
    let cue = '';
    if (f.fn) {
      const p = f.fn(still ? 0.25 : (time / (f.cycle * 1000)) % 1); const J = solve(p);
      s += body(J, f.hot) + (f.fg ? f.fg(J) : '');
    } else if (f.front) {
      const ph = still ? { t: 0.55 } : phase(f, time); cue = ph.cue;
      if (!still) s += `<g opacity=".16">${front(f.b, [], f)}</g>`;
      s += front(lerp(f.a, f.b, ph.t), f.hot, { pads: f.pads, handles: f.handles });
      if (!still && f.arrow2) s += f.arrow2.map(a => arrow(a)).join('');
      if (!still) s += `<text x="10" y="16" font-size="9" fill="var(--soft)">${f.label}</text>`;
    } else {
      const ph = still ? { t: f.effort === 'static' ? 0 : 0.55 } : phase(f, time); cue = ph.cue;
      if (!still && f.effort !== 'static') { const Jb = solve(f.b); s += `<g opacity=".16">${body(Jb, [], true)}${f.fg ? f.fg(Jb) : ''}</g>`; }
      const J = solve(lerp(f.a, f.b, ph.t));
      s += body(J, f.hot) + (f.fg ? f.fg(J) : '');
      if (!still && f.arrow) s += arrow(f.arrow);
    }
    return { svg: s, cue };
  }
  window.FIG = {
    has: id => !!F[id],
    svg(id, cls = 'fig', still = false) {
      const d = draw(id, 0, still);
      return `<figure class="${cls}"><svg viewBox="0 0 220 145" ${still ? '' : `data-fig="${id}"`} role="img" aria-label="Dessin de l'exercice">${d.svg}</svg>${still ? '' : `<figcaption data-cue="${id}">${d.cue || ''}</figcaption>`}</figure>`;
    },
    start() {
      if (this._raf) return;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      const loop = time => {
        document.querySelectorAll('svg[data-fig]').forEach(el => {
          if (!el.getClientRects().length) return;
          const d = draw(el.dataset.fig, reduce ? 1800 : time); el.innerHTML = d.svg;
          const cap = el.parentNode.querySelector('figcaption'); if (cap && cap.textContent !== d.cue) cap.textContent = d.cue;
        });
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    },
  };
})();
