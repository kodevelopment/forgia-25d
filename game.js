let luck = 1.0;

// 1. Scena e Telecamera 2.5D Ottimizzata 60 FPS
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x161c24);
scene.fog = new THREE.Fog(0x161c24, 24, 52);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 120);
const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(0.95);
document.body.appendChild(renderer.domElement);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

scene.add(new THREE.AmbientLight(0xffffff, 0.78));
const dirLight = new THREE.DirectionalLight(0xfff5e4, 0.9);
dirLight.position.set(14, 26, 12);
scene.add(dirLight);

// 2. Terreno Erba Dettagliato (150x150) e Mappa
const cT = document.createElement('canvas'); cT.width = 64; cT.height = 64;
const gT = cT.getContext('2d');
gT.fillStyle = '#2d4c3e'; gT.fillRect(0, 0, 64, 64);
gT.fillStyle = '#365b4a'; gT.fillRect(0, 0, 32, 32); gT.fillRect(32, 32, 32, 32);
gT.fillStyle = '#43705b';
gT.fillRect(8, 10, 4, 4); gT.fillRect(42, 18, 4, 4); gT.fillRect(18, 46, 4, 4); gT.fillRect(50, 50, 4, 4);
gT.fillStyle = '#ffd54f'; gT.fillRect(14, 22, 3, 3);
gT.fillStyle = '#81d4fa'; gT.fillRect(46, 12, 3, 3);
gT.fillStyle = '#ff8a80'; gT.fillRect(26, 52, 3, 3);

const tT = new THREE.CanvasTexture(cT);
tT.wrapS = THREE.RepeatWrapping; tT.wrapT = THREE.RepeatWrapping;
tT.repeat.set(55, 55); tT.magFilter = THREE.NearestFilter;

const ground = new THREE.Mesh(new THREE.PlaneGeometry(150, 150), new THREE.MeshLambertMaterial({ map: tT }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const rocce = [];
costruisciMondo(scene, rocce);

// --- MINIMAPPA STILE MEDIEVALE (Angolo in basso a destra) ---
const minimapBox = document.createElement('div');
minimapBox.style.cssText = "position:fixed;bottom:16px;right:16px;background:linear-gradient(180deg,#2b1e16,#1a120d);border:2px solid #d4af37;border-radius:12px;padding:8px;z-index:60;box-shadow:0 4px 18px rgba(0,0,0,0.7);text-align:center;font-family:Georgia,serif;";
minimapBox.innerHTML = `
  <div id="minimap-zona" style="font-size:11px;font-weight:bold;color:#ffd54f;margin-bottom:4px;">🏰 Villaggio</div>
  <canvas id="minimap-canvas" width="130" height="130" style="border-radius:8px;background:#0d0907;border:1px solid #5d4037;display:block;"></canvas>
`;
document.body.appendChild(minimapBox);

function aggiornaMinimappa(px, pz) {
  const mc = document.getElementById('minimap-canvas');
  if (!mc) return;
  const mg = mc.getContext('2d');
  mg.clearRect(0, 0, 130, 130);

  const scala = 1.55;
  const cx = 65, cz = 65;

  // Griglia sottile
  mg.strokeStyle = "rgba(212,175,55,0.12)";
  mg.beginPath(); mg.moveTo(65, 0); mg.lineTo(65, 130); mg.moveTo(0, 65); mg.lineTo(130, 65); mg.stroke();

  // Case (marrone/oro)
  if (typeof listaCase !== 'undefined') {
    mg.fillStyle = "#8d6e63";
    listaCase.forEach(c => {
      const mx = cx + ((c.minX + c.maxX) / 2 - px) * scala;
      const mz = cz + ((c.minZ + c.maxZ) / 2 - pz) * scala;
      if (mx > 0 && mx < 130 && mz > 0 && mz < 130) mg.fillRect(mx - 4, mz - 4, 8, 8);
    });
  }

  // Portali (azzurro/rosso)
  if (typeof listaPortali !== 'undefined') {
    listaPortali.forEach(p => {
      const mx = cx + (p.x - px) * scala;
      const mz = cz + (p.z - pz) * scala;
      if (mx > 0 && mx < 130 && mz > 0 && mz < 130) {
        mg.fillStyle = "#00e5ff";
        mg.beginPath(); mg.arc(mx, mz, 3.5, 0, Math.PI * 2); mg.fill();
      }
    });
  }

  // NPC (giallo)
  if (typeof listaNPC !== 'undefined') {
    mg.fillStyle = "#ffd54f";
    listaNPC.forEach(n => {
      const mx = cx + (n.x - px) * scala;
      const mz = cz + (n.z - pz) * scala;
      if (mx > 0 && mx < 130 && mz > 0 && mz < 130) mg.fillRect(mx - 2.5, mz - 2.5, 5, 5);
    });
  }

  // Mostri vivi (rosso)
  if (typeof listaMostri !== 'undefined') {
    mg.fillStyle = "#ff1744";
    listaMostri.forEach(m => {
      if (!m.vivo) return;
      const mx = cx + (m.gruppo.position.x - px) * scala;
      const mz = cz + (m.gruppo.position.z - pz) * scala;
      if (mx > 0 && mx < 130 && mz > 0 && mz < 130) {
        mg.beginPath(); mg.arc(mx, mz, m.overlevel ? 3.5 : 2.5, 0, Math.PI * 2); mg.fill();
      }
    });
  }

  // Giocatore al centro (bianco brillante)
  mg.fillStyle = "#ffffff";
  mg.beginPath(); mg.arc(cx, cz, 3.5, 0, Math.PI * 2); mg.fill();

  const zonaEl = document.getElementById('minimap-zona');
  if (zonaEl) {
    if (px < -100) zonaEl.innerText = "❄️ Abisso Glaciale";
    else if (px > 80) zonaEl.innerText = "🔥 Arena Re Grotta";
    else if (pz < -12) zonaEl.innerText = "⛏️ Grotta Antica";
    else zonaEl.innerText = "🏰 Villaggio";
  }
}

// 3. Personaggio + Piccone + Spada + Nome
const playerGroup = new THREE.Group();
playerGroup.position.set(0, 0, 9);
scene.add(playerGroup);

const cE = document.createElement('canvas'); cE.width = 80; cE.height = 80;
const texE = new THREE.CanvasTexture(cE); texE.magFilter = THREE.NearestFilter;
const playerSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texE }));
playerSprite.scale.set(1.85, 1.85, 1); playerSprite.position.y = 0.92;
playerGroup.add(playerSprite);

