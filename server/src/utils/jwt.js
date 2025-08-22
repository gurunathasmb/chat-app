import jwt from 'jsonwebtoken';

export function signJWT(payload, secret) {
  return jwt.sign(payload, secret, { expiresIn: '7d' });
}

export function verifyJWT(token, secret) {
  return jwt.verify(token, secret);
}
