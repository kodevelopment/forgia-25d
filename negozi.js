const VALORE_MINERALI = {
  "Pietra Focaia": 5, "Verdite": 15, "Cielite": 35,
  "Voidstone": 80, "Solarium": 200, "Kitsunite": 600,
  // 12 Nuovi Minerali Glaciali
  "Brina Compatta": 45, "Quarzo Artico": 70, "Criolite": 110,
  "Zaffiro Boreale": 165, "Permafrost": 240, "Ghiaccio Eterno": 340,
  "Cristallo Polare": 480, "Argento Lunare": 680, "Nordite": 950,
  "Aurora Cristallina": 1400, "Cuore dello Yeti": 2200, "Zero Assoluto": 3500
};

const LISTA_PICCONI = [
  { nome: "Piccone Base", danno: 1, prezzo: 0, colore: "#90a4ae" },
  { nome: "Piccone di Ferro", danno: 2, prezzo: 60, colore: "#eceff1" },
  { nome: "Piccone Runico", danno: 3, prezzo: 250, colore: "#29b6f6" },
  { nome: "Piccone Astrale", danno: 5, prezzo: 800, colore: "#ffd54f" },
  { nome: "Piccone Vulcanico", danno: 9, prezzo: 3500, colore: "#ff7043" },
  { nome: "Piccone del Vuoto", danno: 16, prezzo: 20000, colore: "#ab47bc" },
  { nome: "Piccone Kitsunite", danno: 30, prezzo: 50000, colore: "#ff1744" },
  { nome: "Piccone di Criolite", danno: 55, prezzo: 95000, colore: "#00e5ff" },
  { nome: "Piccone Polare", danno: 95, prezzo: 160000, colore: "#64ffda" },
  { nome: "Piccone Zero Assoluto", danno: 160, prezzo: 280000, colore: "#84ffff" }
];

let picconeSprite = null;
let dialogoAperto = false;
let negozioPicconiAperto = false;
let opzioniAttuali = [];

const dlgBox = document.createElement('div');
dlgBox.id = "dialogo-rpg";
dlgBox.style.cssText = "display:none;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);width:620px;max-width:94vw;background:linear-gradient(180deg,#2b1e16,#1a120d);border:3px solid #d4af37;border-radius:14px;padding:18px 22px;color:#f5ebd6;z-index:180;box-shadow:0 10px 35px rgba(0,0,0,0.85);font-family:Georgia,serif;";
dlgBox.innerHTML = `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;border-bottom:1px solid rgba(212,175,55,0.3);padding-bottom:8px;">
    <div id="dlg-icona" style="font-size:28px;background:#1a120d;width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:2px solid #8d6e63;">💬</div>
    <div>
      <div id="dlg-nome" style="font-weight:bold;font-size:17px;color:#ffd54f;">NPC</div>
      <div style="font-size:11px;color:#bcaaa4;">Premi <b>1-4</b> o clicca una risposta (<b>ESC</b> per uscire)</div>
    </div>
  </div>
  <p id="dlg-testo" style="font-size:14px;line-height:1.5;color:#f5ebd6;margin-bottom:14px;min-height:38px;"></p>
  <div id="dlg-opzioni" style="display:flex;flex-direction:column;gap:7px;"></div>
`;
document.body.appendChild(dlgBox);

function apriDialogo(icona, nome, colore, testo, opzioni) {
  dialogoAperto = true;
  opzioniAttuali = opzioni;
  document.getElementById('dlg-icona').innerText = icona;
  const nomeEl = document.getElementById('dlg-nome');
  nomeEl.innerText = nome;
  nomeEl.style.color = colore;
  dlgBox.style.borderColor = colore;
  document.getElementById('dlg-testo').innerText = testo;

  const optContainer = document.getElementById('dlg-opzioni');
  optContainer.innerHTML = '';
  opzioni.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.innerHTML = `<span style="color:${colore};font-weight:bold;margin-right:8px;">[${idx + 1}]</span> ${opt.testo}`;
    btn.style.cssText = "text-align:left;padding:9px 14px;background:#3a281d;border:1px solid #8d6e63;border-radius:8px;color:#f5ebd6;font-size:13px;cursor:pointer;font-family:Georgia,serif;";
    btn.onmouseover = () => btn.style.background = "#4e3628";
    btn.onmouseout = () => btn.style.background = "#3a281d";
    btn.onclick = () => {
      if (opt.azione) opt.azione();
      else chiudiDialogo();
    };
    optContainer.appendChild(btn);
  });

  dlgBox.style.display = "block";
}

