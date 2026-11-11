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
  c.width = 16; c.height = 16;
  const g = c.getContext('2d');

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      if (matrice[y][x]) {
        g.fillStyle = matrice[y][x];
        g.fillRect(x, y, 1, 1);
      }
    }
  }

  if (armatura && armatura.hpBonus > 0) {
    g.fillStyle = "#ffd54f";
    g.fillRect(6, 0, 4, 1);
    g.fillStyle = armatura.hex;
    g.fillRect(3, 1, 10, 4);
    g.fillRect(3, 5, 2, 3);
    g.fillRect(11, 5, 2, 3);
    g.fillStyle = "rgba(0,0,0,0.45)";
    g.fillRect(5, 4, 6, 1);

    g.fillStyle = armatura.hex;
    g.fillRect(1, 8, 3, 4);
    g.fillRect(12, 8, 3, 4);
    g.fillRect(3, 8, 10, 6);

    g.fillStyle = "rgba(255,255,255,0.35)";
    g.fillRect(4, 9, 3, 2);
    g.fillStyle = "rgba(0,0,0,0.3)";
    g.fillRect(4, 11, 8, 2);

    g.fillStyle = "#ffd54f";
    g.fillRect(3, 13, 10, 1);
    g.fillStyle = "#ffffff";
    g.fillRect(7, 13, 2, 1);

    g.fillStyle = armatura.hex;
    g.fillRect(4, 14, 3, 2);
    g.fillRect(9, 14, 3, 2);
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