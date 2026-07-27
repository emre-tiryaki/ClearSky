import { useMemo, useState } from "react";
import type { BoundingBox } from "./types/fligt";
import { useLiveFlights } from "./hooks/useLiveFlights";
import { FlightMap } from "./components/FlightMap";
import { useFlightTrail } from "./hooks/useFlightTrail";
import { useSystemStatus } from "./hooks/useSystemStatus";
import { StatusBanner } from "./components/StatusBanner";
import { ReportPage } from "./pages/ReportPage";

const TURKEY_BBOX: BoundingBox = {
    lamin: 34.0,
    lomin: 24.0,
    lamax: 43.5,
    lomax: 43.5,
};

function App() {
    const bbox = useMemo(() => TURKEY_BBOX, []);
    const flights = useLiveFlights(bbox);
    const trails = useFlightTrail(flights);
    const systemStatus = useSystemStatus();
    const [view, setView] = useState<"map" | "report">("map");

    return (
        <div className="h-screen w-screen flex flex-col">
            <header className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
                <h1 className="text-lg font-semibold">
                    Clear Sky &mdash; Live Flight Dashboard
                </h1>
                <span className="text-sm text-slate-300">
                    {flights.size} planes are showing
                </span>
                <button
                    onClick={() =>
                        setView((v) => (v === "map" ? "report" : "map"))
                    }
                    className="text-sm underline"
                >
                    {view === "map" ? "Report Page" : "Map Page"}
                </button>
            </header>
            <StatusBanner status={systemStatus} />
            <main className="flex-1">
                {view === "map" ? (
                    <FlightMap flights={flights} trails={trails} />
                ) : (
                    <ReportPage />
                )}
            </main>
        </div>
    );
}

export default App;
