import { useEffect, useMemo, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import { ProjectCard, type AskItem } from "@/components/projects/ProjectCard";
import { FundModal } from "@/components/projects/FundModal";
import { getReadPool, getWritePool } from "@/lib/hedera";
import { useWallet } from "@/components/wallet/WalletContext";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { parseEther } from "ethers";

const Index = () => {
  const { getEthersProvider, accountId } = useWallet();
  const [asks, setAsks] = useState<AskItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<AskItem | null>(null);

  const loadAsks = async () => {
    setLoading(true);
    try {
      const pool = getReadPool();
      const raw = await pool.getAllAsks();
      const normalized: AskItem[] = (raw || []).map((r: any) => ({
        id: BigInt(r.id ?? r[0] ?? 0n),
        business: r.business ?? r[1] ?? "",
        amount: BigInt(r.amount ?? r[2] ?? 0n),
        funded: BigInt(r.funded ?? r[3] ?? 0n),
        status: Number(r.status ?? r[4] ?? 0),
      }));
      setAsks(normalized);
    } catch (e: any) {
      toast({ title: "Failed to load asks", description: e?.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAsks();
  }, []);

  const onFund = (ask: AskItem) => {
    setSelected(ask);
    setModalOpen(true);
  };

  const confirmFund = async (amountHBAR: number) => {
    try {
      const provider = getEthersProvider();
      if (!provider) throw new Error("Connect wallet first");
      const pool = await getWritePool(provider);
      const tx = await pool.invest(selected?.id ?? 0, { value: parseEther(String(amountHBAR)) });
      toast({ title: "Transaction submitted", description: tx.hash });
      await tx.wait();
      toast({ title: "Funding successful" });
      setModalOpen(false);
      loadAsks();
    } catch (e: any) {
      toast({ title: "Funding failed", description: e?.message || String(e) });
    }
  };

  return (
    <div className="min-h-screen bg-[image:var(--gradient-subtle)]">
      <Seo title="FundChain — Explore Projects" description="Browse investment asks and fund directly on Hedera." />
      <Navbar />
      <main className="container mx-auto py-10">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Investment Asks</h1>
            <p className="text-muted-foreground">Discover projects seeking micro-investments on Hedera.</p>
          </div>
          <Button asChild>
            <a href="/create">Create Project</a>
          </Button>
        </div>
        {loading ? (
          <div className="text-muted-foreground">Loading…</div>
        ) : asks.length === 0 ? (
          <div className="text-muted-foreground">No asks yet. Be the first to create one.</div>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {asks.map((ask) => (
              <ProjectCard key={ask.id.toString()} ask={ask} onFund={onFund} />
            ))}
          </div>
        )}
      </main>
      <FundModal open={!!modalOpen} onOpenChange={setModalOpen} onConfirm={confirmFund} />
    </div>
  );
};

export default Index;
