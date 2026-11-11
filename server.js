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
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

const server = http.createServer((req, res) => {
  const cleanUrl = req.url.split('?')[0];
  let file = '.' + (cleanUrl === '/' ? '/index.html' : cleanUrl);
  let ext = path.extname(file);

  fs.readFile(file, (err, data) => {
    if (err) { 
      res.writeHead(404); 
      res.end('Not found'); 
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

  socket.on('aggiornaStato', (dati) => {
    giocatoriOnline[socket.id] = { id: socket.id, ...dati };
    io.emit('listaGiocatori', giocatoriOnline);
  });

  socket.on('inviaMessaggioChat', (msgData) => {
    io.emit('nuovoMessaggioChat', msgData);
  });

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
