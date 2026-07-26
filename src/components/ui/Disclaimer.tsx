export function Disclaimer({ children }: { children?: React.ReactNode }) {
  return (
    <div className="px-5 py-2.5 bg-muted/40 border-t text-[10px] text-muted-foreground">
      {children ||
        "Educational and informational only. This is not regulated financial advice under SEBI. Past patterns do not guarantee future outcomes. Consult a registered advisor before making decisions."}
    </div>
  );
}
