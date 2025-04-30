import { useState, useEffect } from "react";
import { ethers } from "ethers";

const FAUCET_ADDRESS = "0x4df2953897D9f973766a5daaBfAaE24B2DcC6977";
const faucetAbi = [
  "function claimTokenx() external",
  "function claimTokeny() external",
];

export default function Faucet() {
  const [account, setAccount] = useState(null);
  const [loadingX, setLoadingX] = useState(false);
  const [loadingY, setLoadingY] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts.length > 0) setAccount(accounts[0]);
        })
        .catch((err) => console.error("Error fetching accounts:", err));

      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });

      window.ethereum.on("chainChanged", () => window.location.reload());
    } else {
      setErrorMessage("🦊 MetaMask not found. Go install it, chief.");
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) return setErrorMessage("Install MetaMask to proceed.");
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } catch (err) {
      console.error("Wallet connection failed:", err);
      setErrorMessage("Wallet connection failed.");
    }
  };

  const claim = async (type) => {
    if (!account) return alert("Yo, connect your wallet first!");

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const faucet = new ethers.Contract(FAUCET_ADDRESS, faucetAbi, signer);

      type === "x" ? setLoadingX(true) : setLoadingY(true);

      const tx =
        type === "x"
          ? await faucet.claimTokenx()
          : await faucet.claimTokeny();

      await tx.wait();
      setTxHash(tx.hash);
    } catch (err) {
      console.error("Claim failed:", err);
      setErrorMessage(err?.reason || err?.message || "Something broke.");
    } finally {
      setLoadingX(false);
      setLoadingY(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-8 w-full max-w-md flex flex-col items-center">
        <h1 className="text-2xl font-extrabold mb-6 text-black uppercase tracking-wider">
          🧃 Dual Token Faucet
        </h1>

        {errorMessage && (
          <div className="mb-4 text-red-600 font-bold text-center">
            {errorMessage}
          </div>
        )}

        {!account ? (
          <button
            onClick={connectWallet}
            className="w-full bg-[#9966ff] hover:bg-[#b08aff] text-white font-bold py-3 px-6 rounded-none border-2 border-black transition"
          >
            Connect Wallet
          </button>
        ) : (
          <>
            <div className="mb-4 text-gray-700 font-mono text-sm break-words text-center">
              Connected: {account.substring(0, 6)}...{account.slice(-4)}
            </div>

            <button
              onClick={() => claim("x")}
              disabled={loadingX}
              className={`w-full mb-3 ${
                loadingX ? "bg-gray-400 cursor-not-allowed" : "bg-green-400 hover:bg-green-500"
              } text-black font-bold py-3 px-6 rounded-none border-2 border-black transition`}
            >
              {loadingX ? "Claiming Token X..." : "Claim Token X"}
            </button>

            <button
              onClick={() => claim("y")}
              disabled={loadingY}
              className={`w-full ${
                loadingY ? "bg-gray-400 cursor-not-allowed" : "bg-blue-400 hover:bg-blue-500"
              } text-black font-bold py-3 px-6 rounded-none border-2 border-black transition`}
            >
              {loadingY ? "Claiming Token Y..." : "Claim Token Y"}
            </button>

            {txHash && (
              <div className="text-blue-700 font-mono text-xs mt-4 text-center">
                <a
                  href={`https://etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  View Transaction
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
