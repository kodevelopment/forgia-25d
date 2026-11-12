function creaMatriceBase() {
  const m = Array.from({ length: 16 }, () => Array(16).fill(null));
  const disegna = (x, y, w, h, col) => {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) m[y + dy][x + dx] = col;
    }
  };
  disegna(4, 1, 8, 3, "#d32f2f");
  disegna(4, 4, 8, 5, "#ffcc80");
  disegna(5, 6, 2, 2, "#111111");
  disegna(9, 6, 2, 2, "#111111");
  disegna(3, 9, 10, 5, "#1976d2");
  disegna(4, 14, 3, 2, "#4e342e");
  disegna(9, 14, 3, 2, "#4e342e");
  return m;
}

if (!datiUtente.pixelEroe) {
  datiUtente.pixelEroe = creaMatriceBase();
}

function generaCanvasPersonaggio(matrice, armatura) {
  const c = document.createElement('canvas');
  c.width = 80;
  c.height = 80;
  const g = c.getContext('2d');
  g.imageSmoothingEnabled = false;

  const hasArmatura = armatura && armatura.hpBonus > 0;
  const colBase = hasArmatura ? (armatura.hex || "#90a4ae") : "#90a4ae";
  const isElmo = hasArmatura && (armatura.nome || "").toLowerCase().includes("elmo");

  // 0. MANTELLO DIETRO LE SPALLE (se indossi una corazza)
  if (hasArmatura && !isElmo) {
    g.fillStyle = "#111827";
    g.fillRect(10, 40, 60, 36);
    g.fillStyle = colBase;
    g.globalAlpha = 0.55;
    g.fillRect(12, 42, 56, 32);
    g.globalAlpha = 1.0;
    // Bordo dorato in fondo al mantello
    g.fillStyle = "#ffd54f";
    g.fillRect(12, 72, 56, 3);
  }

  // 1. Disegna il personaggio base 16x16 scalato x5
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (matrice[y][x]) {
        g.fillStyle = matrice[y][x];
        g.fillRect(x * 5, y * 5, 5, 5);
      }
    }
  }

  // 2. Disegna l'armatura HD 80x80 sopra al personaggio
  if (hasArmatura) {
    const pezzoHD = (x, y, w, h, fill, bordo = "#090d16") => {
      g.fillStyle = bordo;
      g.fillRect(x - 1, y - 1, w + 2, h + 2);
      g.fillStyle = fill;
      g.fillRect(x, y, w, h);
    };

    // ELMO HD CON CORNA / CRESTA REALI
    if (isElmo || armatura.difesa >= 12) {
      // Corna laterali epiche per armature rare/epiche
      if (armatura.difesa >= 20) {
        pezzoHD(7, 4, 8, 12, "#ffd54f");
        pezzoHD(5, 1, 5, 6, "#ffffff");
        pezzoHD(65, 4, 8, 12, "#ffd54f");
        pezzoHD(70, 1, 5, 6, "#ffffff");
      }
      // Cresta centrale
      pezzoHD(33, 1, 14, 5, "#ffd54f");
      pezzoHD(37, 0, 6, 3, "#ffffff");
      // Calotta elmo
      pezzoHD(17, 6, 46, 15, colBase);
      pezzoHD(15, 20, 9, 17, colBase);
      pezzoHD(56, 20, 9, 17, colBase);
      // Ombre, riflessi e gemma frontale
      g.fillStyle = "rgba(0,0,0,0.5)";
      g.fillRect(20, 18, 40, 4);
      g.fillStyle = "rgba(255,255,255,0.5)";
      g.fillRect(21, 8, 16, 4);
      pezzoHD(36, 10, 8, 8, "#00e5ff", "#000");
    }

    // CORAZZA COMPLETA HD
    if (!isElmo) {
      // Spalline scolpite a doppio strato
      pezzoHD(3, 37, 15, 19, colBase);
      pezzoHD(5, 34, 11, 5, "#ffd54f");
      g.fillStyle = "rgba(255,255,255,0.45)";
      g.fillRect(6, 39, 5, 11);

      pezzoHD(62, 37, 15, 19, colBase);
      pezzoHD(64, 34, 11, 5, "#ffd54f");
      g.fillStyle = "rgba(255,255,255,0.45)";
      g.fillRect(65, 39, 5, 11);

      // Pettorale centrale con bordi dorati
      pezzoHD(16, 42, 48, 25, colBase);
      g.fillStyle = "#ffd54f";
      g.fillRect(16, 42, 48, 2);

      // Piastre e riflessi
      g.fillStyle = "rgba(255,255,255,0.4)";
      g.fillRect(19, 45, 16, 8);
      g.fillRect(45, 45, 16, 8);
      g.fillStyle = "rgba(0,0,0,0.35)";
      g.fillRect(18, 56, 44, 7);

      // Nucleo runico luminoso al centro del petto
      pezzoHD(34, 46, 12, 12, "#ffd54f", "#000");
      g.fillStyle = "#00e5ff";
      g.fillRect(36, 48, 8, 8);
      g.fillStyle = "#ffffff";
      g.fillRect(38, 50, 4, 4);

      // Cintura e stivali
      pezzoHD(15, 64, 50, 5, "#3e2723");
      pezzoHD(34, 63, 12, 7, "#ffd54f");

      pezzoHD(19, 70, 16, 9, colBase);
      pezzoHD(45, 70, 16, 9, colBase);
      g.fillStyle = "#ffd54f";
      g.fillRect(20, 70, 14, 2);
      g.fillRect(46, 70, 14, 2);
    }
  }
  return c;
}

