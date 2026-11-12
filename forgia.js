let calderoneForgia = {};
let categoriaForgia = "arma";
let forgiaAperta = false;
let minigiocoAttivo = false;
let posCursore = 0;
let dirCursore = 2.4;
let colpiFatti = 0;
let punteggiColpi = [];
let auraArmaturaMesh = null;

function aggiornaAuraArmatura(playerGroup) {
  if (auraArmaturaMesh) playerGroup.remove(auraArmaturaMesh);
  if (typeof applicaGraficaPersonaggio === 'function' && typeof playerSprite !== 'undefined') {
    applicaGraficaPersonaggio(playerSprite);
  }
}

// --- FINESTRA ANTEPRIMA 3D SCOLPITA (Stile Medievale) ---
const preview3DModal = document.createElement('div');
preview3DModal.id = "preview-3d-modal";
preview3DModal.style.cssText = "display:none;position:fixed;inset:0;background:rgba(10,7,5,0.92);z-index:220;align-items:center;justify-content:center;color:#f5ebd6;font-family:Georgia,serif;";
preview3DModal.innerHTML = `
  <div id="preview-3d-card" style="background:linear-gradient(180deg,#2b1e16,#1a120d);border:3px solid #d4af37;padding:24px;border-radius:18px;width:370px;max-width:92vw;text-align:center;box-shadow:0 0 40px rgba(212,175,55,0.35);">
    <p id="p3d-sottotitolo" style="font-size:11px;letter-spacing:2px;color:#d4af37;font-weight:bold;margin-bottom:4px;">OGGETTO FORGIATO!</p>
    <h2 id="p3d-titolo" style="font-size:22px;color:#ffd54f;margin-bottom:6px;">Spada</h2>
    <span id="p3d-qualita" style="display:inline-block;padding:3px 12px;border-radius:12px;font-size:11px;font-weight:bold;background:rgba(212,175,55,0.18);border:1px solid #d4af37;margin-bottom:12px;">PERFETTA ✨</span>
    <div id="p3d-canvas-box" style="width:225px;height:225px;margin:0 auto 14px auto;border-radius:16px;background:radial-gradient(circle,rgba(212,175,55,0.2) 0%,rgba(0,0,0,0.65) 100%);border:2px solid #5d4037;overflow:hidden;"></div>
    <p id="p3d-stats" style="font-size:15px;font-weight:bold;color:#f5ebd6;margin-bottom:16px;">+45 ATK</p>
    <button id="btn-chiudi-p3d" style="padding:10px 28px;background:#d4af37;color:#1a120d;border:2px solid #fff3e0;border-radius:10px;font-weight:bold;font-size:14px;cursor:pointer;font-family:Georgia,serif;">EQUIPAGGIA E CHIUDI</button>
  </div>
`;
document.body.appendChild(preview3DModal);

let p3dAnimId = null;
document.getElementById('btn-chiudi-p3d').onclick = () => {
  preview3DModal.style.display = 'none';
  if (p3dAnimId) cancelAnimationFrame(p3dAnimId);
};

