const fs = require('fs');

function writeLargeJsonFile(filePath, jsonObject) {
  const stream = fs.createWriteStream(filePath, { encoding: "utf8" });
  stream.write('{\n');
  const keys = Object.keys(jsonObject);
  keys.forEach((key, idx) => {
    stream.write(`"${key}": `);
    const value = jsonObject[key];
    if (Array.isArray(value)) {
      stream.write('[');
      for (let i = 0; i < value.length; i += 1000) {
        const chunk = value.slice(i, i + 1000);
        console.log(`Writing chunk ${i / 1000 + 1} for property "${key}" (${chunk.length} items)`);
        stream.write(JSON.stringify(chunk, null, 2).slice(1, -1)); // remove [ and ]
        if (i + 1000 < value.length) stream.write(',');
      }
      stream.write(']');
    } else if (typeof value === 'object' && value !== null) {
      stream.write(JSON.stringify(value, null, 2));
    } else {
      stream.write(JSON.stringify(value));
    }
    if (idx < keys.length - 1) stream.write(',\n');
  });
  stream.write('\n}');
  stream.end();
  stream.on('finish', () => {
    console.log('Done writing !');
  });
  stream.on('error', (err) => {
    console.error(err);
  });
}

module.exports = writeLargeJsonFile;