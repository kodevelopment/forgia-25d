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
  gn.fillStyle = "rgba(0,0,0,0.75)"; gn.fillRect(10, 14, 236, 36);
  gn.font = "bold 20px sans-serif"; gn.fillStyle = "#81d4fa"; gn.textAlign = "center";
  gn.fillText(nome, 128, 40);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cn) }));
  tag.scale.set(3.3, 0.82, 1); tag.position.y = 2.25;
  gruppo.add(tag);

  scene.add(gruppo);
  listaNPC.push({ nome, x, z, tipo });
}

function creaBoscoOttimizzato(scene, ostacoli, posizioniAlberi) {
  const count = posizioniAlberi.length;
  if (count === 0) return;

  const geoTronco = new THREE.CylinderGeometry(0.35, 0.48, 2.3, 6);
  const matTronco = new THREE.MeshLambertMaterial({ color: 0x4e342e });
  const meshTronchi = new THREE.InstancedMesh(geoTronco, matTronco, count);

  const geoChioma = new THREE.DodecahedronGeometry(1.95, 0);
  const matChioma = new THREE.MeshLambertMaterial({ color: 0x2e7d32, flatShading: true });
  const meshChiome = new THREE.InstancedMesh(geoChioma, matChioma, count);

  const dummy = new THREE.Object3D();
  posizioniAlberi.forEach((pos, i) => {
    dummy.position.set(pos.x, 1.15, pos.z);
    dummy.rotation.set(0, 0, 0);
    dummy.updateMatrix();
    meshTronchi.setMatrixAt(i, dummy.matrix);

    dummy.position.set(pos.x, 3.2, pos.z);
    dummy.rotation.set(0, pos.x + pos.z, 0);
    dummy.updateMatrix();
    meshChiome.setMatrixAt(i, dummy.matrix);

    ostacoli.push({ x: pos.x, z: pos.z, raggio: 1.4, attiva: true });
  });

  meshTronchi.instanceMatrix.needsUpdate = true;
  meshChiome.instanceMatrix.needsUpdate = true;
  scene.add(meshTronchi, meshChiome);
}

function creaLanterna(scene, x, z) {
  const palo = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12, 0.16, 2.7, 5),
    new THREE.MeshLambertMaterial({ color: 0x263238 })
  );
  palo.position.set(x, 1.35, z);

  const globo = new THREE.Mesh(
    new THREE.SphereGeometry(0.28, 6, 6),
    new THREE.MeshBasicMaterial({ color: 0xffd54f })
  );
  globo.position.set(x, 2.75, z);
  scene.add(palo, globo);
}

function creaStradina(scene, tMat, x1, z1, x2, z2, larghezza = 3.4) {
  const dx = x2 - x1;
  const dz = z2 - z1;
  const dist = Math.hypot(dx, dz);
  const strada = new THREE.Mesh(
    new THREE.PlaneGeometry(larghezza, dist),
    new THREE.MeshLambertMaterial({ map: tMat })
  );
  strada.rotation.x = -Math.PI / 2;
  strada.rotation.z = -Math.atan2(dx, dz);
  strada.position.set((x1 + x2) / 2, 0.035, (z1 + z2) / 2);
  scene.add(strada);
}

function creaTextureTegole(colBase) {
  const c = document.createElement('canvas'); c.width = 32; c.height = 32;
  const g = c.getContext('2d');
  g.fillStyle = colBase; g.fillRect(0, 0, 32, 32);
  g.fillStyle = "rgba(0,0,0,0.28)";
  for (let y = 0; y < 32; y += 8) {
    g.fillRect(0, y + 6, 32, 2);
    for (let x = (y % 16 === 0 ? 0 : 8); x < 32; x += 16) g.fillRect(x, y, 2, 8);
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 3); t.magFilter = THREE.NearestFilter;
  return t;
}

