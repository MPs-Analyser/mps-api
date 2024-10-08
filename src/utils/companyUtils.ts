export const standardizeCompanyName = (name: string): string => {

  let standardized;
  if (typeof name !== 'string') {
    standardized = String(name).toLowerCase();
  } else {
    standardized = name.toLowerCase();
  }

  const stopWords = ['the', 'inc', 'ltd', 'plc', 'corp', 'llc', "service", "services", "industrial", "industry", "uk", "partners", "partner", "and"];

  const words = standardized.split(/\s+/);

  standardized = words
    .filter(word => !stopWords.includes(word) && word.length > 2)
    .map(word => {
      // Simple plural removal (might need refinement for irregular plurals)
      if (word.endsWith('s') && word.length > 3) { // Avoid removing 'is' or similar
        return word.slice(0, -1);
      }
      return word;
    })
    .join(' ');

  return standardized;
};