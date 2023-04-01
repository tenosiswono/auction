import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Signup from "~/pages/auth/signup";
import { describe, expect, vi } from "vitest";

const mutateAsync = vi.fn(() => ({ success: true }));
const push = vi.fn()

vi.mock("next/router", () => ({
  useRouter: () => ({
    push,
  }),
}));
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
  useSession: () => ({
    data: null,
    status: "loading",
    error: null,
  }),
}));
vi.mock("~/utils/api", () => ({
  api: {
    user: {
      getDepositBallance: {
        useQuery: vi.fn(() => ({ data: { deposit: 100 } })),
      },
      onDepositChange: {
        useSubscription: vi.fn(),
      },
      createUser: {
        useMutation: vi.fn(() => ({
          mutateAsync,
        })),
      },
    },
    deposit: {
      createDeposit: {
        useMutation: vi.fn(() => ({
          mutateAsync: vi.fn(),
        })),
      },
    },
  },
}));
describe("Home", () => {
  it("renders the title and description", () => {
    render(<Signup />);
    expect(
      screen.getByRole("heading", {
        name: /register your account/i,
      })
    ).toBeInTheDocument();
  });
  it("Submit signup", async () => {
    render(<Signup />);
    act(() => {
      fireEvent.input(screen.getByTestId("input-name"), {
        target: { value: "name" },
      });
      fireEvent.input(screen.getByTestId("input-email"), {
        target: { value: "email@email.com" },
      });
      fireEvent.input(screen.getByTestId("input-password"), {
        target: { value: "password" },
      });
      fireEvent.click(screen.getByTestId("btn-submit"));
    });
    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        email: "email@email.com",
        name: "name",
        password: "password",
      });
      expect(push).toHaveBeenCalledWith('/auth/signin?signup=true')
    });
  });
});
