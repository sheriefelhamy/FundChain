import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import { useEffect, useState } from "react";
import { useWallet } from "@/components/wallet/WalletContext";
import { getReadPool } from "@/lib/hedera";

const MyInvestments = () => {
  const { evmAddress } = useWallet();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const pool = getReadPool();
        // This expects the event name to be Invested(address indexed investor, uint256 askId, uint256 amount)
        const filter = pool.filters.Invested?.(evmAddress);
        const logs = filter ? await pool.queryFilter(filter, 0, "latest") : [];
        setItems(logs.map((l: any) => ({ askId: l.args?.askId, amount: l.args?.amount })));
      } catch {
        setItems([]);
      }
    })();
  }, [evmAddress]);

  return (
    <div className="min-h-screen">
      <Seo title="FundChain — My Investments" description="Track your investments across projects on Hedera." />
      <Navbar />
      <main className="container mx-auto py-10">
        <h1 className="text-3xl font-bold mb-6">My Investments</h1>
        {!evmAddress ? (
          <p className="text-muted-foreground">Connect your wallet to view your investments.</p>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground">No investments found.</p>
        ) : (
          <ul className="space-y-3">
            {items.map((it, idx) => (
              <li key={idx} className="rounded-md border p-4">Ask #{String(it.askId)} — {Number(it.amount) / 1e18} HBAR</li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
};

export default MyInvestments;
