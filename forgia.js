let calderoneForgia = {};
let categoriaForgia = "arma";
let forgiaAperta = false;
let minigiocoAttivo = false;
let posCursore = 0;
let dirCursore = 2.6;
let auraArmaturaMesh = null;

function aggiornaAuraArmatura(playerGroup) {
  if (auraArmaturaMesh) playerGroup.remove(auraArmaturaMesh);
  if (typeof applicaGraficaPersonaggio === 'function' && typeof playerSprite !== 'undefined') {
    applicaGraficaPersonaggio(playerSprite);
  }
}

const forgiaDiv = document.createElement('div');
forgiaDiv.id = "forgia-modal";
forgiaDiv.style.cssText = "display:none;position:fixed;inset:0;background:rgba(8,10,15,0.88);z-index:150;align-items:center;justify-content:center;color:#fff;";
forgiaDiv.innerHTML = `
  <div style="background:#161d29;border:2px solid #ff7043;padding:22px;border-radius:16px;width:540px;max-width:94vw;box-shadow:0 0 30px rgba(255,112,67,0.3);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <h2 style="color:#ff7043;font-size:20px;">⚒️ LA FORGIA DI IGNIS</h2>
      <div style="display:flex;gap:8px;">
        <button id="tab-arma" style="padding:6px 14px;border-radius:8px;border:2px solid #ff7043;background:#ff7043;color:#fff;font-weight:bold;cursor:pointer;">⚔️ ARMA</button>
        <button id="tab-armatura" style="padding:6px 14px;border-radius:8px;border:2px solid #29b6f6;background:transparent;color:#29b6f6;font-weight:bold;cursor:pointer;">🛡️ ARMATURA</button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
      <div style="background:#0f141d;padding:12px;border-radius:10px;border:1px solid #2c384d;">
        <p style="font-size:12px;color:#81d4fa;font-weight:bold;margin-bottom:8px;">🎒 ZAINO (Clicca per aggiungere)</p>
        <div id="forgia-zaino-list" style="display:flex;flex-direction:column;gap:6px;max-height:170px;overflow-y:auto;"></div>
      </div>

      <div style="background:#0f141d;padding:12px;border-radius:10px;border:1px solid #2c384d;display:flex;flex-direction:column;justify-content:space-between;">
        <div>
          <p style="font-size:12px;color:#ffd54f;font-weight:bold;margin-bottom:8px;">🔥 CALDERONE (<span id="calderone-tot">0</span>/20)</p>
          <div id="forgia-calderone-list" style="display:flex;flex-wrap:wrap;gap:5px;min-height:60px;"></div>
        </div>
        <div id="forgia-preview" style="background:#1a2332;padding:8px;border-radius:8px;margin-top:10px;font-size:12px;text-align:center;">
          Inserisci almeno 3 minerali!
        </div>
      </div>
    </div>

    <div id="minigioco-box" style="display:none;margin-bottom:14px;background:#0f141d;padding:12px;border-radius:10px;border:1px solid #ffd54f;">
      <p style="font-size:13px;color:#ffd54f;margin-bottom:8px;text-align:center;">Colpisci con <b>SPAZIO</b> nella zona verde!</p>
      <div style="position:relative;width:100%;height:26px;background:#111;border:2px solid #555;border-radius:8px;overflow:hidden;">
        <div style="position:absolute;left:42%;width:16%;height:100%;background:#4caf50;"></div>
        <div id="martello-cursore" style="position:absolute;left:0%;width:5px;height:100%;background:#fff;box-shadow:0 0 10px #fff;"></div>
      </div>
    </div>

    <div style="text-align:center;">
      <button id="btn-avvia-forgia" style="padding:10px 24px;background:#ff7043;color:#fff;border:none;border-radius:8px;font-weight:bold;font-size:14px;cursor:pointer;margin-right:8px;">🔥 FONDI E FORGIA</button>
      <button id="btn-chiudi-forgia" style="padding:10px 16px;background:#37474f;color:#fff;border:none;border-radius:8px;cursor:pointer;">Chiudi (ESC)</button>
    </div>
  </div>
`;
document.body.appendChild(forgiaDiv);

document.getElementById('tab-arma').onclick = () => {
  categoriaForgia = "arma";
  document.getElementById('tab-arma').style.background = "#ff7043"; document.getElementById('tab-arma').style.color = "#fff";
  document.getElementById('tab-armatura').style.background = "transparent"; document.getElementById('tab-armatura').style.color = "#29b6f6";
  aggiornaUIForgia();
};

document.getElementById('tab-armatura').onclick = () => {
  categoriaForgia = "armatura";
  document.getElementById('tab-armatura').style.background = "#29b6f6"; document.getElementById('tab-armatura').style.color = "#fff";
  document.getElementById('tab-arma').style.background = "transparent"; document.getElementById('tab-arma').style.color = "#ff7043";
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
      btn.style.cssText = "display:flex;justify-content:space-between;padding:6px 10px;background:#1a2332;border:1px solid #303d52;border-radius:6px;color:#fff;cursor:pointer;font-size:12px;";
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
      tag.style.cssText = `padding:5px 8px;background:#1e293b;color:${info.hex};border:1px solid ${info.hex};border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;`;
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
    prevEl.innerHTML = `<span style="color:#90a4ae;">Aggiungi almeno <b>3 minerali</b> (max 20)</span>`;
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

    prevEl.innerHTML = `Anteprima: <b style="color:${dominante.hex};">${tipoOggetto} di ${dominante.nome}</b><br>Potenza stimata: <b>~${sommaStat} ${categoriaForgia === "arma" ? "ATK" : "DEF"}</b>`;
  }
}

document.getElementById('btn-chiudi-forgia').onclick = chiudiForgia;

document.getElementById('btn-avvia-forgia').onclick = () => {
  const tot = Object.values(calderoneForgia).reduce((a, b) => a + b, 0);
  if (tot < 3) { alert("Inserisci almeno 3 minerali nel calderone!"); return; }
  minigiocoAttivo = true;
  posCursore = 0;
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

function completaForgia() {
  minigiocoAttivo = false;
  if (typeof SFX !== 'undefined') SFX.forgia();
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

  const dist = Math.abs(50 - posCursore);
  let molt = 1.0, qualita = "Normale";
  if (dist <= 8) { molt = 1.3; qualita = "PERFETTA ✨"; }
  else if (dist <= 20) { molt = 1.1; qualita = "Buona"; }
  else { molt = 0.85; qualita = "Sbeccata"; }

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
    const t = document.getElementById('toast');
    t.innerText = `⚔️ Forgiata: ${nuovaArma.nome} [${qualita}] (${dannoFinale} ATK)!`;
    t.style.border = `2px solid ${nuovaArma.hex}`; t.style.color = nuovaArma.hex; t.style.opacity = 1;
    setTimeout(() => t.style.opacity = 0, 2500);
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
    const t = document.getElementById('toast');
    t.innerText = `🛡️ Forgiata: ${nuovaArmatura.nome} [${qualita}] (+${defFinale} DEF)!`;
    t.style.border = `2px solid ${nuovaArmatura.hex}`; t.style.color = nuovaArmatura.hex; t.style.opacity = 1;
    setTimeout(() => t.style.opacity = 0, 2500);
  }
}

window.addEventListener('keydown', e => {
  if (!forgiaAperta) return;
  if (e.key === 'Escape') chiudiForgia();
  if (e.code === 'Space' && minigiocoAttivo) {
    e.preventDefault();
    completaForgia();
  }
});