if (typeof applicaGraficaPersonaggio === 'function') applicaGraficaPersonaggio(playerSprite);
creaPicconeInMano(playerGroup);
creaOAggiornaSpadaInMano(playerGroup);
spawnaMostri(scene);

let nameTag = null;
function aggiornaNomeSopraTesta(testo) {
  if (nameTag) playerGroup.remove(nameTag);
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = "rgba(0,0,0,0.65)"; g.fillRect(24, 14, 208, 36);
  g.font = "bold 24px sans-serif"; g.fillStyle = "#ffd54f"; g.textAlign = "center";
  g.fillText(testo, 128, 40);
  nameTag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c) }));
  nameTag.scale.set(3.2, 0.8, 1); nameTag.position.y = 2.25;
  playerGroup.add(nameTag);
}

// 4. Login & Salvataggio
const overlay = document.getElementById('login-overlay');
const inputNome = document.getElementById('input-nome');
function confermaNome() {
  datiUtente.nome = inputNome.value.trim() || "Fabbro";
  salvaPartita(); aggiornaNomeSopraTesta(datiUtente.nome); aggiornaHUDCompleto();
  if (typeof applicaGraficaPersonaggio === 'function') applicaGraficaPersonaggio(playerSprite);
  overlay.style.display = "none";
}
document.getElementById('btn-gioca').addEventListener('click', confermaNome);
inputNome.addEventListener('keydown', e => { if (e.key === 'Enter') confermaNome(); });

if (datiUtente.nome) {
  overlay.style.display = "none";
  aggiornaNomeSopraTesta(datiUtente.nome); aggiornaHUDCompleto();
} else { inputNome.focus(); }
// 5. Randomizer Rocce (Grotta Base + Abisso Glaciale)
function trovaPuntoCasualeCaverna(isGlaciale = false) {
  const settoriBase = [
    { cx: -1, cz: -20, r: 7.5 },
    { cx: 1, cz: -31, r: 7.5 },
    { cx: -26, cz: -29, r: 8 },
    { cx: 23, cz: -35, r: 7.5 },
    { cx: -3, cz: -49, r: 8.5 }
  ];
  const settoriGlaciali = [
    { cx: -160, cz: -24, r: 11 },
    { cx: -160, cz: -42, r: 10 },
    { cx: -144, cz: -75, r: 12 },
    { cx: -176, cz: -77, r: 12 },
    { cx: -160, cz: -102, r: 11 }
  ];
  const settori = isGlaciale ? settoriGlaciali : settoriBase;

  let x, z, ok, tentativi = 0;
  do {
    ok = true;
    const s = settori[Math.floor(Math.random() * settori.length)];
    const ang = Math.random() * Math.PI * 2;
    const dist = 1.5 + Math.random() * (s.r - 1.5);
    x = s.cx + Math.cos(ang) * dist;
    z = s.cz + Math.sin(ang) * dist;

    if (!isGlaciale && Math.abs(x) < 2.8 && z > -16) ok = false;
    if (isGlaciale && Math.hypot(x - (-160), z - (-52)) < 7.5) ok = false; // Lascia libero il Campo Base di Kael e Freya

    for (let r of rocce) {
      if (r.attiva && Math.hypot(x - r.x, z - r.z) < 3.2) { ok = false; break; }
    }
    tentativi++;
  } while (!ok && tentativi < 40);
  return { x, z };
}