function applicaGraficaPersonaggio(playerSprite) {
  if (!playerSprite) return;
  const canvas = generaCanvasPersonaggio(datiUtente.pixelEroe, datiUtente.armaturaEquipaggiata);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  playerSprite.material.map = tex;
  playerSprite.material.needsUpdate = true;
}

function inizializzaEditorPixel() {
  const loginBox = document.getElementById('login-box');
  if (!loginBox || document.getElementById('editor-pixel-box')) return;

  const box = document.createElement('div');
  box.id = "editor-pixel-box";
  box.style.cssText = "margin:10px 0 14px 0;background:#111822;padding:10px;border-radius:10px;border:1px solid #334155;";
  box.innerHTML = `
    <p style="font-size:12px;color:#81d4fa;font-weight:bold;margin-bottom:6px;">🎨 CLICCA SUI PIXEL PER COLORARTI</p>
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;font-size:12px;">
      <span>Colore:</span>
      <input type="color" id="pennello-colore" value="#ff1744" style="cursor:pointer;">
      <button type="button" id="btn-reset-pixel" style="padding:4px 8px;background:#334155;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:11px;">Reset</button>
    </div>
    <div id="griglia-pixel" style="display:grid;grid-template-columns:repeat(16, 13px);gap:1px;justify-content:center;background:#090d14;padding:6px;border-radius:8px;"></div>
  `;

  loginBox.insertBefore(box, document.getElementById('btn-gioca'));

  const griglia = document.getElementById('griglia-pixel');
  let disegnando = false;
  window.addEventListener('mouseup', () => disegnando = false);

  function renderGriglia() {
    griglia.innerHTML = '';
    for (let y = 0; y < 16; y++) {
      for (let x = 0; x < 16; x++) {
        const cella = document.createElement('div');
        const col = datiUtente.pixelEroe[y][x];
        cella.style.cssText = `width:13px;height:13px;background:${col || '#1e293b'};cursor:pointer;border-radius:1px;`;
        
        const colora = () => {
          const nuovoCol = document.getElementById('pennello-colore').value;
          datiUtente.pixelEroe[y][x] = nuovoCol;
          cella.style.background = nuovoCol;
          if (typeof playerSprite !== 'undefined') applicaGraficaPersonaggio(playerSprite);
        };

        cella.onmousedown = () => { disegnando = true; colora(); };
        cella.onmouseenter = () => { if (disegnando) colora(); };
        griglia.appendChild(cella);
      }
    }
  }

  document.getElementById('btn-reset-pixel').onclick = () => {
    datiUtente.pixelEroe = creaMatriceBase();
    renderGriglia();
    if (typeof playerSprite !== 'undefined') applicaGraficaPersonaggio(playerSprite);
  };

  renderGriglia();
}

inizializzaEditorPixel();
