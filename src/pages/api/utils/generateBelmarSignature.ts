export function generateBelmarSignature(
  dosageInstructions: string | null | undefined,
  quantity: number | undefined
) {
  const belmarSig = dosageInstructions || 'Use as directed';
  const sliceTo = belmarSig.indexOf(')') + 1;
  const pre = belmarSig.slice(0, sliceTo) + ' ' + 'SQ' + ' ';
  const post = belmarSig.slice(sliceTo + 1);
  let sig = pre + post;

  if (quantity === 2 && !dosageInstructions?.includes('50 units'))
    sig = `${sig} (up to 50 units as directed by your provider)`;
  else if (quantity === 5 && !dosageInstructions?.includes('125 units'))
    sig = `${sig} (up to 125 units as directed by your provider)`;
  else if (quantity === 10 && !dosageInstructions?.includes('250 units'))
    sig = `${sig} (up to 250 units as directed by your provider)`;
  return sig;
}
