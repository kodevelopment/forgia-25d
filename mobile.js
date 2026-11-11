// Controlli Touch per Telefono e Tablet
const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

if (isTouch) {
  // Riduci leggermente l'HUD per lasciare spazio allo schermo del telefono
  const styleMobile = document.createElement('style');
  styleMobile.innerHTML = `
    #hud-comandi { display: none !important; }
    #hud-zaino { bottom: auto !important; top: 75px !important; min-width: 140px !important; font-size: 11px !important; padding: 8px !important; }
    .box { padding: 4px 7px !important; font-size: 10px !important; }
    .box span { font-size: 11px !important; }
  `;
  document.head.appendChild(styleMobile);

  // 1. Joystick Sinistro (Movimento WASD)
  const joyBase = document.createElement('div');
  joyBase.style.cssText = "position:fixed;bottom:25px;left:25px;width:110px;height:110px;background:rgba(255,255,255,0.12);border:2px solid rgba(255,255,255,0.35);border-radius:50%;z-index:120;touch-action:none;";
  const joyStick = document.createElement('div');
  joyStick.style.cssText = "position:absolute;top:33px;left:33px;width:44px;height:44px;background:rgba(129,212,250,0.75);border-radius:50%;pointer-events:none;";
  joyBase.appendChild(joyStick);
  document.body.appendChild(joyBase);

  let joyActive = false;
  joyBase.addEventListener('touchstart', e => { joyActive = true; aggiornaJoy(e.touches.item(0)); });
  joyBase.addEventListener('touchmove', e => { if (joyActive) { e.preventDefault(); aggiornaJoy(e.touches.item(0)); } });
  const resetJoy = () => {
    joyActive = false;
    joyStick.style.transform = "translate(0px, 0px)";
    if (typeof tasti !== 'undefined') {
      tasti['w'] = false; tasti['s'] = false; tasti['a'] = false; tasti['d'] = false;
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
    const maxR = 38;
    if (dist > maxR) { dx = (dx / dist) * maxR; dy = (dy / dist) * maxR; }
    joyStick.style.transform = `translate(${dx}px, ${dy}px)`;

    if (typeof tasti !== 'undefined') {
      tasti['w'] = dy < -12;
      tasti['s'] = dy > 12;
      tasti['a'] = dx < -12;
      tasti['d'] = dx > 12;
    }
  }

  // 2. Pulsanti Azione Destra (Attacca/Piccona, Parla E, Scatto Q, Switch 1/2, Arsenale I)
  const padDestro = document.createElement('div');
  padDestro.style.cssText = "position:fixed;bottom:20px;right:20px;display:grid;grid-template-columns:repeat(3, 52px);gap:8px;z-index:120;touch-action:none;";

  function creaBtnTouch(testo, col, azione) {
    const b = document.createElement('button');
    b.innerText = testo;
    b.style.cssText = `height:52px;background:${col};color:#fff;border:2px solid rgba(255,255,255,0.4);border-radius:50%;font-weight:bold;font-size:13px;box-shadow:0 4px 10px rgba(0,0,0,0.5);`;
    b.addEventListener('touchstart', e => { e.preventDefault(); azione(); });
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