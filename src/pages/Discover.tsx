import { AssetClassAwareness } from "@/components/awareness/AssetClassAwareness";
import { DiscoveryBrowser } from "@/components/discovery/DiscoveryBrowser";

export default function DiscoverPage() {
  return (
    <div className="p-4 md:p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Discover & Learn</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Understand the building blocks of a portfolio, then explore instruments across asset classes
        </p>
      </div>
      <AssetClassAwareness />
      <DiscoveryBrowser />
    </div>
  );
}
