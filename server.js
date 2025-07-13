// server.js – version CommonJS (fonctionne sans config spéciale)
const { createServer } = require('https');
const { readFileSync } = require('fs');
const next = require('next');
const path = require('path');

const app = next({ dev: true });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: readFileSync(path.join(__dirname, 'certs', 'localhost+1-key.pem')),
  cert: readFileSync(path.join(__dirname, 'certs', 'localhost+1.pem')),
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    handle(req, res);
  }).listen(3001, () => {
    console.log('✅ Front prêt sur : https://localhost:3001');
  });
});
