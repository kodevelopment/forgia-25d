let arsenaleAperto = false;
let tabArsenale = "armi";

const arsDiv = document.createElement('div');
arsDiv.id = "arsenale-modal";
arsDiv.style.cssText = "display:none;position:fixed;inset:0;background:rgba(8,10,15,0.9);z-index:160;align-items:center;justify-content:center;color:#fff;";
arsDiv.innerHTML = `
  <div style="background:#161d29;border:2px solid #81d4fa;padding:22px;border-radius:16px;width:520px;max-width:94vw;box-shadow:0 0 30px rgba(129,212,250,0.25);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
      <h2 style="color:#81d4fa;font-size:19px;">🎒 ARSENALE DI SUCCO STUDIOS</h2>
      <div style="display:flex;gap:8px;">
        <button id="ars-tab-armi" style="padding:6px 14px;border-radius:8px;border:2px solid #ff7043;background:#ff7043;color:#fff;font-weight:bold;cursor:pointer;">⚔️ ARMI</button>
        <button id="ars-tab-armature" style="padding:6px 14px;border-radius:8px;border:2px solid #29b6f6;background:transparent;color:#29b6f6;font-weight:bold;cursor:pointer;">🛡️ ARMATURE</button>
      </div>
    </div>
    <div id="arsenale-lista" style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;margin-bottom:14px;"></div>
    <div style="text-align:center;">
      <button id="btn-chiudi-ars" style="padding:9px 20px;background:#37474f;color:#fff;border:none;border-radius:8px;cursor:pointer;font-weight:bold;">Chiudi (ESC / I)</button>
    </div>
  </div>
`;
document.body.appendChild(arsDiv);

document.getElementById('ars-tab-armi').onclick = () => {
  tabArsenale = "armi";
  document.getElementById('ars-tab-armi').style.background = "#ff7043"; document.getElementById('ars-tab-armi').style.color = "#fff";
  document.getElementById('ars-tab-armature').style.background = "transparent"; document.getElementById('ars-tab-armature').style.color = "#29b6f6";
  aggiornaUIArsenale();
};

document.getElementById('ars-tab-armature').onclick = () => {
  tabArsenale = "armature";
  document.getElementById('ars-tab-armature').style.background = "#29b6f6"; document.getElementById('ars-tab-armature').style.color = "#fff";
  document.getElementById('ars-tab-armi').style.background = "transparent"; document.getElementById('ars-tab-armi').style.color = "#ff7043";
  aggiornaUIArsenale();
};

function apriArsenale() {
  if (!datiUtente.arsenaleArmi) datiUtente.arsenaleArmi = [datiUtente.armaEquipaggiata];
  if (!datiUtente.arsenaleArmature) datiUtente.arsenaleArmature = [datiUtente.armaturaEquipaggiata];
  arsenaleAperto = true;
  arsDiv.style.display = "flex";
  aggiornaUIArsenale();
}

function chiudiArsenale() {
  arsenaleAperto = false;
  arsDiv.style.display = "none";
}

function aggiornaUIArsenale() {
  const lista = document.getElementById('arsenale-lista');
  lista.innerHTML = '';

  const items = tabArsenale === "armi" ? datiUtente.arsenaleArmi : datiUtente.arsenaleArmature;
  const equip = tabArsenale === "armi" ? datiUtente.armaEquipaggiata : datiUtente.armaturaEquipaggiata;

  items.forEach((item, idx) => {
    const isEquip = (item.nome === equip.nome && (item.danno === equip.danno && item.difesa === equip.difesa));
    const stat = tabArsenale === "armi" ? `${item.danno} ATK` : `+${item.difesa} DEF | +${item.hpBonus} HP`;

    const riga = document.createElement('div');
    riga.style.cssText = `display:flex;justify-content:space-between;align-items:center;padding:10px 14px;background:#0f141d;border:1px solid ${isEquip ? '#4caf50' : '#2c384d'};border-radius:10px;`;
    riga.innerHTML = `
      <div>
        <div style="color:${item.hex};font-weight:bold;font-size:14px;">${item.nome} <span style="font-size:11px;color:#94a3b8;">[${item.qualita}]</span></div>
        <div style="font-size:12px;color:#cbd5e1;">${stat}</div>
      </div>
      <div style="display:flex;gap:6px;">
        ${isEquip
          ? `<span style="padding:6px 12px;background:#2e7d32;border-radius:6px;font-size:12px;font-weight:bold;">✔ Equipaggiato</span>`
          : `<button class="btn-eq" style="padding:6px 12px;background:#1976d2;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:bold;">Equipaggia</button>
             <button class="btn-vendi" style="padding:6px 10px;background:#b71c1c;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:12px;">Vendi (+25💰)</button>`}
      </div>
    `;

    if (!isEquip) {
      riga.querySelector('.btn-eq').onclick = () => {
        if (tabArsenale === "armi") {
          datiUtente.armaEquipaggiata = item;
          if (typeof creaOAggiornaSpadaInMano === 'function') creaOAggiornaSpadaInMano(playerGroup);
        } else {
          datiUtente.armaturaEquipaggiata = item;
          if (typeof aggiornaAuraArmatura === 'function') aggiornaAuraArmatura(playerGroup);
        }
        salvaPartita();
        aggiornaUIArsenale();
      };

      riga.querySelector('.btn-vendi').onclick = () => {
        items.splice(idx, 1);
        datiUtente.monete = (datiUtente.monete || 0) + 25;
        salvaPartita();
        aggiornaUIArsenale();
      };
    }

    lista.appendChild(riga);
  });
}

document.getElementById('btn-chiudi-ars').onclick = chiudiArsenale;

window.addEventListener('keydown', e => {
  if (e.key.toLowerCase() === 'i' && overlay.style.display === "none" && !forgiaAperta && !dialogoAperto) {
    if (arsenaleAperto) chiudiArsenale();
    else apriArsenale();
  } else if (e.key === 'Escape' && arsenaleAperto) {
    chiudiArsenale();
  }
});