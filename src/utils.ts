function getLastOfPath<T>(object: { [key: string]: any }, path: string, Empty?: { new(): T }) {
  function cleanKey(key: string) {
    return (key && key.indexOf('###') > -1) ? key.replace(/###/g, '.') : key;
  }

  function canNotTraverseDeeper() {
    return !object || typeof object === 'string';
  }

  const stack = (typeof path !== 'string') ? [].concat(path) : path.split('.');
  while (stack.length > 1) {
    if (canNotTraverseDeeper()) return {};

    const key = cleanKey(stack.shift()!);
    if (!object[key] && Empty) object[key] = new Empty();
    object = object[key];
  }

  if (canNotTraverseDeeper()) return {};
  return {
    obj: object,
    k: cleanKey(stack.shift()!)
  };
}

export function setPath(object: { [key: string]: any }, path: string, newValue: any) {
  const { obj, k } = getLastOfPath(object, path, Object);

  if (obj && k) obj[k] = newValue;
}

export function pushPath(object: { [key: string]: any }, path: string, newValue: any, concat: boolean) {
  const { obj, k } = getLastOfPath(object, path, Object);

  if (obj && k) {
    obj[k] = obj[k] || [];
    if (concat) obj[k] = obj[k].concat(newValue);
    if (!concat) obj[k].push(newValue);
  }
}

export function getPath(object: { [key: string]: any }, path: string) {
  const { obj, k } = getLastOfPath(object, path);

  if (!obj) return undefined;
  return obj[k!];
}

export function defaults(obj: { [key: string]: any }, ...args: ({ [key: string]: any } | undefined)[]) {
  args.forEach((source) => {
    if (source) {
      for (const prop in source) {
        if (obj[prop] === undefined) obj[prop] = source[prop];
      }
    }
  });
  return obj;
}

export function extend(obj: { [key: string]: any }, ...args: ({ [key: string]: any } | undefined)[]) {
  args.forEach((source) => {
    if (source) {
      for (const prop in source) {
        obj[prop] = source[prop];
      }
    }
  });
  return obj;
}
