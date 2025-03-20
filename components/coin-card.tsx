"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { useRouter } from "next/navigation";
import PUMP_FACTORY_ABI from "@/config/PUMP_FACTORY_ABI.json";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { useState, useEffect } from "react";

interface CoinProps {
  tokenAddress: `0x${string}`;
}

const IPFS_GATEWAY = "https://amber-static-chameleon-729.mypinata.cloud/ipfs/";

export default function CoinCard({ tokenAddress }: CoinProps) {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const router = useRouter();

  // Get price info for this specific token
  const { data: priceInfo } = useReadContract({
    address: CONTRACT_ADDRESSES.pumpFactory,
    abi: PUMP_FACTORY_ABI,
    functionName: "tokens",
    args: [tokenAddress],
  });

  const { data: allTokens } = useReadContract({
    address: CONTRACT_ADDRESSES.pumpFactory,
    abi: PUMP_FACTORY_ABI,
    functionName: "getTokenData",
    args: [tokenAddress],
  });

  useEffect(() => {
    if (priceInfo && allTokens) {
      const ipfsUri = allTokens[3]; // imageURI is at index 3
      if (ipfsUri) {
        const hash = ipfsUri.replace("ipfs://", "");
        setImageUrl(`${IPFS_GATEWAY}${hash}`);
      }

      setLoading(false);
    }
  }, [priceInfo, allTokens]);

  // Parse token info
  const parsedTokenInfo = priceInfo
    ? {
        tokenAddress: tokenAddress,
        creator: priceInfo[1],
        name: priceInfo[2],
        symbol: priceInfo[3],
        supply: Number(formatUnits(priceInfo[4], 18)),
        reserve: Number(formatUnits(priceInfo[5], 18)),
        k: Number(priceInfo[6]),
        createdAt: new Date(Number(priceInfo[7]) * 1000).toLocaleDateString(),
        totalBuyVolume: Number(formatUnits(priceInfo[8], 18)),
        totalSellVolume: Number(formatUnits(priceInfo[9], 18)),
        holderCount: Number(priceInfo[10]),
        price:
          Number(formatUnits(priceInfo[5], 18)) /
          Number(formatUnits(priceInfo[4], 18)),
      }
    : null;

  const handleClick = () => {
    router.push(`/coin/${tokenAddress}`);
  };

  if (loading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <div className="aspect-video bg-muted" />
        <CardContent className="p-4 space-y-2">
          <div className="h-4 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!parsedTokenInfo) return null;

  return (
    <Card
      className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer"
      onClick={handleClick}
    >
      <CardHeader className="p-0">
        <div className="aspect-video relative bg-muted">
          <Image
            src={imageUrl || "/placeholder.svg"}
            alt={`${parsedTokenInfo.name} logo`}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h2 className="text-xl font-bold">
          {parsedTokenInfo.name} ({parsedTokenInfo.symbol})
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Created by {parsedTokenInfo.creator.slice(0, 6)}...
          {parsedTokenInfo.creator.slice(-4)} • {parsedTokenInfo.createdAt}
        </p>

        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="font-mono">
              {formatUnits(
                BigInt(parsedTokenInfo.price.toFixed(6).replace(".", "")),
                18
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Market Cap</span>
            <span className="font-mono">
              $
              {(
                parsedTokenInfo.price * parsedTokenInfo.supply
              ).toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Holders</span>
            <span className="font-mono">
              {parsedTokenInfo.holderCount.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
