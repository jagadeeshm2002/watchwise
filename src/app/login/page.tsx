import Image from "next/image";
import React from "react";
import LoginTab from "@/components/login/loginTab";
import { Card, CardContent } from "@/components/ui/card";

type Props = {};

function Page({}: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="flex flex-col gap-6 w-full max-w-5xl">
        <Card className="overflow-hidden p-0 w-full">
          <CardContent className="flex flex-col md:flex-row p-0 w-full h-full">
            
            {/* Left side form */}
            <div className="flex w-full md:w-1/2 justify-center items-center p-6 md:p-10">
              <LoginTab />
            </div>

            {/* Right side image (hidden on mobile) */}
            <div className="relative hidden md:block w-full md:w-1/2 h-64 md:h-auto">
              <Image
                src="/images/login_left.png"
                alt="Login illustration"
                width={600}
                height={600}
                className="object-cover dark:brightness-[0.2] aspect-square dark:grayscale"
                priority
              />
            </div>
          </CardContent>
        </Card>

        {/* Footer text */}
        <div className="text-center text-xs text-pretty text-gray-500 [&>a]:underline [&>a]:underline-offset-4 [&>a:hover]:text-blue-600">
          By clicking continue, you agree to our{" "}
          <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}

export default Page;
