const MINERALI = [
  { nome: "Pietra Focaia", rarita: "Comune", peso: 60, danno: 2, difesa: 1, hpBonus: 5, colore: 0xffffff, hex: "#ffffff" },
  { nome: "Verdite", rarita: "Non Comune", peso: 28, danno: 5, difesa: 2, hpBonus: 15, colore: 0x4caf50, hex: "#4caf50" },
  { nome: "Cielite", rarita: "Raro", peso: 10, danno: 11, difesa: 5, hpBonus: 35, colore: 0x29b6f6, hex: "#29b6f6" },
  { nome: "Voidstone", rarita: "Epico", peso: 2, danno: 22, difesa: 10, hpBonus: 70, colore: 0xab47bc, hex: "#ab47bc" },
  { nome: "Solarium", rarita: "Leggendario", peso: 0.2, danno: 45, difesa: 20, hpBonus: 140, colore: 0xffd54f, hex: "#ffd54f" },
  { nome: "Kitsunite", rarita: "MITICO", peso: 0.05, danno: 95, difesa: 40, hpBonus: 300, colore: 0xff1744, hex: "#ff1744" }
];

const SAVE_KEY = "forgia_25d_save_v1";
let datiUtente = JSON.parse(localStorage.getItem(SAVE_KEY)) || {
  nome: "",
  inventario: {},
  monete: 0,
  livelloPiccone: 0,
  armaEquipaggiata: { nome: "Spada di Legno", danno: 8, qualita: "Base", hex: "#a1887f" },
  armaturaEquipaggiata: { nome: "Tunica Base", difesa: 0, hpBonus: 0, qualita: "Base", hex: "#1976d2" }
};

function salvaPartita() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(datiUtente));
  aggiornaHUDCompleto();
}

function aggiornaHUDCompleto() {
  document.getElementById('nome-zaino').innerText = datiUtente.nome || "Fabbro";
  const moneteEl = document.getElementById('hud-monete');
  if (moneteEl) moneteEl.innerText = datiUtente.monete || 0;

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
    const bonus = datiUtente.armaturaEquipaggiata ? (datiUtente.armaturaEquipaggiata.hpBonus || 0) : 0;
    maxHpGiocatore = 100 + bonus;
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