function mostraAnteprima3D({ titolo, sottotitolo = "NUOVO OGGETTO!", qualita = "", stats = "", hex = "#ffd54f", tipoModello = "spada" }) {
  if (typeof THREE === 'undefined') return;
  document.getElementById('p3d-sottotitolo').innerText = sottotitolo;
  const titoloEl = document.getElementById('p3d-titolo');
  titoloEl.innerText = titolo;
  titoloEl.style.color = hex;
  document.getElementById('preview-3d-card').style.borderColor = hex;

  const qualEl = document.getElementById('p3d-qualita');
  qualEl.innerText = qualita || "Equipaggiato";
  qualEl.style.display = qualita ? "inline-block" : "none";
  document.getElementById('p3d-stats').innerText = stats;

  const box = document.getElementById('p3d-canvas-box');
  box.innerHTML = '';
  preview3DModal.style.display = 'flex';

  const scene3d = new THREE.Scene();
  const camera3d = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera3d.position.set(0, 0.25, 4.1);

  const renderer3d = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer3d.setSize(225, 225);
  box.appendChild(renderer3d.domElement);

  const luce1 = new THREE.DirectionalLight(0xffffff, 1.6);
  luce1.position.set(3, 5, 4);
  scene3d.add(luce1, new THREE.AmbientLight(0xffffff, 0.7));

  let gruppoObj = new THREE.Group();
  const colNum = parseInt(hex.replace('#', '0x'), 16) || 0xffd54f;
  const matPrincipale = new THREE.MeshStandardMaterial({ color: colNum, metalness: 0.7, roughness: 0.2, emissive: colNum, emissiveIntensity: 0.22 });
  const matLegno = new THREE.MeshStandardMaterial({ color: 0x4e342e, roughness: 0.85 });
  const matOro = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.85, roughness: 0.2 });

  if (tipoModello === "piccone" && typeof creaModello3DPicconeScolpito === 'function') {
    gruppoObj = creaModello3DPicconeScolpito(hex);
  } else if (tipoModello === "armatura") {
    // Corazza 3D scolpita con spalline a punta, pettorale gemmato e mantello
    const busto = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.52, 1.35, 8), matPrincipale);
    const pettoraleOro = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.45, 0.75), matOro);
    pettoraleOro.position.y = 0.25;
    const gemma = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    gemma.position.set(0, 0.25, 0.4);

    const spallaSx = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.65, 5), matPrincipale);
    spallaSx.position.set(-0.78, 0.55, 0);
    spallaSx.rotation.z = 0.65;
    const spallaDx = spallaSx.clone();
    spallaDx.position.x = 0.78;
    spallaDx.rotation.z = -0.65;

    const mantello = new THREE.Mesh(new THREE.BoxGeometry(1.15, 1.45, 0.08), new THREE.MeshStandardMaterial({ color: 0x5d1010, roughness: 0.9 }));
    mantello.position.set(0, -0.05, -0.42);
    mantello.rotation.x = 0.14;

    gruppoObj.add(busto, pettoraleOro, gemma, spallaSx, spallaDx, mantello);
  } else {
    // Spada / Pugnale / Spadone 3D scolpito con punta affilata e guardia gemmata
    const lunghezza = tipoModello === "pugnale" ? 1.15 : tipoModello === "spadone" ? 2.2 : 1.75;
    const larghezza = tipoModello === "spadone" ? 0.34 : 0.22;

    const lama = new THREE.Mesh(new THREE.BoxGeometry(larghezza, lunghezza, 0.07), matPrincipale);
    lama.position.y = 0.35;

    const punta = new THREE.Mesh(new THREE.ConeGeometry(larghezza * 0.72, 0.42, 4), matPrincipale);
    punta.rotation.y = Math.PI / 4;
    punta.scale.set(1, 1, 0.35);
    punta.position.y = 0.35 + lunghezza / 2 + 0.2;

    const guardia = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.14, 0.2), matOro);
    guardia.position.y = -0.55;
    const gemmaGuardia = new THREE.Mesh(new THREE.OctahedronGeometry(0.14, 0), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
    gemmaGuardia.position.set(0, -0.55, 0.1);

    const impugnatura = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.085, 0.62, 8), matLegno);
    impugnatura.position.y = -0.92;
    const pomolo = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), matOro);
    pomolo.position.y = -1.25;

    gruppoObj.add(lama, punta, guardia, gemmaGuardia, impugnatura, pomolo);
  }

  gruppoObj.rotation.z = 0.24;
  scene3d.add(gruppoObj);

  function anima3D() {
    if (preview3DModal.style.display === 'none') return;
    gruppoObj.rotation.y += 0.032;
    renderer3d.render(scene3d, camera3d);
    p3dAnimId = requestAnimationFrame(anima3D);
  }
  anima3D();
}
const forgiaDiv = document.createElement('div');
forgiaDiv.id = "forgia-modal";
forgiaDiv.style.cssText = "display:none;position:fixed;inset:0;background:rgba(10,7,5,0.9);z-index:150;align-items:center;justify-content:center;color:#f5ebd6;font-family:Georgia,serif;";
forgiaDiv.innerHTML = `
  <div style="background:linear-gradient(180deg,#2b1e16,#1a120d);border:3px solid #d4af37;padding:22px;border-radius:16px;width:550px;max-width:94vw;box-shadow:0 0 35px rgba(212,175,55,0.28);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid rgba(212,175,55,0.3);padding-bottom:10px;">
      <h2 style="color:#ffd54f;font-size:20px;">⚒️ LA FORGIA DI IGNIS</h2>
      <div style="display:flex;gap:8px;">
        <button id="tab-arma" style="padding:6px 14px;border-radius:8px;border:2px solid #d4af37;background:#8d2323;color:#ffd54f;font-weight:bold;cursor:pointer;font-family:Georgia,serif;">⚔️ ARMA</button>
        <button id="tab-armatura" style="padding:6px 14px;border-radius:8px;border:2px solid #8d6e63;background:#140e0a;color:#bcaaa4;font-weight:bold;cursor:pointer;font-family:Georgia,serif;">🛡️ ARMATURA</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
      <div style="background:#140e0a;padding:12px;border-radius:10px;border:1px solid #5d4037;">
        <p style="font-size:12px;color:#ffd54f;font-weight:bold;margin-bottom:8px;">🎒 ZAINO (Clicca per aggiungere)</p>
        <div id="forgia-zaino-list" style="display:flex;flex-direction:column;gap:6px;max-height:175px;overflow-y:auto;"></div>
      </div>

      <div style="background:#140e0a;padding:12px;border-radius:10px;border:1px solid #5d4037;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <p style="font-size:12px;color:#ff8a65;font-weight:bold;margin-bottom:8px;">🔥 CALDERONE (<span id="calderone-tot">0</span>/20)</p>
          <div id="forgia-calderone-list" style="display:flex;flex-wrap:wrap;gap:5px;min-height:60px;"></div>
        </div>
        <div id="forgia-preview" style="background:#241811;padding:8px;border-radius:8px;margin-top:10px;font-size:12px;text-align:center;border:1px solid #5d4037;">
          Inserisci almeno 3 minerali!
        </div>
      </div>
    </div>

    <div id="minigioco-box" style="display:none;margin-bottom:14px;background:#140e0a;padding:12px;border-radius:10px;border:2px solid #d4af37;">
      <p id="minigioco-istruzioni" style="font-size:13px;color:#ffd54f;margin-bottom:8px;text-align:center;">Colpo <b>1/3</b>: Premi <b>SPAZIO</b> o <b>TOCCA QUI</b> al centro!</p>
      <div id="barra-martello-touch" style="position:relative;width:100%;height:30px;background:#0d0907;border:2px solid #8d6e63;border-radius:8px;overflow:hidden;cursor:pointer;">
        <div style="position:absolute;left:35%;width:30%;height:100%;background:#2e7d32;"></div>
        <div style="position:absolute;left:45%;width:10%;height:100%;background:#ffd54f;"></div>
        <div id="martello-cursore" style="position:absolute;left:0%;width:6px;height:100%;background:#fff;box-shadow:0 0 10px #fff;"></div>
      </div>
    </div>

    <div style="text-align:center;">
      <button id="btn-avvia-forgia" style="padding:10px 24px;background:#8d2323;color:#ffd54f;border:2px solid #d4af37;border-radius:8px;font-weight:bold;font-size:14px;cursor:pointer;margin-right:8px;font-family:Georgia,serif;">🔥 FONDI E FORGIA</button>
      <button id="btn-chiudi-forgia" style="padding:10px 16px;background:#4e342e;color:#f5ebd6;border:1px solid #8d6e63;border-radius:8px;cursor:pointer;font-family:Georgia,serif;">Chiudi (ESC)</button>
    </div>
  </div>
`;
document.body.appendChild(forgiaDiv);

