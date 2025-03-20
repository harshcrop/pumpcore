"use client";

import { useParams, useRouter } from "next/navigation";
import { useReadContract, useWriteContract } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  Activity,
  Users,
  Clock,
  Share2,
  ArrowLeft,
  ArrowUpRight,
  Info,
  Copy,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import PUMP_FACTORY_ABI from "@/config/PUMP_FACTORY_ABI.json";
import { CONTRACT_ADDRESSES } from "@/config/contracts";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/app/header";

const IPFS_GATEWAY = "https://amber-static-chameleon-729.mypinata.cloud/ipfs/";

export default function CoinDetails() {
  const params = useParams();
  const router = useRouter();
  const tokenAddress = params.address;
  const [buyAmount, setBuyAmount] = useState("");
  const [sellAmount, setSellAmount] = useState("");
  const [estimatedBuyPrice, setEstimatedBuyPrice] = useState(0);
  const [estimatedSellPrice, setEstimatedSellPrice] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [bondingProgress, setBondingProgress] = useState(0);
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

  // Inside your component
  const { data: priceHistory } = useReadContract({
    address: CONTRACT_ADDRESSES.pumpFactory,
    abi: PUMP_FACTORY_ABI,
    functionName: "getPriceHistory",
    args: [tokenAddress],
  });

  useEffect(() => {
    if (allTokens) {
      const ipfsUri = allTokens[3]; // imageURI is at index 3
      if (ipfsUri) {
        const hash = ipfsUri.replace("ipfs://", "");
        setImageUrl(`${IPFS_GATEWAY}${hash}`);
      }
    }
  }, [allTokens]);

  const { writeContractAsync } = useWriteContract();

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

  useEffect(() => {
    if (parsedTokenInfo) {
      const maxSupply = parsedTokenInfo.supply * 2;
      const progress = (parsedTokenInfo.supply / maxSupply) * 100;
      setBondingProgress(progress);
    }
  }, [parsedTokenInfo]);

  useEffect(() => {
    if (parsedTokenInfo && buyAmount) {
      const amount = Number.parseFloat(buyAmount);
      if (!isNaN(amount)) {
        const priceImpact = amount * 0.01;
        setEstimatedBuyPrice(parsedTokenInfo.price * (1 + priceImpact));
      }
    }
  }, [buyAmount, parsedTokenInfo]);

  useEffect(() => {
    if (parsedTokenInfo && sellAmount) {
      const amount = Number.parseFloat(sellAmount);
      if (!isNaN(amount)) {
        const priceImpact = amount * 0.01;
        setEstimatedSellPrice(parsedTokenInfo.price * (1 - priceImpact));
      }
    }
  }, [sellAmount, parsedTokenInfo]);

  const handleBuy = async () => {
    if (!buyAmount || !parsedTokenInfo) return;

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.pumpFactory,
        abi: PUMP_FACTORY_ABI,
        functionName: "buyToken",
        args: [tokenAddress],
        value: parseUnits(buyAmount, 18),
      });
      setBuyAmount("");
    } catch (error) {
      console.error("Buy failed:", error);
    }
  };

  const handleSell = async () => {
    if (!sellAmount || !parsedTokenInfo) return;

    try {
      await writeContractAsync({
        address: CONTRACT_ADDRESSES.pumpFactory,
        abi: PUMP_FACTORY_ABI,
        functionName: "sell",
        args: [tokenAddress, parseUnits(sellAmount, 18)],
      });
      setSellAmount("");
    } catch (error) {
      console.error("Sell failed:", error);
    }
  };

  if (!parsedTokenInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(
      Date.now() - (29 - i) * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
    price: parsedTokenInfo.price * (1 + Math.sin(i / 5) * 0.1),
  }));

  const bondingCurveData = Array.from({ length: 20 }, (_, i) => {
    const supply = parsedTokenInfo.supply * (i / 10);
    const price =
      (parsedTokenInfo.reserve * Math.sqrt(supply)) / parsedTokenInfo.supply;
    return { supply, price };
  });

  const holdersData = [
    {
      address: "0x1234...5678",
      balance: parsedTokenInfo.supply * 0.25,
      percentage: 25,
      lastTransaction: "2 hours ago",
    },
    {
      address: "0xabcd...efgh",
      balance: parsedTokenInfo.supply * 0.15,
      percentage: 15,
      lastTransaction: "1 day ago",
    },
    {
      address: "0x9876...5432",
      balance: parsedTokenInfo.supply * 0.1,
      percentage: 10,
      lastTransaction: "3 days ago",
    },
    {
      address: "0xijkl...mnop",
      balance: parsedTokenInfo.supply * 0.08,
      percentage: 8,
      lastTransaction: "1 week ago",
    },
    {
      address: "0xqrst...uvwx",
      balance: parsedTokenInfo.supply * 0.05,
      percentage: 5,
      lastTransaction: "2 weeks ago",
    },
  ];

  // Process the data
  const priceHistoryData =
    priceHistory?.map((point) => {
      const date = point[0]
        ? new Date(Number(point[0]) * 1000).toLocaleDateString()
        : "N/A";
      const price = point[1] ? parseFloat(formatUnits(point[1], 18)) : 0; // Convert from wei
      return { date, price };
    }) || [];

  // Format price display
  const priceFormatter = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 6,
    }).format(value);

  // Format date display on XAxis
  const dateFormatter = (timestamp) => new Date(timestamp).toLocaleDateString();

  return (
    <div>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
        <Button
          variant="ghost"
          className="flex items-center gap-2 hover:bg-background/60"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Coins
        </Button>
        <div className="mx-auto px-4 py-8 space-y-8">
          <div>
            <div className="flex items-center gap-4">
              <div className="relative w-[100] h-[100] rounded-full overflow-hidden ">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`${parsedTokenInfo.name} logo`}
                  className="object-cover rounded-full"
                  width={100}
                  height={100}
                />
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <Badge
                  variant="outline"
                  className="text-lg px-3 py-1 font-semibold"
                >
                  {parsedTokenInfo.symbol}
                </Badge>
                <div className="ml-auto flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => navigator.clipboard.writeText(tokenAddress)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-muted-foreground">Created by</p>
                <Badge variant="secondary" className="font-mono">
                  {parsedTokenInfo.creator.slice(0, 6)}...
                  {parsedTokenInfo.creator.slice(-4)}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <p className="text-muted-foreground">
                  {parsedTokenInfo.createdAt}
                </p>
              </div>
            </div>

            <div className="flex gap-6 md:grid-cols-3 mt-6 max-h-[180px]">
              <Card className="bg-card/50 backdrop-blur border-primary/10 mt-4 mb-4">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Current Price</p>
                  <p className="text-3xl font-bold">
                    {formatUnits(parsedTokenInfo.price.toFixed(6), 18)}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 bg-green-500/10 text-green-500 border-green-500/20"
                  >
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    +5.2% 24h
                  </Badge>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur border-primary/10 mt-4 mb-4">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Market Cap</p>
                  <p className="text-3xl font-bold">
                    $
                    {(
                      parsedTokenInfo.price * parsedTokenInfo.supply
                    ).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur border-primary/10 mt-4 mb-4">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Total Supply</p>
                  <p className="text-3xl font-bold">
                    {parsedTokenInfo.supply.toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 backdrop-blur border-primary/10 mt-4 mb-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Bonding Curve Progress</CardTitle>
                    <TooltipProvider>
                      <UITooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">
                            The bonding curve determines token price based on
                            supply. As more tokens are purchased, the price
                            increases according to the curve formula.
                          </p>
                        </TooltipContent>
                      </UITooltip>
                    </TooltipProvider>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Current Supply
                      </span>
                      <span>
                        {parsedTokenInfo.supply.toLocaleString()}{" "}
                        {parsedTokenInfo.symbol}
                      </span>
                    </div>
                    <Progress value={bondingProgress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>Max Supply</span>
                    </div>
                  </div>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={bondingCurveData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted))"
                        />
                        <XAxis
                          dataKey="supply"
                          stroke="hsl(var(--muted-foreground))"
                          label={{
                            value: "Supply",
                            position: "insideBottom",
                            offset: -5,
                          }}
                        />
                        <YAxis
                          stroke="hsl(var(--muted-foreground))"
                          label={{
                            value: "Price",
                            angle: -90,
                            position: "insideLeft",
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem",
                          }}
                          formatter={(value) => [
                            `$${value.toFixed(6)}`,
                            "Price",
                          ]}
                          labelFormatter={(value) =>
                            `Supply: ${Number(value).toLocaleString()}`
                          }
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--primary))"
                          dot={false}
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-3 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle>Price Chart</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height={400}>
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="colorPrice"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0.8}
                          />
                          <stop
                            offset="95%"
                            stopColor="hsl(var(--primary))"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>

                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--muted))"
                        opacity={0.5}
                      />

                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={dateFormatter}
                        tickLine={false}
                        axisLine={false}
                        dy={10}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />

                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        tickFormatter={(value) => `$${value.toFixed(4)}`}
                        tickLine={false}
                        axisLine={false}
                        dx={-10}
                        tick={{
                          fill: "hsl(var(--muted-foreground))",
                          fontSize: 12,
                        }}
                      />

                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          borderColor: "hsl(var(--border))",
                          borderRadius: "0.5rem",
                          padding: "12px",
                          boxShadow:
                            "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                        }}
                        formatter={(value) => [
                          priceFormatter(Number(value)),
                          "Price",
                        ]}
                        labelFormatter={(label) =>
                          dateFormatter(label.toString())
                        }
                        cursor={{
                          stroke: "hsl(var(--primary))",
                          strokeWidth: 1,
                          strokeDasharray: "4 4",
                        }}
                      />

                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        dot={false}
                        activeDot={{
                          r: 4,
                          fill: "hsl(var(--primary))",
                          stroke: "hsl(var(--background))",
                          strokeWidth: 2,
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

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
                      <Label htmlFor="buyAmount">Amount (TCORE)</Label>
                      <Input
                        id="buyAmount"
                        type="number"
                        placeholder="0.0"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(e.target.value)}
                      />
                    </div>
                    {buyAmount && (
                      <div className="p-3 bg-muted/50 rounded-md backdrop-blur">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Estimated Price:
                          </span>
                          <span>
                            {formatUnits(estimatedBuyPrice.toFixed(6), 18)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            Price Impact:
                          </span>
                          <span className="text-green-500">+1.2%</span>
                        </div>
                      </div>
                    )}
                    <Button className="w-full" onClick={handleBuy}>
                      Buy {parsedTokenInfo.symbol}
                    </Button>
                  </TabsContent>
                  <TabsContent value="sell" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="sellAmount">
                        Amount ({parsedTokenInfo.symbol})
                      </Label>
                      <Input
                        id="sellAmount"
                        type="number"
                        placeholder="0.0"
                        value={sellAmount}
                        onChange={(e) => setSellAmount(e.target.value)}
                      />
                    </div>
                    {sellAmount && (
                      <div className="p-3 bg-muted/50 rounded-md backdrop-blur">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Estimated Price:
                          </span>
                          <span>
                            {formatUnits(estimatedBuyPrice.toFixed(6), 18)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-muted-foreground">
                            Price Impact:
                          </span>
                          <span className="text-red-500">-1.2%</span>
                        </div>
                      </div>
                    )}
                    <Button
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                      variant="destructive"
                      onClick={handleSell}
                    >
                      Sell {parsedTokenInfo.symbol}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-6 mt-4">
            <TabsList className="bg-muted/50 backdrop-blur">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="holders">Holders</TabsTrigger>
              <TabsTrigger value="transactions">Transactions</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Holders</p>
                        <p className="text-2xl font-bold">
                          {parsedTokenInfo.holderCount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Activity className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Volume
                        </p>
                        <p className="text-2xl font-bold">
                          $
                          {(
                            parsedTokenInfo.totalBuyVolume +
                            parsedTokenInfo.totalSellVolume
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-full bg-primary/10">
                        <Clock className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-2xl font-bold">
                          {parsedTokenInfo.createdAt}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Token Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Token Address
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">
                            {tokenAddress.slice(0, 6)}...
                            {tokenAddress.slice(-4)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() =>
                              navigator.clipboard.writeText(tokenAddress)
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Creator</span>
                        <span className="font-mono">
                          {parsedTokenInfo.creator.slice(0, 6)}...
                          {parsedTokenInfo.creator.slice(-4)}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Creation Date
                        </span>
                        <span>{parsedTokenInfo.createdAt}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">
                          Total Supply
                        </span>
                        <span>
                          {parsedTokenInfo.supply.toLocaleString()}{" "}
                          {parsedTokenInfo.symbol}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Reserve</span>
                        <span>
                          {parsedTokenInfo.reserve.toLocaleString()} ETH
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">K Value</span>
                        <span>{parsedTokenInfo.k}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Trading Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-muted/50 rounded-lg p-4 backdrop-blur">
                      <p className="text-sm text-muted-foreground">
                        Buy Volume
                      </p>
                      <p className="text-2xl font-bold">
                        ${parsedTokenInfo.totalBuyVolume.toLocaleString()}
                      </p>
                      <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${
                              (parsedTokenInfo.totalBuyVolume /
                                (parsedTokenInfo.totalBuyVolume +
                                  parsedTokenInfo.totalSellVolume)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-4 backdrop-blur">
                      <p className="text-sm text-muted-foreground">
                        Sell Volume
                      </p>
                      <p className="text-2xl font-bold">
                        ${parsedTokenInfo.totalSellVolume.toLocaleString()}
                      </p>
                      <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-red-500"
                          style={{
                            width: `${
                              (parsedTokenInfo.totalSellVolume /
                                (parsedTokenInfo.totalBuyVolume +
                                  parsedTokenInfo.totalSellVolume)) *
                              100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--muted))"
                        />
                        <XAxis
                          dataKey="date"
                          stroke="hsl(var(--muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="price"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="holders" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Top Holders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Address</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Percentage</TableHead>
                        <TableHead className="hidden md:table-cell">
                          Last Transaction
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {holdersData.map((holder, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-mono">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <Image
                                  src={`/placeholder.svg?height=24&width=24`}
                                  alt="Avatar"
                                  width={24}
                                  height={24}
                                />
                              </Avatar>
                              {holder.address}
                            </div>
                          </TableCell>
                          <TableCell>
                            {holder.balance.toLocaleString()}{" "}
                            {parsedTokenInfo.symbol}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span>{holder.percentage}%</span>
                              <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${holder.percentage}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {holder.lastTransaction}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <Card className="bg-card/50 backdrop-blur">
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="hidden md:table-cell">
                          From
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Time
                        </TableHead>
                        <TableHead className="text-right">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-green-500/10 text-green-500 border-green-500/20"
                          >
                            Buy
                          </Badge>
                        </TableCell>
                        <TableCell>1,250 {parsedTokenInfo.symbol}</TableCell>
                        <TableCell>
                          ${parsedTokenInfo.price.toFixed(6)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono">
                          0x1234...5678
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          2 hours ago
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-red-500/10 text-red-500 border-red-500/20"
                          >
                            Sell
                          </Badge>
                        </TableCell>
                        <TableCell>750 {parsedTokenInfo.symbol}</TableCell>
                        <TableCell>
                          ${(parsedTokenInfo.price * 0.98).toFixed(6)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono">
                          0xabcd...efgh
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          5 hours ago
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
