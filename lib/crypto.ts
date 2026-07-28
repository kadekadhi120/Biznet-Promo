import crypto from 'crypto'

const ALGORITHM = 'aes-256-cbc'
const KEY = crypto.scryptSync(
  process.env.NIK_ENCRYPTION_KEY || 'change-me-in-production-nik-key-32',
  'biznet-nik-salt',
  32
)

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv)
  let enc = cipher.update(text, 'utf8', 'hex')
  enc += cipher.final('hex')
  return iv.toString('hex') + ':' + enc
}

export function decrypt(encryptedText: string): string {
  const [ivHex, enc] = encryptedText.split(':')
  if (!ivHex || !enc) return encryptedText
  const iv = Buffer.from(ivHex, 'hex')
  const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv)
  let dec = decipher.update(enc, 'hex', 'utf8')
  dec += decipher.final('utf8')
  return dec
}
