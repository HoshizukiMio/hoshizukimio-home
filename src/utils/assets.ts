export function resolveAssetPath(path?: string) {
  const trimmed = path?.trim();

  if (!trimmed) {
    return undefined;
  }

  if (/^(https?:)?\/\//.test(trimmed) || /^(data|blob):/.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  if (trimmed.startsWith('./')) {
    return `/${trimmed.slice(2)}`;
  }

  return `/${trimmed}`;
}
