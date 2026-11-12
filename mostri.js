let strumentoAttivo = "piccone";
let spadaSprite = null;
const listaMostri = [];

let hpGiocatore = 100;
let maxHpGiocatore = 100;

const hpBox = document.createElement('div');
hpBox.style.cssText = "position:fixed;top:15px;left:15px;background:linear-gradient(180deg,#2b1e16,#1a120d);border:2px solid #d4af37;padding:10px 14px;border-radius:10px;color:#f5ebd6;z-index:50;min-width:215px;box-shadow:0 4px 15px rgba(0,0,0,0.6);font-family:Georgia,serif;";
hpBox.innerHTML = `
  <div style="display:flex;justify-content:space-between;font-size:12px;font-weight:bold;margin-bottom:6px;">
    <span style="color:#ff8a80;">❤️ SALUTE</span><span id="hp-testo">100 / 100</span>
  </div>
  <div style="width:100%;height:12px;background:#0d0907;border-radius:6px;overflow:hidden;border:1px solid #8d6e63;">
    <div id="hp-barra" style="width:100%;height:100%;background:linear-gradient(90deg,#8d2323,#e53935);transition:width 0.2s;"></div>
  </div>
`;
document.body.appendChild(hpBox);

function aggiornaBarraHP() {
  const perc = Math.max(0, Math.min(100, (hpGiocatore / maxHpGiocatore) * 100));
  document.getElementById('hp-barra').style.width = perc + '%';
  document.getElementById('hp-testo').innerText = `${Math.ceil(hpGiocatore)} / ${maxHpGiocatore}`;
}

function creaOAggiornaSpadaInMano(playerGroup) {
  if (spadaSprite) playerGroup.remove(spadaSprite);

  const arma = datiUtente.armaEquipaggiata || { hex: "#a1887f" };
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  const g = c.getContext('2d');

  g.fillStyle = '#5d4037'; g.fillRect(2, 12, 2, 2); g.fillRect(4, 10, 2, 2);
  g.fillStyle = '#ffd54f'; g.fillRect(4, 8, 5, 2); g.fillRect(6, 7, 2, 5);
  g.fillStyle = arma.hex || '#eceff1';
  g.fillRect(7, 7, 2, 2); g.fillRect(9, 5, 2, 2); g.fillRect(11, 3, 2, 2); g.fillRect(13, 1, 2, 2);
  g.fillStyle = '#ffffff'; g.fillRect(10, 4, 1, 1); g.fillRect(12, 2, 1, 1);

  const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter;
  spadaSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  spadaSprite.scale.set(1.35, 1.35, 1);
  spadaSprite.position.set(0.7, 0.9, 0.1);
  spadaSprite.visible = (strumentoAttivo === "spada");
  playerGroup.add(spadaSprite);
}

function cambiaStrumento(nuovo, playerGroup) {
  strumentoAttivo = nuovo;
  if (picconeSprite) picconeSprite.visible = (nuovo === "piccone");
  if (!spadaSprite) creaOAggiornaSpadaInMano(playerGroup);
  if (spadaSprite) spadaSprite.visible = (nuovo === "spada");

  const t = document.getElementById('toast');
  t.innerText = nuovo === "piccone" ? "⛏️ Equipaggiato: PICCONE" : `⚔️ Equipaggiato: ${datiUtente.armaEquipaggiata.nome}`;
  t.style.border = "2px solid #d4af37"; t.style.color = "#ffd54f"; t.style.opacity = 1;
  setTimeout(() => t.style.opacity = 0, 1100);
}

