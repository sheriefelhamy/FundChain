import { Button } from "@/components/ui/button";
import { useWallet } from "./WalletContext";
import { Copy } from "lucide-react";

export const WalletButton = () => {
  const { accountId, balanceHBAR, connecting, connect, disconnect } = useWallet();

  const short = (v: string) => (v.length > 12 ? `${v.slice(0, 6)}…${v.slice(-4)}` : v);

  if (accountId) {
    return (
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
          <span className="text-muted-foreground">HBAR</span>
          <span className="font-semibold">{balanceHBAR ?? "—"}</span>
        </div>
        <Button variant="outline" onClick={disconnect}>
          {short(accountId)}
          <Copy className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connect} disabled={connecting} variant="default">
      {connecting ? "Connecting…" : "Connect Wallet"}
    </Button>
  );
};
