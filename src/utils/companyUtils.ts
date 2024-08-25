export const standardizeCompanyName = (name: string): string => {
    // let standardized = name.toLowerCase();
  
    // standardized = standardized.replace(/[^\w\s]/g, '');
  
    const stopWords = ['the', 'inc', 'ltd', 'plc', 'corp', 'llc', "service", "services", "industrial", "industry"];

    const words = name.split(/\s+/);

    const standardized = words
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