import { Zap } from 'lucide-react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div className="relative">
        <div className="absolute inset-0">
          <Zap
            className="h-16 w-16 text-border stroke-2"
            style={{ fill: 'none' }}
          />
        </div>

        <div className="relative overflow-hidden">
          <div className="h-16 w-16 relative">
            <Zap className="h-16 w-16 text-primary stroke-2" />
            <div className="absolute inset-0 bg-background animate-reveal-up"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
