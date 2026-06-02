// Maps Ergast/Jolpica nationality demonyms to ISO 3166-1 alpha-2 codes so we
// can show flags (via flagcdn.com). Covers nationalities seen in F1 history.

const DEMONYM_TO_CODE: Record<string, string> = {
  British: "gb",
  English: "gb",
  Scottish: "gb",
  German: "de",
  Italian: "it",
  French: "fr",
  Spanish: "es",
  Dutch: "nl",
  Finnish: "fi",
  Australian: "au",
  Mexican: "mx",
  Canadian: "ca",
  Monegasque: "mc",
  Thai: "th",
  Japanese: "jp",
  Danish: "dk",
  Chinese: "cn",
  American: "us",
  Brazilian: "br",
  Austrian: "at",
  Swiss: "ch",
  Belgian: "be",
  "New Zealander": "nz",
  Argentine: "ar",
  Argentinian: "ar",
  Russian: "ru",
  Swedish: "se",
  Polish: "pl",
  Portuguese: "pt",
  Indian: "in",
  Indonesian: "id",
  Irish: "ie",
  Hungarian: "hu",
  Czech: "cz",
  Colombian: "co",
  Venezuelan: "ve",
  "South African": "za",
  Malaysian: "my",
  Chilean: "cl",
  Uruguayan: "uy",
};

export function flagCode(nationality?: string): string | null {
  if (!nationality) return null;
  return DEMONYM_TO_CODE[nationality.trim()] ?? null;
}

export function flagUrl(nationality?: string, width = 40): string | null {
  const code = flagCode(nationality);
  return code ? `https://flagcdn.com/w${width}/${code}.png` : null;
}
