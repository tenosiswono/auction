import { useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { TbHammer } from "react-icons/tb";

export default function Layout({
  children,
  title,
  description,
}: {
  children: React.ReactNode;
  title: string;
  description: string;
}) {
  const { data: sessionData, status } = useSession();
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <button
          data-drawer-target="sidebar-multi-level-sidebar"
          data-drawer-toggle="sidebar-multi-level-sidebar"
          aria-controls="sidebar-multi-level-sidebar"
          type="button"
          className="mt-2 ml-3 inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200  md:hidden"
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="h-6 w-6"
            aria-hidden="true"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              clip-rule="evenodd"
              fill-rule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
            ></path>
          </svg>
        </button>

        <aside
          id="sidebar-multi-level-sidebar"
          className="fixed top-0 left-0 z-40 h-screen w-64 -translate-x-full transition-transform sm:translate-x-0"
          aria-label="Sidebar"
        >
          <div className="flex h-full flex-col overflow-y-auto bg-orange-50 p-4">
            <ul className="space-y-4 font-medium">
              <li className="mb-8 flex justify-center">
                <Image
                  src="/logo.png"
                  width={150}
                  height={94}
                  alt="AuctionHive"
                />
              </li>
              <li>
                <a
                  href="#"
                  className="flex items-center rounded-lg p-2 text-gray-800 hover:bg-orange-100"
                >
                  <TbHammer size={24} />
                  <span className="ml-3">Auctions</span>
                </a>
              </li>
              {status !== "authenticated" ? (
                <li>
                  <div className="flex flex-row">
                    <Link
                      href="/auth/signup"
                      className="mr-4 flex-1 btn btn-primary"
                    >
                      Signup
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="flex-1 rounded-lg btn btn-secondary"
                    >
                      Signin
                    </Link>
                  </div>
                </li>
              ) : (
                <li></li>
              )}
            </ul>
            <div className="flex-1"></div>
            <div className="text-sm text-gray-600">
              <div>@{new Date().getFullYear()} AuctionHive LLC</div>
              <div>
                Design inspired by{" "}
                <a
                  href="https://www.behance.net/gallery/150684529/ClickBids-A-new-way-of-winning-in-11-clicks"
                  target="_blank"
                  className="font-bold"
                >
                  Flatstudio
                </a>
              </div>
            </div>
          </div>
        </aside>
        <div className="p-20 sm:ml-64">{children}</div>
      </main>
    </>
  );
}
