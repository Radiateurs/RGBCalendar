// Asynchronous
const crypto = require('crypto');
const fs = require('fs');

function token_generator() {
    const dir = './configure';

    if (process.argv.length >= 3)
        len = Number.parseInt(process.argv[2])
    
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir);
    }
    
    crypto.randomBytes(16, (err, buf) => {
      if (err) throw err;
      fs.writeFile('./configure/token.json', `{"token":"${buf.toString('hex')}"}`, (err) => {if (err) console.error(err);});
    });
}

module.exports = token_generator;