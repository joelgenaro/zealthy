export const replaceAll = (
  header: string,
  replace: string[],
  replaceWith: string[]
) => {
  return replace.reduce(
    (newHeader, old, idx) => newHeader.replaceAll(old, replaceWith[idx]),
    header
  );
};
