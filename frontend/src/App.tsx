import { useCallback, useRef, useState } from 'react';
import type { BoundingBox } from './types/flight';
import { useLiveFlights } from './hooks/useLiveFlights';
import { FlightMap } from './components/FlightMap';
import { useSystemStatus } from './hooks/useSystemStatus';
import { StatusBanner } from './components/StatusBanner';
import { ReportPage } from './pages/ReportPage';
import { ProjectScopeTooltip } from './components/ProjectScopeTooltip';

const TURKEY_BBOX: BoundingBox = {
    lamin: 34.0,
    lomin: 24.0,
    lamax: 43.5,
    lomax: 43.5,
};
const BBOX_DEBOUNCE_MS = 400;

function App() {
    const [bbox, setBbox] = useState<BoundingBox>(TURKEY_BBOX);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleBounceChange = useCallback((next: BoundingBox) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setBbox(next), BBOX_DEBOUNCE_MS);
    }, []);

    const { flights, trails } = useLiveFlights(bbox);
    const systemStatus = useSystemStatus();
    const [view, setView] = useState<'map' | 'report'>('map');
    const [visibleCount, setVisibleCount] = useState(0);

    const handleVisibleCountChange = useCallback((count: number) => {
        setVisibleCount(count);
    }, []);

    return (
        <div className="h-screen w-screen flex flex-col">
            <header className="relative z-1000 bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <h1 className="text-lg font-semibold">
                        Clear Sky &mdash; Live Flight Dashboard
                    </h1>

                    <ProjectScopeTooltip />
                </div>
                <span className="text-sm text-slate-300">
                    {view === 'map'
                        ? visibleCount > 0
                            ? `${visibleCount}`
                            : 'No'
                        : flights.size > 0
                          ? `${flights.size}`
                          : 'No'}{' '}
                    planes are showing
                </span>

                <button
                    onClick={() => setView(v => (v === 'map' ? 'report' : 'map'))}
                    className="text-sm underline"
                >
                    {view === 'map' ? 'Report Page' : 'Map Page'}
                </button>
            </header>
            <StatusBanner status={systemStatus} />
            <main className="flex-1">
                {view === 'map' ? (
                    <FlightMap
                        flights={flights}
                        trails={trails}
                        bbox={bbox}
                        onBoundsChange={handleBounceChange}
                        onVisibleCountChange={handleVisibleCountChange}
                    />
                ) : (
                    <ReportPage />
                )}
            </main>
        </div>
    );
}

export default App;