document.getElementById('tab-arma').onclick = () => {
  categoriaForgia = "arma";
  document.getElementById('tab-arma').style.background = "#8d2323"; document.getElementById('tab-arma').style.color = "#ffd54f"; document.getElementById('tab-arma').style.borderColor = "#d4af37";
  document.getElementById('tab-armatura').style.background = "#140e0a"; document.getElementById('tab-armatura').style.color = "#bcaaa4"; document.getElementById('tab-armatura').style.borderColor = "#8d6e63";
  aggiornaUIForgia();
};

document.getElementById('tab-armatura').onclick = () => {
  categoriaForgia = "armatura";
  document.getElementById('tab-armatura').style.background = "#1b4f72"; document.getElementById('tab-armatura').style.color = "#ffd54f"; document.getElementById('tab-armatura').style.borderColor = "#d4af37";
  document.getElementById('tab-arma').style.background = "#140e0a"; document.getElementById('tab-arma').style.color = "#bcaaa4"; document.getElementById('tab-arma').style.borderColor = "#8d6e63";
  aggiornaUIForgia();
};

function apriForgia() {
  forgiaAperta = true;
  minigiocoAttivo = false;
  calderoneForgia = {};
  document.getElementById('minigioco-box').style.display = 'none';
  document.getElementById('btn-avvia-forgia').style.display = 'inline-block';
  forgiaDiv.style.display = 'flex';
  aggiornaUIForgia();
}

function chiudiForgia() {
  forgiaAperta = false;
  minigiocoAttivo = false;
  forgiaDiv.style.display = 'none';
}

