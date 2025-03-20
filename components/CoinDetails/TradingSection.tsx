"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { TokenInfo } from "./CoinDetailsProvider";
import { useWriteContract } from "wagmi";
import { parseUnits } from "viem";
import PUMP_FACTORY_ABI from "@/config/PUMP_FACTORY_ABI.json";
import { CONTRACT_ADDRESSES } from "@/config/contracts";

interface TradingSectionProps {
  tokenInfo: TokenInfo;
}

export default function TradingSection({ tokenInfo }: TradingSectionProps) {
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [estimatedBuyPrice, setEstimatedBuyPrice] = useState(0);
  const [estimatedSellPrice, setEstimatedSellPrice] = useState(0);

  const { writeContractAsync } = useWriteContract();

  const handleBuyPriceEstimate = (amount: string) => {
    const parsedAmount = Number.parseFloat(amount);
    if (!isNaN(parsedAmount)) {
      const priceImpact = parsedAmount * 0.01;
      setEstimatedBuyPrice(tokenInfo.price * (1 + priceImpact));
    }
  };

  const handleSellPriceEstimate = (amount: string) => {
    const parsedAmount = Number.parseFloat(amount);
    if (!isNaN(parsedAmount)) {
      const priceImpact = parsedAmount * 0.01;
      setEstimatedSellPrice(tokenInfo.price * (1 - priceImpact));
    }
  };

  const handleBuy = async () => {
    if (!buyAmount) return;

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.pumpFactory,
        abi: PUMP_FACTORY_ABI,
        functionName: "buyToken",
        args: [tokenInfo.tokenAddress],
        value: parseUnits(buyAmount, 18),
      });
      setBuyAmount("");
    } catch (error) {
      console.error("Buy failed:", error);
    }
  };

  const handleSell = async () => {
    if (!sellAmount) return;

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.pumpFactory,
        abi: PUMP_FACTORY_ABI,
        functionName: "sell",
        args: [tokenInfo.tokenAddress, parseUnits(sellAmount, 18)],
      });
      setSellAmount("");
    } catch (error) {
      console.error("Sell failed:", error);
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle>Trade</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="buy" className="space-y-4">
          <TabsList className="flex justify-evenly">
            <TabsTrigger value="buy">Buy</TabsTrigger>
            <TabsTrigger value="sell">Sell</TabsTrigger>
          </TabsList>
          <TabsContent value="buy" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buyAmount">Amount (ETH)</Label>
              <Input
                id="buyAmount"
                type="number"
                placeholder="0.0"
                value={buyAmount}
                onChange={(e) => {
                  setBuyAmount(e.target.value);
                  handleBuyPriceEstimate(e.target.value);
                }}
              />
            </div>
            {buyAmount && (
              <div className="p-3 bg-muted/50 rounded-md backdrop-blur">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Estimated Price:
                  </span>
                  <span>${estimatedBuyPrice.toFixed(6)}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-muted-foreground">Price Impact:</span>
                  <span className="text-green-500">+1.2%</span>
                </div>
              </div>
            )}
            <Button className="w-full" onClick={handleBuy}>
              Buy {tokenInfo.symbol}
            </Button>
          </TabsContent>
          {/* Sell tab similar to buy tab */}
        </Tabs>
      </CardContent>
    </Card>
  );
}
