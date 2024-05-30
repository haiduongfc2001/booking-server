type DateString = `${number}-${number}-${number}`;

export function getDateOnly(dateString: DateString): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
}
