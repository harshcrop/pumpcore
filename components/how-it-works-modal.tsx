"use client";

import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface HowItWorksModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export default function HowItWorksModal({
  isOpen,
  setIsOpen,
}: HowItWorksModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-center mb-4">
            how it works
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          ></Button>
        </DialogHeader>
        <div className="space-y-6">
          <p className="text-center text-sm">
            pump allows anyone to create coins. all coins created on Pump are
            <span className="text-orange-400"> fair-launch</span>, meaning
            everyone has equal access to buy and sell when the coin is first
            created.
          </p>

          <div className="space-y-4">
            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium text-orange-400">step 1:</span>{" "}
                pick a coin that you like
              </p>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium text-orange-400">step 2:</span> buy
                the coin on the bonding curve
              </p>
            </div>

            <div className="bg-gray-800 p-3 rounded-lg">
              <p className="text-sm">
                <span className="font-medium text-orange-400">step 3:</span>{" "}
                sell at any time to lock in your profits or losses
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400">
            by clicking this button you agree to the terms and conditions and
            certify that you are over 18
          </p>

          <Button className="w-full bg-orange-500 hover:bg-orange-600 text-black font-medium">
            I'm ready to pump
          </Button>

          <div className="flex justify-center space-x-4 text-xs text-gray-400">
            <a href="#" className="hover:text-white">
              privacy policy
            </a>
            <span>|</span>
            <a href="#" className="hover:text-white">
              terms of service
            </a>
            <span>|</span>
            <a href="#" className="hover:text-white">
              fees
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
