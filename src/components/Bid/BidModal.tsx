import React from "react";
import ReactDOM from "react-dom";
import { useForm, type SubmitHandler } from "react-hook-form";
import { api } from "~/utils/api";
import { TbLoader2, TbX } from "react-icons/tb";
import { z } from "zod";
import { processZodErrors } from "~/utils/transform";
import { zodResolver } from "@hookform/resolvers/zod";
import { TRPCClientError } from "@trpc/client";

type BidModalProps = {
  auctionId: string;
  currentPrice: number;
  setModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const validationSchema = z.object({
  amount: z.number().gt(0, { message: "Starting Price must be larger than 0" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

function BidModal(props: BidModalProps) {
  const { auctionId, currentPrice, setModalOpen } = props;
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

  const createBid = api.bid.createBid.useMutation();

  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    try {
      await createBid.mutateAsync({
        amount: data.amount,
        auctionId: auctionId,
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
        data-testid={`auction-bid-modal-${auctionId}`}
        id={`auction-bid-modal-${auctionId}`}
        tabIndex={-1}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
      >
        <div className="relative h-full w-full max-w-2xl md:h-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="relative rounded-lg bg-white shadow">
              <div className="flex items-start justify-between rounded-t border-b p-4">
                <h3 className="text-xl font-semibold text-gray-900">Add Bid</h3>
                <button
                  onClick={closeModal}
                  type="button"
                  className="ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 "
                >
                  <TbX />
                </button>
              </div>
              <div className="space-y-6 p-6">
                <div className="txt-md text-gray-600">
                  Auction current price:{" "}
                  <span className="txt-bold">${currentPrice}</span>
                </div>
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
                    min={currentPrice}
                    className="form-input block w-full"
                    required
                    data-testid="bid-input"
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
                  data-testid="bid-submit"
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
            </div>
          </form>
        </div>
      </div>
      <div className="fixed inset-0 z-40 bg-black opacity-25"></div>
    </>
  );
}

const BidModalPortal = (props: BidModalProps) =>
  ReactDOM.createPortal(<BidModal {...props} />, document.body);

export default BidModalPortal;