function generaSpriteMostro(tipo, col) {
  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  const g = c.getContext('2d');

  if (tipo === "yeti") {
    // Yeti Antico: pelliccia bianca/azzurra, corna polari e occhi cyan luminosi
    g.fillStyle = '#00e5ff'; g.fillRect(2, 0, 2, 3); g.fillRect(12, 0, 2, 3);
    g.fillStyle = '#eceff1'; g.fillRect(3, 2, 10, 12);
    g.fillStyle = col; g.fillRect(1, 5, 3, 8); g.fillRect(12, 5, 3, 8);
    g.fillStyle = '#546e7a'; g.fillRect(5, 4, 6, 3);
    g.fillStyle = '#18ffff'; g.fillRect(5, 5, 2, 1); g.fillRect(9, 5, 2, 1);
    g.fillStyle = '#b0bec5'; g.fillRect(4, 14, 3, 2); g.fillRect(9, 14, 3, 2);
  } else if (tipo === "golem") {
    g.fillStyle = '#37474f'; g.fillRect(3, 3, 10, 11);
    g.fillStyle = '#546e7a'; g.fillRect(4, 2, 8, 2);
    g.fillStyle = col;
    g.fillRect(1, 4, 3, 6); g.fillRect(12, 4, 3, 6);
    g.fillRect(6, 7, 4, 4);
    g.fillStyle = '#ffeb3b'; g.fillRect(5, 4, 2, 1); g.fillRect(9, 4, 2, 1);
  } else if (tipo === "pipistrello") {
    g.fillStyle = col;
    g.fillRect(1, 5, 4, 4); g.fillRect(11, 5, 4, 4);
    g.fillRect(5, 4, 6, 7);
    g.fillRect(5, 2, 2, 2); g.fillRect(9, 2, 2, 2);
    g.fillStyle = '#ff1744'; g.fillRect(6, 6, 1, 1); g.fillRect(9, 6, 1, 1);
  } else if (tipo === "spettro") {
    g.fillStyle = '#311b92'; g.fillRect(3, 2, 10, 10);
    g.fillStyle = col; g.fillRect(4, 3, 8, 8);
    g.fillRect(3, 12, 2, 3); g.fillRect(7, 12, 2, 4); g.fillRect(11, 12, 2, 3);
    g.fillStyle = '#00e5ff'; g.fillRect(5, 6, 2, 2); g.fillRect(9, 6, 2, 2);
  } else if (tipo === "boss") {
    g.fillStyle = '#ffd54f'; g.fillRect(3, 0, 10, 2); g.fillRect(3, 0, 2, 3); g.fillRect(7, 0, 2, 3); g.fillRect(11, 0, 2, 3);
    g.fillStyle = '#880e4f'; g.fillRect(1, 4, 14, 11);
    g.fillStyle = col; g.fillRect(3, 3, 10, 11);
    g.fillStyle = '#ffd54f'; g.fillRect(3, 10, 10, 2);
    g.fillStyle = '#ffffff'; g.fillRect(5, 5, 2, 2); g.fillRect(9, 5, 2, 2);
  } else {
    g.fillStyle = col; g.fillRect(3, 6, 10, 8); g.fillRect(5, 4, 6, 2); g.fillRect(2, 9, 12, 5);
    g.fillStyle = '#ffffff'; g.fillRect(4, 6, 2, 1);
    g.fillStyle = '#111111'; g.fillRect(5, 8, 2, 2); g.fillRect(9, 8, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter;
  return tex;
}
let cooldownSpada = 0;

function aggiornaBarraMostro(m) {
  const c = m.hpCanvas;
  const g = c.getContext('2d');
  g.clearRect(0, 0, 160, 36);
  g.fillStyle = "rgba(0,0,0,0.8)";
  g.fillRect(10, 14, 140, 12);
  const perc = Math.max(0, m.hp / m.maxHp);
  g.fillStyle = m.overlevel ? "#00e5ff" : (perc > 0.5 ? "#4caf50" : perc > 0.25 ? "#ff9800" : "#f44336");
  g.fillRect(12, 16, 136 * perc, 8);
  g.font = "bold 11px sans-serif";
  g.fillStyle = m.overlevel ? "#84ffff" : "#fff";
  g.textAlign = "center";
  g.fillText(m.nome, 80, 11);
  m.hpTex.needsUpdate = true;
}

function spawnaMostri(scene) {
  const zoneMostri = [
    // Caverna Base (Danni ribilanciati)
    { x: -16, z: -22, hp: 55, atk: 18, xp: 20, tipo: "pipistrello", col: "#78909c", nome: "Pipistrello", monete: 20, scala: 1.5 },
    { x: -24, z: -26, hp: 85, atk: 26, xp: 30, tipo: "slime", col: "#29b6f6", nome: "Slime Glaciale", monete: 30, scala: 1.8 },
    { x: -28, z: -33, hp: 160, atk: 38, xp: 55, tipo: "golem", col: "#00e5ff", nome: "Golem Cristallo", monete: 55, scala: 2.2 },
    { x: 15, z: -26, hp: 65, atk: 22, xp: 25, tipo: "pipistrello", col: "#d84315", nome: "Pipistrello Fuoco", monete: 25, scala: 1.5 },
    { x: 22, z: -31, hp: 125, atk: 34, xp: 45, tipo: "slime", col: "#ff7043", nome: "Slime Magmatico", monete: 45, scala: 1.8 },
    { x: 26, z: -38, hp: 230, atk: 52, xp: 85, tipo: "golem", col: "#ff1744", nome: "Golem Cremisi", monete: 85, scala: 2.3 },
    { x: -2, z: -47, hp: 360, atk: 75, xp: 140, tipo: "spettro", col: "#ab47bc", nome: "Spettro Abisso", monete: 130, scala: 2.1 },
    { x: 120, z: -5, hp: 1100, atk: 125, xp: 400, tipo: "boss", col: "#ff6f00", nome: "BOSS Re Grotta", monete: 350, scala: 2.8 },

    // CAVERNA GLACIALE ENORME - MOSTRI OVERLEVEL & BOSS YETI
    { x: -152, z: -26, hp: 680, atk: 160, xp: 220, tipo: "slime", col: "#00e5ff", nome: "[LV.18] Gelatina Artica", monete: 280, scala: 2.1, overlevel: true },
    { x: -172, z: -34, hp: 890, atk: 210, xp: 290, tipo: "pipistrello", col: "#80d8ff", nome: "[LV.22] Viverna Brina", monete: 360, scala: 2.0, overlevel: true },
    { x: -145, z: -52, hp: 1450, atk: 280, xp: 450, tipo: "golem", col: "#00b0ff", nome: "[LV.28] Colosso Glaciale", monete: 550, scala: 2.6, overlevel: true },
    { x: -178, z: -68, hp: 2100, atk: 360, xp: 650, tipo: "spettro", col: "#18ffff", nome: "[LV.35] Banshee Polare", monete: 820, scala: 2.4, overlevel: true },
    { x: -158, z: -88, hp: 3200, atk: 470, xp: 950, tipo: "golem", col: "#64ffda", nome: "[LV.44] Titano Permafrost", monete: 1250, scala: 2.9, overlevel: true },
    { x: -160, z: -116, hp: 8500, atk: 680, xp: 3200, tipo: "yeti", col: "#84ffff", nome: "❄️ BOSS YETI ANTICO [LV.60]", monete: 4500, scala: 3.5, overlevel: true }
  ];

  zoneMostri.forEach(m => {
    const gruppo = new THREE.Group();
    gruppo.position.set(m.x, 0, m.z);

    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: generaSpriteMostro(m.tipo, m.col) }));
    sprite.scale.set(m.scala, m.scala, 1);
    sprite.position.y = m.scala * 0.5;
    gruppo.add(sprite);

    const hpCanvas = document.createElement('canvas'); hpCanvas.width = 160; hpCanvas.height = 36;
    const hpTex = new THREE.CanvasTexture(hpCanvas);
    const hpSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: hpTex }));
    hpSprite.scale.set(2.9, 0.65, 1);
    hpSprite.position.y = m.scala + 0.5;
    gruppo.add(hpSprite);

    scene.add(gruppo);
    const objMostro = {
      gruppo, sprite, hpCanvas, hpTex, spawnX: m.x, spawnZ: m.z,
      hp: m.hp, maxHp: m.hp, atk: m.atk, xp: m.xp, nome: m.nome, monete: m.monete,
      overlevel: !!m.overlevel, vivo: true, cooldown: 0
    };
    aggiornaBarraMostro(objMostro);
    listaMostri.push(objMostro);
  });
}

