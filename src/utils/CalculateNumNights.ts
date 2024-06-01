// Function to calculate the number of nights from check-in date to check-out date
export default function calculateNumberOfNights(
  checkIn: string,
  checkOut: string
): number {
  // Convert the dates into Date objects
  var startDate = new Date(checkIn);
  var endDate = new Date(checkOut);

  // Calculate the number of milliseconds in a day
  var oneDay = 24 * 60 * 60 * 1000;

  // Calculate the number of nights by taking the difference of two days and dividing by the number of milliseconds in a day
  var differenceMs = endDate.getTime() - startDate.getTime();
  var calculateNumberOfNights = Math.round(differenceMs / oneDay);

  return calculateNumberOfNights;
}
