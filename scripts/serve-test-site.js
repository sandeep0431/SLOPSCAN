import http from 'http';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';

const PORT = 3333;
const filePath = path.resolve('test-fixture/vibe-coded-site.html');

const server = http.createServer((req, res) => {
  if (fs.existsSync(filePath)) {
    const html = fs.readFileSync(filePath, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(html);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Test fixture not found.');
  }
});

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 SlopScan Test Site is running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`==================================================\n`);
  console.log(`Now switch to Google Chrome, go to http://localhost:${PORT}, and click the SlopScan icon!`);

  // Automatically open in default browser
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} http://localhost:${PORT}`);
});

