import { useWriteContract } from "wagmi";
import { CONTRACT_ADDRESSES } from "../config/contracts";
import PumpABI from "../config/PUMP_FACTORY_ABI.json"

export function useCreateToken() {
  console.log("useCreateToken Hook Initialized");

  const { writeContract } = useWriteContract();
  console.log("writeContract from Wagmi:", writeContract);

  if (!writeContract) {
    console.error("writeContract is undefined! Check Wagmi setup.");
    return {};
  }

  const createToken = async (name: string, symbol: string, k: bigint) => {
    console.log("Calling writeContract with:", { name, symbol, k });

    return writeContract({
      address: CONTRACT_ADDRESSES.pumpFactory,
      abi: PumpABI,
      functionName: "createToken",
      args: [name, symbol, k],
    });
  };

  console.log("createToken Function Available:", typeof createToken);

  return {
    createToken,
  };
}
