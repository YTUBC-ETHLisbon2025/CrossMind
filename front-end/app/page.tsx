"use client";
import { ExternalProvider } from "@ethersproject/providers";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

declare global {
  interface Window {
    ethereum?: ExternalProvider;
  }
}

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 50;
      setScrolled(isScrolled);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchWalletAddress = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/agent/get-wallet-address');
        const data = await response.json();
        setWalletAddress(data.walletAddress);
      } catch (error) {
        console.error('Error fetching wallet address:', error);
      }
    };

    fetchWalletAddress();
  }, []);

  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <main className="min-h-screen text-black w-full">
        <div className="container max-w-5xl mx-auto flex justify-between items-center pt-4  sticky top-0 z-50 bg-[#f3f3f2] ">
          <div className="flex justify-center items-center gap-5 rounded-t-3xl py-4 px-6 !m-0 relative">
            <div className={`absolute inset-0 bg-[#9ceea0] rounded-t-3xl transition-all duration-400 ease-in-out pb-10 ${
              scrolled ? "-translate-y-[-100%] opacity-0" : "translate-y-0 opacity-100"
            }`}></div>
            <div className="relative z-10 flex items-center gap-5">
              <Image src="/assets/gnosis.png" width={20} height={20} alt="logo" />
              <h1 className="text-xl font-bold text-black">
                CrossMind
              </h1>
            </div>
          </div>
          <div className="flex justify-center items-center gap-6">
            <button className="hover:text-[#2b4bbf] transition-colors">
              Github
            </button>
            <button className="hover:text-[#2b4bbf] transition-colors">
              Docs
            </button>
            {walletAddress ? (
              <div className="rounded-full px-6 py-2 text-white bg-[#2b4bbf]">
                {formatWalletAddress(walletAddress)}
              </div>
            ) : (
              <div className="rounded-full px-6 py-2 text-white bg-[#2b4bbf] animate-pulse">
                Loading...
              </div>
            )}
          </div>
        </div>

        {/* Hero */}
        <section className="w-full text-center px-6 relative overflow-hidden">
          <div className="max-w-5xl mx-auto bg-[#9ceea0] rounded-b-3xl rounded-tr-3xl py-20 px-10 relative">
            <div
              className={`absolute top-0 left-0 w-full h-[72px] bg-[#9ceea0] rounded-t-3xl transition-all duration-500 ${
                scrolled ? "translate-y-[-100%]" : "translate-y-0"
              }`}
            ></div>
            <h1 className="text-6xl font-bold text-[#f3f3f2] mb-6">
              1 AI ChatBot, 
              <span className="text-[#2b4bbf]">all web3</span>
            </h1>
            <p className="text-xl text-gray-700 mb-12 max-w-2xl mx-auto">
            Perform onchain operations simply by chatting with an AI!
            </p>
            <div className="flex justify-center gap-8">
              <Link
                href="/chat"
                className=" bg-[#2b4bbf] font-semibold text-white py-3 px-8 rounded-3xl transition-all duration-300 hover:bg-[#2745b0]"
              >
                Go To App
              </Link>
              <button className="bg-white border-white rounded-3xl font-semibold py-3 px-6 transition-all duration-300 hover:text-[#2b4bbf] ">
                See the Docs
              </button>
            </div>
          </div>
        </section>

        

        {/* Features */}
        <section className="px-6 py-20 text-center">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              What is <span className="text-[#2b4bbf]">CrossMind</span>?
            </h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-gray-700 text-lg leading-relaxed">
                Crossmind is an AI agent that enables users —especially blockchain newcomers— to perform complex onchain and crosschain operations simply by chatting with an AI.
                <br /><br />
                The agent abstracts away blockchain UX complexity, allowing users to interact with blockchains and bridge assets between them, all through natural language.
              </p>
            </div>
          </div>
        </section>
              {/* Animated Chat Example */}
              <section className="px-6 pb-10 text-center">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Take a <span className="text-[#2b4bbf]">Look</span>
            </h2>
            <div className="bg-white rounded-3xl p-8 shadow-lg max-w-2xl mx-auto">
              <div className="space-y-4 text-left">
                {/* First message */}
                <div className="flex justify-end">
                <div className=" bg-[#2b4bbf] whitespace-pre-wrap leading-relaxed text-sm shadow-md  text-white px-4 py-3 rounded-2xl max-w-[75%] opacity-0 animate-fade-in [animation-delay:3000ms]">
                    What&apos;s the best yield today?
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                <div className="whitespace-pre-wrap leading-relaxed text-sm shadow-md  text-black px-4 py-3 rounded-2xl max-w-[75%] opacity-0 animate-fade-in [animation-delay:3000ms]">
                    Based on current market conditions, Aave&apos;s USDC pool on Gnosis Chain offers the best yield at 4.2% APY. Would you like me to show you how to deposit?
                  </div>
                </div>

                {/* User follow-up */}
                <div className="flex justify-end">
                <div className="whitespace-pre-wrap bg-[#2b4bbf] leading-relaxed text-sm shadow-md px-4 py-3 rounded-2xl max-w-[75%] opacity-0 text-white animate-fade-in [animation-delay:3000ms]">
                    Yes, please show me the steps.
                  </div>
                </div>

                {/* Final AI Response */}
                <div className="flex justify-start">
                  <div className="whitespace-pre-wrap leading-relaxed text-sm shadow-md  text-black px-4 py-3 rounded-2xl max-w-[75%] opacity-0 animate-fade-in [animation-delay:3000ms]">
                    1. Connect your wallet to Gnosis Chain <br />
                    2. Navigate to Aave&apos;s interface <br />
                    3. Select USDC as your deposit asset <br />
                    4. Enter the amount you want to deposit <br />
                    5. Confirm the transaction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className=" px-6 text-center ">
  
          <div className="flex justify-center gap-6">
            <span className="flex justify-center items-center gap-3 font-semibold text-xl">
              <Image
                src="https://olas.network/images/olas-logo.svg"
                alt="olas"
                width={80}
                height={80}
                className="w-[70px] h-[70px] object-contain"
                style={{ minWidth: '80px', minHeight: '80px' }}
              />
            </span>
            <span className="flex justify-center items-center gap-3 font-semibold text-xl">
              <Image
                src="/assets/rootstock.svg"
                alt="rootstock"
                width={80}
                height={80}
                className="w-[80px] h-[80px] object-contain"
                style={{ minWidth: '110px', minHeight: '110px' }}
              />
</span>

            <span className="flex justify-center items-center gap-1 font-semibold text-lg ">

              <Image
                src="/assets/mcp.png"
                alt="model context protocol"
                width={24}
                height={24}
              />
              Model Context Protocol
            </span>
            <span className="flex justify-center items-center gap-1 font-semibold text-lg ">

<Image
  src="/assets/ant.webp"
  alt="anthropic"
  width={24}
  height={24}
/>
Anthropic
</span>
          </div>
        </section>

  

        {/* Footer */}
        <footer className="text-center pt-2 pb-6 text-gray-500 text-sm ">
        <p className="text-gray-500 ">
            Built for{" "}
            <span className="text-black font-bold">ETHLisbon 2025</span>, by <strong className="text-black">YTU Blockchain </strong>
          </p>
        </footer>
      </main>
    </>
  );
}
