import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import Signin from '~/pages/auth/signin';
import { describe, expect, vi } from "vitest";
import { signIn } from 'next-auth/react'


vi.mock("next/router", () => ({
  useRouter: () => ({
    push: vi.fn(),
    query: {}
  }),
}));
vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
  useSession: () => ({
    data: null,
    status: "loading",
    error: null,
  }),
  signIn: vi.fn(() => ({ ok: true}))
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
describe('Home', () => {
  it('renders the title and description', () => {
    render(<Signin />);
    expect(screen.getByRole('heading', {
      name: /login to your account/i
    })).toBeInTheDocument()
  });
  it('Submit signin', async () => {
    render(<Signin />);
    act(() => {
      fireEvent.input(screen.getByTestId('input-email'), { target: { value: 'email@email.com'}})
      fireEvent.input(screen.getByTestId('input-password'), { target: { value: 'password'}})
      fireEvent.click(screen.getByTestId('btn-submit'))
    })
    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('credentials', { email: 'email@email.com', password: 'password', redirect: false})
    })
  });
});
