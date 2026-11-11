const socket = typeof io !== 'undefined' ? io() : null;

let mioIdGiocatore = null;
if (socket) {
  socket.on('connect', () => {
    mioIdGiocatore = socket.id;
  });
}

const altriGiocatori = {};
let tuttiGiocatoriOnline = {};
let chatAperta = false;
let micAttivo = false;
let peerVoice = null;
let streamLocale = null;

if (!datiUtente.amici) datiUtente.amici = [];

const mpUI = document.createElement('div');
mpUI.style.cssText = "position:fixed;bottom:145px;left:15px;width:305px;max-width:88vw;z-index:70;font-family:sans-serif;";
mpUI.innerHTML = `
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;gap:4px;">
    <button id="btn-lista-online" style="font-size:11px;font-weight:bold;color:#81d4fa;background:rgba(15,20,30,0.92);padding:5px 9px;border-radius:6px;border:1px solid #4fc3f7;cursor:pointer;">
      🌐 Online: <b id="mp-count">1</b> | 🤝 Amici
    </button>
    <button id="btn-voice-chat" style="padding:5px 10px;background:#37474f;color:#fff;border:1px solid #607d8b;border-radius:6px;font-size:11px;font-weight:bold;cursor:pointer;">
      🎙️ Mic OFF
    </button>
  </div>

  <div id="pannello-online" style="display:none;background:rgba(12,17,26,0.97);border:1px solid #4fc3f7;border-radius:8px;padding:9px;margin-bottom:5px;max-height:175px;overflow-y:auto;font-size:11px;color:#fff;">
    <div style="display:flex;gap:4px;margin-bottom:7px;">
      <input type="text" id="input-cerca-amico" placeholder="Cerca nome fabbro..." style="flex:1;padding:4px 7px;background:#1e293b;border:1px solid #475569;border-radius:5px;color:#fff;font-size:11px;outline:none;">
      <button id="btn-aggiungi-nome" style="padding:4px 8px;background:#2e7d32;color:#fff;border:none;border-radius:5px;font-weight:bold;cursor:pointer;font-size:11px;">+ Amico</button>
    </div>
    <div style="color:#ffd54f;font-weight:bold;margin-bottom:3px;">🤝 I tuoi Amici:</div>
    <div id="lista-miei-amici" style="margin-bottom:7px;">Nessun amico aggiunto.</div>
    <div style="color:#81d4fa;font-weight:bold;margin-bottom:3px;">🌍 Nella Stanza Ora:</div>
    <div id="lista-giocatori-online">Nessun altro nella stanza.</div>
  </div>

  <div id="chat-log" style="height:100px;overflow-y:auto;background:rgba(10,14,22,0.85);border:1px solid #334155;border-radius:8px 8px 0 0;padding:7px;font-size:12px;color:#e2e8f0;display:flex;flex-direction:column;gap:4px;">
    <div style="color:#94a3b8;font-style:italic;">Premi <b>INVIO</b> per chattare...</div>
  </div>
  <input type="text" id="chat-input" placeholder="Scrivi messaggio (Invio)..." maxlength="90"
    style="width:100%;padding:7px 10px;background:rgba(15,23,42,0.95);border:1px solid #4fc3f7;border-top:none;border-radius:0 0 8px 8px;color:#fff;font-size:12px;outline:none;" />
`;
document.body.appendChild(mpUI);

document.getElementById('btn-lista-online').onclick = () => {
  const p = document.getElementById('pannello-online');
  p.style.display = p.style.display === 'none' ? 'block' : 'none';
  aggiornaPannelloSocial();
};

const inputCercaAmico = document.getElementById('input-cerca-amico');
inputCercaAmico.addEventListener('focus', () => { chatAperta = true; });
inputCercaAmico.addEventListener('blur', () => { chatAperta = false; });

document.getElementById('btn-aggiungi-nome').onclick = () => {
  const nome = inputCercaAmico.value.trim();
  if (!nome) return;
  if (nome.toLowerCase() === (datiUtente.nome || "").toLowerCase()) {
    aggiungiMessaggioChat("Sistema", "Non puoi aggiungere te stesso!", "#ff5252");
    return;
  }
  aggiungiAmico(nome);
  inputCercaAmico.value = "";
  aggiornaPannelloSocial();
};

const chatInput = document.getElementById('chat-input');
const chatLog = document.getElementById('chat-log');
chatInput.addEventListener('focus', () => { chatAperta = true; });
chatInput.addEventListener('blur', () => { chatAperta = false; });

