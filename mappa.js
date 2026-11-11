const listaNPC = [];
const listaPortali = [];
const listaCase = [];

function creaNPC(scene, nome, coloreVestito, x, z, tipo) {
  const gruppo = new THREE.Group();
  gruppo.position.set(x, 0, z);

  const c = document.createElement('canvas'); c.width = 16; c.height = 16;
  const g = c.getContext('2d');
  g.fillStyle = '#ffcc80'; g.fillRect(4, 3, 8, 5);
  g.fillStyle = '#111'; g.fillRect(5, 5, 2, 2); g.fillRect(9, 5, 2, 2);
  g.fillStyle = coloreVestito; g.fillRect(3, 8, 10, 6);
  g.fillStyle = '#3e2723'; g.fillRect(4, 14, 3, 2); g.fillRect(9, 14, 3, 2);

  const tex = new THREE.CanvasTexture(c); tex.magFilter = THREE.NearestFilter;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  sprite.scale.set(1.8, 1.8, 1); sprite.position.y = 0.9;
  gruppo.add(sprite);

  const cn = document.createElement('canvas'); cn.width = 256; cn.height = 64;
  const gn = cn.getContext('2d');
  gn.fillStyle = "rgba(0,0,0,0.65)"; gn.fillRect(14, 14, 228, 36);
  gn.font = "bold 21px sans-serif"; gn.fillStyle = "#81d4fa"; gn.textAlign = "center";
  gn.fillText(nome, 128, 40);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cn) }));
  tag.scale.set(3.2, 0.8, 1); tag.position.y = 2.2;
  gruppo.add(tag);

  scene.add(gruppo);
  listaNPC.push({ nome, x, z, tipo });
}

function creaAlbero(scene, ostacoli, x, z) {
  const tronco = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.45, 2.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x4e342e })
  );
  tronco.position.set(x, 1.1, z);
  scene.add(tronco);

  const chioma = new THREE.Mesh(
    new THREE.DodecahedronGeometry(1.9, 0),
    new THREE.MeshStandardMaterial({ color: 0x2e7d32, flatShading: true })
  );
  chioma.position.set(x, 3.2, z);
  chioma.rotation.y = x + z;
  scene.add(chioma);

  ostacoli.push({ x, z, raggio: 1.4, attiva: true });
}

function creaLanterna(scene, x, z) {
  const palo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.15, 2.6, 6),
    new THREE.MeshStandardMaterial({ color: 0x37474f })
  );
  palo.position.set(x, 1.3, z);
  scene.add(palo);

  const globo = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffd54f })
  );
  globo.position.set(x, 2.7, z);
  scene.add(globo);

  const luce = new THREE.PointLight(0xffb300, 1.1, 11);
  luce.position.set(x, 2.8, z);
  scene.add(luce);
}

function creaTextureMedievale(colIntonaco) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = colIntonaco; g.fillRect(0, 0, 32, 32);
  g.fillStyle = '#546e7a'; g.fillRect(0, 20, 32, 12);
  g.fillStyle = '#37474f'; g.fillRect(2, 22, 12, 4); g.fillRect(16, 26, 14, 4);
  g.fillStyle = '#3e2723';
  g.fillRect(0, 0, 32, 4); g.fillRect(0, 18, 32, 3);
  g.fillRect(0, 0, 4, 32); g.fillRect(28, 0, 4, 32);
  g.fillRect(14, 0, 4, 20);
  const t = new THREE.CanvasTexture(c); t.magFilter = THREE.NearestFilter;
  return t;
}

