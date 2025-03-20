"use client";

import Link from "next/link";
import WalletConnectButton from "@/components/wallet-connect-button";

export default function Header() {
  return (
    <header className="border-b border-gray-800 p-4 bg-black text-white">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/"
            className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-500"
          >
            pump.core
          </Link>
          <span className="text-xs text-gray-400">
            <span className="text-orange-400">94zkGz</span> sold 0.3198 CORE
          </span>
          <span className="text-xs text-gray-400">market cap: $3.7K</span>
          <span className="text-xs text-gray-400">replies: 2</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-xs text-gray-400">
            <span className="text-cyan-400">FaceOu</span> created MTO 🔥 on
            03/18/25
          </span>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