function aggiungiMessaggioChat(autore, testo, colore = "#ffd54f") {
  const riga = document.createElement('div');
  riga.innerHTML = `<b style="color:${colore};">${autore}:</b> <span>${testo}</span>`;
  chatLog.appendChild(riga);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function aggiungiAmico(nomeAmico) {
  if (!datiUtente.amici.some(a => a.toLowerCase() === nomeAmico.toLowerCase())) {
    datiUtente.amici.push(nomeAmico);
    salvaPartita();
    aggiungiMessaggioChat("Sistema", `🤝 ${nomeAmico} aggiunto agli Amici!`, "#4caf50");
  } else {
    aggiungiMessaggioChat("Sistema", `${nomeAmico} è già nei tuoi Amici.`, "#81d4fa");
  }
}

chatInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const msg = chatInput.value.trim();
    if (msg) {
      const mioNome = datiUtente.nome || "Fabbro";
      const coloreMsg = datiUtente.armaEquipaggiata ? datiUtente.armaEquipaggiata.hex : "#ffd54f";
      if (socket && socket.connected) {
        socket.emit('inviaMessaggioChat', {
          autore: mioNome,
          testo: msg,
          colore: coloreMsg
        });
      } else {
        aggiungiMessaggioChat(mioNome, msg, coloreMsg);
      }
      chatInput.value = "";
    }
    chatInput.blur();
  } else if (e.key === 'Escape') {
    chatInput.blur();
  }
});
window.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !chatAperta && overlay.style.display === "none" && !forgiaAperta && !dialogoAperto) {
    e.preventDefault();
    chatInput.focus();
  }
});

document.getElementById('btn-voice-chat').onclick = async () => {
  const btn = document.getElementById('btn-voice-chat');
  if (!micAttivo) {
    try {
      streamLocale = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      micAttivo = true;
      btn.innerText = "🎙️ Mic ON";
      btn.style.background = "#2e7d32";
      btn.style.borderColor = "#4caf50";
      aggiungiMessaggioChat("Sistema", "Microfono attivato!", "#4caf50");

      if (!peerVoice && typeof Peer !== 'undefined' && mioIdGiocatore) {
        peerVoice = new Peer(mioIdGiocatore);
        peerVoice.on('call', call => {
          call.answer(streamLocale);
          call.on('stream', remoteStream => {
            const audioEl = new Audio();
            audioEl.srcObject = remoteStream;
            audioEl.play();
          });
        });
      }
      if (peerVoice) {
        Object.keys(altriGiocatori).forEach(id => {
          const call = peerVoice.call(id, streamLocale);
          if (call) {
            call.on('stream', remoteStream => {
              const audioEl = new Audio();
              audioEl.srcObject = remoteStream;
              audioEl.play();
            });
          }
        });
      }
    } catch (err) {
      aggiungiMessaggioChat("Sistema", "Permesso microfono negato.", "#ff5252");
    }
  } else {
    if (streamLocale) streamLocale.getTracks().forEach(t => t.stop());
    micAttivo = false;
    btn.innerText = "🎙️ Mic OFF";
    btn.style.background = "#37474f";
    btn.style.borderColor = "#607d8b";
    aggiungiMessaggioChat("Sistema", "Microfono spento.", "#94a3b8");
  }
};

function creaAvatarRemoto(scene, id, dati) {
  const gruppo = new THREE.Group();
  gruppo.position.set(dati.x || 0, 0, dati.z || 9);

  const canvas = (typeof generaCanvasPersonaggio === 'function' && dati.pixel)
    ? generaCanvasPersonaggio(dati.pixel, dati.armatura)
    : document.createElement('canvas');
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;

  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
  sprite.scale.set(1.8, 1.8, 1);
  sprite.position.y = 0.9;
  gruppo.add(sprite);

  const isAmico = datiUtente.amici && datiUtente.amici.some(a => a.toLowerCase() === (dati.nome || "").toLowerCase());
  const c = document.createElement('canvas'); c.width = 256; c.height = 64;
  const g = c.getContext('2d');
  g.fillStyle = "rgba(0,0,0,0.65)"; g.fillRect(18, 14, 220, 36);
  g.font = "bold 21px sans-serif";
  g.fillStyle = isAmico ? "#4caf50" : "#81d4fa";
  g.textAlign = "center";
  g.fillText(`${isAmico ? "🤝 " : ""}${dati.nome || "Fabbro"} (Lv.${dati.livello || 1})`, 128, 40);
  const tag = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c) }));
  tag.scale.set(3.2, 0.8, 1); tag.position.y = 2.25;
  gruppo.add(tag);

  scene.add(gruppo);
  altriGiocatori[id] = { gruppo, sprite, targetX: dati.x || 0, targetZ: dati.z || 9, nome: dati.nome };
}

