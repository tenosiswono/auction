import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { signIn, useSession } from "next-auth/react";
import Layout from "~/components/Layout/Layout";
import Link from "next/link";
import router from "next/router";

type Inputs = {
  email: string;
  password: string;
};

export default function SignIn() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Inputs>();
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      void router.push("/");
    }
  }, [status]);

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await signIn("credentials", { ...data, callbackUrl: "/"});
    reset();
  };

  return (
    <Layout title={"Auction"} description={"Auction"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-white">
            Your email
          </label>
          <input
            {...register("email", { required: true })}
            type="email"
            id="email"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
            placeholder="name@flowbite.com"
            required
          />
        </div>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-white">
            Your password
          </label>
          <input
            {...register("password", { required: true })}
            type="password"
            id="password"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
            required
          />
        </div>
        <button
          type="submit"
          className="mb-4 block w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
        >
          Submit
        </button>
        <Link href="/auth/signup">
          <button className="mr-2 mb-2 block w-full rounded-lg border border-gray-200 bg-white py-2.5 px-5 text-sm font-medium text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:outline-none focus:ring-4 focus:ring-gray-200">
            Register
          </button>
        </Link>
      </form>
    </Layout>
  );
}
