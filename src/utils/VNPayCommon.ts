import crypto, { BinaryLike } from "crypto";
import { HashAlgorithm, VnpLocale } from "../config/enum.config";
import { RESPONSE_MAP } from "../config/response-map.constant";

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

/**
 * Lấy thông tin response theo mã response
 * @en Get response message by response code
 *
 * @param responseCode response code from VNPay
 * @param locale locale of response text
 * @param responseMap map of response code and response text if you want to custom
 * @returns message of response code
 */
export function getResponseByStatusCode(
  responseCode: string = "",
  locale: VnpLocale = VnpLocale.VN,
  responseMap = RESPONSE_MAP
): string {
  const respondText: Record<VnpLocale, string> =
    responseMap.get(responseCode) ??
    (responseMap.get("default") as Record<VnpLocale, string>);

  return respondText[locale];
}