function aggiornaPannelloSocial() {
  const boxAmici = document.getElementById('lista-miei-amici');
  if (boxAmici) {
    if (datiUtente.amici.length === 0) {
      boxAmici.innerHTML = "<span style='color:#94a3b8;'>Usa la barra sopra per aggiungere un amico!</span>";
    } else {
      boxAmici.innerHTML = '';
      datiUtente.amici.forEach((nomeAmico, idx) => {
        const onlineData = Object.values(tuttiGiocatoriOnline).find(p => (p.nome || "").toLowerCase() === nomeAmico.toLowerCase());
        const row = document.createElement('div');
        row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1e293b;";
        row.innerHTML = `
          <span>${onlineData ? '🟢' : '⚫'} <b>${nomeAmico}</b> <small style="color:#94a3b8;">(${onlineData ? 'Online' : 'Offline'})</small></span>
          <div style="display:flex;gap:3px;">
            ${onlineData ? `<button class="btn-tp" style="padding:2px 6px;background:#0288d1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:10px;">TP</button>` : ''}
            <button class="btn-del" style="padding:2px 5px;background:#b71c1c;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:10px;">✖</button>
          </div>
        `;
        if (onlineData) {
          row.querySelector('.btn-tp').onclick = () => {
            if (typeof playerGroup !== 'undefined') playerGroup.position.set(onlineData.x, 0, onlineData.z + 1.5);
          };
        }
        row.querySelector('.btn-del').onclick = () => {
          datiUtente.amici.splice(idx, 1);
          salvaPartita();
          aggiornaPannelloSocial();
        };
        boxAmici.appendChild(row);
      });
    }
  }

  const boxOnline = document.getElementById('lista-giocatori-online');
  if (!boxOnline) return;
  const altriIds = Object.keys(tuttiGiocatoriOnline).filter(id => id !== mioIdGiocatore);
  if (altriIds.length === 0) {
    boxOnline.innerHTML = "<span style='color:#94a3b8;'>Nessun altro nella stanza.</span>";
    return;
  }
  boxOnline.innerHTML = '';
  altriIds.forEach(id => {
    const p = tuttiGiocatoriOnline[id];
    const row = document.createElement('div');
    row.style.cssText = "display:flex;justify-content:space-between;align-items:center;padding:3px 0;border-bottom:1px solid #1e293b;";
    row.innerHTML = `
      <span>👤 ${p.nome} (Lv.${p.livello || 1})</span>
      <div style="display:flex;gap:3px;">
        <button class="btn-add" style="padding:2px 6px;background:#2e7d32;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:10px;">+ Amico</button>
        <button class="btn-tp" style="padding:2px 6px;background:#0288d1;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:10px;">TP</button>
      </div>
    `;
    row.querySelector('.btn-add').onclick = () => { aggiungiAmico(p.nome); aggiornaPannelloSocial(); };
    row.querySelector('.btn-tp').onclick = () => {
      if (typeof playerGroup !== 'undefined') playerGroup.position.set(p.x, 0, p.z + 1.5);
    };
    boxOnline.appendChild(row);
  });
}

function aggiornaMultiplayer(scene, playerGroup) {
  if (!socket || !socket.connected || !datiUtente.nome) return;

  if (!window.mpTick) window.mpTick = 0;
  window.mpTick++;
  if (window.mpTick % 4 === 0) {
    socket.emit('aggiornaStato', {
      nome: datiUtente.nome,
      livello: datiUtente.livello || 1,
      x: Number(playerGroup.position.x.toFixed(2)),
      z: Number(playerGroup.position.z.toFixed(2)),
      pixel: datiUtente.pixelEroe || null,
      armatura: datiUtente.armaturaEquipaggiata || null
    });
  }

  Object.keys(altriGiocatori).forEach(id => {
    const p = altriGiocatori[id];
    p.gruppo.position.x += (p.targetX - p.gruppo.position.x) * 0.25;
    p.gruppo.position.z += (p.targetZ - p.gruppo.position.z) * 0.25;
  });
}

if (socket) {
  socket.on('listaGiocatori', (giocatoriDalServer) => {
    tuttiGiocatoriOnline = giocatoriDalServer || {};
    const ids = Object.keys(tuttiGiocatoriOnline);
    document.getElementById('mp-count').innerText = Math.max(1, ids.length);
    aggiornaPannelloSocial();

    ids.forEach(id => {
      if (id === mioIdGiocatore) return;
      const d = tuttiGiocatoriOnline[id];
      if (!altriGiocatori[id] && typeof scene !== 'undefined') {
        creaAvatarRemoto(scene, id, d);
      } else if (altriGiocatori[id]) {
        altriGiocatori[id].targetX = d.x;
        altriGiocatori[id].targetZ = d.z;
      }
    });

    Object.keys(altriGiocatori).forEach(id => {
      if (!tuttiGiocatoriOnline[id]) {
        if (typeof scene !== 'undefined') scene.remove(altriGiocatori[id].gruppo);
        delete altriGiocatori[id];
      }
    });
  });

  socket.on('nuovoMessaggioChat', (m) => {
    if (m) aggiungiMessaggioChat(m.autore, m.testo, m.colore || "#ffd54f");
  });
}
