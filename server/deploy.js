const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const LOG = path.join(__dirname, 'deploy-url.txt');

function log(msg) {
  console.log(msg);
  fs.appendFileSync(LOG, msg + '\n');
}

// Start server
const server = spawn('node.exe', ['index.js'], { cwd: __dirname, stdio: ['ignore', 'pipe', 'pipe'] });
server.stdout.on('data', d => log(d.toString().trim()));
server.stderr.on('data', d => log(d.toString().trim()));

// Wait for server, then SSH tunnel
setTimeout(() => {
  const ssh = spawn('C:\\Windows\\System32\\OpenSSH\\ssh.exe', [
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'ServerAliveInterval=30',
    '-R', '80:localhost:5000', 'serveo.net'
  ], { stdio: ['ignore', 'pipe', 'pipe'] });

  ssh.stdout.on('data', d => {
    const txt = d.toString().trim();
    log(txt);
    console.log(txt);
  });
  ssh.stderr.on('data', d => {
    const txt = d.toString().trim();
    log(txt);
    console.log(txt);
  });

  ssh.on('exit', code => log('SSH exited: ' + code));
}, 3000);

process.on('SIGINT', () => { server.kill(); process.exit(); });
process.on('SIGTERM', () => { server.kill(); process.exit(); });
