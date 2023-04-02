import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import {
  TbHammer,
  TbHandStop,
  TbPigMoney,
  TbBookmarks,
  TbLogout,
} from "react-icons/tb";
import DepositBallance from "../Deposit/DepositBallance";
import { useRouter } from "next/router";

export default function Layout({
  children,
  title = "AuctionHive",
  description = "Bee the highest bidder with AuctionHive.",
}: {
  children: React.ReactNode;
  title?: string;
  description?: string;
}) {
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const onSignout = async () => {
    await signOut();
  };
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
          type="button"
          onClick={() => setOpen(!open)}
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
              clipRule="evenodd"
              fillRule="evenodd"
              d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"
            ></path>
          </svg>
        </button>
        {open ? <div onClick={() => setOpen(false)} className="bg-gray-900 bg-opacity-50 fixed inset-0 z-30"></div> : null}
        <aside
          id="sidebar-multi-level-sidebar"
          data-open={open}
          className="fixed top-0 left-0 z-40 h-screen w-72 -translate-x-full transition-transform data-[open=false]:-translate-x-full data-[open=true]:transform-none sm:translate-x-0"
          aria-label="Sidebar"
        >
          <div className="flex h-full flex-col overflow-y-auto bg-orange-50 p-4">
            <ul className="space-y-2 font-medium">
              <li className="mb-8 ">
                <Link
                  href="/"
                  className="flex flex-col items-center justify-center"
                >
                  <Image
                    src="/logo.png"
                    width={72}
                    height={72}
                    alt="AuctionHive"
                  />

                  <h1 className="mt-4 text-3xl font-extrabold leading-none tracking-tight text-gray-800">
                    Auction<span className="text-orange-400">Hive</span>
                  </h1>
                </Link>
              </li>
              <li>
                <Link
                  href="/auctions"
                  data-active={router.pathname === "/auctions"}
                  className="nav-item"
                >
                  <TbHammer size={24} />
                  <span className="ml-3">Auctions</span>
                </Link>
              </li>
              {status !== "authenticated" ? (
                <li>
                  <div className="flex flex-row">
                    <Link
                      href="/auth/signup"
                      className="btn btn-primary mr-4 flex-1"
                    >
                      Signup
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="btn btn-secondary flex-1 rounded-lg"
                    >
                      Signin
                    </Link>
                  </div>
                </li>
              ) : (
                <>
                  <li>
                    <Link
                      href="/auctions/bid"
                      data-active={router.pathname === "/auctions/bid"}
                      className="nav-item"
                    >
                      <TbBookmarks size={24} />
                      <span className="ml-3">Bidded Auctions</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auctions/me"
                      data-active={router.pathname === "/auctions/me"}
                      className="nav-item"
                    >
                      <TbHandStop size={24} />
                      <span className="ml-3">My Auctions</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/auctions/new"
                      data-active={router.pathname === "/auctions/new"}
                      className="btn btn-primary block"
                    >
                      Start a new auction
                    </Link>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <hr className="border-1 mr-4 w-full border-gray-400" />
                      <div className="text-centerm text-sm font-bold text-gray-400">
                        ACCOUNT
                      </div>
                      <hr className="border-1 ml-4 w-full border-gray-400" />
                    </div>
                  </li>
                  <DepositBallance />
                  <li>
                    <a href="#" className="nav-item">
                      <Image
                        className="h-6 w-6 rounded-full"
                        width={24}
                        height={24}
                        src={
                          sessionData.user.image || "/img/default-avatar.webp"
                        }
                        alt={sessionData.user.email || "avatar"}
                      />
                      <span className="ml-3 flex-1">My Profile</span>
                    </a>
                  </li>
                  <li>
                    <Link
                      href="/deposits"
                      data-active={router.pathname === "/deposits"}
                      className="nav-item"
                    >
                      <TbPigMoney size={24} />
                      <span className="ml-3">Deposit Histories</span>
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={onSignout}
                      className="flex w-full items-center rounded-lg p-2 text-gray-800 hover:bg-orange-100"
                    >
                      <TbLogout size={24} />
                      <span className="ml-3">Signout</span>
                    </button>
                  </li>
                </>
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
        <div className="main-container min-h-screen bg-slate-50 p-12 sm:ml-64 md:p-20">
          {children}
        </div>
      </main>
    </>
  );
}
