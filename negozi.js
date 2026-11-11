const VALORE_MINERALI = {
  "Pietra Focaia": 5, "Verdite": 15, "Cielite": 35,
  "Voidstone": 80, "Solarium": 200, "Kitsunite": 600
};

const LISTA_PICCONI = [
  { nome: "Piccone Base", danno: 1, prezzo: 0, colore: "#90a4ae" },
  { nome: "Piccone di Ferro", danno: 2, prezzo: 60, colore: "#eceff1" },
  { nome: "Piccone Runico", danno: 3, prezzo: 250, colore: "#29b6f6" },
  { nome: "Piccone Astrale", danno: 5, prezzo: 800, colore: "#ffd54f" }
];

let picconeSprite = null;
let dialogoAperto = false;
let opzioniAttuali = [];

// Crea la Finestra di Dialogo stile RPG
const dlgBox = document.createElement('div');
dlgBox.id = "dialogo-rpg";
dlgBox.style.cssText = "display:none;position:fixed;bottom:24px;left:50%;transform:translateX(-50%);width:620px;max-width:94vw;background:rgba(15,20,30,0.96);border:2px solid #ffd54f;border-radius:16px;padding:18px 22px;color:#fff;z-index:180;box-shadow:0 10px 35px rgba(0,0,0,0.8);";
dlgBox.innerHTML = `
  <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
    <div id="dlg-icona" style="font-size:28px;background:#1e293b;width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;border:1px solid #334155;">💬</div>
    <div>
      <div id="dlg-nome" style="font-weight:bold;font-size:16px;color:#ffd54f;">NPC</div>
      <div style="font-size:11px;color:#94a3b8;">Premi <b>1-4</b> o clicca una risposta (<b>ESC</b> per uscire)</div>
    </div>
  </div>
  <p id="dlg-testo" style="font-size:14px;line-height:1.5;color:#e2e8f0;margin-bottom:14px;min-height:38px;"></p>
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
    btn.style.cssText = "text-align:left;padding:9px 14px;background:#1e293b;border:1px solid #334155;border-radius:8px;color:#fff;font-size:13px;cursor:pointer;transition:background 0.15s;";
    btn.onmouseover = () => btn.style.background = "#2d3b52";
    btn.onmouseout = () => btn.style.background = "#1e293b";
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

// Supporto tasti rapidi 1, 2, 3, 4 ed ESC nei dialoghi
window.addEventListener('keydown', e => {
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
  g.fillStyle = '#8d6e63';
  g.fillRect(3, 11, 2, 2); g.fillRect(5, 9, 2, 2); g.fillRect(7, 7, 2, 2); g.fillRect(9, 5, 2, 2);
  g.fillStyle = '#29b6f6';
  g.fillRect(7, 2, 6, 2); g.fillRect(11, 3, 2, 5);

  const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter;
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
function interagisciNPC(playerGroup) {
  if (dialogoAperto) return;
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
        "Non hai nessun minerale nello zaino al momento! Entra nella grotta a Nord e rompi qualche roccia.",
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
    const lvl = datiUtente.livelloPiccone || 0;
    const prossimo = LISTA_PICCONI.at(lvl + 1);
    const monete = datiUtente.monete || 0;

    if (!prossimo) {
      apriDialogo("⛏️", "Sora l'Artigiana", "#29b6f6",
        "Hai già il Piccone Astrale, il più potente mai forgiato da Succo Studios!",
        [{ testo: "Fantastico!" }]
      );
    } else {
      apriDialogo("⛏️", "Sora l'Artigiana", "#29b6f6",
        `Ho pronto il [${prossimo.nome}] (Danno x${prossimo.danno}) al prezzo di ${prossimo.prezzo} Monete. Tu hai ${monete} Monete.`,
        [
          {
            testo: `Compra ${prossimo.nome} (-${prossimo.prezzo} Monete)`,
            azione: () => {
              if (monete >= prossimo.prezzo) {
                datiUtente.monete -= prossimo.prezzo;
                datiUtente.livelloPiccone = lvl + 1;
                salvaPartita();
                apriDialogo("⛏️", "Sora l'Artigiana", "#29b6f6",
                  `Ecco a te il ${prossimo.nome}! Ora spaccherai le rocce molto più in fretta.`,
                  [{ testo: "Non vedo l'ora di provarlo!" }]
                );
              } else {
                apriDialogo("⛏️", "Sora l'Artigiana", "#ff5252",
                  "Non hai abbastanza monete! Vai da Marco a vendere qualche minerale prima.",
                  [{ testo: "D'accordo, torno dopo." }]
                );
              }
            }
          },
          { testo: "Non ora (Esci)" }
        ]
      );
    }
  } else if (vicino.tipo === "forgia") {
    apriForgia();
  } else if (vicino.tipo === "quest") {
    apriDialogo("📜", "Saggio Elowen", "#ce93d8",
      "Benvenuto nel Villaggio di Succo Studios, giovane fabbro! La grotta nasconde grandi tesori e pericoli. Come posso guidarti?",
      [
        {
          testo: "Missione: Consegna 5 Verdite (Ricompensa: 150 Monete)",
          azione: () => {
            if (datiUtente.inventario["Verdite"] && datiUtente.inventario["Verdite"].qta >= 5) {
              datiUtente.inventario["Verdite"].qta -= 5;
              if (datiUtente.inventario["Verdite"].qta <= 0) delete datiUtente.inventario["Verdite"];
              datiUtente.monete = (datiUtente.monete || 0) + 150;
              salvaPartita();
              apriDialogo("📜", "Saggio Elowen", "#ce93d8",
                "Magnifico! Queste Verdite sono purissime. Ecco 150 Monete come promesso!",
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
        {
          testo: "Chiedi informazioni sulla Kitsunite",
          azione: () => {
            apriDialogo("📜", "Saggio Elowen", "#ce93d8",
              "La Kitsunite è un minerale leggendario rarissimo. Chi riesce a forgiare un'arma o una corazza con essa diventa quasi invincibile!",
              [{ testo: "Un giorno la troverò!" }]
            );
          }
        },
        { testo: "Arrivederci" }
      ]
    );
  }
}