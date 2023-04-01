import { capitalizeWord, padWithZeros, processZodErrors } from "~/utils/transform";
import { TRPCClientError } from "@trpc/client";
import { z } from "zod";
import { describe, expect, vi } from "vitest";

describe("processZodErrors", () => {
  it("should call setError with field errors from zodError", () => {
    const setErrorMock = vi.fn();
    const zodError = z
      .object({
        email: z.string().email(),
        password: z.string().min(8),
      })
      .safeParse({
        email: "invalid-email",
        password: "short",
      });
    
    if (!zodError.success) {
      const formattedError = zodError.error.flatten()
      const trpcError = new TRPCClientError("validation error", {
        result: {
          error: {
            data: {
              zodError: formattedError
            }
          }
        }
      });

      processZodErrors(trpcError, setErrorMock);
  
      expect(setErrorMock).toHaveBeenCalledTimes(2);
      expect(setErrorMock).toHaveBeenCalledWith("email", {
        type: "server",
        message: "Invalid email",
      });
      expect(setErrorMock).toHaveBeenCalledWith("password", {
        type: "server",
        message: "String must contain at least 8 character(s)",
      });
    }
  });
});

describe('capitalizeWord', () => {
  it('should capitalize the first letter of a word', () => {
    expect(capitalizeWord('hello')).toBe('Hello');
    expect(capitalizeWord('world')).toBe('World');
    expect(capitalizeWord('hello-world')).toBe('Hello-World');
    expect(capitalizeWord('')).toBe('');
  });

  it('should convert all other letters to lowercase', () => {
    expect(capitalizeWord('HAPPY')).toBe('Happy');
    expect(capitalizeWord('eVeNtS')).toBe('Events');
  });
});

describe('padWithZeros', () => {
  it('should add leading zeros to a number', () => {
    expect(padWithZeros(5, 3)).toBe('005');
    expect(padWithZeros(123, 5)).toBe('00123');
    expect(padWithZeros(987654321, 5)).toBe('987654321');
  });

  it('should return the original number if the number of digits is less than or equal to the length of the number', () => {
    expect(padWithZeros(42, 1)).toBe('42');
    expect(padWithZeros(42, 2)).toBe('42');
    expect(padWithZeros(42, 3)).toBe('042');
  });
});
