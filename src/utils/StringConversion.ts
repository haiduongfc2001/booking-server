/**
 * Function to capitalize the first letter of a string and make all other letters lowercase.
 * @param str - The string to be transformed.
 * @returns The transformed string with the first letter capitalized.
 */
export function capitalizeFirstLetter(str: string): string {
  // Check if the input is not a string, return the input as is
  if (typeof str !== "string") return str;

  // Capitalize the first letter and make the rest of the string lowercase
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Function to transform all characters of a string to uppercase.
 * @param str - The string to be transformed.
 * @returns The transformed string in uppercase.
 */
export function toUpperCase(str: string): string {
  // Check if the input is not a string, return the input as is
  if (typeof str !== "string") return str;

  // Convert the entire string to uppercase
  return str.toUpperCase();
}

/**
 * Function to transform all characters of a string to lowercase.
 * @param str - The string to be transformed.
 * @returns The transformed string in lowercase.
 */
export function toLowerCase(str: string): string {
  // Check if the input is not a string, return the input as is
  if (typeof str !== "string") return str;

  // Convert the entire string to lowercase
  return str.toLowerCase();
}

/**
 * Function to capitalize the first letter of each word in a string and make all other letters lowercase.
 * @param str - The string to be transformed.
 * @returns The transformed string with each word's first letter capitalized.
 */
export function capitalizeAllWords(str: string): string {
  // Check if the input is not a string, return the input as is
  if (typeof str !== "string") return str;

  // Split the string into words, capitalize the first letter of each word, and join them back together
  return str
    .split(" ") // Split the string into an array of words using space as the delimiter
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter of each word
    .join(" "); // Join the array of words back into a single string with spaces between words
}
