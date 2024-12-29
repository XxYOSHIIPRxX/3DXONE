const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const generateSHA256 = (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('sha256');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
};

const generateUpdateInfo = (version) => {
  const platforms = {
    'windows-x86_64': {
      signature: '',
      url: `https://github.com/YOUR_USERNAME/3dxone10/releases/download/v${version}/3DXOne_${version}_x64-setup.exe`
    }
  };

  const releaseDir = path.join(__dirname, '../src-tauri/target/release/bundle/msi');
  const files = fs.readdirSync(releaseDir);
  const installerFile = files.find(f => f.endsWith('.exe'));
  
  if (installerFile) {
    const checksum = generateSHA256(path.join(releaseDir, installerFile));
    platforms['windows-x86_64'].signature = checksum;
  }

  const updateData = {
    version,
    notes: 'See the changelog on GitHub for details: https://github.com/YOUR_USERNAME/3dxone10/releases',
    pub_date: new Date().toISOString(),
    platforms
  };

  fs.writeFileSync(
    path.join(__dirname, '../latest.json'),
    JSON.stringify(updateData, null, 2)
  );
};

// Get version from tauri.conf.json
const tauriConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src-tauri/tauri.conf.json'), 'utf8')
);
const version = tauriConfig.package.version;

generateUpdateInfo(version);
