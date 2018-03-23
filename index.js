#!/usr/bin/env node

const { spawn } = require('child_process');
const netstat = spawn('netstat', ['-anv', '-p', 'tcp']);
const grep = spawn('grep', ['LISTEN']);
const readline = require('readline');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

function kill(pid) {
  return exec(`kill -9 ${pid}`);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

netstat.stdout.on('data', (data) => {
  grep.stdin.write(data);
});

netstat.stderr.on('data', (data) => {
  console.log(`netstat stderr: ${data}`);
});

netstat.on('close', (code) => {
  if (code !== 0) {
    console.log(`netstat process exited with code ${code}`);
  }
  grep.stdin.end();
});

grep.stdout.on('data', (data) => {
  console.log(data.toString());

  rl.question('Please select the pid of prosess to kill: ', async (answer) => {
    try {
      await kill(answer);
      console.log(`killed prosess: ${answer}`);
    } catch(err) {
      throw new Error(err);
    } finally {
      rl.close();
    }
  });
});

grep.on('close', (code) => {
  if (code !== 0) {
    console.log(`grep process exited with code ${code}`);
  }
});
