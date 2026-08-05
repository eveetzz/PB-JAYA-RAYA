export const generatePassword = (nik) => {
  const lastDigits = nik.slice(-4);

  return `PBJR@${lastDigits}`;
};
