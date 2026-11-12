const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav'
};

const server = http.createServer((req, res) => {
  if (req.url && req.url.startsWith('/socket.io')) return;

  const rawUrl = typeof req.url === 'string' ? req.url : '/';
  const cleanUrl = rawUrl.split('?').at(0) || '/';
  const relativePath = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\/+/, '');
  const filePath = path.join(__dirname, relativePath);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403);
    res.end('Accesso negato');
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('File non trovato: ' + relativePath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
});

const io = new Server(server, {
  cors: { origin: '*' },
  maxHttpBufferSize: 1e7
});

const giocatori = {};

io.on('connection', (socket) => {
  console.log('Giocatore connesso:', socket.id);

  socket.on('aggiornaGiocatore', (dati) => {
    giocatori[socket.id] = { id: socket.id, ...dati };
    socket.broadcast.emit('statoGiocatori', giocatori);
  });

  socket.on('messaggioChat', (msg) => {
    io.emit('messaggioChat', msg);
  });

  socket.on('webrtc-offer', (data) => {
    if (data && data.to) io.to(data.to).emit('webrtc-offer', { from: socket.id, offer: data.offer });
  });

  socket.on('webrtc-answer', (data) => {
    if (data && data.to) io.to(data.to).emit('webrtc-answer', { from: socket.id, answer: data.answer });
  });

  socket.on('webrtc-ice', (data) => {
    if (data && data.to) io.to(data.to).emit('webrtc-ice', { from: socket.id, candidate: data.candidate });
  });

  socket.on('disconnect', () => {
    console.log('Giocatore uscito:', socket.id);
    delete giocatori[socket.id];
    io.emit('giocatoreDisconnesso', socket.id);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER ATTIVO SU http://localhost:${PORT}`);
});
