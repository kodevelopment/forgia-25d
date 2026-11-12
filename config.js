const MINERALI = [
  // Minerali Caverna Base
  { nome: "Pietra Focaia", rarita: "Comune", peso: 60, danno: 2, difesa: 1, hpBonus: 5, xp: 8, colore: 0xffffff, hex: "#ffffff" },
  { nome: "Verdite", rarita: "Non Comune", peso: 28, danno: 5, difesa: 2, hpBonus: 15, xp: 14, colore: 0x4caf50, hex: "#4caf50" },
  { nome: "Cielite", rarita: "Raro", peso: 10, danno: 11, difesa: 5, hpBonus: 35, xp: 24, colore: 0x29b6f6, hex: "#29b6f6" },
  { nome: "Voidstone", rarita: "Epico", peso: 2, danno: 22, difesa: 10, hpBonus: 70, xp: 45, colore: 0xab47bc, hex: "#ab47bc" },
  { nome: "Solarium", rarita: "Leggendario", peso: 0.2, danno: 45, difesa: 20, hpBonus: 140, xp: 90, colore: 0xffd54f, hex: "#ffd54f" },
  { nome: "Kitsunite", rarita: "MITICO", peso: 0.05, danno: 95, difesa: 40, hpBonus: 300, xp: 200, colore: 0xff1744, hex: "#ff1744" },

  // 12 Nuovi Minerali della Caverna Glaciale
  { nome: "Brina Compatta", rarita: "Glaciale Comune", peso: 45, danno: 14, difesa: 7, hpBonus: 45, xp: 28, colore: 0xb3e5fc, hex: "#b3e5fc", glaciale: true },
  { nome: "Quarzo Artico", rarita: "Glaciale Comune", peso: 32, danno: 20, difesa: 10, hpBonus: 65, xp: 36, colore: 0xe1f5fe, hex: "#e1f5fe", glaciale: true },
  { nome: "Criolite", rarita: "Glaciale Non Comune", peso: 22, danno: 28, difesa: 14, hpBonus: 95, xp: 48, colore: 0x4fc3f7, hex: "#4fc3f7", glaciale: true },
  { nome: "Zaffiro Boreale", rarita: "Glaciale Non Comune", peso: 16, danno: 38, difesa: 18, hpBonus: 130, xp: 62, colore: 0x0288d1, hex: "#0288d1", glaciale: true },
  { nome: "Permafrost", rarita: "Glaciale Raro", peso: 11, danno: 50, difesa: 24, hpBonus: 175, xp: 80, colore: 0x00bcd4, hex: "#00bcd4", glaciale: true },
  { nome: "Ghiaccio Eterno", rarita: "Glaciale Raro", peso: 7.5, danno: 65, difesa: 31, hpBonus: 230, xp: 105, colore: 0x80deea, hex: "#80deea", glaciale: true },
  { nome: "Cristallo Polare", rarita: "Glaciale Epico", peso: 4.5, danno: 85, difesa: 40, hpBonus: 300, xp: 140, colore: 0x00e5ff, hex: "#00e5ff", glaciale: true },
  { nome: "Argento Lunare", rarita: "Glaciale Epico", peso: 2.8, danno: 110, difesa: 52, hpBonus: 390, xp: 185, colore: 0xcfd8dc, hex: "#cfd8dc", glaciale: true },
  { nome: "Nordite", rarita: "Glaciale Leggendario", peso: 1.4, danno: 145, difesa: 68, hpBonus: 510, xp: 240, colore: 0x64ffda, hex: "#64ffda", glaciale: true },
  { nome: "Aurora Cristallina", rarita: "Glaciale Leggendario", peso: 0.6, danno: 190, difesa: 88, hpBonus: 680, xp: 320, colore: 0x1de9b6, hex: "#1de9b6", glaciale: true },
  { nome: "Cuore dello Yeti", rarita: "GLACIALE MITICO", peso: 0.18, danno: 250, difesa: 115, hpBonus: 900, xp: 450, colore: 0x18ffff, hex: "#18ffff", glaciale: true },
  { nome: "Zero Assoluto", rarita: "DIVINO GLACIALE", peso: 0.05, danno: 340, difesa: 155, hpBonus: 1250, xp: 650, colore: 0x84ffff, hex: "#84ffff", glaciale: true }
];

const SAVE_KEY = "forgia_25d_save_v1";
let datiUtente = JSON.parse(localStorage.getItem(SAVE_KEY)) || {
  nome: "",
  livello: 1,
  xp: 0,
  inventario: {},
  monete: 0,
  livelloPiccone: 0,
  checkpointGlaciale: false,
  armaEquipaggiata: { nome: "Spada di Legno", danno: 8, qualita: "Base", hex: "#a1887f" },
  armaturaEquipaggiata: { nome: "Tunica Base", difesa: 0, hpBonus: 0, qualita: "Base", hex: "#1976d2" }
};

