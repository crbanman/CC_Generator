import luhn from "fast-luhn";
import { getCheckDigit, generateLuhnNumber, generateCardNumber } from "./index";
import { Mastercard } from "../Issuers/Mastercard";
import { Amex } from "../Issuers/Amex";
import { Custom } from "../Issuers/Custom";
import { Discover } from "../Issuers/Discover";
import { Visa } from "../Issuers/Visa";

describe("'getCheckDigit' utility", () => {
  test("given [1, 0, 0, 0, 0] as argument, returns 8", () => {
    const checkDigit = getCheckDigit([1, 0, 0, 0, 0]);
    expect(checkDigit).toBe(8);
  });

  test("given [1, 0, 0, 0, 0, 0] as argument, returns 9", () => {
    const checkDigit = getCheckDigit([1, 0, 0, 0, 0, 0]);
    expect(checkDigit).toBe(9);
  });

  test("given [1, 2, 3, 4, 5, 6, 7, 8, 9] as argument, returns 7", () => {
    const checkDigit = getCheckDigit([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(checkDigit).toBe(7);
  });
});

describe("'generateLuhnNumber' utility", () => {
  const cases = [
    [0, 4],
    [1, 9],
    [12345, 4],
    [12345, 10],
    [54321, 15],
    [123123123123, 15],
  ];
  test.each(cases)(
    "given prefix %d and length %d provides a valid Luhn number",
    (prefix: number, length: number) => {
      expect(luhn(generateLuhnNumber(prefix, length))).toBe(true);
    }
  );
});

describe("'generateCardNumber'", () => {
  test("AMEX generation", () => {
    const issuer = new Amex();
    const number = generateCardNumber(issuer);

    expect(luhn(number)).toBe(true);
    expect(number.charAt(0)).toBe("3");
    const secondDigit = Number(number.charAt(1));
    expect(secondDigit === 4 || secondDigit === 7).toBeTruthy();
    expect(number.length).toBe(15);
  });

  test("Custom generation", () => {
    const issuer = new Custom(1234, 9);
    const number = generateCardNumber(issuer);

    expect(luhn(number)).toBe(true);
    const prefix = number.substr(0, 4);
    expect(prefix).toBe("1234");
    expect(number.length).toBe(9);
  });

  test("Discover generation", () => {
    const issuer = new Discover();
    const number = generateCardNumber(issuer);

    expect(luhn(number)).toBe(true);
    const prefix = number.substr(0, 4);
    expect(prefix).toBe("6011");
    expect(number.length).toBe(15);
  });
  
  test("Mastercard generation", () => {
    const issuer = new Mastercard();
    const number = generateCardNumber(issuer);

    expect(luhn(number)).toBe(true);
    expect(number.charAt(0)).toBe("5");
    const secondDigit = Number(number.charAt(1));
    expect(secondDigit).toBeGreaterThanOrEqual(1);
    expect(secondDigit).toBeLessThanOrEqual(5);
    expect(number.length).toBe(16);
  });
  
  test("Visa generation", () => {
    const issuer = new Visa();
    const number = generateCardNumber(issuer);

    expect(luhn(number)).toBe(true);
    expect(number.charAt(0)).toBe("4");
    expect(number.length).toBe(16);
  });
});