function chiudiDialogo() {
  dialogoAperto = false;
  opzioniAttuali = [];
  dlgBox.style.display = "none";
}

window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && negozioPicconiAperto) {
    chiudiNegozioPicconi();
    return;
  }
  if (!dialogoAperto) return;
  if (e.key === 'Escape') { chiudiDialogo(); return; }
  const num = parseInt(e.key);
  if (num >= 1 && num <= opzioniAttuali.length) {
    e.preventDefault();
    const scelta = opzioniAttuali.at(num - 1);
    if (scelta && scelta.azione) scelta.azione();
    else chiudiDialogo();
  }
});

function creaPicconeInMano(playerGroup) {
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  const g = c.getContext('2d');
  const lvl = datiUtente.livelloPiccone || 0;
  const picconeAttuale = LISTA_PICCONI.at(lvl) || LISTA_PICCONI.at(0);

  g.fillStyle = '#8d6e63';
  g.fillRect(3, 11, 2, 2); g.fillRect(5, 9, 2, 2); g.fillRect(7, 7, 2, 2); g.fillRect(9, 5, 2, 2);
  g.fillStyle = picconeAttuale.colore || '#29b6f6';
  g.fillRect(7, 2, 6, 2); g.fillRect(11, 3, 2, 5);

  const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter;
  if (picconeSprite) playerGroup.remove(picconeSprite);
  picconeSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  picconeSprite.scale.set(1.1, 1.1, 1);
  picconeSprite.position.set(0.65, 0.85, 0.1);
  playerGroup.add(picconeSprite);
}

function animaPiccone() {
  if (!picconeSprite) return;
  picconeSprite.material.rotation = -0.9;
  picconeSprite.position.x = 0.85;
  setTimeout(() => { picconeSprite.material.rotation = 0; picconeSprite.position.x = 0.65; }, 140);
}
// --- MENU VETRINA PICCONI CON MODELLO 3D SCOLPITO ---
const shopPicconiDiv = document.createElement('div');
shopPicconiDiv.id = "shop-picconi-modal";
shopPicconiDiv.style.cssText = "display:none;position:fixed;inset:0;background:rgba(10,7,5,0.9);z-index:190;align-items:center;justify-content:center;color:#f5ebd6;font-family:Georgia,serif;";
shopPicconiDiv.innerHTML = `
  <div style="background:linear-gradient(180deg,#2b1e16,#1a120d);border:3px solid #d4af37;padding:20px;border-radius:16px;width:650px;max-width:95vw;box-shadow:0 0 35px rgba(212,175,55,0.25);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;border-bottom:1px solid rgba(212,175,55,0.3);padding-bottom:10px;">
      <h2 style="color:#ffd54f;font-size:20px;">⛏️ BOTTEGA DI SORA - PICCONI</h2>
      <div style="background:#140e0a;padding:6px 14px;border-radius:8px;border:2px solid #d4af37;font-weight:bold;color:#ffd54f;font-size:14px;">
        💰 <span id="shop-picconi-monete">0</span>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1.1fr 0.9fr;gap:16px;align-items:center;">
      <div id="lista-vetrina-picconi" style="display:flex;flex-direction:column;gap:7px;max-height:300px;overflow-y:auto;padding-right:4px;"></div>

      <div style="background:#140e0a;border:2px solid #8d6e63;border-radius:14px;padding:16px;text-align:center;">
        <h3 id="vetrina-nome" style="font-size:18px;color:#ffd54f;margin-bottom:4px;">Piccone</h3>
        <p id="vetrina-danno" style="font-size:12px;color:#d7ccc8;margin-bottom:10px;">Potenza Scavo: x1</p>
        <div id="vetrina-3d-box" style="width:175px;height:175px;margin:0 auto 12px auto;border-radius:12px;background:radial-gradient(circle,rgba(212,175,55,0.16) 0%,rgba(0,0,0,0.6) 100%);border:1px solid #5d4037;overflow:hidden;"></div>
        <button id="btn-azione-piccone" style="width:100%;padding:10px;border:2px solid #d4af37;border-radius:8px;font-weight:bold;font-size:13px;cursor:pointer;font-family:Georgia,serif;">EQUIPAGGIATO</button>
      </div>
    </div>

    <div style="text-align:right;margin-top:14px;">
      <button id="btn-chiudi-shop-picconi" style="padding:8px 18px;background:#4e342e;color:#f5ebd6;border:1px solid #8d6e63;border-radius:8px;cursor:pointer;font-weight:bold;font-family:Georgia,serif;">Chiudi (ESC)</button>
    </div>
  </div>
`;
document.body.appendChild(shopPicconiDiv);

