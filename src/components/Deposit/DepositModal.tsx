import React from "react";
import ReactDOM from "react-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";
import { TbLoader2, TbX } from "react-icons/tb";
import { z } from "zod";
import { processZodErrors } from "~/utils/transform";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";

const validationSchema = z.object({
  amount: z.number().gt(0, { message: "Starting Price must be larger than 0" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

type DepositModalProps = {
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function DepositModal(props: DepositModalProps) {
  const { setModalOpen } = props;
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });

  const closeModal = () => {
    setModalOpen(false);
  };

  const createDeposit = api.deposit.createDeposit.useMutation();

  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    try {
      await createDeposit.mutateAsync({
        ...data,
      });
      reset();
      closeModal();
    } catch (e) {
      if (e instanceof TRPCClientError) {
        processZodErrors(e, setError)
      }
    }
  };
  return (
    <>
      <div
        data-testid="deposit-modal"
        id="depositModal"
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
      >
        <div className="relative h-full w-full max-w-2xl md:h-auto">
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
            <form onSubmit={handleSubmit(onSubmit)}>
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
                      setValueAs: (val: string) => parseFloat(val),
                    })}
                    data-invalid={errors.amount}
                    type="number"
                    id="amount"
                    step="any"
                    className="form-input block w-full"
                    required
                    data-testid="deposit-input"
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
                  data-testid="deposit-submit"
                >
                  {isSubmitting ? (
                    <TbLoader2 className="mr-3 inline h-4 w-4 animate-spin text-white" />
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
            </form>
          </div>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  );
}

const DepositModalPortal = (props: DepositModalProps) =>
  ReactDOM.createPortal(<DepositModal {...props} />, document.body);

export default DepositModalPortal;
