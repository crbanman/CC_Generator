import { IIssuer } from "../../interfaces/IIssuer";

/**
 * Defines an AMEX issuer.
 */
export class Amex implements IIssuer {
  prefix: number;
  numDigits: number = 15;
  
  constructor() {
    // First digit must be 5.
    let prefix = "3";
    // Second digit either 4 or 7.
    prefix += Math.random() < 0.5 ? 4 : 7;
    this.prefix = Number(prefix);
  }
}
