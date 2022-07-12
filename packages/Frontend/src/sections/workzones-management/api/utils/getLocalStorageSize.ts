export const getLocalStorageSize =
  Object.keys(localStorage)
    .map(k => (localStorage[k] || '').length)
    .reduce((acc, length) => acc + length, 0);