let vetrinaAnimId = null;
let indiceSelezionato = 0;

function chiudiNegozioPicconi() {
  negozioPicconiAperto = false;
  shopPicconiDiv.style.display = 'none';
  if (vetrinaAnimId) cancelAnimationFrame(vetrinaAnimId);
}

document.getElementById('btn-chiudi-shop-picconi').onclick = chiudiNegozioPicconi;

// Costruisce un Piccone 3D scolpito con punte curve, fasce in cuoio e gemma centrale
function creaModello3DPicconeScolpito(coloreHex) {
  const gruppo = new THREE.Group();
  const colNum = parseInt(coloreHex.replace('#', '0x'), 16) || 0x29b6f6;

  const matMetallo = new THREE.MeshStandardMaterial({ color: colNum, metalness: 0.7, roughness: 0.2, emissive: colNum, emissiveIntensity: 0.22 });
  const matLegno = new THREE.MeshStandardMaterial({ color: 0x5d4037, roughness: 0.85 });
  const matCuoio = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.9 });
  const matOro = new THREE.MeshStandardMaterial({ color: 0xffd54f, metalness: 0.85, roughness: 0.2 });

  // Manico principale + fasciature in cuoio + pomolo d'oro
  const manico = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.09, 2.2, 10), matLegno);
  const fascia1 = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.16, 10), matCuoio);
  fascia1.position.y = -0.5;
  const fascia2 = fascia1.clone();
  fascia2.position.y = -0.8;
  const pomolo = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), matOro);
  pomolo.position.y = -1.12;
  gruppo.add(manico, fascia1, fascia2, pomolo);

  // Blocco centrale della testa con gemma incastonata
  const bloccoCentro = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.34, 0.32), matOro);
  bloccoCentro.position.y = 0.82;
  const gemma = new THREE.Mesh(new THREE.OctahedronGeometry(0.18, 0), matMetallo);
  gemma.position.set(0, 0.82, 0.14);
  const gemmaRetro = gemma.clone();
  gemmaRetro.position.z = -0.14;
  gruppo.add(bloccoCentro, gemma, gemmaRetro);

  // Braccio sinistro curvo + punta affilata
  const braccioSx = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.22), matMetallo);
  braccioSx.position.set(-0.44, 0.78, 0);
  braccioSx.rotation.z = 0.22;
  const puntaSx = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.55, 4), matMetallo);
  puntaSx.position.set(-0.92, 0.62, 0);
  puntaSx.rotation.z = Math.PI / 2 + 0.42;

  // Braccio destro curvo + punta affilata
  const braccioDx = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.22, 0.22), matMetallo);
  braccioDx.position.set(0.44, 0.78, 0);
  braccioDx.rotation.z = -0.22;
  const puntaDx = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.55, 4), matMetallo);
  puntaDx.position.set(0.92, 0.62, 0);
  puntaDx.rotation.z = -Math.PI / 2 - 0.42;

  gruppo.add(braccioSx, puntaSx, braccioDx, puntaDx);
  return gruppo;
}

