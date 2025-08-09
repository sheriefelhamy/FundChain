import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export interface AskItem {
  id: bigint;
  business: string;
  amount: bigint;
  funded: bigint;
  status: number;
}

export const ProjectCard = ({ ask, onFund }: { ask: AskItem; onFund: (ask: AskItem) => void }) => {
  const pct = Number(ask.funded) / Math.max(1, Number(ask.amount)) * 100;
  return (
    <Card className="hover:shadow-lg transition-shadow" aria-label={`${ask.business} ask`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{ask.business}</span>
          <span className="text-sm text-muted-foreground">#{ask.id.toString()}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span>Ask</span>
          <span>{Number(ask.amount) / 1e18} HBAR</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Funded</span>
          <span>{Number(ask.funded) / 1e18} HBAR</span>
        </div>
        <Progress value={pct} aria-label="Funding progress" />
        <div className="text-xs text-muted-foreground">Status: {ask.status}</div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={() => onFund(ask)}>Fund</Button>
      </CardFooter>
    </Card>
  );
};
