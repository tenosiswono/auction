// DepositBalance.test.tsx
import { describe, expect, vi } from "vitest";
import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import DepositBalance from "~/components/Deposit/DepositBallance";

const mutateAsync = vi.fn()

vi.mock("~/utils/api", () => ({
  api: {
    user: {
      getDepositBallance: {
        useQuery: vi.fn(() => ({ data: { deposit: 100 } })),
      },
      onDepositChange: {
        useSubscription: vi.fn(),
      },
    },
    deposit: {
      createDeposit: {
        useMutation: vi.fn(() => ({
          mutateAsync,
        })),
      },
    },
  },
}));

describe("DepositBalance component", () => {
  test("renders the balance value correctly", () => {
    render(<DepositBalance />);
    expect(screen.getByText(/Ballance:/)).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
  });
  test("open modal", async () => {
    render(<DepositBalance />);
    expect(screen.getByTestId('deposit-modal').classList.contains('hidden')).toBeTruthy()
    const button = screen.getByRole('button', {
      name: /\+/i,
      hidden: true
    })
    expect(button).toBeInTheDocument();
    act(() => {
      fireEvent.click(button)
    })
    await waitFor(() => {
      expect(screen.getByTestId('deposit-modal').classList.contains('hidden')).toBeFalsy()
    })
    act(() => {
      fireEvent.input(screen.getByTestId('deposit-input'), {target: {value: '100'}})
      fireEvent.click(screen.getByTestId('deposit-submit'))
    })
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        amount: 100
      })
    })
    await waitFor(() => {
      expect(screen.getByTestId('deposit-modal').classList.contains('hidden')).toBeTruthy()
    })
  });
});