function creaTetto3D(scene, cx, cz, larg, prof, hMuro, colTetto) {
  const gruppoTetto = new THREE.Group();
  const raggioTetto = Math.max(larg, prof) * 0.78;
  const tetto = new THREE.Mesh(
    new THREE.ConeGeometry(raggioTetto, 2.2, 4),
    new THREE.MeshLambertMaterial({ map: creaTextureTegole(colTetto) })
  );
  tetto.rotation.y = Math.PI / 4;
  tetto.scale.set(larg / Math.max(larg, prof), 1, prof / Math.max(larg, prof));
  tetto.position.set(cx, hMuro + 1.1, cz);
  gruppoTetto.add(tetto);

  const camino = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 1.3, 0.6),
    new THREE.MeshLambertMaterial({ color: 0x455a64 })
  );
  camino.position.set(cx + larg * 0.25, hMuro + 1.45, cz - prof * 0.2);
  gruppoTetto.add(camino);

  scene.add(gruppoTetto);
  return gruppoTetto;
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

function creaEdificioEsplorabile(scene, ostacoli, cx, cz, larg, prof, colPav, colIntonaco, latoPorta, colTetto = "#8d2323") {
  const hMuro = 2.8;
  const tetto3D = creaTetto3D(scene, cx, cz, larg, prof, hMuro, colTetto);

  listaCase.push({
    minX: cx - larg / 2 + 0.3, maxX: cx + larg / 2 - 0.3,
    minZ: cz - prof / 2 + 0.3, maxZ: cz + prof / 2 - 0.3,
    tetto: tetto3D
  });

  const pav = new THREE.Mesh(
    new THREE.PlaneGeometry(larg, prof),
    new THREE.MeshLambertMaterial({ color: colPav })
  );
  pav.rotation.x = -Math.PI / 2;
  pav.position.set(cx, 0.08, cz);
  scene.add(pav);

  const matMuro = new THREE.MeshLambertMaterial({ map: creaTextureMedievale(colIntonaco) });
  const matPilastro = new THREE.MeshLambertMaterial({ color: 0x261712 });

  const angoli = [
    { dx: -1, dz: -1 }, { dx: 1, dz: -1 },
    { dx: -1, dz: 1 },  { dx: 1, dz: 1 }
  ];
  angoli.forEach(ang => {
    const pil = new THREE.Mesh(new THREE.BoxGeometry(0.75, hMuro + 0.25, 0.75), matPilastro);
    pil.position.set(cx + ang.dx * (larg / 2), (hMuro + 0.25) / 2, cz + ang.dz * (prof / 2));
    scene.add(pil);
  });

  const costruisciLatoX = (zPos, conPorta) => {
    if (!conPorta) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(larg, hMuro, 0.6), matMuro);
      m.position.set(cx, hMuro / 2, zPos); scene.add(m);
    } else {
      const wPezzo = (larg - 2.4) / 2;
      const mSx = new THREE.Mesh(new THREE.BoxGeometry(wPezzo, hMuro, 0.6), matMuro);
      mSx.position.set(cx - larg / 2 + wPezzo / 2, hMuro / 2, zPos);
      const mDx = mSx.clone();
      mDx.position.x = cx + larg / 2 - wPezzo / 2;
      scene.add(mSx, mDx);
    }
    for (let x = cx - larg / 2; x <= cx + larg / 2; x += 1.2) {
      if (!(conPorta && Math.abs(x - cx) < 1.3)) ostacoli.push({ x, z: zPos, raggio: 0.7, attiva: true });
    }
  };

  const costruisciLatoZ = (xPos, conPorta) => {
    if (!conPorta) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, hMuro, prof), matMuro);
      m.position.set(xPos, hMuro / 2, cz); scene.add(m);
    } else {
      const pPezzo = (prof - 2.4) / 2;
      const mN = new THREE.Mesh(new THREE.BoxGeometry(0.6, hMuro, pPezzo), matMuro);
      mN.position.set(xPos, hMuro / 2, cz - prof / 2 + pPezzo / 2);
      const mS = mN.clone();
      mS.position.z = cz + prof / 2 - pPezzo / 2;
      scene.add(mN, mS);
    }
    for (let z = cz - prof / 2; z <= cz + prof / 2; z += 1.2) {
      if (!(conPorta && Math.abs(z - cz) < 1.3)) ostacoli.push({ x: xPos, z, raggio: 0.7, attiva: true });
    }
  };

  costruisciLatoX(cz - prof / 2, latoPorta === "nord");
  costruisciLatoX(cz + prof / 2, latoPorta === "sud");
  costruisciLatoZ(cx - larg / 2, latoPorta === "ovest");
  costruisciLatoZ(cx + larg / 2, latoPorta === "est");
}

