import { type NextPage } from "next";
import Layout from "~/components/Layout";
import { useForm, type SubmitHandler } from "react-hook-form";
import Auth from "~/components/Auth";
import { compress } from "image-conversion";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { processZodErrors } from "~/utils/transform";

const validationSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  duration: z
    .number()
    .gte(1, { message: "Duration must be larger or equal than 1" }),
  startingPrice: z
    .number()
    .gt(0, { message: "Starting Price must be larger than 0" }),
  image: z.string().min(1, { message: "Image is required" }),
});

type ValidationSchema = z.infer<typeof validationSchema>;

const MAX_SIZE = 2 * 1024 * 1024;

const New: NextPage = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    watch,
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });
  const { push } = useRouter();

  const imageFile: string = watch("image");
  const createAuction = api.auction.createAuction.useMutation();
  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    try {
      const res = await createAuction.mutateAsync({
        ...data,
      });
      reset();
      if (res.success) {
        await push("/auctions/me?status=draft");
      }
    } catch (e) {
      if (createAuction.error?.data?.zodError) {
        processZodErrors(createAuction.error?.data?.zodError, setError)
      }
      console.error(e);
    }
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (file) {
      if (file.size > MAX_SIZE) {
        setError("image", {
          type: "validate",
          message: "File Larger than 2MB",
        });
      } else {
        const compressedFile = await compress(file, 0.7);
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result?.toString() ?? "";
          setValue("image", base64);
        };
        reader.readAsDataURL(compressedFile);
      }
    } else {
    }
  };

  return (
    <Auth>
      <Layout title={"AuctionHive - Create Auction"}>
        <h1 className="mb-8 text-3xl font-bold">Create your Item Auction</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label
              data-invalid={errors.title}
              className="form-label mb-2 block"
            >
              Title
            </label>
            <input
              {...register("title")}
              data-invalid={errors.title}
              type="text"
              id="title"
              className="form-input block w-full"
              required
              data-testid="input-title"
            />
            {errors.title ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.title?.message}
              </p>
            ) : null}
          </div>
          <div className="mb-6">
            <label
              data-invalid={errors.duration}
              className="form-label mb-2 block"
            >
              Duration (hours)
            </label>
            <input
              {...register("duration", {
                setValueAs: (val: string) => parseFloat(val),
              })}
              data-invalid={errors.duration}
              type="number"
              id="duration"
              className="form-input block w-full"
              required
              data-testid="input-duration"
            />
            {errors.duration ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.duration?.message}
              </p>
            ) : null}
          </div>
          <div className="mb-6">
            <label
              data-invalid={errors.startingPrice}
              className="form-label mb-2 block"
            >
              Starting price (USD)
            </label>
            <input
              {...register("startingPrice", {
                setValueAs: (val: string) => {
                  return parseFloat(val)
                },
              })}
              step="any"
              data-invalid={errors.startingPrice}
              type="number"
              id="startingPrice"
              className="form-input block w-full"
              required
              data-testid="input-starting-price"
            />
            {errors.startingPrice ? (
              <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                {errors.startingPrice?.message}
              </p>
            ) : null}
          </div>
          <div className="mb-6">
            <label
              data-invalid={errors.image}
              className="form-label mb-2 block"
            >
              Image
            </label>
            <div className="flex">
              <label
                htmlFor="dropzone-file"
                className="flex h-64 w-64 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100"
                style={{
                  backgroundSize: "contain",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center",
                  backgroundImage: `url(${imageFile})`,
                }}
              >
                {!imageFile ? (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      aria-hidden="true"
                      className="mb-3 h-10 w-10 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      SVG, PNG, JPG or GIF
                    </p>
                    <p className="text-xs text-gray-500">
                      (MAX. 800x400px, {MAX_SIZE} MB)
                    </p>
                  </div>
                ) : null}
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
                {errors.image ? (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-500">
                    {errors.image?.message}
                  </p>
                ) : null}
              </label>
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary mb-4 block w-full"
            data-testid="btn-submit"
          >
            {isSubmitting ? (
              <svg
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
        </form>
      </Layout>
    </Auth>
  );
};

export default New;
