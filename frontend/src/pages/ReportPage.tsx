import { useState } from "react";
import { useFlightRecords } from "../hooks/useFlightRecords";

export function ReportPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const { records, loading, error, fetch } = useFlightRecords();

    return (
        <div className="p-4">
            <div className="flex gap-4 items-end mb-4">
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
                <button
                    onClick={() =>
                        fetch(
                            new Date(startDate).toISOString(),
                            new Date(endDate).toISOString(),
                        )
                    }
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                    Fetch
                </button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="text-red-600">{error}</p>}

            <table className="w-full text-sm border-collapse">
                <thead>
                    <tr className="text-left border-b">
                        <th>ICAO24</th>
                        <th>Callsign</th>
                        <th>Speed</th>
                        <th>Save Date</th>
                        <th>Note</th>
                    </tr>
                </thead>
                <tbody>
                    {records.map(r => (
                        <tr key={r.id} className="border-b">
                            <td>{r.icao24}</td>
                            <td>{r.callsign ?? "-"}</td>
                            <td>{r.velocity != null ? Math.round(r.velocity) : "-"}</td>
                            <td>{new Date(r.recordedAt).toLocaleDateString()}</td>
                            <td>{r.note ?? "-"}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
