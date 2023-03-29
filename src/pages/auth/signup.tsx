import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import { processZodErrors } from "~/utils/transform";

const validationSchema = z.object({
  name: z.string().min(1, { message: "name is required"}).min(3),
  email: z.string().min(1, { message: "email is required"}).email(),
  password: z.string().min(1, { message: "password is required"}).min(8),
});

type ValidationSchema = z.infer<typeof validationSchema>;

export default function SignIn() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ValidationSchema>({
    resolver: zodResolver(validationSchema),
  });
  const { status } = useSession();
  const { push } = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      void push("/");
    }
  }, [push, status]);

  const createUser = api.user.createUser.useMutation();

  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    try {
      const res = await createUser.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      reset();
      if (res.success) {
        await push("/");
      }
    } catch (e) {
      if (createUser.error?.data?.zodError) {
        processZodErrors(createUser.error?.data?.zodError, setError)
      }
      console.error(e);
    }
  };

  return (
    <Layout title={"AuctionHive - Signout"}>
      <h1 className="mb-8 text-3xl font-bold">Register your Account</h1>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label data-invalid={errors.name} className="form-label mb-2 block">
            Your Name
          </label>
          <input
            {...register("name")}
            data-invalid={errors.name}
            type="text"
            id="name"
            min="3"
            className="form-input block w-full"
            placeholder="Jhon"
            required
            data-testid="input-name"
          />
          {errors.name ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.name?.message}
            </p>
          ) : null}
        </div>
        <div className="mb-6">
          <label className="form-label mb-2 block" data-invalid={errors.email}>
            Your email
          </label>
          <input
            {...register("email")}
            data-invalid={errors.email}
            type="email"
            id="email"
            className="form-input block w-full"
            placeholder="name@flowbite.com"
            required
            data-testid="input-email"
          />
          {errors.email ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.email?.message}
            </p>
          ) : null}
        </div>
        <div className="mb-6">
          <label
            className="form-label mb-2 block"
            data-invalid={errors.password}
          >
            Your password
          </label>
          <input
            {...register("password")}
            data-invalid={errors.password}
            type="password"
            id="password"
            className="form-input block w-full"
            required
            data-testid="input-password"
          />
          {errors.password ? (
            <p className="mt-2 text-sm text-red-600 dark:text-red-500">
              {errors.password?.message}
            </p>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn btn-primary mb-4 block w-full"
          data-testid="btn-submit"
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
      </form>
    </Layout>
  );
}
