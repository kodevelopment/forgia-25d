// Controlli Touch ottimizzati per Telefono e Tablet
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (isTouch) {
  // 1. Blocca lo scorrimento, il zoom e il refresh trascinando sul telefono
  const styleMobile = document.createElement('style');
  styleMobile.innerHTML = `
    html, body {
      touch-action: none !important;
      overscroll-behavior: none !important;
      overflow: hidden !important;
      position: fixed;
      width: 100%;
      height: 100%;
    }
    #hud-comandi { display: none !important; }
    #hud-effetti { top: 6px !important; right: 6px !important; gap: 4px !important; max-width: 96vw !important; }
    .box { padding: 3px 6px !important; font-size: 9px !important; border-width: 1px !important; }
    .box span { font-size: 10px !important; }
    #hud-zaino {
      bottom: auto !important;
      top: 48px !important;
      left: 6px !important;
      min-width: 130px !important;
      max-width: 45vw !important;
      font-size: 10px !important;
      padding: 6px 8px !important;
    }
    /* Rimpicciolisce e sposta la chat multiplayer in alto a destra sotto l'HUD */
    #chat-log { height: 55px !important; font-size: 10px !important; padding: 4px !important; }
    #chat-input { padding: 4px 6px !important; font-size: 11px !important; }
  `;
  document.head.appendChild(styleMobile);

  // Riposiziona il box della chat multiplayer per non coprire il joystick
  setTimeout(() => {
    const chatLogEl = document.getElementById('chat-log');
    if (chatLogEl && chatLogEl.parentElement) {
      const mpContainer = chatLogEl.parentElement;
      mpContainer.style.bottom = "auto";
      mpContainer.style.left = "auto";
      mpContainer.style.top = "48px";
      mpContainer.style.right = "6px";
      mpContainer.style.width = "185px";
    }
  }, 300);

  // 2. Joystick Sinistro Multi-Touch (Gestisce il dito specifico sul joystick)
  const joyBase = document.createElement('div');
  joyBase.style.cssText = "position:fixed;bottom:20px;left:20px;width:105px;height:105px;background:rgba(255,255,255,0.12);border:2px solid rgba(255,255,255,0.35);border-radius:50%;z-index:120;touch-action:none;";
  const joyStick = document.createElement('div');
  joyStick.style.cssText = "position:absolute;top:31px;left:31px;width:43px;height:43px;background:rgba(129,212,250,0.75);border-radius:50%;pointer-events:none;";
  joyBase.appendChild(joyStick);
  document.body.appendChild(joyBase);

  let joyTouchId = null;

  joyBase.addEventListener('touchstart', e => {
    e.preventDefault();
    if (joyTouchId === null && e.changedTouches.length > 0) {
      const t = e.changedTouches[0];
      joyTouchId = t.identifier;
      aggiornaJoy(t);
    }
  }, { passive: false });

  joyBase.addEventListener('touchmove', e => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joyTouchId) {
        aggiornaJoy(e.changedTouches[i]);
        break;
      }
    }
  }, { passive: false });

  const resetJoy = (e) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joyTouchId) {
        joyTouchId = null;
        joyStick.style.transform = "translate(0px, 0px)";
        if (typeof tasti !== 'undefined') {
          tasti['w'] = false; tasti['s'] = false; tasti['a'] = false; tasti['d'] = false;
        }
        break;
      }
    }
  };
  joyBase.addEventListener('touchend', resetJoy);
  joyBase.addEventListener('touchcancel', resetJoy);

  function aggiornaJoy(touch) {
    const rect = joyBase.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = touch.clientX - cx;
    let dy = touch.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxR = 36;
    if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
    joyStick.style.transform = `translate(${dx}px, ${dy}px)`;

    if (typeof tasti !== 'undefined') {
      tasti['w'] = dy < -12;
      tasti['s'] = dy > 12;
      tasti['a'] = dx < -12;
      tasti['d'] = dx > 12;
    }
  }

  // 3. Pulsanti Azione Destra
  const padDestro = document.createElement('div');
  padDestro.style.cssText = "position:fixed;bottom:18px;right:15px;display:grid;grid-template-columns:repeat(3, 48px);gap:7px;z-index:120;touch-action:none;";

  function creaBtnTouch(testo, col, azione) {
    const b = document.createElement('button');
    b.innerText = testo;
    b.style.cssText = `height:48px;background:${col};color:#fff;border:2px solid rgba(255,255,255,0.4);border-radius:50%;font-weight:bold;font-size:12px;box-shadow:0 4px 10px rgba(0,0,0,0.5);touch-action:none;`;
    b.addEventListener('touchstart', e => { e.preventDefault(); azione(); }, { passive: false });
    return b;
  }

  padDestro.appendChild(creaBtnTouch("🎒", "#455a64", () => { if (typeof apriArsenale === 'function') apriArsenale(); }));
  padDestro.appendChild(creaBtnTouch("💨 Q", "#0288d1", () => {
    if (typeof scattoCooldown !== 'undefined' && scattoCooldown <= 0) {
      scattoTimer = 10; scattoCooldown = 55;
      if (typeof SFX !== 'undefined' && SFX.scatto) SFX.scatto();
    }
  }));
  padDestro.appendChild(creaBtnTouch("💬 E", "#7b1fa2", () => { if (typeof interagisciNPC === 'function') interagisciNPC(playerGroup); }));

  padDestro.appendChild(creaBtnTouch("🔄", "#ef6c00", () => {
    if (typeof cambiaStrumento === 'function') {
      cambiaStrumento(strumentoAttivo === "piccone" ? "spada" : "piccone", playerGroup);
    }
  }));
  padDestro.appendChild(creaBtnTouch("🏃", "#2e7d32", () => {
    if (typeof tasti !== 'undefined') tasti['shift'] = !tasti['shift'];
  }));
  padDestro.appendChild(creaBtnTouch("⚔️", "#d32f2f", () => { if (typeof piccona === 'function') piccona(); }));

  document.body.appendChild(padDestro);
}
