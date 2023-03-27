import { useSession } from "next-auth/react";
import router from "next/router";
import React, { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import Layout from "~/components/Layout/Layout";
import { api } from "~/utils/api";

type Inputs = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
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
  
  const createUser = api.user.createUser.useMutation()

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    await createUser.mutateAsync({
      name: data.name,
      email: data.email,
      password: data.password,
    })
    reset();
  };

  return (
    <Layout title={"Auction"} description={"Auction"}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-white">
            Your Name
          </label>
          <input
            {...register("name", { required: true, minLength: 3 })}
            type="text"
            id="name"
            min="3"
            className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 "
            placeholder="Jhon"
            required
          />
        </div>
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
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-white">
            Confirm password
          </label>
          <input
            {...register("confirmPassword", { required: true })}
            type="password"
            id="confirm-password"
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
      </form>
    </Layout>
  );
}
