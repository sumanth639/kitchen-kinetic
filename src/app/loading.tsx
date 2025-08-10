import { Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="relative">
        <Zap className="h-16 w-16 text-border absolute inset-0" />

        <div className="relative overflow-hidden">
          <Zap className="h-16 w-16 text-primary" />
          <div className="absolute inset-0 bg-background animate-fill-up"></div>
        </div>

        <div className="absolute inset-0 -m-2">
          <div className="w-20 h-20 bg-primary/20 rounded-full animate-pulse blur-lg"></div>
        </div>
      </div>
    </div>
  );
}
