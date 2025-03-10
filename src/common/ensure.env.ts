import * as dotenv from 'dotenv';
dotenv.config();

export function ensureEnvVar(envVar: string | undefined, name: string): string {
  if (!envVar) {
    throw new Error(`A variável de ambiente ${name} não está definida.`);
  }
  return envVar;
}
