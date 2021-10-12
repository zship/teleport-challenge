const BASE = 1024;

export const getHumanReadableSize = (size: number): string => {
  const exp = Math.log(size) / Math.log(BASE);
  let scaled = '';
  let prefix = '';

  if (exp >= 4) {
    scaled = (size / BASE**4).toFixed(1);
    prefix = 'T';
  } else if (exp >= 3) {
    scaled = (size / BASE**3).toFixed(1);
    prefix = 'G';
  } else if (exp >= 2) {
    scaled = (size / BASE**2).toFixed(1);
    prefix = 'M';
  } else if (exp >= 1) {
    scaled = (size / BASE).toFixed(1);
    prefix = 'K';
  } else {
    scaled = size.toString();
  }

  return `${scaled}${prefix}`;
};
