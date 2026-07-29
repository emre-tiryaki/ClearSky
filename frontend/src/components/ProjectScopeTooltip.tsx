import { useState } from 'react';

export function ProjectScopeTooltip() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {/* Soru İşareti İkonu */}
            <span className="cursor-help w-5 h-5 rounded-full border border-slate-400 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-700 transition-colors">
                ?
            </span>
            
            {/* State 'true' ise kutuyu render et */}
            {isVisible && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 text-slate-200 text-xs p-3 rounded-md shadow-xl z-1000">
                    <strong className="text-white">Proje Kapsamı:</strong>
                    <ul className="list-disc ml-4 mt-1 mb-3 text-slate-300">
                        <li>Gerçek zamanlı uçak pozisyonları</li>
                        <li>Geçmiş rotaların haritada gösterimi</li>
                        <li>Kullanıcı notlarıyla veri kaydetme</li>
                    </ul>
                    <strong className="text-white">Kapsam Dışı:</strong>
                    <ul className="list-disc ml-4 mt-1 text-slate-300">
                        <li>Yolcu ve biletleme bilgileri</li>
                        <li>Canlı hava durumu verileri</li>
                    </ul>
                </div>
            )}
        </div>
    );
}