"use client";
import Image from "next/image";
import React from "react";
import { signIn } from "@/lib/auth-client";
import { auth } from "@/lib/auth";

type Props = {};

export default function LoginTab({}: Props) {
  return (
    <div className="bg-white  p-8 w-80 flex flex-col items-center gap-6">
      <h2 className="text-2xl font-semibold text-gray-800">Get Started</h2>
      <button
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
        aria-label="Sign in with Google"
        onClick={() =>
          signIn.social({
            provider: "google",
            callbackURL: "http://localhost:3000",
            errorCallbackURL: "http://localhost:3000",
          })
        }
      >
        <Image
          src="/svg/google_icon.svg"
          alt="Google Logo"
          width={20}
          height={20}
        />{" "}
        {/* More descriptive than Badge */}
        <span className="text-gray-700 font-medium">Continue with Google</span>
      </button>
    </div>
  );
}