if (!datiUtente.livello) datiUtente.livello = 1;
if (typeof datiUtente.xp !== 'number') datiUtente.xp = 0;

function getXpNecessaria(livello) {
  return Math.round(livello * 120 + Math.pow(livello, 1.35) * 25);
}

function aggiungiXP(quantita) {
  datiUtente.xp = (datiUtente.xp || 0) + quantita;
  let salito = false;

  while (datiUtente.xp >= getXpNecessaria(datiUtente.livello)) {
    datiUtente.xp -= getXpNecessaria(datiUtente.livello);
    datiUtente.livello++;
    salito = true;
  }

  if (salito) {
    if (typeof SFX !== 'undefined' && SFX.forgia) SFX.forgia();
    const t = document.getElementById('toast');
    if (t) {
      t.innerText = `🎉 LEVEL UP! Ora sei Livello ${datiUtente.livello}! (+3 ATK, +12 HP)`;
      t.style.border = "2px solid #ffd54f";
      t.style.color = "#ffd54f";
      t.style.opacity = 1;
      setTimeout(() => t.style.opacity = 0, 3000);
    }
  }
  salvaPartita();
}

function salvaPartita() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(datiUtente));
  aggiornaHUDCompleto();
}

function aggiornaHUDCompleto() {
  document.getElementById('nome-zaino').innerText = datiUtente.nome || "Fabbro";
  const moneteEl = document.getElementById('hud-monete');
  if (moneteEl) moneteEl.innerText = datiUtente.monete || 0;

  const lv = datiUtente.livello || 1;
  const xpAtt = datiUtente.xp || 0;
  const xpMax = getXpNecessaria(lv);
  const xpTestoEl = document.getElementById('xp-testo');
  const xpBarraEl = document.getElementById('xp-barra');
  if (xpTestoEl) xpTestoEl.innerText = `LV.${lv} (${xpAtt}/${xpMax} XP)`;
  if (xpBarraEl) xpBarraEl.style.width = Math.min(100, (xpAtt / xpMax) * 100) + '%';

  const armaEl = document.getElementById('hud-arma');
  if (armaEl && datiUtente.armaEquipaggiata) {
    armaEl.innerText = `${datiUtente.armaEquipaggiata.nome} (${datiUtente.armaEquipaggiata.danno} ATK)`;
    armaEl.style.color = datiUtente.armaEquipaggiata.hex;
  }

  const armEl = document.getElementById('hud-armatura');
  if (armEl && datiUtente.armaturaEquipaggiata) {
    armEl.innerText = `${datiUtente.armaturaEquipaggiata.nome} (+${datiUtente.armaturaEquipaggiata.difesa} DEF)`;
    armEl.style.color = datiUtente.armaturaEquipaggiata.hex;
  }

  if (typeof maxHpGiocatore !== 'undefined') {
    const bonusArm = datiUtente.armaturaEquipaggiata ? (datiUtente.armaturaEquipaggiata.hpBonus || 0) : 0;
    const bonusLv = (lv - 1) * 12;
    maxHpGiocatore = 100 + bonusArm + bonusLv;
    if (hpGiocatore > maxHpGiocatore) hpGiocatore = maxHpGiocatore;
    if (typeof aggiornaBarraHP === 'function') aggiornaBarraHP();
  }

  const chiavi = Object.keys(datiUtente.inventario);
  if (chiavi.length === 0) {
    document.getElementById('lista-minerali').innerHTML = "Zaino vuoto. Vai in caverna!";
    return;
  }
  document.getElementById('lista-minerali').innerHTML = chiavi
    .map(k => `<span style="color:${datiUtente.inventario[k].hex};font-weight:bold;">● ${k}</span>: ${datiUtente.inventario[k].qta}`)
    .join('<br>');
}

function aggiornaZainoUI() { aggiornaHUDCompleto(); }

function gestisciBackup() {
  const scelta = prompt("💾 SALVATAGGIO SUCCO STUDIOS:\nScrivi 1 per ESPORTARE il tuo codice\nScrivi 2 per IMPORTARE un codice salvato");
  if (scelta === "1") {
    const codice = btoa(JSON.stringify(datiUtente));
    prompt("Copia questo codice e salvalo dove vuoi:", codice);
  } else if (scelta === "2") {
    const codice = prompt("Incolla qui il tuo codice di salvataggio:");
    if (codice) {
      try {
        datiUtente = JSON.parse(atob(codice));
        salvaPartita();
        location.reload();
      } catch (e) { alert("❌ Codice non valido!"); }
    }
  }
}
