export function getErrorMessage(err: any, fallback: string): string {
  if (typeof err?.error === 'string') return err.error;
  if (typeof err?.error?.message === 'string') return err.error.message;
  if (typeof err?.message === 'string') return err.message;
  return fallback;
}
