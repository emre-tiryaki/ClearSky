import { useMemo } from "react"
import type { BoundingBox } from "./types/fligt"
import { useLiveFlights } from "./hooks/useLiveFlights";
import { FlightMap } from "./components/FlightMap";
import { useFlightTrail } from "./hooks/useFlightTrail";

const TURKEY_BBOX: BoundingBox = {
  lamin: 34.0,
  lomin: 24.0,
  lamax: 43.5,
  lomax: 43.5
}

function App() {
  const bbox = useMemo(() => TURKEY_BBOX, []);
  const flights = useLiveFlights(bbox);
  const trails = useFlightTrail(flights);

  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold">Clear Sky - Live Flight Dashboard</h1>
        <span className="text-sm text-slate-300">{flights.size} planes are showing</span>
      </header>
      <main className="flex-1">
        <FlightMap flights={flights} trails={trails}/>
      </main>
    </div>
  )
}

export default App
