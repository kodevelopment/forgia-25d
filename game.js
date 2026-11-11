let luck = 1.0;

// 1. Scena e Telecamera 2.5D
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x161c24);
scene.fog = new THREE.Fog(0x161c24, 22, 48);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(0.75);
renderer.domElement.style.imageRendering = "pixelated";
document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0xffffff, 0.75));
const dirLight = new THREE.DirectionalLight(0xfff5e4, 0.85);
dirLight.position.set(12, 24, 10);
scene.add(dirLight);

// 2. Terreno e Mappa
const cT = document.createElement('canvas'); cT.width = 32; cT.height = 32;
const gT = cT.getContext('2d');
gT.fillStyle = '#2d4c3e'; gT.fillRect(0, 0, 32, 32);
gT.fillStyle = '#365b4a'; gT.fillRect(0, 0, 16, 16); gT.fillRect(16, 16, 16, 16);
const tT = new THREE.CanvasTexture(cT);
tT.wrapS = THREE.RepeatWrapping; tT.wrapT = THREE.RepeatWrapping;
tT.repeat.set(45, 45); tT.magFilter = THREE.NearestFilter;

const ground = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshStandardMaterial({ map: tT, roughness: 1 }));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

const rocce = [];
costruisciMondo(scene, rocce);

// 3. Personaggio + Piccone + Spada + Nome
const playerGroup = new THREE.Group();
playerGroup.position.set(0, 0, 9);
scene.add(playerGroup);

const cE = document.createElement('canvas'); cE.width = 16; cE.height = 16;
const texE = new THREE.CanvasTexture(cE); texE.magFilter = THREE.NearestFilter;
const playerSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texE }));
playerSprite.scale.set(1.8, 1.8, 1); playerSprite.position.y = 0.9;
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
  g.fillStyle = "rgba(0,0,0,0.55)"; g.fillRect(28, 14, 200, 36);
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
// 5. Randomizer Rocce
function trovaPuntoCasualeCaverna() {
  const settori = [
    { cx: -1, cz: -20, r: 7.5 },
    { cx: 1, cz: -31, r: 7.5 },
    { cx: -26, cz: -29, r: 8 },
    { cx: 23, cz: -35, r: 7.5 },
    { cx: -3, cz: -49, r: 8.5 }
  ];
  let x, z, ok, tentativi = 0;
  do {
    ok = true;
    const s = settori.at(Math.floor(Math.random() * settori.length));
    const ang = Math.random() * Math.PI * 2;
    const dist = 1.5 + Math.random() * (s.r - 1.5);
    x = s.cx + Math.cos(ang) * dist;
    z = s.cz + Math.sin(ang) * dist;

    if (Math.abs(x) < 2.8 && z > -16) ok = false;
    for (let r of rocce) {
      if (r.attiva && Math.hypot(x - r.x, z - r.z) < 3.2) { ok = false; break; }
    }
    tentativi++;
  } while (!ok && tentativi < 40);
  return { x, z };
}

function creaRocciaCasuale() {
  const pos = trovaPuntoCasualeCaverna();
  if (typeof generaSingolaRoccia === 'function') {
    generaSingolaRoccia(scene, rocce, pos);
  }
}
for (let i = 0; i < 26; i++) creaRocciaCasuale();

// 6. Raggi di Luce, Mining, Audio e Combattimento
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

function estraiMinerale() {
  const pesi = MINERALI.map((m, i) => m.peso * (i > 1 ? luck : 1));
  let rand = Math.random() * pesi.reduce((a, b) => a + b, 0);
  for (let i = 0; i < MINERALI.length; i++) {
    if (rand < pesi.at(i)) return MINERALI.at(i);
    rand -= pesi.at(i);
  }
  return MINERALI.at(0);
}

