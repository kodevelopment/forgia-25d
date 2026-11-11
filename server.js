const http = require('http');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');

const mime = { 
  '.html': 'text/html', 
  '.js': 'application/javascript', 
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg'
};

const server = http.createServer((req, res) => {
  // Prende l'URL pulito senza eventuali parametri (es. ?v=1)
  const cleanUrl = req.url.split('?');
  const relativePath = cleanUrl === '/' ? 'index.html' : cleanUrl.replace(/^\/+/, '');
  const filePath = path.join(__dirname, relativePath);
  const ext = path.extname(filePath).toLowerCase();

  fs.readFile(filePath, (err, data) => {
    if (err) { 
      res.writeHead(404, { 'Content-Type': 'text/plain' }); 
      res.end('File non trovato: ' + relativePath); 
      return; 
    }
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

const io = new Server(server);
const giocatoriOnline = {};

io.on('connection', (socket) => {
  console.log('Giocatore connesso:', socket.id);

  // Riceve posizione, nome, livello e skin dal giocatore
  socket.on('aggiornaStato', (dati) => {
    giocatoriOnline[socket.id] = { id: socket.id, ...dati };
    io.emit('listaGiocatori', giocatoriOnline);
  });

  // Riceve un messaggio in chat e lo inoltra a tutti
  socket.on('inviaMessaggioChat', (msgData) => {
    io.emit('nuovoMessaggioChat', msgData);
  });

  // Quando un giocatore chiude il gioco
  socket.on('disconnect', () => {
    console.log('Giocatore uscito:', socket.id);
    delete giocatoriOnline[socket.id];
    io.emit('listaGiocatori', giocatoriOnline);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`SERVER ATTIVO SU http://localhost:${PORT}`);
});
