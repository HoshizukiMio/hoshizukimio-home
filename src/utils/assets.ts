export function resolveAssetPath(path?: string) {
  const trimmed = path?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^(https?:)?\/\//.test(trimmed) || /^(data|blob):/.test(trimmed)) {
    return trimmed;
  }

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`;
  const relativePath = trimmed.replace(/^\.\//, '').replace(/^\//, '');

  return `${baseUrl}${relativePath}`;
}
