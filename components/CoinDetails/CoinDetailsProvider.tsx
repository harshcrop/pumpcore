"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";

import PUMP_FACTORY_ABI from "@/config/PUMP_FACTORY_ABI.json";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

const IPFS_GATEWAY = "https://amber-static-chameleon-729.mypinata.cloud/ipfs/";

export interface TokenInfo {
  tokenAddress: string;
  creator: string;
  name: string;
  symbol: string;
  supply: number;
  reserve: number;
  k: number;
  createdAt: string;
  totalBuyVolume: number;
  totalSellVolume: number;
  holderCount: number;
  price: number;
  imageUrl: string;
}

export function useCoinDetails() {
  const params = useParams();
  const tokenAddress = params.address as string;
  const [imageUrl, setImageUrl] = useState("");

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
    if (allTokens) {
      const ipfsUri = allTokens[3];
      if (ipfsUri) {
        const hash = ipfsUri.replace("ipfs://", "");
        setImageUrl(`${IPFS_GATEWAY}${hash}`);
      }
    }
  }, [allTokens]);

  const parsedTokenInfo: TokenInfo | null = priceInfo
    ? {
        tokenAddress,
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
        imageUrl,
      }
    : null;

  return { parsedTokenInfo, tokenAddress };
}
