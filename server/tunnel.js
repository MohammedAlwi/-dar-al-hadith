const { execSync, spawn } = require('child_process');
const http = require('http');
const path = require('path');
const fs = require('fs');

const serverDir = __dirname;

function startServer() {
  return new Promise((resolve) => {
    const server = spawn('C:\\Program Files\\nodejs\\node.exe', ['index.js'], {
      cwd: serverDir,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    server.stdout.on('data', (data) => {
      const msg = data.toString();
      process.stdout.write(msg);
      if (msg.includes('Server running')) resolve(server);
    });

    server.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    setTimeout(() => resolve(server), 5000);
  });
}

async function waitForServer(url, maxRetries = 10) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          res.resume();
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(1000, () => { req.destroy(); reject('timeout'); });
      });
      return true;
    } catch {
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return false;
}

async function createTunnel(port) {
  return new Promise((resolve, reject) => {
    const proc = spawn('C:\\PROGRA~1\\nodejs\\npx.cmd', ['localtunnel', '--port', String(port)], {
      cwd: serverDir,
      stdio: ['ignore', 'pipe', 'pipe'],
      shell: true,
    });

    let resolved = false;

    proc.stdout.on('data', (data) => {
      const output = data.toString();
      process.stdout.write(output);
      
      const urlMatch = output.match(/https?:\/\/[^\s]+/);
      if (urlMatch && !resolved) {
        resolved = true;
        resolve(urlMatch[0]);
      }

      if (output.includes('url:') && !resolved) {
        const parts = output.split('url:');
        if (parts.length > 1) {
          const url = parts[1].trim();
          resolved = true;
          resolve(url);
        }
      }
    });

    proc.stderr.on('data', (data) => {
      process.stderr.write(data);
    });

    setTimeout(() => {
      if (!resolved) resolve('http://localhost:' + port);
    }, 20000);
  });
}

(async () => {
  console.log('Starting server...');
  const serverProc = await startServer();
  const port = 5000;

  const ready = await waitForServer(`http://localhost:${port}/`);
  if (!ready) {
    console.log('Server failed to start');
    process.exit(1);
  }

  console.log('\nCreating public tunnel...');
  const url = await createTunnel(port);

  console.log(`\n═══════════════════════════════════════`);
  console.log(`🌐  الرابط العام: ${url}`);
  console.log(`👤  دخول: admin / admin123`);
  console.log(`═══════════════════════════════════════\n`);

  process.on('SIGINT', () => {
    serverProc.kill();
    process.exit();
  });
})();