function attaccaConSpada(playerGroup) {
  const ora = Date.now();
  if (ora < cooldownSpada) return; // Timing tra un colpo e l'altro (450ms)
  cooldownSpada = ora + 450;

  if (typeof SFX !== 'undefined') SFX.spada();
  if (spadaSprite) {
    spadaSprite.material.rotation = -1.35;
    spadaSprite.position.x = 1.05;
    setTimeout(() => { spadaSprite.material.rotation = 0; spadaSprite.position.x = 0.7; }, 180);
  }

  const bonusLvlAtk = ((datiUtente.livello || 1) - 1) * 3;
  const atk = (datiUtente.armaEquipaggiata ? datiUtente.armaEquipaggiata.danno : 8) + bonusLvlAtk;

  listaMostri.forEach(m => {
    if (!m.vivo) return;
    const d = Math.hypot(playerGroup.position.x - m.gruppo.position.x, playerGroup.position.z - m.gruppo.position.z);
    if (d < 3.6) {
      m.hp -= atk;
      aggiornaBarraMostro(m);
      m.sprite.material.color.setHex(0xff5252);
      setTimeout(() => { if (m.vivo) m.sprite.material.color.setHex(0xffffff); }, 120);

      const t = document.getElementById('toast');
      if (m.hp <= 0) {
        m.vivo = false;
        m.gruppo.visible = false;
        datiUtente.monete = (datiUtente.monete || 0) + m.monete;
        if (typeof aggiungiXP === 'function') aggiungiXP(m.xp || 25);
        salvaPartita();
        t.innerText = `💀 Sconfitto ${m.nome}! +${m.monete} Monete | +${m.xp} XP`;
        t.style.border = "2px solid #ffd54f"; t.style.color = "#ffd54f"; t.style.opacity = 1;
        setTimeout(() => t.style.opacity = 0, 2400);

        setTimeout(() => {
          m.hp = m.maxHp; m.vivo = true; m.gruppo.visible = true;
          m.gruppo.position.set(m.spawnX, 0, m.spawnZ);
          aggiornaBarraMostro(m);
        }, 9000);
      }
    }
  });
}