function menuBloccato() {
  return overlay.style.display !== "none" ||
         forgiaAperta ||
         dialogoAperto ||
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

  let target = null, min = 3.2;
  rocce.forEach(r => {
    if (!r.attiva || !r.minabile) return;
    const d = Math.hypot(playerGroup.position.x - r.x, playerGroup.position.z - r.z);
    if (d < min) { min = d; target = r; }
  });
  if (!target) return;

  const lvl = datiUtente.livelloPiccone || 0;
  const danno = LISTA_PICCONI.at(lvl) ? LISTA_PICCONI.at(lvl).danno : 1;
  target.hp -= danno;

  target.gruppo.scale.set(0.84, 0.84, 0.84);
  setTimeout(() => { if (target.attiva) target.gruppo.scale.set(1, 1, 1); }, 100);

  if (target.hp <= 0) {
    target.attiva = false; target.gruppo.visible = false;
    const drop = estraiMinerale();
    const qtaDrop = target.bonusDrop || 1;
    if (!datiUtente.inventario[drop.nome]) datiUtente.inventario[drop.nome] = { qta: 0, hex: drop.hex };
    datiUtente.inventario[drop.nome].qta += qtaDrop;
    if (typeof aggiungiXP === 'function') aggiungiXP((drop.xp || 10) * qtaDrop);
    if (typeof SFX !== 'undefined') SFX.dropRaro();
    salvaPartita(); aggiornaHUDCompleto();

    creaRaggio(target.x, target.z, drop.colore, drop.rarita === "MITICO");
    const toast = document.getElementById('toast');
    toast.innerText = `Trovato: ${drop.nome} x${qtaDrop} (${drop.rarita})!`;
    toast.style.border = `2px solid ${drop.hex}`; toast.style.color = drop.hex; toast.style.opacity = 1;
    setTimeout(() => toast.style.opacity = 0, 2000);

    setTimeout(() => {
      const p = trovaPuntoCasualeCaverna();
      target.x = p.x; target.z = p.z;
      target.gruppo.position.set(p.x, target.gruppo.position.y, p.z);
      target.hp = target.maxHp || 3; target.attiva = true; target.gruppo.visible = true;
    }, 4000);
  }
}

// 7. Controlli & Game Loop
const tasti = {};
let ultimoDirX = 0, ultimoDirZ = 1;
let scattoTimer = 0, scattoCooldown = 0, passoCorsaTimer = 0;

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
      if (playerGroup.position.x >= c.minX && playerGroup.position.x <= c.maxX &&
          playerGroup.position.z >= c.minZ && playerGroup.position.z <= c.maxZ) {
        dentroCasa = true;
        break;
      }
    }
  }

  if (dentroCasa) {
    scene.background.setHex(0x040406);
    scene.fog.color.setHex(0x040406);
    scene.fog.near = 13.5;
    scene.fog.far = 21.0;
  } else if (playerGroup.position.z < -12 || playerGroup.position.x > 80) {
    scene.background.setHex(0x0b0d12);
    scene.fog.color.setHex(0x0b0d12);
    scene.fog.near = 10;
    scene.fog.far = 26;
  } else {
    scene.background.setHex(0x161c24);
    scene.fog.color.setHex(0x161c24);
    scene.fog.near = 22;
    scene.fog.far = 48;
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

  if (Math.hypot(playerGroup.position.x - 0, playerGroup.position.z - 6) < 2.4 && typeof hpGiocatore !== 'undefined' && hpGiocatore < maxHpGiocatore) {
    hpGiocatore = maxHpGiocatore;
    if (typeof aggiornaBarraHP === 'function') aggiornaBarraHP();
    if (typeof SFX !== 'undefined') SFX.cura();
    const t = document.getElementById('toast');
    t.innerText = "🔥 Il calore del Falò ha ripristinato tutta la tua Salute!";
    t.style.border = "2px solid #ff6d00"; t.style.color = "#ff6d00"; t.style.opacity = 1;
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

  if (typeof aggiornaMultiplayer === 'function') aggiornaMultiplayer(scene, playerGroup);
  aggiornaMostri(playerGroup);
  renderer.render(scene, camera);
}
animate();