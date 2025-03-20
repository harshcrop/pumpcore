"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { TokenInfo } from "./CoinDetailsProvider";

interface CoinDetailsHeaderProps {
  tokenInfo: TokenInfo;
}

export default function CoinDetailsHeader({
  tokenInfo,
}: CoinDetailsHeaderProps) {
  const router = useRouter();

  return (
    <div>
      <Button
        variant="ghost"
        className="flex items-center gap-2 hover:bg-background/60"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Coins
      </Button>

      <div className="flex items-center gap-4">
        <div className="relative w-[100] h-[100] rounded-full overflow-hidden">
          <Image
            src={tokenInfo.imageUrl || "/placeholder.svg"}
            alt={`${tokenInfo.name} logo`}
            className="object-cover rounded-full"
            width={100}
            height={100}
          />
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80">
            {tokenInfo.name}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className="text-lg px-3 py-1 font-semibold">
            {tokenInfo.symbol}
          </Badge>
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                navigator.clipboard.writeText(tokenInfo.tokenAddress)
              }
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
