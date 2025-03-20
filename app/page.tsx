"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, TrendingUp, Plus } from "lucide-react";
import { useAccount } from "wagmi";
import CoinCard from "@/components/coin-card";
import CreateCoinModal from "@/components/create-coin-modal";
import HowItWorksModal from "@/components/how-it-works-modal";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { useReadContract } from "wagmi";
import PUMP_FACTORY_ABI from "../config/PUMP_FACTORY_ABI.json";

// Sample data for tags
const tags = ["trending", "trump", "dog", "mascot", "ai", "meme"];

export default function Home() {
  const { isConnected, address } = useAccount();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isHowItWorksModalOpen, setIsHowItWorksModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allTokens } = useReadContract({
    address: CONTRACT_ADDRESSES.pumpFactory,
    abi: PUMP_FACTORY_ABI,
    functionName: "getAllTokens",
  });

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Create New Coin Section */}
        <div className="mb-12 text-center">
          <h1 className="mb-8 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-blue-500">
            [start a new coin]
          </h1>
          <div className="flex max-w-md mx-auto gap-2">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="search for token"
                className="bg-gray-900 border-gray-700 h-12 pl-4 pr-10 rounded-lg w-full text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
            </div>
            <Button className="h-12 bg-orange-500 hover:bg-orange-600 text-black font-medium px-6">
              search
            </Button>
          </div>
        </div>

        {/* Trending Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-orange-400" />
              <h2 className="text-xl font-bold">now trending</h2>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">show animations:</span>
                <Badge
                  variant="outline"
                  className="bg-orange-500/20 text-orange-400 border-orange-500"
                >
                  on
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">include nsfw:</span>
                <Badge
                  variant="outline"
                  className="bg-gray-800 text-gray-400 border-gray-700"
                >
                  off
                </Badge>
              </div>
            </div>
          </div>

          {/* Trending Coins Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {allTokens?.map((tokenAddress) => (
              <CoinCard key={tokenAddress} tokenAddress={tokenAddress} />
            ))}
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-gray-900 border-orange-500 text-orange-400"
            >
              sort: featured
              <span className="ml-2 text-xs">▼</span>
            </Button>
          </div>

          <Tabs defaultValue="trending" className="w-auto">
            <TabsList className="bg-gray-900 p-1">
              {tags.map((tag) => (
                <TabsTrigger
                  key={tag}
                  value={tag}
                  className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                >
                  {tag === "trending" && (
                    <TrendingUp className="mr-1 h-3 w-3" />
                  )}
                  {tag}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* More Coins Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allTokens?.map((tokenAddress) => (
            <CoinCard key={tokenAddress} tokenAddress={tokenAddress} />
          ))}
        </div>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8">
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-orange-500 hover:bg-orange-600 text-black"
          onClick={() => setIsCreateModalOpen(true)}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* How It Works Button */}
      <Button
        variant="link"
        className="fixed bottom-8 left-8 text-gray-400 hover:text-white"
        onClick={() => setIsHowItWorksModalOpen(true)}
      >
        how it works
      </Button>

      {/* Modals */}
      <CreateCoinModal
        isOpen={isCreateModalOpen}
        setIsOpen={setIsCreateModalOpen}
      />
      <HowItWorksModal
        isOpen={isHowItWorksModalOpen}
        setIsOpen={setIsHowItWorksModalOpen}
      />
    </div>
  );
}