function aggiornaMostri(playerGroup) {
  if (playerGroup.position.z > -10 && Math.abs(playerGroup.position.x) < 60 && hpGiocatore < maxHpGiocatore) {
    hpGiocatore = Math.min(maxHpGiocatore, hpGiocatore + 0.4);
    aggiornaBarraHP();
  }

  listaMostri.forEach(m => {
    if (!m.vivo) return;
    if (m.cooldown > 0) m.cooldown--;

    const dx = playerGroup.position.x - m.gruppo.position.x;
    const dz = playerGroup.position.z - m.gruppo.position.z;
    const dist = Math.hypot(dx, dz);

    if (dist < 11.5 && dist > 1.75) {
      const velMostro = m.overlevel ? 0.072 : 0.062;
      m.gruppo.position.x += (dx / dist) * velMostro;
      m.gruppo.position.z += (dz / dist) * velMostro;
    }

    if (dist <= 1.9 && m.cooldown === 0) {
      m.cooldown = 52;
      const difesa = datiUtente.armaturaEquipaggiata ? datiUtente.armaturaEquipaggiata.difesa : 0;
      const dannoBase = m.atk - difesa * 0.55;
      const dannoMinimo = Math.round(m.atk * 0.25);
      const dannoSubito = Math.max(dannoMinimo, Math.round(dannoBase));
      hpGiocatore -= dannoSubito;
      aggiornaBarraHP();

      playerSprite.material.color.setHex(0xff1744);
      setTimeout(() => playerSprite.material.color.setHex(0xffffff), 150);

      if (hpGiocatore <= 0) {
        hpGiocatore = maxHpGiocatore;
        aggiornaBarraHP();
        playerGroup.position.set(0, 0, 9);
        const t = document.getElementById('toast');
        t.innerText = "💀 Sei stato sconfitto! Sei tornato al Villaggio.";
        t.style.border = "2px solid #ff1744"; t.style.color = "#ff1744"; t.style.opacity = 1;
        setTimeout(() => t.style.opacity = 0, 2500);
      }
    }
  });
}
