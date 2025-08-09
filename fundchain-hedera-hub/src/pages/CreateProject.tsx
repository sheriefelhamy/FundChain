import { Navbar } from "@/components/layout/Navbar";
import { Seo } from "@/components/seo/Seo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { getWritePool } from "@/lib/hedera";
import { useWallet } from "@/components/wallet/WalletContext";
import { parseEther } from "ethers";

const CreateProject = () => {
  const { getEthersProvider } = useWallet();
  const [business, setBusiness] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [pending, setPending] = useState(false);

  const submit = async () => {
    if (!business || !amount || !description) {
      toast({ title: "Please fill all fields" });
      return;
    }
    try {
      setPending(true);
      const provider = getEthersProvider();
      if (!provider) throw new Error("Connect wallet first");
      const pool = await getWritePool(provider);
      const tx = await pool.createInvestmentAsk(business, parseEther(amount), description);
      toast({ title: "Transaction submitted", description: tx.hash });
      await tx.wait();
      toast({ title: "Ask created successfully" });
      setBusiness(""); setAmount(""); setDescription("");
    } catch (e: any) {
      toast({ title: "Creation failed", description: e?.message || String(e) });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Seo title="FundChain — Create Project" description="Create a new investment ask on Hedera." />
      <Navbar />
      <main className="container mx-auto py-10 max-w-2xl">
        <h1 className="text-3xl font-bold mb-6">Create Investment Ask</h1>
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="business">Business name</Label>
            <Input id="business" value={business} onChange={(e) => setBusiness(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (HBAR)</Label>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button className="w-full" onClick={submit} disabled={pending}>{pending ? "Submitting…" : "Create Ask"}</Button>
        </div>
      </main>
    </div>
  );
};

export default CreateProject;
