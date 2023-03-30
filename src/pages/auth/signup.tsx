import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";
import Layout from "~/components/Layout";
import { api } from "~/utils/api";
import { processZodErrors } from "~/utils/transform";
import { TbLoader2 } from "react-icons/tb";
import { TRPCClientError } from "@trpc/client";

const validationSchema = z.object({
  name: z.string().min(1, { message: "name is required" }).min(3),
  email: z.string().min(1, { message: "email is required" }).email(),
  password: z.string().min(1, { message: "password is required" }).min(8),
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

  console.log(errors.email);
  const createUser = api.user.createUser.useMutation();

  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    try {
      const res = await createUser.mutateAsync({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      if (res.success) {
        await push("/");
      }
      reset();
    } catch (e) {
      if (e instanceof TRPCClientError) {
        processZodErrors(e, setError)
      }
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
            <TbLoader2 className="mr-3 inline h-4 w-4 animate-spin text-white" />
          ) : null}
          Submit
        </button>
      </form>
    </Layout>
  );
}