for (let i = 0; i < 26; i++) {
  const pos = trovaPuntoCasualeCaverna(false);
  if (typeof generaSingolaRoccia === 'function') generaSingolaRoccia(scene, rocce, pos, false);
}
for (let i = 0; i < 32; i++) {
  const pos = trovaPuntoCasualeCaverna(true);
  if (typeof generaSingolaRoccia === 'function') generaSingolaRoccia(scene, rocce, pos, true);
}

// 6. Raggi & Estrazione Minerali (Base o Glaciali)
const raggi = [];
function creaRaggio(x, z, col, mitico) {
  const h = mitico ? 15 : 8;
  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, mitico ? 0.55 : 0.3, h, 8, 1, true),
    new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
  );
  beam.position.set(x, h / 2, z); scene.add(beam);
  raggi.push({ mesh: beam, vita: mitico ? 180 : 90 });
}

function estraiMinerale(isGlaciale = false) {
  const pool = MINERALI.filter(m => isGlaciale ? !!m.glaciale : !m.glaciale);
  const pesi = pool.map((m, i) => m.peso * (i > 1 ? luck : 1));
  let rand = Math.random() * pesi.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) {
    if (rand < pesi[i]) return pool[i];
    rand -= pesi[i];
  }
  return pool[0];
}

function menuBloccato() {
  return overlay.style.display !== "none" ||
         forgiaAperta ||
         dialogoAperto ||
         (typeof negozioPicconiAperto !== 'undefined' && negozioPicconiAperto) ||
         (typeof arsenaleAperto !== 'undefined' && arsenaleAperto) ||
         (typeof chatAperta !== 'undefined' && chatAperta);
}

function piccona() {
  if (menuBloccato()) return;
  if (strumentoAttivo === "spada") {
    attaccaConSpada(playerGroup);
    return;
  }
  animaPiccone();
  if (typeof SFX !== 'undefined') SFX.piccone();

  let target = null, min = 3.4;
  rocce.forEach(r => {
    if (!r.attiva || !r.minabile) return;
    const d = Math.hypot(playerGroup.position.x - r.x, playerGroup.position.z - r.z);
    if (d < min) { min = d; target = r; }
  });
  if (!target) return;

  const lvl = datiUtente.livelloPiccone || 0;
  const danno = LISTA_PICCONI[lvl] ? LISTA_PICCONI[lvl].danno : 1;
  target.hp -= danno;

  target.gruppo.scale.set(0.84, 0.84, 0.84);
  setTimeout(() => { if (target.attiva) target.gruppo.scale.set(1, 1, 1); }, 100);

  if (target.hp <= 0) {
    target.attiva = false; target.gruppo.visible = false;
    const drop = estraiMinerale(!!target.isGlaciale);
    const qtaDrop = target.bonusDrop || 1;
    if (!datiUtente.inventario[drop.nome]) datiUtente.inventario[drop.nome] = { qta: 0, hex: drop.hex };
    datiUtente.inventario[drop.nome].qta += qtaDrop;
    if (typeof aggiungiXP === 'function') aggiungiXP((drop.xp || 10) * qtaDrop);
    if (typeof SFX !== 'undefined') SFX.dropRaro();
    salvaPartita(); aggiornaHUDCompleto();

    const isMitico = drop.rarita.includes("MITICO") || drop.rarita.includes("DIVINO");
    creaRaggio(target.x, target.z, drop.colore, isMitico);
    const toast = document.getElementById('toast');
    toast.innerText = `Trovato: ${drop.nome} x${qtaDrop} (${drop.rarita})!`;
    toast.style.border = `2px solid ${drop.hex}`; toast.style.color = drop.hex; toast.style.opacity = 1;
    setTimeout(() => toast.style.opacity = 0, 2000);

    setTimeout(() => {
      const p = trovaPuntoCasualeCaverna(!!target.isGlaciale);
      target.x = p.x; target.z = p.z;
      target.gruppo.position.set(p.x, target.gruppo.position.y, p.z);
      target.hp = target.maxHp || 3; target.attiva = true; target.gruppo.visible = true;
    }, 4500);
  }
}
// 7. Controlli & Game Loop
const tasti = {};
let ultimoDirX = 0, ultimoDirZ = 1;
let scattoTimer = 0, scattoCooldown = 0, passoCorsaTimer = 0;
let portaleCheckpointCreato = false;

