import crypto, { BinaryLike } from "crypto";
import { HashAlgorithm } from "../config/enum.config";

export function resolveUrlString(host: string, path: string): string {
  host = host.trim();
  path = path.trim();
  while (host.endsWith("/") || host.endsWith("\\")) {
    host = host.slice(0, -1);
  }
  while (path.startsWith("/") || path.startsWith("\\")) {
    path = path.slice(1);
  }
  return `${host}/${path}`;
}

export function hash(
  algorithm: HashAlgorithm,
  secret: string,
  data: BinaryLike,
): string {
  return crypto.createHmac(algorithm, secret).update(data).digest("hex");
}