function creaCasaDecorativa(scene, ostacoli, cx, cz, larg, prof, colIntonaco, colTetto, latoPorta = "sud") {
  const hMuro = 2.7;
  const corpo = new THREE.Mesh(
    new THREE.BoxGeometry(larg, hMuro, prof),
    new THREE.MeshLambertMaterial({ map: creaTextureMedievale(colIntonaco) })
  );
  corpo.position.set(cx, hMuro / 2, cz);
  scene.add(corpo);

  creaTetto3D(scene, cx, cz, larg, prof, hMuro, colTetto);

  const matPorta = new THREE.MeshLambertMaterial({ color: 0x3e2723 });
  const matFinestra = new THREE.MeshBasicMaterial({ color: 0xffecb3 });

  const porta = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.15), matPorta);
  const fin1 = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.75, 0.15), matFinestra);
  const fin2 = fin1.clone();

  if (latoPorta === "sud" || latoPorta === "nord") {
    const zOff = latoPorta === "sud" ? prof / 2 + 0.05 : -prof / 2 - 0.05;
    porta.position.set(cx, 0.9, cz + zOff);
    fin1.position.set(cx - larg * 0.28, 1.6, cz + zOff);
    fin2.position.set(cx + larg * 0.28, 1.6, cz + zOff);
  } else {
    const xOff = latoPorta === "est" ? larg / 2 + 0.05 : -larg / 2 - 0.05;
    porta.rotation.y = Math.PI / 2; fin1.rotation.y = Math.PI / 2; fin2.rotation.y = Math.PI / 2;
    porta.position.set(cx + xOff, 0.9, cz);
    fin1.position.set(cx + xOff, 1.6, cz - prof * 0.28);
    fin2.position.set(cx + xOff, 1.6, cz + prof * 0.28);
  }
  scene.add(porta, fin1, fin2);
  ostacoli.push({ x: cx, z: cz, raggio: Math.max(larg, prof) * 0.55, attiva: true });
}

function creaPozzoVillaggio(scene, ostacoli, x, z) {
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.9, 10), new THREE.MeshLambertMaterial({ color: 0x546e7a }));
  base.position.set(x, 0.45, z);
  const acqua = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.85, 10), new THREE.MeshBasicMaterial({ color: 0x0288d1 }));
  acqua.position.set(x, 0.45, z);
  const tettuccio = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.0, 4), new THREE.MeshLambertMaterial({ map: creaTextureTegole("#8d2323") }));
  tettuccio.rotation.y = Math.PI / 4; tettuccio.position.set(x, 2.3, z);
  scene.add(base, acqua, tettuccio);
  ostacoli.push({ x, z, raggio: 1.3, attiva: true });
}

