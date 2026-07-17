import { FlightMap } from "./components/FlightMap";
import { useLiveFlights } from "./hooks/useLiveFlights"

function App() {
  const flights = useLiveFlights();
  return (
    <div className="h-screen w-screen flex flex-col">
      <header className="bg-slate-900 text-white px-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">ClearSky $mdash; Live plane dashboard</h1>
        <span className="text-sm text-slate-300">{flights.size} planes are showing</span>
      </header>
      <main className="flex-1">
        <FlightMap flights={flights}/>
      </main>
    </div>
  )
}

export default App
