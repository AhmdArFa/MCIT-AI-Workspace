const crypto = require('crypto');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
const meta = { alg: 'RS256', kid: crypto.randomBytes(8).toString('hex'), use: 'sig' };
const priv = JSON.stringify({ keys: [{ ...privateKey.export({ format: 'jwk' }), ...meta }] });
const pub = JSON.stringify({ keys: [{ ...publicKey.export({ format: 'jwk' }), ...meta }] });
console.log('JWKS_KEY=' + priv);
console.log('JWKS_PUBLIC_KEY=' + pub);