function creaEdificioEsplorabile(scene, ostacoli, cx, cz, larg, prof, colPav, colIntonaco, latoPorta) {
  listaCase.push({
    minX: cx - larg / 2 + 0.4, maxX: cx + larg / 2 - 0.4,
    minZ: cz - prof / 2 + 0.4, maxZ: cz + prof / 2 - 0.4
  });

  const pav = new THREE.Mesh(
    new THREE.PlaneGeometry(larg, prof),
    new THREE.MeshStandardMaterial({ color: colPav, roughness: 0.9 })
  );
  pav.rotation.x = -Math.PI / 2;
  pav.position.set(cx, 0.08, cz);
  scene.add(pav);

  const matMuro = new THREE.MeshStandardMaterial({ map: creaTextureMedievale(colIntonaco), roughness: 0.9 });
  const matPilastro = new THREE.MeshStandardMaterial({ color: 0x261712, roughness: 1 });
  const hMuro = 2.8;

  const angoli = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1]
  ];
  angoli.forEach(ang => {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.75, hMuro + 0.3, 0.75), matPilastro);
    pil.position.set(cx + ang.at(0) * (larg / 2), (hMuro + 0.3) / 2, cz + ang.at(1) * (prof / 2));
    scene.add(pil);
  });

  for (let x = cx - larg / 2; x <= cx + larg / 2; x += 1.2) {
    if (!(latoPorta === "nord" && Math.abs(x - cx) < 1.3)) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, hMuro, 0.6), matMuro);
      m.position.set(x, hMuro / 2, cz - prof / 2); scene.add(m);
      ostacoli.push({ x, z: cz - prof / 2, raggio: 0.7, attiva: true });
    }
    if (!(latoPorta === "sud" && Math.abs(x - cx) < 1.3)) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.2, hMuro, 0.6), matMuro);
      m.position.set(x, hMuro / 2, cz + prof / 2); scene.add(m);
      ostacoli.push({ x, z: cz + prof / 2, raggio: 0.7, attiva: true });
    }
  }

  for (let z = cz - prof / 2; z <= cz + prof / 2; z += 1.2) {
    if (!(latoPorta === "ovest" && Math.abs(z - cz) < 1.3)) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, hMuro, 1.2), matMuro);
      m.position.set(cx - larg / 2, hMuro / 2, z); scene.add(m);
      ostacoli.push({ x: cx - larg / 2, z, raggio: 0.7, attiva: true });
    }
    if (!(latoPorta === "est" && Math.abs(z - cz) < 1.3)) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, hMuro, 1.2), matMuro);
      m.position.set(cx + larg / 2, hMuro / 2, z); scene.add(m);
      ostacoli.push({ x: cx + larg / 2, z, raggio: 0.7, attiva: true });
    }
  }
}

function creaPortale(scene, x, z, destX, destZ, colore, etichetta) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.7, 24),
    new THREE.MeshBasicMaterial({ color: colore, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.16, z);
  scene.add(ring);

  const luce = new THREE.PointLight(colore, 2.0, 12);
  luce.position.set(x, 1.5, z);
  scene.add(luce);

  const cn = document.createElement('canvas'); cn.width = 256; cn.height = 64;
  const gn = cn.getContext('2d');
  gn.fillStyle = "rgba(0,0,0,0.75)"; gn.fillRect(10, 14, 236, 36);
  gn.font = "bold 20px sans-serif"; gn.fillStyle = "#fff"; gn.textAlign = "center";
  gn.fillText(etichetta, 128, 40);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cn) }));
  tag.scale.set(3.6, 0.9, 1); tag.position.set(x, 2.3, z);
  scene.add(tag);

  listaPortali.push({ x, z, destX, destZ, mesh: ring });
}
function aggiungiMassoMuro(scene, ostacoli, x, z, raggio = 2.8, altezza = 6) {
  const geo = new THREE.DodecahedronGeometry(raggio, 1);
  const mat = new THREE.MeshStandardMaterial({ color: 0x3e2723, flatShading: true, roughness: 0.95 });
  const masso = new THREE.Mesh(geo, mat);
  masso.position.set(x, altezza * 0.4, z);
  masso.scale.set(1.15, altezza / (raggio * 1.4), 0.95);
  masso.rotation.set(0.15, x * 1.7 + z * 0.9, -0.1);
  scene.add(masso);
  ostacoli.push({ x, z, raggio: raggio * 0.85, attiva: true });
}

function creaZonaPavimento(scene, x, z, raggio, col) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(raggio, raggio, 0.05, 16),
    new THREE.MeshStandardMaterial({ color: col, roughness: 1 })
  );
  mesh.position.set(x, 0.035, z);
  scene.add(mesh);
}

