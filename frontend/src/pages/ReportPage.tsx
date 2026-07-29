import { useState } from "react";
import { useFlightRecords } from "../hooks/useFlightRecords";
import { getCategoryName } from "../utils/categoryMapper";

// Page that lets the user query saved flight records by date range and displays them in a table.
export function ReportPage() {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const { records, loading, error, fetch } = useFlightRecords();

    return (
        <div className="min-h-screen p-8 bg-slate-50 text-slate-800">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* 1. Başlık Alanı */}
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Uçuş Raporları</h1>
                    <p className="mt-2 text-sm text-slate-500">
                        Belirtilen tarih aralığındaki kaydedilmiş uçuş verilerini listeleyin.
                    </p>
                </div>

                {/* 2. Filtreleme Kartı */}
                <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-wrap gap-4 items-end">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Başlangıç Tarihi</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-slate-600">Bitiş Tarihi</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="px-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <button
                        onClick={() =>
                            fetch(
                                new Date(startDate).toISOString(),
                                new Date(endDate).toISOString(),
                            )
                        }
                        disabled={loading || !startDate || !endDate}
                        className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Yükleniyor..." : "Verileri Getir"}
                    </button>
                </div>

                {/* 3. Hata Mesajı Görünümü */}
                {error && (
                    <div className="p-4 text-sm text-red-700 bg-red-50 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {/* 4. Tablo Kartı */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        {/* Tabloya table-fixed ekleyerek ve sütun genişliklerini w- oranlarıyla dağıtarak sağdaki boşluğu önlüyoruz */}
                        <table className="w-full text-sm text-left table-fixed">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                                <tr>
                                    <th className="px-4 py-4 w-[12%]">ICAO24</th>
                                    <th className="px-4 py-4 w-[12%]">Category</th>
                                    <th className="px-4 py-4 w-[12%]">Callsign</th>
                                    <th className="px-4 py-4 w-[15%]">Position (Lat/Lng)</th>
                                    <th className="px-4 py-4 w-[12%]">Altitıde</th>
                                    <th className="px-4 py-4 w-[12%]">Speed</th>
                                    <th className="px-4 py-4 w-[17%]">Record date</th>
                                    <th className="px-4 py-4 w-[20%]">Note</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {records.length === 0 && !loading ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                                            Gösterilecek kayıt bulunamadı. Lütfen bir tarih aralığı seçip arama yapın.
                                        </td>
                                    </tr>
                                ) : (
                                    records.map(r => (
                                        <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-4 font-medium text-slate-900 truncate">{r.icao24}</td>
                                            <td className="px-4 py-4">
                                                {r.category != null ? (
                                                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                                        {getCategoryName(r.category)}
                                                    </span>
                                                ) : "-"}
                                            </td>
                                            <td className="px-4 py-4 font-semibold text-blue-700 truncate">{r.callsign ?? "-"}</td>
                                            
                                            {/* Yeni: Konum Bilgisi */}
                                            <td className="px-4 py-4 text-slate-500 text-xs truncate">
                                                {r.latitude.toFixed(4)}, {r.longitude.toFixed(4)}
                                            </td>
                                            
                                            {/* Yeni: Yükseklik Bilgisi */}
                                            <td className="px-4 py-4">
                                                {r.altitude != null ? (
                                                    <span className="text-slate-600 font-medium">{Math.round(r.altitude)} m</span>
                                                ) : "-"}
                                            </td>

                                            <td className="px-4 py-4">
                                                {r.velocity != null ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                        {Math.round(r.velocity)}
                                                    </span>
                                                ) : "-"}
                                            </td>
                                            <td className="px-4 py-4 text-slate-500 truncate">
                                                {new Date(r.recordedAt).toLocaleString('tr-TR')}
                                            </td>
                                            <td className="px-4 py-4 text-slate-500 truncate" title={r.note ?? ""}>
                                                {r.note ?? "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}