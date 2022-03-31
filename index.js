#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getBackupName(dir) {
  return `${dir}-link-backup`;
}

function link(relativeSrc) {
  if (!relativeSrc) {
    console.error('Error: Path to package not supplied.');
    process.exit(1);
  }

  const src = path.resolve(relativeSrc);
  const packageJsonPath = path.join(src, 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.error(`Error: Unable to find package.json at: ${packageJsonPath}`);
    process.exit(1);
  }

  const packageName = require(packageJsonPath).name;
  const dest = path.join(process.cwd(), 'node_modules', packageName);
  fs.mkdirSync(path.dirname(dest), { recursive: true });

  if (fs.existsSync(dest)) {
    if (fs.lstatSync(dest).isSymbolicLink()) {
      fs.rmSync(dest, { recursive: true, force: true });
    } else {
      const backupName = getBackupName(dest);
      if (fs.existsSync(backupName)) {
        fs.rmSync(backupName, { recursive: true, force: true });
      }

      fs.renameSync(dest, backupName);
    }
  }

  fs.symlinkSync(src, dest);

  console.info(`Linked '${packageName}' successfully`);
}

function unlink(packageName) {
  if (!packageName) {
    console.error('Error: package name not supplied.');
    process.exit(1);
  }

  const dest = path.join(process.cwd(), 'node_modules', packageName);
  if (fs.existsSync(dest) && fs.lstatSync(dest).isSymbolicLink()) {
    fs.rmSync(dest, { recursive: true, force: true });
  }

  const backupName = getBackupName(dest);
  if (fs.existsSync(backupName)) {
    if (fs.existsSync(dest)) {
      fs.rmSync(dest, { recursive: true, force: true });
    }

    fs.renameSync(backupName, dest);
  }

  console.info(`Unlinked '${packageName}' successfully`);
}

function main() {
  const mode = process.argv[2];

  if (mode === 'link') {
    link(process.argv[3]);
  } else if (mode === 'unlink') {
    unlink(process.argv[3]);
  } else {
    console.error(`Error: Unsupported command: ${mode}`);
    process.exit(1);
  }
}

main();
