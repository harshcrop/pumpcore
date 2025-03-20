"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TokenInfo } from "./CoinDetailsProvider";

interface PriceChartProps {
  tokenInfo: TokenInfo;
}

export default function PriceChart({ tokenInfo }: PriceChartProps) {
  const chartData = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(
      Date.now() - (29 - i) * 24 * 60 * 60 * 1000
    ).toLocaleDateString(),
    price: tokenInfo.price * (1 + Math.sin(i / 5) * 0.1),
  }));

  const priceFormatter = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 6,
    }).format(value);

  const dateFormatter = (timestamp: string) =>
    new Date(timestamp).toLocaleDateString();

  return (
    <Card className="lg:col-span-2 bg-card/50 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle>Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
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

              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />

              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={dateFormatter}
              />

              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickFormatter={(value) => `$${value.toFixed(4)}`}
              />

              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  borderColor: "hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
                formatter={(value) => [priceFormatter(Number(value)), "Price"]}
              />

              <Area
                type="monotone"
                dataKey="price"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorPrice)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