function aggiornaUIForgia() {
  const totPezzi = Object.values(calderoneForgia).reduce((a, b) => a + b, 0);
  document.getElementById('calderone-tot').innerText = totPezzi;

  const zainoEl = document.getElementById('forgia-zaino-list');
  zainoEl.innerHTML = '';
  Object.keys(datiUtente.inventario).forEach(nome => {
    const item = datiUtente.inventario[nome];
    const usati = calderoneForgia[nome] || 0;
    const disp = item.qta - usati;
    if (disp > 0) {
      const btn = document.createElement('button');
      btn.innerHTML = `<span style="color:${item.hex};font-weight:bold;">● ${nome}</span> <span>x${disp}</span>`;
      btn.style.cssText = "display:flex;justify-content:space-between;padding:6px 10px;background:#241811;border:1px solid #5d4037;border-radius:6px;color:#f5ebd6;cursor:pointer;font-size:12px;font-family:Georgia,serif;";
      btn.onclick = () => {
        if (totPezzi < 20) {
          calderoneForgia[nome] = (calderoneForgia[nome] || 0) + 1;
          aggiornaUIForgia();
        }
      };
      zainoEl.appendChild(btn);
    }
  });

  const caldEl = document.getElementById('forgia-calderone-list');
  caldEl.innerHTML = '';
  Object.keys(calderoneForgia).forEach(nome => {
    const qta = calderoneForgia[nome];
    if (qta > 0) {
      const info = MINERALI.find(m => m.nome === nome);
      const tag = document.createElement('button');
      tag.innerText = `${nome} x${qta} ✖`;
      tag.style.cssText = `padding:5px 8px;background:#241811;color:${info.hex};border:1px solid ${info.hex};border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;font-family:Georgia,serif;`;
      tag.onclick = () => {
        calderoneForgia[nome]--;
        if (calderoneForgia[nome] <= 0) delete calderoneForgia[nome];
        aggiornaUIForgia();
      };
      caldEl.appendChild(tag);
    }
  });
  const prevEl = document.getElementById('forgia-preview');
  if (totPezzi < 3) {
    prevEl.innerHTML = `<span style="color:#bcaaa4;">Aggiungi almeno <b>3 minerali</b> (max 20)</span>`;
  } else {
    let sommaStat = 0;
    let dominante = null, maxQta = 0;
    Object.keys(calderoneForgia).forEach(nome => {
      const q = calderoneForgia[nome];
      const info = MINERALI.find(m => m.nome === nome);
      sommaStat += (categoriaForgia === "arma" ? info.danno : info.difesa) * q;
      if (q > maxQta || (q === maxQta && info.danno > (dominante ? dominante.danno : 0))) {
        maxQta = q; dominante = info;
      }
    });
    const tipoOggetto = categoriaForgia === "arma"
      ? (totPezzi <= 5 ? "Pugnale" : totPezzi <= 12 ? "Spada" : "Spadone")
      : (totPezzi <= 7 ? "Elmo" : "Corazza");

    prevEl.innerHTML = `Anteprima: <b style="color:${dominante.hex};">${tipoOggetto} di ${dominante.nome}</b><br>Potenza base: <b>~${sommaStat} ${categoriaForgia === "arma" ? "ATK" : "DEF"}</b>`;
  }
}

document.getElementById('btn-chiudi-forgia').onclick = chiudiForgia;

document.getElementById('btn-avvia-forgia').onclick = () => {
  const tot = Object.values(calderoneForgia).reduce((a, b) => a + b, 0);
  if (tot < 3) { alert("Inserisci almeno 3 minerali nel calderone!"); return; }
  minigiocoAttivo = true;
  posCursore = 0;
  dirCursore = 2.3;
  colpiFatti = 0;
  punteggiColpi = [];
  document.getElementById('minigioco-istruzioni').innerHTML = `Colpo <b>1/3</b>: Premi <b>SPAZIO</b> o <b>TOCCA QUI</b> al centro!`;
  document.getElementById('btn-avvia-forgia').style.display = 'none';
  document.getElementById('minigioco-box').style.display = 'block';
  animaMinigioco();
};

function animaMinigioco() {
  if (!minigiocoAttivo) return;
  posCursore += dirCursore;
  if (posCursore >= 98 || posCursore <= 0) dirCursore *= -1;
  document.getElementById('martello-cursore').style.left = posCursore + '%';
  requestAnimationFrame(animaMinigioco);
}

