import { IIssuer } from "../../interfaces/IIssuer";

/**
 * Defines an Mastercard issuer.
 */
export class Mastercard implements IIssuer {
  prefix: number;
  numDigits: number = 16;
  
  constructor() {
    // First digit must be 5.
    let prefix = "5";
    // Second digit between 1 and 5
    prefix += Math.floor(Math.random() * (5 - 1 + 1) + 1);
    this.prefix = Number(prefix);
  }

}