const ts2mmss = (v: number | string, mode?: 'ms' | 's') => {
  let target = 0;
  if (typeof v === 'string') {
    target = Number.parseInt(v, 10);
  } else {
    target = v;
  }
  if (mode !== 's') {
    target /= 1000;
  }
  const m = Number.parseInt(String(target / 60), 10);
  const s = Number.parseInt(String(target % 60), 10);
  const r = `${m}:${s < 10 ? '0' : ''}${s}`;
  return r;
};

export { ts2mmss };