function costruisciMondo(scene, ostacoli) {
  const fondoUnicoGrotta = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 65),
    new THREE.MeshStandardMaterial({ color: 0x161413, roughness: 1 })
  );
  fondoUnicoGrotta.rotation.x = -Math.PI / 2;
  fondoUnicoGrotta.position.set(0, 0.025, -44);
  scene.add(fondoUnicoGrotta);

  const cMat = document.createElement('canvas'); cMat.width = 32; cMat.height = 32;
  const gMat = cMat.getContext('2d');
  gMat.fillStyle = '#455a64'; gMat.fillRect(0, 0, 32, 32);
  gMat.fillStyle = '#546e7a'; gMat.fillRect(1, 1, 14, 14); gMat.fillRect(17, 17, 14, 14);
  gMat.fillStyle = '#37474f'; gMat.fillRect(17, 1, 14, 14); gMat.fillRect(1, 17, 14, 14);
  const tMat = new THREE.CanvasTexture(cMat);
  tMat.wrapS = THREE.RepeatWrapping; tMat.wrapT = THREE.RepeatWrapping;
  tMat.repeat.set(12, 12); tMat.magFilter = THREE.NearestFilter;

  const sentiero = new THREE.Mesh(new THREE.PlaneGeometry(5, 22), new THREE.MeshStandardMaterial({ map: tMat, roughness: 0.9 }));
  sentiero.rotation.x = -Math.PI / 2; sentiero.position.set(0, 0.02, -2);
  scene.add(sentiero);

  const piazza = new THREE.Mesh(new THREE.CylinderGeometry(11.5, 11.5, 0.12, 32), new THREE.MeshStandardMaterial({ map: tMat, roughness: 0.9 }));
  piazza.position.set(0, 0.06, 6);
  scene.add(piazza);

  // Falò Curativo al centro della Piazza
  const ceppi = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.3, 8), new THREE.MeshStandardMaterial({ color: 0x3e2723 }));
  ceppi.position.set(0, 0.2, 6); scene.add(ceppi);
  const fiamma = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.3, 6), new THREE.MeshBasicMaterial({ color: 0xff6d00 }));
  fiamma.position.set(0, 0.85, 6); scene.add(fiamma);
  const luceFalo = new THREE.PointLight(0xff6d00, 1.8, 12);
  luceFalo.position.set(0, 1.8, 6); scene.add(luceFalo);
  ostacoli.push({ x: 0, z: 6, raggio: 1.0, attiva: true });

  // 4 Edifici Medievali Esplorabili
  creaEdificioEsplorabile(scene, ostacoli, -13, 3.5, 7.2, 7.2, 0x3e2723, "#bcaaa4", "est");
  creaNPC(scene, "⚒️ Ignis (Forgia)", "#e53935", -14.5, 3.5, "forgia");

  creaEdificioEsplorabile(scene, ostacoli, 13.5, 2.5, 7.2, 6.0, 0x2e4c36, "#d7ccc8", "ovest");
  creaNPC(scene, "💰 Marco (Vendi)", "#ffd54f", 15, 2.5, "vendi");

  creaEdificioEsplorabile(scene, ostacoli, 13, 11, 6.0, 7.2, 0x263849, "#cfd8dc", "ovest");
  creaNPC(scene, "⛏️ Sora (Picconi)", "#29b6f6", 14.2, 11, "picconi");

  creaEdificioEsplorabile(scene, ostacoli, -11, 13.5, 7.2, 6.0, 0x311b92, "#d1c4e9", "nord");
  creaNPC(scene, "📜 Saggio Elowen", "#ce93d8", -11, 14.8, "quest");

  // Lanterne
  creaLanterna(scene, -3.5, -6); creaLanterna(scene, 3.5, -6);
  creaLanterna(scene, -4.5, 0.5); creaLanterna(scene, 4.5, 0.5);
  creaLanterna(scene, -7.5, 7.5); creaLanterna(scene, 7.5, 7.5);
  creaLanterna(scene, 0, 15.5);

  // Bosco denso stile Pokémon (4 file fitte che riempiono lo sfondo)
  for (let riga = 0; riga < 4; riga++) {
    const raggioBase = 20.5 + riga * 3.1;
    const passoAngolo = 0.13 - riga * 0.015;
    for (let ang = 0; ang < Math.PI * 2; ang += passoAngolo) {
      const raggioCerchio = raggioBase + Math.sin(ang * 6 + riga) * 0.9;
      const ax = Math.cos(ang) * raggioCerchio;
      const az = 6 + Math.sin(ang) * raggioCerchio;
      if (!(az < 0 && Math.abs(ax) < 4.8)) {
        creaAlbero(scene, ostacoli, ax, az);
      }
    }
  }

  // Grotta Asimmetrica
  creaZonaPavimento(scene, -2, -19, 9.5, 0x1c1917);
  creaZonaPavimento(scene, -16, -24, 9, 0x161d24);
  creaZonaPavimento(scene, -27, -33, 11.5, 0x131b24);
  creaZonaPavimento(scene, 9, -28, 7.5, 0x241816);
  creaZonaPavimento(scene, 23, -36, 12, 0x261513);
  creaZonaPavimento(scene, -6, -42, 8, 0x1a1715);
  creaZonaPavimento(scene, -2, -54, 13.5, 0x141211);

  // Pozzanghere di Magma nella Grotta
  window.pozzanghereMagma = [];
  function creaMagma(mx, mz, raggio) {
    const pool = new THREE.Mesh(
      new THREE.CylinderGeometry(raggio, raggio * 1.1, 0.08, 16),
      new THREE.MeshBasicMaterial({ color: 0xff3d00 })
    );
    pool.position.set(mx, 0.06, mz);
    scene.add(pool);

    const bordo = new THREE.Mesh(
      new THREE.RingGeometry(raggio * 0.95, raggio * 1.25, 16),
      new THREE.MeshBasicMaterial({ color: 0xff9100, side: THREE.DoubleSide })
    );
    bordo.rotation.x = -Math.PI / 2;
    bordo.position.set(mx, 0.07, mz);
    scene.add(bordo);

    const luce = new THREE.PointLight(0xff3d00, 1.4, 9);
    luce.position.set(mx, 1.2, mz);
    scene.add(luce);

    window.pozzanghereMagma.push({ x: mx, z: mz, raggio });
  }

  creaMagma(15, -26, 1.8);
  creaMagma(26, -33, 2.5);
  creaMagma(19, -41, 2.0);
  creaMagma(-18, -32, 1.6);
  creaMagma(-6, -47, 1.9);

  const arco = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2, 1), new THREE.MeshStandardMaterial({ color: 0x3e2723, flatShading: true }));
  arco.position.set(0, 4.6, -12); arco.scale.set(1.5, 0.7, 1);
  scene.add(arco);

  const muri = [
    [-4.5, -12, 2.7], [-8.5, -12.5, 3.1], [-12.5, -14.5, 2.9],
    [4.4, -12.2, 3.0], [7.5, -15, 3.2], [7.8, -19.5, 3.1],
    [-16.5, -16, 3.0], [-21.5, -18.5, 3.2], [-27.5, -21.5, 3.1], [-33.5, -26.5, 3.3],
    [-37.5, -32.5, 3.1], [-35.5, -39.5, 3.2], [-29.5, -43.5, 3.0], [-22.5, -42.5, 2.9], [-16.5, -38.5, 2.8],
    [11.5, -22, 2.9], [16.5, -24, 3.1], [22.5, -25.5, 3.0], [28.5, -28.5, 3.3], [33.5, -34, 3.1],
    [33.5, -40.5, 3.2], [28.5, -46.5, 3.0], [21.5, -47.5, 3.1], [15.5, -44.5, 2.9], [11.5, -39.5, 2.7],
    [-13.5, -44.5, 3.0], [-15.5, -50.5, 3.2], [-14.5, -57.5, 3.1], [-9.5, -63.5, 3.3],
    [-2.5, -65.5, 3.2], [4.5, -64, 3.0], [10, -58.5, 3.1], [11.5, -51.5, 2.9]
  ];
  muri.forEach(p => aggiungiMassoMuro(scene, ostacoli, p.at(0), p.at(1), p.at(2), 5.8 + (Math.abs(p.at(0)) % 2)));

  aggiungiMassoMuro(scene, ostacoli, -24.5, -31.5, 2.2, 5.5);
  aggiungiMassoMuro(scene, ostacoli, 22.5, -35.5, 2.1, 5.4);

  // Portali & Sala Boss
  creaPortale(scene, -2, -57, 120, 8, 0xd500f9, "🌀 SALA DEL BOSS");

  const arenaBoss = new THREE.Mesh(
    new THREE.CylinderGeometry(16, 16, 0.2, 32),
    new THREE.MeshStandardMaterial({ color: 0x210b0b, roughness: 0.9 })
  );
  arenaBoss.position.set(120, 0.1, 0);
  scene.add(arenaBoss);

  for (let a = 0; a < Math.PI * 2; a += 0.22) {
    aggiungiMassoMuro(scene, ostacoli, 120 + Math.cos(a) * 16.5, Math.sin(a) * 16.5, 2.6, 6.5);
  }
  const luceBoss = new THREE.PointLight(0xff1744, 2.2, 28);
  luceBoss.position.set(120, 6, -4);
  scene.add(luceBoss);

  creaPortale(scene, 120, 11, 0, 5, 0x00e5ff, "🌀 TORNA AL VILLAGGIO");
}