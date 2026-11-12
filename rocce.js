const TIPI_ROCCE = [
  { nome: "Ciottolo Friabile", hp: 2, sx: 0.85, sy: 0.65, sz: 0.85, col: 0x78909c, cristallo: 0xffffff, forma: "sfera", bonusDrop: 1 },
  { nome: "Masso Comune", hp: 3, sx: 1.15, sy: 0.95, sz: 1.15, col: 0x607d8b, cristallo: 0x4caf50, forma: "dodeca", bonusDrop: 1 },
  { nome: "Guglia di Quarzo", hp: 4, sx: 0.85, sy: 1.85, sz: 0.85, col: 0x546e7a, cristallo: 0x29b6f6, forma: "cono", bonusDrop: 1 },
  { nome: "Lastra Muschiosa", hp: 3, sx: 1.55, sy: 0.60, sz: 1.40, col: 0x33691e, cristallo: 0x81c784, forma: "lastra", bonusDrop: 1 },
  { nome: "Vena di Ferro", hp: 5, sx: 1.25, sy: 1.25, sz: 1.25, col: 0x4e342e, cristallo: 0xffab91, forma: "cubo", bonusDrop: 2 },
  { nome: "Geode Cavo", hp: 5, sx: 1.35, sy: 1.15, sz: 1.35, col: 0x37474f, cristallo: 0xab47bc, forma: "geode", bonusDrop: 2 },
  { nome: "Obelisco Runico", hp: 7, sx: 0.80, sy: 2.30, sz: 0.80, col: 0x263238, cristallo: 0x00e5ff, forma: "obelisco", bonusDrop: 2 },
  { nome: "Colosso di Granito", hp: 9, sx: 1.80, sy: 1.45, sz: 1.80, col: 0x455a64, cristallo: 0xffd54f, forma: "dodeca", bonusDrop: 3 },
  { nome: "Nucleo Magmatico", hp: 8, sx: 1.45, sy: 1.30, sz: 1.45, col: 0x3e2723, cristallo: 0xff5722, forma: "geode", bonusDrop: 3 },
  { nome: "Monolite Mitico", hp: 12, sx: 1.50, sy: 2.50, sz: 1.50, col: 0x1a1a2e, cristallo: 0xff1744, forma: "obelisco", bonusDrop: 4 }
];

const TIPI_ROCCE_GLACIALI = [
  { nome: "Cumulo di Brina", hp: 45, sx: 1.1, sy: 0.9, sz: 1.1, col: 0x4fc3f7, cristallo: 0xe1f5fe, forma: "sfera", bonusDrop: 1 },
  { nome: "Guglia Polare", hp: 90, sx: 1.0, sy: 2.2, sz: 1.0, col: 0x0288d1, cristallo: 0x00e5ff, forma: "cono", bonusDrop: 2 },
  { nome: "Blocco Permafrost", hp: 160, sx: 1.5, sy: 1.4, sz: 1.5, col: 0x01579b, cristallo: 0x80deea, forma: "cubo", bonusDrop: 2 },
  { nome: "Geode Boreale", hp: 260, sx: 1.6, sy: 1.4, sz: 1.6, col: 0x006064, cristallo: 0x64ffda, forma: "geode", bonusDrop: 3 },
  { nome: "Obelisco Zero Assoluto", hp: 450, sx: 1.3, sy: 2.8, sz: 1.3, col: 0x1a237e, cristallo: 0x18ffff, forma: "obelisco", bonusDrop: 4 }
];

const PESI_FORME_ROCCE = new Array(22, 20, 14, 12, 10, 8, 6, 4, 3, 1);
const PESI_ROCCE_GLACIALI = new Array(35, 28, 20, 12, 5);

function creaGeometriaRoccia(forma) {
  if (forma === "cono") return new THREE.ConeGeometry(1.0, 1.9, 5);
  if (forma === "obelisco") return new THREE.CylinderGeometry(0.45, 1.05, 2.1, 6);
  if (forma === "cubo") return new THREE.BoxGeometry(1.4, 1.35, 1.4);
  if (forma === "lastra") return new THREE.CylinderGeometry(1.2, 1.35, 0.8, 7);
  if (forma === "geode") return new THREE.OctahedronGeometry(1.15, 0);
  if (forma === "sfera") return new THREE.IcosahedronGeometry(1.0, 0);
  return new THREE.DodecahedronGeometry(1.15, 0);
}

function generaSingolaRoccia(scene, rocce, pos, isGlaciale = false) {
  const lista = isGlaciale ? TIPI_ROCCE_GLACIALI : TIPI_ROCCE;
  const pesi = isGlaciale ? PESI_ROCCE_GLACIALI : PESI_FORME_ROCCE;

  let r = Math.random() * 100, idx = 0;
  for (let i = 0; i < pesi.length; i++) {
    if (r < pesi.at(i)) { idx = i; break; }
    r -= pesi.at(i);
  }
  const tipo = lista.at(idx);

  const gruppo = new THREE.Group();
  gruppo.position.set(pos.x, 0.8 * tipo.sy, pos.z);

  const mesh = new THREE.Mesh(
    creaGeometriaRoccia(tipo.forma),
    new THREE.MeshLambertMaterial({ color: tipo.col, flatShading: true })
  );
  mesh.scale.set(tipo.sx, tipo.sy, tipo.sz);
  mesh.rotation.y = Math.random() * Math.PI;
  gruppo.add(mesh);

  const numCristalli = tipo.bonusDrop >= 2 ? 3 : 2;
  for (let c = 0; c < numCristalli; c++) {
    const cr = new THREE.Mesh(
      new THREE.ConeGeometry(0.24 * tipo.sx, 0.8 * tipo.sy, 4),
      new THREE.MeshBasicMaterial({ color: tipo.cristallo })
    );
    const ang = (c / numCristalli) * Math.PI * 2 + 0.4;
    cr.position.set(Math.cos(ang) * 0.45 * tipo.sx, 0.45 * tipo.sy, Math.sin(ang) * 0.45 * tipo.sz);
    cr.rotation.z = (c % 2 === 0 ? 0.35 : -0.35);
    gruppo.add(cr);
  }

  scene.add(gruppo);
  rocce.push({
    gruppo, mesh, x: pos.x, z: pos.z,
    raggio: 1.25 * Math.max(tipo.sx, tipo.sz),
    hp: tipo.hp, maxHp: tipo.hp,
    tipoNome: tipo.nome, bonusDrop: tipo.bonusDrop,
    isGlaciale: isGlaciale,
    attiva: true, minabile: true
  });
}
