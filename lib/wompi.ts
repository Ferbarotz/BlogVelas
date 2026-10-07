import crypto from 'crypto';

// Helpers para la integración de pagos con Wompi (Colombia).
// Mientras no se configuren credenciales reales, la app funciona en MODO SIMULADO
// para poder probar el flujo completo sin cobrar.

export function getWompiConfig() {
  const publicKey = process.env.WOMPI_PUBLIC_KEY ?? '';
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET ?? '';
  const privateKey = process.env.WOMPI_PRIVATE_KEY ?? '';
  return { publicKey, integritySecret, privateKey };
}

// Una llave es válida solo si existe y empieza por el prefijo real de Wompi.
export function isWompiConfigured() {
  const { publicKey, integritySecret, privateKey } = getWompiConfig();
  const validPublic = publicKey.startsWith('pub_');
  const validPrivate = privateKey.startsWith('prv_');
  const validSecret = !!integritySecret && !integritySecret.startsWith('REPLACE');
  return validPublic && validPrivate && validSecret;
}

// Entorno (sandbox vs producción) deducido del prefijo de la llave pública.
export function wompiApiBase() {
  const { publicKey } = getWompiConfig();
  return publicKey.startsWith('pub_prod_')
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';
}

export function wompiCheckoutBase() {
  return 'https://checkout.wompi.co/p/';
}

// Firma de integridad: SHA256(reference + amountInCents + currency + integritySecret)
export function buildIntegritySignature(
  reference: string,
  amountInCents: number,
  currency: string,
  integritySecret: string
) {
  const raw = `${reference}${amountInCents}${currency}${integritySecret}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}
