import { IIssuer } from "../../interfaces/IIssuer";

/**
 * Defines an Visa issuer.
 */
export class Visa implements IIssuer {
  prefix: number = 4;
  numDigits: number = 16;
}