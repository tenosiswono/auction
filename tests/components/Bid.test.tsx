import { describe, expect, vi } from "vitest";
import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import BidButton from "~/components/Bid/BidButton";

const mutateAsync = vi.fn();

vi.mock("~/utils/api", () => ({
  api: {
    bid: {
      createBid: {
        useMutation: vi.fn(() => ({
          mutateAsync,
        })),
      },
    },
  },
}));

describe("Bid component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
  });
  // render normal state
  it("renders normal state", () => {
    render(<BidButton currentPrice={100} auctionId={"abc"} />);
    expect(screen.getByTestId("bid-button-timer")).toHaveTextContent("Bid");
  });
  // render 5s cooldown
  it("renders countdown 5 secs", () => {
    const date = new Date(2000, 1, 1, 13, 0, 0);
    const updatedDate = new Date(2000, 1, 1, 13, 0, 0);
    vi.setSystemTime(date);
    render(
      <BidButton currentPrice={100} auctionId={"abc"} updatedAt={updatedDate} />
    );
    expect(screen.getByTestId("bid-button-timer")).toHaveTextContent("5s");
    expect(screen.getByTestId("bid-button-timer")).toBeDisabled();
    act(() => {
      // advance by 900ms should show 4s
      vi.advanceTimersByTime(900);
      vi.runOnlyPendingTimers();
    });
    expect(screen.getByTestId("bid-button-timer")).toHaveTextContent("4s");
    expect(screen.getByTestId("bid-button-timer")).toBeDisabled();
    act(() => {
      // advance by 4s to complete timer
      vi.advanceTimersByTime(4000);
      vi.runOnlyPendingTimers();
    });
    expect(screen.getByTestId("bid-button-timer")).toHaveTextContent("Bid");
    expect(screen.getByTestId("bid-button-timer")).not.toBeDisabled();
  });
  // check button action on bid
  it("check button action on bid", async () => {
    vi.useRealTimers();
    render(<BidButton currentPrice={100} auctionId={"abc"} />);
    expect(screen.getByTestId("bid-button-timer")).toHaveTextContent("Bid");
    fireEvent.click(screen.getByTestId("bid-button-timer"));
    expect(screen.getByTestId("auction-bid-modal-abc")).toBeInTheDocument();
    fireEvent.input(screen.getByTestId("bid-input"), {
      target: { value: 1000 },
    });
    fireEvent.click(screen.getByTestId("bid-submit"));
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        amount: 1000,
        auctionId: "abc",
      });
    });
  });
});
