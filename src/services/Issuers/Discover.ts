import { IIssuer } from "../../interfaces/IIssuer";

/**
 * Defines an Discover issuer.
 */
export class Discover implements IIssuer {
  prefix: number = 6011;
  numDigits: number = 15;
}