function renderizzaPicconeVetrina(coloreHex) {
  if (vetrinaAnimId) cancelAnimationFrame(vetrinaAnimId);
  const box = document.getElementById('vetrina-3d-box');
  box.innerHTML = '';
  if (typeof THREE === 'undefined') return;

  const sceneV = new THREE.Scene();
  const camV = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camV.position.set(0, 0.15, 3.6);

  const rendV = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  rendV.setSize(175, 175);
  box.appendChild(rendV.domElement);

  const luce = new THREE.DirectionalLight(0xffffff, 1.6);
  luce.position.set(3, 5, 4);
  sceneV.add(luce, new THREE.AmbientLight(0xffffff, 0.7));

  const gruppo = creaModello3DPicconeScolpito(coloreHex);
  gruppo.rotation.z = 0.28;
  sceneV.add(gruppo);

  function gira() {
    if (!negozioPicconiAperto) return;
    gruppo.rotation.y += 0.032;
    rendV.render(sceneV, camV);
    vetrinaAnimId = requestAnimationFrame(gira);
  }
  gira();
}

function apriNegozioPicconi(playerGroup, idxIniziale = null) {
  negozioPicconiAperto = true;
  const lvlPosseduto = datiUtente.livelloPiccone || 0;
  if (idxIniziale !== null) {
    indiceSelezionato = idxIniziale;
  } else {
    indiceSelezionato = Math.min(LISTA_PICCONI.length - 1, lvlPosseduto + 1);
  }

  document.getElementById('shop-picconi-monete').innerText = datiUtente.monete || 0;
  const listaEl = document.getElementById('lista-vetrina-picconi');
  listaEl.innerHTML = '';

  LISTA_PICCONI.forEach((pic, idx) => {
    const posseduto = idx <= lvlPosseduto;
    const selezionato = idx === indiceSelezionato;
    const btn = document.createElement('button');
    btn.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:9px 12px;background:${selezionato ? '#3a281d' : '#140e0a'};border:2px solid ${selezionato ? pic.colore : '#5d4037'};border-radius:10px;color:#f5ebd6;cursor:pointer;text-align:left;font-family:Georgia,serif;`;
    btn.innerHTML = `
      <div>
        <div style="font-weight:bold;font-size:13px;color:${pic.colore};">${pic.nome}</div>
        <div style="font-size:11px;color:#bcaaa4;">Potenza x${pic.danno}</div>
      </div>
      <div style="font-size:11px;font-weight:bold;color:${posseduto ? '#81c784' : '#ffd54f'};">
        ${posseduto ? '✅ POSSEDUTO' : `💰 ${pic.prezzo}`}
      </div>
    `;
    btn.onclick = () => apriNegozioPicconi(playerGroup, idx);
    listaEl.appendChild(btn);
  });

  const sel = LISTA_PICCONI[indiceSelezionato];
  document.getElementById('vetrina-nome').innerText = sel.nome;
  document.getElementById('vetrina-nome').style.color = sel.colore;
  document.getElementById('vetrina-danno').innerText = `Potenza Scavo: x${sel.danno}`;
  renderizzaPicconeVetrina(sel.colore);

  const btnAzione = document.getElementById('btn-azione-piccone');
  if (indiceSelezionato <= lvlPosseduto) {
    btnAzione.innerText = "✅ GIÀ ACQUISTATO";
    btnAzione.style.background = "#2e7d32";
    btnAzione.style.color = "#fff";
    btnAzione.onclick = null;
  } else if (indiceSelezionato > lvlPosseduto + 1) {
    btnAzione.innerText = "🔒 SBLOCCA PRIMA IL PRECEDENTE";
    btnAzione.style.background = "#3e2723";
    btnAzione.style.color = "#a1887f";
    btnAzione.onclick = null;
  } else {
    btnAzione.innerText = `COMPRA (${sel.prezzo} Monete)`;
    btnAzione.style.background = "#d4af37";
    btnAzione.style.color = "#1a120d";
    btnAzione.onclick = () => {
      if ((datiUtente.monete || 0) >= sel.prezzo) {
        datiUtente.monete -= sel.prezzo;
        datiUtente.livelloPiccone = indiceSelezionato;
        salvaPartita();
        creaPicconeInMano(playerGroup);
        if (typeof SFX !== 'undefined' && SFX.forgia) SFX.forgia();
        apriNegozioPicconi(playerGroup, indiceSelezionato);
      } else {
        alert("Non hai abbastanza monete!");
      }
    };
  }

  shopPicconiDiv.style.display = 'flex';
}
function interagisciNPC(playerGroup) {
  if (dialogoAperto || negozioPicconiAperto) return;
  let vicino = null;
  listaNPC.forEach(npc => {
    if (Math.hypot(playerGroup.position.x - npc.x, playerGroup.position.z - npc.z) < 3.4) {
      vicino = npc;
    }
  });
  if (!vicino) return;

  if (vicino.tipo === "vendi") {
    let guadagno = 0;
    Object.keys(datiUtente.inventario).forEach(nome => {
      guadagno += datiUtente.inventario[nome].qta * (VALORE_MINERALI[nome] || 5);
    });

    if (guadagno === 0) {
      apriDialogo("💰", "Marco il Mercante", "#ffd54f",
        "Non hai nessun minerale nello zaino al momento! Entra nella grotta a Nord o nella Caverna Glaciale.",
        [{ testo: "Va bene, torno subito!" }]
      );
    } else {
      apriDialogo("💰", "Marco il Mercante", "#ffd54f",
        `Ottimo bottino! Posso comprare tutti i minerali del tuo zaino per ${guadagno} Monete d'oro. Che ne dici?`,
        [
          {
            testo: `Vendi tutto (+${guadagno} Monete)`,
            azione: () => {
              datiUtente.monete = (datiUtente.monete || 0) + guadagno;
              datiUtente.inventario = {};
              salvaPartita();
              apriDialogo("💰", "Marco il Mercante", "#ffd54f",
                `Affare fatto! Ora hai ${datiUtente.monete} Monete in tasca.`,
                [{ testo: "Grazie Marco!" }]
              );
            }
          },
          { testo: "Ci penso un attimo (Esci)" }
        ]
      );
    }
  } else if (vicino.tipo === "picconi") {
    apriNegozioPicconi(playerGroup);
  } else if (vicino.tipo === "forgia") {
    apriForgia();
  } else if (vicino.tipo === "quest") {
    apriDialogo("📜", "Saggio Elowen", "#ce93d8",
      "Benvenuto nel Villaggio di Succo Studios, giovane fabbro! Oltre alla Grotta a Nord, ora si è aperto il Portale per l'Abisso Glaciale.",
      [
        {
          testo: "Missione: Consegna 5 Verdite (Ricompensa: 150 Monete + 40 XP)",
          azione: () => {
            if (datiUtente.inventario["Verdite"] && datiUtente.inventario["Verdite"].qta >= 5) {
              datiUtente.inventario["Verdite"].qta -= 5;
              if (datiUtente.inventario["Verdite"].qta <= 0) delete datiUtente.inventario["Verdite"];
              datiUtente.monete = (datiUtente.monete || 0) + 150;
              if (typeof aggiungiXP === 'function') aggiungiXP(40);
              salvaPartita();
              apriDialogo("📜", "Saggio Elowen", "#ce93d8",
                "Magnifico! Queste Verdite sono purissime. Ecco 150 Monete e 40 XP come promesso!",
                [{ testo: "Grazie mille Saggio!" }]
              );
            } else {
              apriDialogo("📜", "Saggio Elowen", "#ce93d8",
                "Ti servono almeno 5 Verdite nello zaino per completare questa missione.",
                [{ testo: "Vado subito a cercarle!" }]
              );
            }
          }
        },
        {
          testo: "Benedizione della Fortuna (-100 Monete -> Luck x2.5)",
          azione: () => {
            if ((datiUtente.monete || 0) >= 100) {
              datiUtente.monete -= 100;
              salvaPartita();
              luck = 2.5;
              document.getElementById('luck-val').innerText = "x2.5 ✨";
              apriDialogo("🍀", "Saggio Elowen", "#4caf50",
                "Che gli spiriti della montagna guidino il tuo piccone! La tua Fortuna ora è x2.5!",
                [{ testo: "Potere incredibile!" }]
              );
            } else {
              apriDialogo("📜", "Saggio Elowen", "#ff5252",
                "Servono 100 Monete per evocare la Benedizione della Fortuna.",
                [{ testo: "Tornerò quando avrò più oro." }]
              );
            }
          }
        },
        { testo: "Arrivederci" }
      ]
    );
  } else if (vicino.tipo === "quest_caccia") {
    apriDialogo("⚔️", "Capitano Valen", "#ff7043",
      "Salute, guerriero! Se vuoi sopravvivere ai mostri della Caverna Glaciale, forgia prima un'armatura potente.",
      [
        {
          testo: "Missione Caccia: Consegna 10 Pietra Focaia e 3 Cielite (+400 Monete, +80 XP)",
          azione: () => {
            const pf = datiUtente.inventario["Pietra Focaia"]?.qta || 0;
            const ci = datiUtente.inventario["Cielite"]?.qta || 0;
            if (pf >= 10 && ci >= 3) {
              datiUtente.inventario["Pietra Focaia"].qta -= 10;
              if (datiUtente.inventario["Pietra Focaia"].qta <= 0) delete datiUtente.inventario["Pietra Focaia"];
              datiUtente.inventario["Cielite"].qta -= 3;
              if (datiUtente.inventario["Cielite"].qta <= 0) delete datiUtente.inventario["Cielite"];
              datiUtente.monete = (datiUtente.monete || 0) + 400;
              if (typeof aggiungiXP === 'function') aggiungiXP(80);
              salvaPartita();
              apriDialogo("⚔️", "Capitano Valen", "#ff7043",
                "Ottimo lavoro! Ecco 400 Monete e 80 XP per il tuo coraggio.",
                [{ testo: "Alla prossima missione!" }]
              );
            } else {
              apriDialogo("⚔️", "Capitano Valen", "#ff5252",
                `Ti servono 10 Pietra Focaia (hai ${pf}) e 3 Cielite (hai ${ci}).`,
                [{ testo: "Torno subito a cercarle!" }]
              );
            }
          }
        },
        { testo: "Arrivederci Capitano" }
      ]
    );
  } else if (vicino.tipo === "quest_miniera") {
    apriDialogo("💎", "Mastro Borin", "#4dd0e1",
      "Benvenuto nella Gilda dei Minatori! Hai già visitato il Portale Glaciale a Sud-Ovest della piazza?",
      [
        {
          testo: "Missione Rara: Consegna 2 Voidstone (+1.200 Monete, +150 XP)",
          azione: () => {
            const vs = datiUtente.inventario["Voidstone"]?.qta || 0;
            if (vs >= 2) {
              datiUtente.inventario["Voidstone"].qta -= 2;
              if (datiUtente.inventario["Voidstone"].qta <= 0) delete datiUtente.inventario["Voidstone"];
              datiUtente.monete = (datiUtente.monete || 0) + 1200;
              if (typeof aggiungiXP === 'function') aggiungiXP(150);
              salvaPartita();
              apriDialogo("💎", "Mastro Borin", "#4dd0e1",
                "Incredibile! Ecco 1.200 Monete e 150 XP!",
                [{ testo: "Grazie Mastro Borin!" }]
              );
            } else {
              apriDialogo("💎", "Mastro Borin", "#ff5252",
                `Hai solo ${vs}/2 Voidstone. Scava nelle zone più profonde della grotta!`,
                [{ testo: "Scendo subito!" }]
              );
            }
          }
        },
        { testo: "A presto Mastro" }
      ]
    );
  } else if (vicino.tipo === "glaciale_kael") {
    apriDialogo("❄️", "Esploratore Kael", "#00e5ff",
      "Attento! I mostri in questa Caverna Glaciale sono OVERLEVEL. Qui al Campo Base posso curarti o attivare il Portale Rapido!",
      [
        {
          testo: "Riposa al Fuoco Polare (Ripristina 100% HP)",
          azione: () => {
            if (typeof hpGiocatore !== 'undefined') {
              hpGiocatore = maxHpGiocatore;
              if (typeof aggiornaBarraHP === 'function') aggiornaBarraHP();
            }
            if (typeof SFX !== 'undefined' && SFX.cura) SFX.cura();
            apriDialogo("🔥", "Esploratore Kael", "#00e5ff",
              "Ti sei scaldato per bene! Salute al massimo.",
              [{ testo: "Pronto a combattere!" }]
            );
          }
        },
        {
          testo: datiUtente.checkpointGlaciale ? "✅ Teletrasporto Rapido già attivo" : "Attiva Teletrasporto Campo Base (-500 Monete)",
          azione: () => {
            if (datiUtente.checkpointGlaciale) { chiudiDialogo(); return; }
            if ((datiUtente.monete || 0) >= 500) {
              datiUtente.monete -= 500;
              datiUtente.checkpointGlaciale = true;
              salvaPartita();
              apriDialogo("🌀", "Esploratore Kael", "#00e5ff",
                "Perfetto! Ora al Villaggio apparirà un Portale diretto per questo Campo Base Glaciale!",
                [{ testo: "Utilissimo!" }]
              );
            } else {
              apriDialogo("❄️", "Esploratore Kael", "#ff5252",
                "Servono 500 Monete per alimentare il cristallo del teletrasporto.",
                [{ testo: "Tornerò con più oro." }]
              );
            }
          }
        },
        { testo: "Continua l'esplorazione" }
      ]
    );
  } else if (vicino.tipo === "glaciale_freya") {
    apriDialogo("👑", "Dama Freya", "#84ffff",
      "Solo i fabbri più audaci osano sfidare lo Yeti Antico nelle profondità dei ghiacci. Portami minerali glaciali per grandi ricompense!",
      [
        {
          testo: "Missione Glaciale: Consegna 5 Criolite e 3 Permafrost (+4.500 Monete, +400 XP)",
          azione: () => {
            const cr = datiUtente.inventario["Criolite"]?.qta || 0;
            const pf = datiUtente.inventario["Permafrost"]?.qta || 0;
            if (cr >= 5 && pf >= 3) {
              datiUtente.inventario["Criolite"].qta -= 5;
              if (datiUtente.inventario["Criolite"].qta <= 0) delete datiUtente.inventario["Criolite"];
              datiUtente.inventario["Permafrost"].qta -= 3;
              if (datiUtente.inventario["Permafrost"].qta <= 0) delete datiUtente.inventario["Permafrost"];
              datiUtente.monete = (datiUtente.monete || 0) + 4500;
              if (typeof aggiungiXP === 'function') aggiungiXP(400);
              salvaPartita();
              apriDialogo("👑", "Dama Freya", "#84ffff",
                "Straordinario! Ecco 4.500 Monete d'oro e 400 XP!",
                [{ testo: "Onorato, Dama Freya!" }]
              );
            } else {
              apriDialogo("👑", "Dama Freya", "#ff5252",
                `Ti servono 5 Criolite (hai ${cr}) e 3 Permafrost (hai ${pf}).`,
                [{ testo: "Vado a minare nei ghiacci!" }]
              );
            }
          }
        },
        { testo: "Arrivederci" }
      ]
    );
  }
}
