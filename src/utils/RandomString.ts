export default function generateRandomString(
  length: number,
  ensureAllTypes: boolean = false
): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";

  let result = "";

  if (ensureAllTypes) {
    if (length < 3) {
      throw new Error(
        "Length must be at least 3 to ensure all character types are included."
      );
    }

    // Ensure at least one of each type
    result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
    result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
    result += digits.charAt(Math.floor(Math.random() * digits.length));
    length -= 3; // Adjust the length to account for the initial 3 characters
  }

  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  // If all types are ensured, shuffle the result
  if (ensureAllTypes) {
    result = result
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
  }

  return result;
}
