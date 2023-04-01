import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import Layout from "~/components/Layout";
import { useRouter } from "next/router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { TbLoader2 } from "react-icons/tb";

const validationSchema = z.object({
  email: z.string().min(1, { message: "email is required" }).email(),
  password: z.string().min(1, { message: "password is required" }),
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
  const { push, query } = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      void push("/");
    }
  }, [push, status]);

  const onSubmit: SubmitHandler<ValidationSchema> = async (data) => {
    const res = await signIn("credentials", { ...data, redirect: false });
    if (!res?.ok) {
      reset({
        password: "",
      });
      setError("email", {
        type: "validate",
        message: "Email or Password doesnt match",
      });
    } else {
      // need to hard reload for ws
      location.href = "/";
    }
  };

  return (
    <Layout title={"AuctionHive - Signin"}>
      <h1 className="mb-8 text-3xl font-bold">Login to your Account</h1>
      {query.signup ? (
        <div
          className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800"
          role="alert"
        >
          <span className="font-medium">You have successfully signed up!</span> To access your account, please login using the credentials you just created.
        </div>
      ) : null}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label data-invalid={errors.email} className="form-label mb-2 block">
            Your email
          </label>
          <input
            {...register("email")}
            data-invalid={errors.email}
            type="email"
            id="email"
            className="form-input block w-full"
            placeholder="name@mail.com"
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
          <label className="form-label mb-2 block text-sm">Your password</label>
          <input
            {...register("password")}
            type="password"
            id="password"
            className="form-input block w-full"
            required
            data-testid="input-password"
          />
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
