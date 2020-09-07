import { IIssuer } from "../../interfaces/IIssuer";

/**
 * Custom issuer class.
 */
export class Custom implements IIssuer {
  prefix: number;
  numDigits: number;
  
  constructor(prefix: number, numDigits: number) {
    this.prefix = prefix;
    this.numDigits = numDigits;
  }
}