window.addEventListener('keydown', e => {
  if (menuBloccato()) return;
  const k = e.key.toLowerCase();
  tasti[k] = true;
  if (e.code === 'Space') piccona();
  if (k === '1') cambiaStrumento("piccone", playerGroup);
  if (k === '2') cambiaStrumento("spada", playerGroup);
  if (k === 'q' && scattoCooldown <= 0) {
    scattoTimer = 10;
    scattoCooldown = 55;
    if (typeof SFX !== 'undefined' && SFX.scatto) SFX.scatto();
  }
  if (k === 'e') interagisciNPC(playerGroup);
  if (k === 'b') gestisciBackup();
  if (k === 'm' && typeof toggleMusica === 'function') toggleMusica();
  if (k === 'p') {
    luck = 3.0; document.getElementById('luck-val').innerText = "x3.0 🔥";
    const b = document.getElementById('admin-banner'); b.classList.add('attivo');
    setTimeout(() => b.classList.remove('attivo'), 5000);
  }
  if (k === 'n') { inputNome.value = datiUtente.nome; overlay.style.display = "flex"; inputNome.focus(); }
});
window.addEventListener('keyup', e => tasti[e.key.toLowerCase()] = false);

let tempo = 0;
function animate() {
  requestAnimationFrame(animate);
  if (menuBloccato()) { renderer.render(scene, camera); return; }
  tempo += 0.15;

  // Genera dinamicamente al Villaggio il Portale Rapido se il giocatore lo ha sbloccato da Kael
  if (!portaleCheckpointCreato && typeof datiUtente !== 'undefined' && datiUtente.checkpointGlaciale && typeof creaPortale === 'function') {
    portaleCheckpointCreato = true;
    creaPortale(scene, -11.5, 10.5, -160, -49, 0x64ffda, "🌀 CAMPO BASE GLACIALE");
  }

  let mx = 0, mz = 0;
  if (tasti['w'] || tasti['arrowup']) mz -= 1;
  if (tasti['s'] || tasti['arrowdown']) mz += 1;
  if (tasti['a'] || tasti['arrowleft']) mx -= 1;
  if (tasti['d'] || tasti['arrowright']) mx += 1;
  if (mx !== 0 && mz !== 0) { mx *= 0.707; mz *= 0.707; }

  if (mx !== 0 || mz !== 0) {
    ultimoDirX = mx;
    ultimoDirZ = mz;
  }

  let velocita = tasti['shift'] ? 0.17 : 0.095;
  if (tasti['shift'] && (mx !== 0 || mz !== 0) && scattoTimer <= 0) {
    passoCorsaTimer++;
    if (passoCorsaTimer % 14 === 0 && typeof SFX !== 'undefined' && SFX.corsa) SFX.corsa();
  }

  if (scattoTimer > 0) {
    velocita = 0.38;
    mx = ultimoDirX;
    mz = ultimoDirZ;
    scattoTimer--;
  }
  if (scattoCooldown > 0) scattoCooldown--;

  let nextX = playerGroup.position.x + mx * velocita;
  let nextZ = playerGroup.position.z + mz * velocita;
  rocce.forEach(r => {
    if (!r.attiva) return;
    const dx = nextX - r.x, dz = nextZ - r.z, dist = Math.hypot(dx, dz);
    if (dist < r.raggio) { const a = Math.atan2(dz, dx); nextX = r.x + Math.cos(a) * r.raggio; nextZ = r.z + Math.sin(a) * r.raggio; }
  });

  playerGroup.position.x = nextX; playerGroup.position.z = nextZ;
  if (scattoTimer > 0) {
    playerSprite.position.y = 1.35;
  } else {
    playerSprite.position.y = (mx !== 0 || mz !== 0) ? 0.9 + Math.abs(Math.sin(tempo * (tasti['shift'] ? 1.5 : 1))) * 0.15 : 0.9;
  }

  camera.position.set(playerGroup.position.x, 14.5, playerGroup.position.z + 9.5);
  camera.lookAt(playerGroup.position.x, 0.5, playerGroup.position.z);

  let dentroCasa = false;
  if (typeof listaCase !== 'undefined') {
    for (let c of listaCase) {
      const dentroQuesta = (
        playerGroup.position.x >= c.minX && playerGroup.position.x <= c.maxX &&
        playerGroup.position.z >= c.minZ && playerGroup.position.z <= c.maxZ
      );
      if (c.tetto) c.tetto.visible = !dentroQuesta;
      if (dentroQuesta) dentroCasa = true;
    }
  }

  // Atmosfera dinamica: Casa, Abisso Glaciale, Grotta/Boss o Villaggio
  if (dentroCasa) {
    scene.background.setHex(0x040406);
    scene.fog.color.setHex(0x040406);
    scene.fog.near = 13.5;
    scene.fog.far = 21.0;
  } else if (playerGroup.position.x < -100) {
    scene.background.setHex(0x071926);
    scene.fog.color.setHex(0x071926);
    scene.fog.near = 14;
    scene.fog.far = 36;
  } else if (playerGroup.position.z < -12 || playerGroup.position.x > 80) {
    scene.background.setHex(0x0b0d12);
    scene.fog.color.setHex(0x0b0d12);
    scene.fog.near = 10;
    scene.fog.far = 26;
  } else {
    scene.background.setHex(0x161c24);
    scene.fog.color.setHex(0x161c24);
    scene.fog.near = 24;
    scene.fog.far = 52;
  }

  for (let i = raggi.length - 1; i >= 0; i--) {
    raggi[i].vita--; raggi[i].mesh.rotation.y += 0.04;
    raggi[i].mesh.material.opacity = Math.min(0.8, raggi[i].vita / 40);
    if (raggi[i].vita <= 0) { scene.remove(raggi[i].mesh); raggi.splice(i, 1); }
  }

  if (typeof listaPortali !== 'undefined') {
    listaPortali.forEach(p => {
      p.mesh.rotation.z += 0.04;
      if (Math.hypot(playerGroup.position.x - p.x, playerGroup.position.z - p.z) < 1.8 && (!window.portalCd || window.portalCd <= 0)) {
        window.portalCd = 70;
        playerGroup.position.set(p.destX, 0, p.destZ);
      }
    });
    if (window.portalCd > 0) window.portalCd--;
  }

  // Cura al Falò del Villaggio o al Fuoco Polare nella Caverna Glaciale
  const vicinoFaloVillaggio = Math.hypot(playerGroup.position.x - 0, playerGroup.position.z - 6) < 2.4;
  const vicinoFuocoPolare = Math.hypot(playerGroup.position.x - (-160), playerGroup.position.z - (-52)) < 2.6;
  if ((vicinoFaloVillaggio || vicinoFuocoPolare) && typeof hpGiocatore !== 'undefined' && hpGiocatore < maxHpGiocatore) {
    hpGiocatore = maxHpGiocatore;
    if (typeof aggiornaBarraHP === 'function') aggiornaBarraHP();
    if (typeof SFX !== 'undefined') SFX.cura();
    const t = document.getElementById('toast');
    t.innerText = vicinoFuocoPolare ? "❄️ Il Fuoco Polare ha ripristinato tutta la Salute!" : "🔥 Il calore del Falò ha ripristinato tutta la tua Salute!";
    t.style.border = "2px solid #d4af37"; t.style.color = "#ffd54f"; t.style.opacity = 1;
    setTimeout(() => t.style.opacity = 0, 1800);
  }

  if (window.pozzanghereMagma && typeof hpGiocatore !== 'undefined') {
    if (!window.magmaCd) window.magmaCd = 0;
    if (window.magmaCd > 0) window.magmaCd--;
    for (let m of window.pozzanghereMagma) {
      if (Math.hypot(playerGroup.position.x - m.x, playerGroup.position.z - m.z) < m.raggio && window.magmaCd === 0) {
        window.magmaCd = 45;
        hpGiocatore = Math.max(1, hpGiocatore - 6);
        if (typeof aggiornaBarraHP === 'function') aggiornaBarraHP();
        playerSprite.material.color.setHex(0xff3d00);
        setTimeout(() => playerSprite.material.color.setHex(0xffffff), 150);
      }
    }
  }

  aggiornaMinimappa(playerGroup.position.x, playerGroup.position.z);
  if (typeof aggiornaMultiplayer === 'function') aggiornaMultiplayer(scene, playerGroup);
  aggiornaMostri(playerGroup);
  renderer.render(scene, camera);
}
animate();
