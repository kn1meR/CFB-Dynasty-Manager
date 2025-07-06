export function capitalizeName(name: string): string {
  return name
    .split(" ")
    .map((word) => {
      // Preserve initials like "TJ", "AJ", "JR"
      if (/^[A-Z]{2,}$/.test(word)) {
        return word.toUpperCase();
      }

      // Handle known prefixes
      if (/^Mc[A-Z]/i.test(word)) {
        return "Mc" + word.charAt(2).toUpperCase() + word.slice(3).toLowerCase();
      }
      if (/^Mac[A-Z]/i.test(word)) {
        return "Mac" + word.charAt(3).toUpperCase() + word.slice(4).toLowerCase();
      }
      if (/^O'/.test(word)) {
        return "O'" + word.charAt(2).toUpperCase() + word.slice(3).toLowerCase();
      }

      // Handle apostrophes for names like De'Andre
      if (/^[A-Za-z]+['’][A-Za-z]+$/.test(word)) {
        const parts = word.split(/['’]/);
        return parts
          .map((part, index) => {
            if (index === 0) {
              return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            } else {
              return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
            }
          })
          .join("'");
      }

      // Keep suffixes like "II", "III", "IV", "V", etc. uppercase
      if (/^(II|III|IV|V|VI|VII|VIII|IX|X)$/i.test(word)) {
        return word.toUpperCase();
      }

      // Handle hyphenated last names (e.g., Smith-Johnson)
      if (word.includes("-")) {
        return word
          .split("-")
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join("-");
      }

      // Default capitalization (first letter uppercase, rest lowercase)
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}
