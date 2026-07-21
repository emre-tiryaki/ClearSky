import type { SystemStatus } from "../types/SystemStatus";

interface StatusBannerProps {
    status: SystemStatus | null;
}

export function StatusBanner({ status }: StatusBannerProps) {
  if (!status || status.type !== "RATE_LIMITED") return null;

  return (
    <div className="bg-amber-500 text-amber-950 px-4 py-2 text-sm font-medium text-center">
      {status.message}
      {status.retryAfterSeconds != null &&
        ` (${status.retryAfterSeconds} saniye sonra tekrar denenecek)`}
    </div>
  );
}