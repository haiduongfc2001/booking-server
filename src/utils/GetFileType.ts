export default function getFileType(fileName: string): string {
  const parts = fileName.split(".");
  if (parts.length > 1) {
    return parts[parts.length - 1].toLowerCase();
  }
  return "";
}
