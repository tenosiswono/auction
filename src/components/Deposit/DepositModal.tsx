import React from "react";
import ReactDOM from "react-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";
import { modal } from "./modal";
import { TbX } from "react-icons/tb";

type Inputs = {
  amount: string;
};

function DepositModal() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<Inputs>();

  const closeModal = async () => {
    await import('./modal').then(m => m.modal.hide())
  }

  const createDeposit = api.deposit.createDeposit.useMutation();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    try {
      await createDeposit.mutateAsync({
        amount: parseInt(data.amount, 10),
        status: "credit",
      });
      reset();
      await closeModal();
    } catch (e) {
      if (createDeposit.error?.data?.zodError) {
        if (createDeposit.error.data.zodError.fieldErrors.amount) {
          createDeposit.error.data.zodError.fieldErrors.amount.forEach(
            (err) => {
              setError("amount", { type: "validate", message: err });
            }
          );
        }
      }
      console.error(e);
    }
  };
  return (
    <div
      id="depositModal"
      tabIndex={-1}
      className="fixed top-0 left-0 right-0 z-50 hidden h-[calc(100%-1rem)] w-full overflow-y-auto overflow-x-hidden p-4 md:inset-0 md:h-full"
    >
      <div className="relative h-full w-full max-w-2xl md:h-auto">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="relative rounded-lg bg-white shadow">
            <div className="flex items-start justify-between rounded-t border-b p-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Add deposit
              </h3>
              <button
                onClick={closeModal}
                type="button"
                className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 "
              >
                <TbX />
              </button>
            </div>
            <div className="space-y-6 p-6">
              <div className="mb-6">
                <label
                  className="form-label mb-2 block"
                  data-invalid={errors.amount}
                >
                  Amount
                </label>
                <input
                  {...register("amount", {
                    required: "You must specify an amount",
                  })}
                  data-invalid={errors.amount}
                  type="number"
                  id="amount"
                  className="form-input block w-full"
                  required
                />
                {errors.amount ? (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    {errors.amount?.message}
                  </p>
                ) : null}
              </div>
            </div>
            <div className="flex items-center space-x-2 rounded-b border-t border-gray-200 p-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary"
              >
                {isSubmitting ? (
                  <svg
                    aria-hidden="true"
                    role="status"
                    className="mr-3 inline h-4 w-4 animate-spin text-white"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="#E5E7EB"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentColor"
                    />
                  </svg>
                ) : null}
                Submit
              </button>
              <button
                disabled={isSubmitting}
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const DepositModalPortal = () =>
  ReactDOM.createPortal(<DepositModal />, document.body);

export default DepositModalPortal;
