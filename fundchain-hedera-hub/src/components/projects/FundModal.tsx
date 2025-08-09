import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const FundModal = ({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (v: boolean) => void; onConfirm: (amountHBAR: number) => void; }) => {
  const [amount, setAmount] = useState<string>("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fund this project</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm text-muted-foreground" htmlFor="amount">Amount (HBAR)</label>
          <Input id="amount" placeholder="10" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => { const n = Number(amount); if (Number.isFinite(n) && n > 0) onConfirm(n); }}>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