function creaDecorazioneEsterna(scene, x, z, tipo) {
  if (tipo === "incudine") {
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.5, 0.5), new THREE.MeshLambertMaterial({ color: 0x263238 }));
    base.position.set(x, 0.25, z);
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.25, 0.6), new THREE.MeshLambertMaterial({ color: 0x455a64 }));
    top.position.set(x, 0.6, z);
    scene.add(base, top);
  } else if (tipo === "casse") {
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshLambertMaterial({ color: 0x6d4c41 }));
    c1.position.set(x, 0.45, z);
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.7, 0.7), new THREE.MeshLambertMaterial({ color: 0x8d6e63 }));
    c2.position.set(x + 0.6, 0.35, z + 0.4);
    scene.add(c1, c2);
  } else if (tipo === "cristalli") {
    const cr = new THREE.Mesh(new THREE.OctahedronGeometry(0.6, 0), new THREE.MeshBasicMaterial({ color: 0x29b6f6 }));
    cr.position.set(x, 0.6, z);
    scene.add(cr);
  }
}
function creaPortale(scene, x, z, destX, destZ, colore, etichetta) {
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(0.9, 1.7, 16),
    new THREE.MeshBasicMaterial({ color: colore, side: THREE.DoubleSide, transparent: true, opacity: 0.9 })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.set(x, 0.16, z);
  scene.add(ring);

  const cn = document.createElement('canvas'); cn.width = 256; cn.height = 64;
  const gn = cn.getContext('2d');
  gn.fillStyle = "rgba(0,0,0,0.75)"; gn.fillRect(10, 14, 236, 36);
  gn.font = "bold 19px sans-serif"; gn.fillStyle = "#fff"; gn.textAlign = "center";
  gn.fillText(etichetta, 128, 40);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cn) }));
  tag.scale.set(3.6, 0.9, 1); tag.position.set(x, 2.3, z);
  scene.add(tag);

  listaPortali.push({ x, z, destX, destZ, mesh: ring });
}

function creaZonaPavimento(scene, x, z, raggio, col) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(raggio, raggio, 0.05, 16),
    new THREE.MeshLambertMaterial({ color: col })
  );
  mesh.position.set(x, 0.035, z);
  scene.add(mesh);
}