function registraColpoMartello() {
  if (!minigiocoAttivo) return;
  const dist = Math.abs(50 - posCursore);
  punteggiColpi.push(dist);
  colpiFatti++;

  if (typeof SFX !== 'undefined' && SFX.piccona) SFX.piccona();

  if (colpiFatti < 3) {
    dirCursore = (dirCursore > 0 ? 1 : -1) * (Math.abs(dirCursore) + 0.75);
    document.getElementById('minigioco-istruzioni').innerHTML = `Colpo <b>${colpiFatti + 1}/3</b>: Continua a martellare!`;
  } else {
    completaForgia();
  }
}

document.getElementById('barra-martello-touch').addEventListener('pointerdown', (e) => {
  e.preventDefault();
  registraColpoMartello();
});

function completaForgia() {
  minigiocoAttivo = false;
  if (typeof SFX !== 'undefined') SFX.forgia();
  if (typeof aggiungiXP === 'function') aggiungiXP(15);
  const totPezzi = Object.values(calderoneForgia).reduce((a, b) => a + b, 0);

  let dominante = null, maxQta = 0;
  let baseAtk = 0, baseDef = 0, baseHp = 0;

  Object.keys(calderoneForgia).forEach(nome => {
    const q = calderoneForgia[nome];
    const info = MINERALI.find(m => m.nome === nome);
    baseAtk += info.danno * q;
    baseDef += info.difesa * q;
    baseHp += info.hpBonus * q;

    if (q > maxQta || (q === maxQta && info.danno > (dominante ? dominante.danno : 0))) {
      maxQta = q; dominante = info;
    }

    datiUtente.inventario[nome].qta -= q;
    if (datiUtente.inventario[nome].qta <= 0) delete datiUtente.inventario[nome];
  });

  const mediaDist = punteggiColpi.reduce((a, b) => a + b, 0) / punteggiColpi.length;
  let molt = 1.0, qualita = "Normale";
  if (mediaDist <= 7) { molt = 1.35; qualita = "PERFETTA ✨ (+35%)"; }
  else if (mediaDist <= 18) { molt = 1.15; qualita = "Buona (+15%)"; }
  else { molt = 0.9; qualita = "Sbeccata (-10%)"; }

  if (categoriaForgia === "arma") {
    const tipo = totPezzi <= 5 ? "Pugnale" : totPezzi <= 12 ? "Spada" : "Spadone";
    const dannoFinale = Math.round(baseAtk * molt);
    const nuovaArma = {
      id: Date.now(),
      nome: `${tipo} di ${dominante.nome}`,
      danno: dannoFinale,
      qualita: qualita,
      hex: dominante.hex
    };
    if (!datiUtente.arsenaleArmi) datiUtente.arsenaleArmi = [datiUtente.armaEquipaggiata];
    datiUtente.arsenaleArmi.push(nuovaArma);
    datiUtente.armaEquipaggiata = nuovaArma;

    salvaPartita();
    creaOAggiornaSpadaInMano(playerGroup);
    chiudiForgia();
    mostraAnteprima3D({
      titolo: nuovaArma.nome,
      sottotitolo: "ARMA FORGIATA!",
      qualita: qualita,
      stats: `⚔️ ${dannoFinale} ATK`,
      hex: nuovaArma.hex,
      tipoModello: tipo.toLowerCase()
    });
  } else {
    const tipo = totPezzi <= 7 ? "Elmo" : "Corazza";
    const defFinale = Math.round(baseDef * molt);
    const hpFinale = Math.round(baseHp * molt);
    const nuovaArmatura = {
      id: Date.now(),
      nome: `${tipo} di ${dominante.nome}`,
      difesa: defFinale,
      hpBonus: hpFinale,
      qualita: qualita,
      hex: dominante.hex
    };
    if (!datiUtente.arsenaleArmature) datiUtente.arsenaleArmature = [datiUtente.armaturaEquipaggiata];
    datiUtente.arsenaleArmature.push(nuovaArmatura);
    datiUtente.armaturaEquipaggiata = nuovaArmatura;

    salvaPartita();
    aggiornaAuraArmatura(playerGroup);
    chiudiForgia();
    mostraAnteprima3D({
      titolo: nuovaArmatura.nome,
      sottotitolo: "ARMATURA FORGIATA!",
      qualita: qualita,
      stats: `🛡️ +${defFinale} DEF | ❤️ +${hpFinale} HP`,
      hex: nuovaArmatura.hex,
      tipoModello: "armatura"
    });
  }
}

window.addEventListener('keydown', e => {
  if (!forgiaAperta) return;
  if (e.key === 'Escape') chiudiForgia();
  if (e.code === 'Space' && minigiocoAttivo) {
    e.preventDefault();
    registraColpoMartello();
  }
});
