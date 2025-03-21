"use client";

import React, { useState, useEffect } from "react";
import {
  useAccount,
  useChainId,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConnectKitButton } from "connectkit";
import PUMP_FACTORY_ABI from "../config/PUMP_FACTORY_ABI.json";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import { parseEther } from "viem";

// Pinata API keys - in a real app, these should be environment variables
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_API_KEY;

export default function CreateCoinModal({ isOpen, setIsOpen }) {
  const { isConnected, address } = useAccount();
  const chainId = useChainId();

  // Use writeContract hook without calling it immediately
  const {
    data: hash,
    writeContractAsync,
    isPending,
    isError,
    error,
  } = useWriteContract();

  const { isLoading, isSuccess } = useWaitForTransactionReceipt({
    hash,
    enabled: !!hash,
  });

  const [formData, setFormData] = useState({
    name: "",
    ticker: "",
    kValue: "1000",
    description: "",
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [ipfsHash, setIpfsHash] = useState(null);

  // Reset form errors when transaction-related states change
  useEffect(() => {
    if (isError && error) {
      setErrors({ submit: error.message });
    }
  }, [isError, error]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Coin name is required";
    if (!formData.ticker.trim()) newErrors.ticker = "Ticker symbol is required";
    if (
      !formData.kValue.trim() ||
      isNaN(Number(formData.kValue)) ||
      Number(formData.kValue) <= 0 ||
      Number(formData.kValue) > 1000
    ) {
      newErrors.kValue = "Must be a positive number between 1 and 1000";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image must be less than 5MB" });
        return;
      }
      setPreviewUrl(URL.createObjectURL(file));
      setFormData({ ...formData, image: file });
      // Reset IPFS hash when new image is selected
      setIpfsHash(null);
    }
  };

  const uploadToPinata = async () => {
    if (!formData.image) return null;

    setUploadStatus("Uploading to IPFS...");

    try {
      // Create form data for Pinata
      const data = new FormData();
      data.append("file", formData.image);

      // Metadata for the file
      const metadata = JSON.stringify({
        name: `${formData.name} Token Image`,
        keyvalues: {
          tokenName: formData.name,
          tokenSymbol: formData.ticker,
        },
      });
      data.append("pinataMetadata", metadata);

      // Pinning options
      const options = JSON.stringify({
        cidVersion: 0,
      });
      data.append("pinataOptions", options);

      // Upload to Pinata using their API
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            pinata_api_key: PINATA_API_KEY,
            pinata_secret_api_key: PINATA_SECRET_API_KEY,
          },
          body: data,
        }
      );

      const responseData = await res.json();
      console.log("Pinata response:", responseData);

      if (!responseData.IpfsHash) {
        throw new Error("Failed to get IPFS hash from Pinata");
      }

      const ipfsUrl = `ipfs://${responseData.IpfsHash}`;
      setIpfsHash(ipfsUrl);
      setUploadStatus("Upload complete!");
      return ipfsUrl;
    } catch (error) {
      console.error("Error uploading to Pinata:", error);
      setUploadStatus("Upload failed!");
      setErrors({
        ...errors,
        image: "Failed to upload image: " + error.message,
      });
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || !isConnected) return;

    if (chainId !== 1115) {
      setErrors({
        submit: "Please switch to Core DAO Testnet (Chain ID 1115)",
      });
      return;
    }

    try {
      // Upload image to IPFS first if we have one
      let imageUri = null;
      if (formData.image && !ipfsHash) {
        imageUri = await uploadToPinata();
        if (!imageUri) {
          setErrors({ submit: "Failed to upload image. Please try again." });
          return;
        }
      } else if (ipfsHash) {
        imageUri = ipfsHash;
      }

      // Value to send for initial liquidity (0.01 ETH)
      const value = parseEther("0.01");

      console.log("Submitting transaction with args:", [
        formData.name,
        formData.ticker,
        formData.description || "",
        imageUri || "",
        BigInt(formData.kValue),
      ]);

      // Call the contract with the updated parameters including description and image URI
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESSES.pumpFactory,
        abi: PUMP_FACTORY_ABI,
        functionName: "createToken",
        args: [
          formData.name,
          formData.ticker,
          formData.description || "", // Pass description
          imageUri || "", // Pass IPFS image URI
          BigInt(formData.kValue),
        ],
        value: value, // Send initial deposit value for liquidity
      });

      console.log("Transaction submitted! Hash:", txHash);
    } catch (error) {
      console.error("Transaction failed:", error);
      setErrors({ submit: error.message || "Transaction failed" });
    }
  };

  const handleUploadClick = async (e) => {
    e.preventDefault();
    if (!formData.image) {
      setErrors({ ...errors, image: "Please select an image first" });
      return;
    }
    await uploadToPinata();
  };

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: "",
        ticker: "",
        kValue: "1000",
        description: "",
        image: null,
      });
      setErrors({});
      setPreviewUrl(null);
      setUploadStatus(null);
      setIpfsHash(null);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-center">
            Create New Coin
          </DialogTitle>
        </DialogHeader>

        {!isConnected ? (
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-500" />
            <h3>Wallet Connection Required</h3>
            <div className="flex justify-center mt-4">
              <ConnectKitButton />
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.submit && (
              <Alert className="bg-red-900/20 border-red-800 text-red-400">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errors.submit}</AlertDescription>
              </Alert>
            )}

            <div>
              <Label>Coin Name</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name}</p>
              )}
            </div>

            <div>
              <Label>Ticker Symbol</Label>
              <Input
                value={formData.ticker}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ticker: e.target.value.toUpperCase(),
                  })
                }
              />
              {errors.ticker && (
                <p className="text-red-400 text-sm">{errors.ticker}</p>
              )}
            </div>

            <div>
              <Label>Bonding Curve Factor (k)</Label>
              <Input
                type="number"
                value={formData.kValue}
                onChange={(e) =>
                  setFormData({ ...formData, kValue: e.target.value })
                }
              />
              {errors.kValue && (
                <p className="text-red-400 text-sm">{errors.kValue}</p>
              )}
            </div>

            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={formData.description}
                className="text-black"
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div>
              <Label>Coin Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {errors.image && (
                <p className="text-red-400 text-sm">{errors.image}</p>
              )}

              {previewUrl && (
                <div className="mt-2 flex items-center gap-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover"
                  />

                  {!ipfsHash && (
                    <Button
                      onClick={handleUploadClick}
                      variant="secondary"
                      size="sm"
                      disabled={uploadStatus === "Uploading to IPFS..."}
                    >
                      {uploadStatus === "Uploading to IPFS..." ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        "Upload to IPFS"
                      )}
                    </Button>
                  )}
                </div>
              )}

              {uploadStatus && (
                <p
                  className={`text-sm mt-1 ${
                    ipfsHash
                      ? "text-green-400"
                      : uploadStatus.includes("failed")
                      ? "text-red-400"
                      : "text-yellow-400"
                  }`}
                >
                  {uploadStatus}
                </p>
              )}

              {ipfsHash && (
                <p className="text-green-400 text-xs mt-1 break-all">
                  IPFS: {ipfsHash}
                </p>
              )}
            </div>

            <Alert className="bg-blue-900/20 border-blue-800 text-blue-400">
              <AlertDescription>
                Creating a token requires a 0.01 TCORE initial deposit to set up
                liquidity
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isLoading}
            >
              {isPending || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Create Coin"
              )}
            </Button>

            {isLoading && (
              <p className="text-yellow-400 text-center">
                Transaction Pending...
              </p>
            )}

            {isSuccess && (
              <Alert className="bg-green-900/20 border-green-800 text-green-400">
                <AlertTitle>Success!</AlertTitle>
                <AlertDescription>
                  Your token has been created successfully.
                </AlertDescription>
              </Alert>
            )}
          </form>
        )}

        {hash && (
          <div className="mt-4 pt-4 border-t border-gray-800">
            <p className="text-sm text-gray-400">Transaction Hash:</p>
            <p className="text-xs break-all">{hash}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