function costruisciMondo(scene, ostacoli) {
  const fondoUnicoGrotta = new THREE.Mesh(
    new THREE.PlaneGeometry(90, 65),
    new THREE.MeshLambertMaterial({ color: 0x161413 })
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
  tMat.repeat.set(14, 14); tMat.magFilter = THREE.NearestFilter;

  const sentiero = new THREE.Mesh(new THREE.PlaneGeometry(5, 22), new THREE.MeshLambertMaterial({ map: tMat }));
  sentiero.rotation.x = -Math.PI / 2; sentiero.position.set(0, 0.02, -2);
  scene.add(sentiero);

  const piazza = new THREE.Mesh(new THREE.CylinderGeometry(12.5, 12.5, 0.12, 24), new THREE.MeshLambertMaterial({ map: tMat }));
  piazza.position.set(0, 0.06, 6);
  scene.add(piazza);

  creaStradina(scene, tMat, 0, 6, 24, 6, 3.4);
  creaStradina(scene, tMat, 0, 6, -24, 8, 3.4);
  creaStradina(scene, tMat, 0, 6, 0, 26, 3.4);

  const ceppi = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 0.3, 8), new THREE.MeshLambertMaterial({ color: 0x3e2723 }));
  ceppi.position.set(0, 0.2, 6);
  const fiamma = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.3, 6), new THREE.MeshBasicMaterial({ color: 0xff6d00 }));
  fiamma.position.set(0, 0.85, 6);
  scene.add(ceppi, fiamma);
  ostacoli.push({ x: 0, z: 6, raggio: 1.0, attiva: true });

  creaPozzoVillaggio(scene, ostacoli, 5.5, 13.5);

  creaEdificioEsplorabile(scene, ostacoli, -13.5, 1.5, 7.2, 7.2, 0x3e2723, "#bcaaa4", "est", "#8d2323");
  creaNPC(scene, "⚒️ Ignis (Forgia)", "#e53935", -15, 1.5, "forgia");
  creaDecorazioneEsterna(scene, -9.2, -1.2, "incudine");

  creaEdificioEsplorabile(scene, ostacoli, 14, 0.5, 7.2, 6.0, 0x2e4c36, "#d7ccc8", "ovest", "#2e7d32");
  creaNPC(scene, "💰 Marco (Vendi)", "#ffd54f", 15.5, 0.5, "vendi");
  creaDecorazioneEsterna(scene, 9.8, -1.8, "casse");

  creaEdificioEsplorabile(scene, ostacoli, 14, 13.5, 6.0, 7.2, 0x263849, "#cfd8dc", "ovest", "#0277bd");
  creaNPC(scene, "⛏️ Sora (Picconi)", "#29b6f6", 15.2, 13.5, "picconi");
  creaDecorazioneEsterna(scene, 10.2, 11.2, "cristalli");

  creaEdificioEsplorabile(scene, ostacoli, -11, 16.5, 7.2, 6.0, 0x311b92, "#d1c4e9", "nord", "#6a1b9a");
  creaNPC(scene, "📜 Saggio Elowen", "#ce93d8", -11, 17.8, "quest");

  creaEdificioEsplorabile(scene, ostacoli, 25.5, 6.5, 6.8, 6.8, 0x4e1a1a, "#ffccbc", "ovest", "#b71c1c");
  creaNPC(scene, "⚔️ Capitano Valen", "#ff7043", 26.8, 6.5, "quest_caccia");

  creaEdificioEsplorabile(scene, ostacoli, -25.5, 9.5, 6.8, 6.8, 0x1a3a4a, "#b2ebf2", "est", "#00838f");
  creaNPC(scene, "💎 Mastro Borin", "#4dd0e1", -26.8, 9.5, "quest_miniera");

  creaCasaDecorativa(scene, ostacoli, -6.5, 23.5, 5.2, 4.6, "#d7ccc8", "#5d4037", "est");
  creaCasaDecorativa(scene, ostacoli, 6.5, 24.0, 5.4, 4.8, "#cfd8dc", "#455a64", "ovest");
  creaCasaDecorativa(scene, ostacoli, 19.5, -6.0, 5.0, 4.5, "#ffe0b2", "#6d4c41", "sud");
  creaCasaDecorativa(scene, ostacoli, -19.5, -5.5, 5.2, 4.5, "#d7ccc8", "#8d2323", "sud");
  creaCasaDecorativa(scene, ostacoli, 20.5, 19.5, 5.0, 5.0, "#e1bee7", "#4a148c", "ovest");

  creaLanterna(scene, -3.5, -6); creaLanterna(scene, 3.5, -6);
  creaLanterna(scene, -4.5, 0.5); creaLanterna(scene, 4.5, 0.5);
  creaLanterna(scene, -7.5, 7.5); creaLanterna(scene, 7.5, 7.5);
  creaLanterna(scene, 18, 4.2); creaLanterna(scene, -18, 6.2);
  creaLanterna(scene, -2.5, 18); creaLanterna(scene, 2.5, 24);

  const posizioniAlberi = [];
  for (let riga = 0; riga < 3; riga++) {
    const raggioBase = 36.5 + riga * 3.4;
    const passoAngolo = 0.095;
    for (let ang = 0; ang < Math.PI * 2; ang += passoAngolo) {
      const raggioCerchio = raggioBase + Math.sin(ang * 6 + riga) * 0.8;
      const ax = Math.cos(ang) * raggioCerchio;
      const az = 6 + Math.sin(ang) * raggioCerchio;
      const ingressoNord = (az < 0 && Math.abs(ax) < 6.5);
      const zonaGrotta = (az < -11 && Math.abs(ax) < 42);
      if (!ingressoNord && !zonaGrotta) posizioniAlberi.push({ x: ax, z: az });
    }
  }
  creaBoscoOttimizzato(scene, ostacoli, posizioniAlberi);

  creaZonaPavimento(scene, -2, -19, 9.5, 0x1c1917);
  creaZonaPavimento(scene, -16, -24, 9, 0x161d24);
  creaZonaPavimento(scene, -27, -33, 11.5, 0x131b24);
  creaZonaPavimento(scene, 9, -28, 7.5, 0x241816);
  creaZonaPavimento(scene, 23, -36, 12, 0x261513);
  creaZonaPavimento(scene, -6, -42, 8, 0x1a1715);
  creaZonaPavimento(scene, -2, -54, 13.5, 0x141211);

  window.pozzanghereMagma = [];
  function creaMagma(mx, mz, raggio) {
    const pool = new THREE.Mesh(
      new THREE.CylinderGeometry(raggio, raggio * 1.1, 0.08, 12),
      new THREE.MeshBasicMaterial({ color: 0xff3d00 })
    );
    pool.position.set(mx, 0.06, mz);
    scene.add(pool);
    window.pozzanghereMagma.push({ x: mx, z: mz, raggio });
  }
  creaMagma(15, -26, 1.8); creaMagma(26, -33, 2.5); creaMagma(19, -41, 2.0);
  creaMagma(-18, -32, 1.6); creaMagma(-6, -47, 1.9);

  const arco = new THREE.Mesh(new THREE.DodecahedronGeometry(3.2, 1), new THREE.MeshLambertMaterial({ color: 0x3e2723, flatShading: true }));
  arco.position.set(0, 4.6, -12); arco.scale.set(1.5, 0.7, 1);
  scene.add(arco);
  const muri = [
    { x: -4.5, z: -12, r: 2.7 }, { x: -8.5, z: -12.5, r: 3.1 }, { x: -12.5, z: -14.5, r: 2.9 },
    { x: 4.4, z: -12.2, r: 3.0 }, { x: 7.5, z: -15, r: 3.2 }, { x: 7.8, z: -19.5, r: 3.1 },
    { x: -16.5, z: -16, r: 3.0 }, { x: -21.5, z: -18.5, r: 3.2 }, { x: -27.5, z: -21.5, r: 3.1 }, { x: -33.5, z: -26.5, r: 3.3 },
    { x: -37.5, z: -32.5, r: 3.1 }, { x: -35.5, z: -39.5, r: 3.2 }, { x: -29.5, z: -43.5, r: 3.0 }, { x: -22.5, z: -42.5, r: 2.9 }, { x: -16.5, z: -38.5, r: 2.8 },
    { x: 11.5, z: -22, r: 2.9 }, { x: 16.5, z: -24, r: 3.1 }, { x: 22.5, z: -25.5, r: 3.0 }, { x: 28.5, z: -28.5, r: 3.3 }, { x: 33.5, z: -34, r: 3.1 },
    { x: 33.5, z: -40.5, r: 3.2 }, { x: 28.5, z: -46.5, r: 3.0 }, { x: 21.5, z: -47.5, r: 3.1 }, { x: 15.5, z: -44.5, r: 2.9 }, { x: 11.5, z: -39.5, r: 2.7 },
    { x: -13.5, z: -44.5, r: 3.0 }, { x: -15.5, z: -50.5, r: 3.2 }, { x: -14.5, z: -57.5, r: 3.1 }, { x: -9.5, z: -63.5, r: 3.3 },
    { x: -2.5, z: -65.5, r: 3.2 }, { x: 4.5, z: -64, r: 3.0 }, { x: 10, z: -58.5, r: 3.1 }, { x: 11.5, z: -51.5, r: 2.9 },
    { x: -24.5, z: -31.5, r: 2.2 }
  ];

  const geoMasso = new THREE.DodecahedronGeometry(1, 1);
  const matMasso = new THREE.MeshLambertMaterial({ color: 0x3e2723, flatShading: true });
  const meshMuri = new THREE.InstancedMesh(geoMasso, matMasso, muri.length);
  const dummyMuro = new THREE.Object3D();

  muri.forEach((p, idx) => {
    const h = 5.8 + (Math.abs(p.x) % 2);
    dummyMuro.position.set(p.x, h * 0.4, p.z);
    dummyMuro.scale.set(p.r * 1.15, h / 1.4, p.r * 0.95);
    dummyMuro.rotation.set(0.15, p.x * 1.7 + p.z * 0.9, -0.1);
    dummyMuro.updateMatrix();
    meshMuri.setMatrixAt(idx, dummyMuro.matrix);
    ostacoli.push({ x: p.x, z: p.z, raggio: p.r * 0.85, attiva: true });
  });
  meshMuri.instanceMatrix.needsUpdate = true;
  scene.add(meshMuri);

  // Chiusura confini Villaggio / Bosco
  for (let x = -42; x <= 42; x += 2.2) {
    if (Math.abs(x) > 4.2) ostacoli.push({ x: x, z: -11.5, raggio: 1.6, attiva: true });
  }
  for (let ang = 0; ang < Math.PI * 2; ang += 0.045) {
    const bx = Math.cos(ang) * 35.8;
    const bz = 6 + Math.sin(ang) * 35.8;
    if (!(bz < 0 && Math.abs(bx) < 5.5)) ostacoli.push({ x: bx, z: bz, raggio: 1.6, attiva: true });
  }

  // Arena BOSS Re Grotta (x: 120, z: -5)
  creaZonaPavimento(scene, 120, -5, 14, 0x1a0f0d);
  for (let ang = 0; ang < Math.PI * 2; ang += 0.22) {
    const mx = 120 + Math.cos(ang) * 14.5;
    const mz = -5 + Math.sin(ang) * 14.5;
    const massoArena = new THREE.Mesh(
      new THREE.DodecahedronGeometry(2.5, 1),
      new THREE.MeshLambertMaterial({ color: 0x3e2723, flatShading: true })
    );
    massoArena.position.set(mx, 2.2, mz);
    scene.add(massoArena);
    ostacoli.push({ x: mx, z: mz, raggio: 2.1, attiva: true });
  }

  // --- ENORME CAVERNA GLACIALE SCAVATA (x: -160, z da -10 a -130) ---
  const pianoGhiaccio = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 135),
    new THREE.MeshLambertMaterial({ color: 0x06121c })
  );
  pianoGhiaccio.rotation.x = -Math.PI / 2;
  pianoGhiaccio.position.set(-160, 0.02, -70);
  scene.add(pianoGhiaccio);

  creaZonaPavimento(scene, -160, -22, 14, 0x0e2c40);
  creaZonaPavimento(scene, -160, -38, 7.5, 0x0b2436);
  creaZonaPavimento(scene, -160, -54, 15, 0x123852);
  creaZonaPavimento(scene, -142, -72, 13, 0x0d293d);
  creaZonaPavimento(scene, -178, -74, 13, 0x0d293d);
  creaZonaPavimento(scene, -160, -92, 8.5, 0x0b2436);
  creaZonaPavimento(scene, -160, -114, 17, 0x081e2e);

  const creaLagoGhiaccio = (lx, lz, r) => {
    const lago = new THREE.Mesh(
      new THREE.CylinderGeometry(r, r * 1.05, 0.07, 16),
      new THREE.MeshBasicMaterial({ color: 0x00b0ff, transparent: true, opacity: 0.55 })
    );
    lago.position.set(lx, 0.05, lz);
    scene.add(lago);
  };
  creaLagoGhiaccio(-142, -72, 4.2);
  creaLagoGhiaccio(-178, -74, 4.2);
  creaLagoGhiaccio(-160, -114, 6.5);

  const fuocoPolare = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.5, 6), new THREE.MeshBasicMaterial({ color: 0x00e5ff }));
  fuocoPolare.position.set(-160, 0.75, -54);
  scene.add(fuocoPolare);
  ostacoli.push({ x: -160, z: -54, raggio: 1.1, attiva: true });

  creaNPC(scene, "❄️ Esploratore Kael", "#00e5ff", -155.5, -54, "glaciale_kael");
  creaNPC(scene, "👑 Dama Freya", "#84ffff", -164.5, -54, "glaciale_freya");

  const muriGhiaccio = [];
  for (let z = -8; z >= -130; z -= 4.2) {
    muriGhiaccio.push({ x: -194, z: z, r: 3.6, h: 6.5 });
    muriGhiaccio.push({ x: -126, z: z, r: 3.6, h: 6.5 });
  }
  for (let x = -194; x <= -126; x += 4.2) {
    muriGhiaccio.push({ x: x, z: -8, r: 3.6, h: 6.5 });
    muriGhiaccio.push({ x: x, z: -130, r: 3.6, h: 6.5 });
  }

  const paretiInterne = [
    { x: -188, z: -38, r: 4.5, h: 6.2 }, { x: -180, z: -38, r: 4.5, h: 6.2 }, { x: -172, z: -38, r: 4.2, h: 6.0 },
    { x: -148, z: -38, r: 4.2, h: 6.0 }, { x: -140, z: -38, r: 4.5, h: 6.2 }, { x: -132, z: -38, r: 4.5, h: 6.2 },
    { x: -160, z: -69, r: 4.2, h: 6.5 }, { x: -160, z: -76, r: 4.5, h: 6.8 }, { x: -160, z: -83, r: 4.2, h: 6.5 },
    { x: -188, z: -96, r: 4.5, h: 6.4 }, { x: -180, z: -96, r: 4.5, h: 6.4 }, { x: -171, z: -96, r: 4.0, h: 6.2 },
    { x: -149, z: -96, r: 4.0, h: 6.2 }, { x: -140, z: -96, r: 4.5, h: 6.4 }, { x: -132, z: -96, r: 4.5, h: 6.4 },
    { x: -168, z: -20, r: 2.2, h: 5.5 }, { x: -152, z: -24, r: 2.2, h: 5.5 },
    { x: -149, z: -64, r: 2.1, h: 5.2 }, { x: -171, z: -66, r: 2.1, h: 5.2 },
    { x: -148, z: -108, r: 2.4, h: 6.0 }, { x: -172, z: -108, r: 2.4, h: 6.0 }
  ];
  paretiInterne.forEach(p => muriGhiaccio.push(p));

  const geoGhiaccio = new THREE.DodecahedronGeometry(1, 1);
  const matGhiaccio = new THREE.MeshLambertMaterial({ color: 0x1b4f72, flatShading: true });
  const meshMuriGhiaccio = new THREE.InstancedMesh(geoGhiaccio, matGhiaccio, muriGhiaccio.length);
  const dummyIce = new THREE.Object3D();

  muriGhiaccio.forEach((p, idx) => {
    const alt = p.h || 6.0;
    dummyIce.position.set(p.x, alt * 0.4, p.z);
    dummyIce.scale.set(p.r, alt / 1.4, p.r);
    dummyIce.rotation.set(0.1, p.x + p.z, -0.1);
    dummyIce.updateMatrix();
    meshMuriGhiaccio.setMatrixAt(idx, dummyIce.matrix);
    ostacoli.push({ x: p.x, z: p.z, raggio: p.r * 0.85, attiva: true });
  });
  meshMuriGhiaccio.instanceMatrix.needsUpdate = true;
  scene.add(meshMuriGhiaccio);

  const posCristalli = [
    { x: -166, z: -36 }, { x: -154, z: -36 }, { x: -160, z: -66 },
    { x: -167, z: -94 }, { x: -153, z: -94 }, { x: -148, z: -106 }, { x: -172, z: -106 }
  ];
  const geoCr = new THREE.ConeGeometry(0.6, 2.2, 5);
  const matCr = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
  const meshCr = new THREE.InstancedMesh(geoCr, matCr, posCristalli.length);
  posCristalli.forEach((c, i) => {
    dummyIce.position.set(c.x, 1.1, c.z);
    dummyIce.scale.set(1, 1, 1);
    dummyIce.rotation.set(0, i, 0.2);
    dummyIce.updateMatrix();
    meshCr.setMatrixAt(i, dummyIce.matrix);
  });
  meshCr.instanceMatrix.needsUpdate = true;
  scene.add(meshCr);

  // PORTALI DEL MONDO
  creaPortale(scene, -2, -60, 120, 3, 0xff1744, "🔥 PORTALE RE GROTTA");
  creaPortale(scene, 120, 5, 0, 9, 0x29b6f6, "🏠 TORNA AL VILLAGGIO");

  creaPortale(scene, -8.5, 10.5, -160, -14, 0x00e5ff, "❄️ ABISSO GLACIALE");
  creaPortale(scene, -160, -11, -6.5, 10.5, 0x80d8ff, "🏠 TORNA AL VILLAGGIO");
  creaPortale(scene, -160, -49, -6.5, 10.5, 0x64ffda, "🌀 RITORNO RAPIDO");
}
