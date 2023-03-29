import { type Path, type FieldValues, type UseFormSetError } from "react-hook-form";
import { type z } from "zod";

export const capitalizeWord = (str: string) =>
  str
    .toLowerCase()
    .replace(/\w{1,}/g, (match) => match.replace(/\w/, (m) => m.toUpperCase()));

export const padWithZeros = (number: number, numDigits: number): string => {
  let paddedNumber = number.toString();
  while (paddedNumber.length < numDigits) {
    paddedNumber = "0" + paddedNumber;
  }
  return paddedNumber;
};

export const processZodErrors = <T extends FieldValues>(zodError:  z.typeToFlattenedError<any, string>, setError:UseFormSetError<T>) => {
  if (zodError?.fieldErrors) {
    Object.entries(zodError.fieldErrors).forEach(([field, errors]) => {
      errors && errors.forEach((err) => {
        setError(field as Path<T>, { type: "validate", message: err });
      });
    });
  }
}