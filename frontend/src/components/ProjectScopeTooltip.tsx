import { useState } from 'react';

export function ProjectScopeTooltip() {
    const [isVisible, setIsVisible] = useState(false);

    return (
        <div 
            className="relative flex items-center"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            <span className="cursor-help w-5 h-5 rounded-full border border-slate-400 text-slate-300 flex items-center justify-center text-xs font-bold hover:bg-slate-700 transition-colors">
                ?
            </span>
            
            {isVisible && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 text-slate-200 text-xs p-3 rounded-md shadow-xl z-1000">
                    <strong className="text-white">Project Scope:</strong>
                    <ul className="list-disc ml-4 mt-1 mb-3 text-slate-300">
                        <li>Real Time aircraft render</li>
                        <li>Saving aircraft with user notes</li>
                    </ul>
                    <strong className="text-white">Out Of Project Scope:</strong>
                    <ul className="list-disc ml-4 mt-1 text-slate-300">
                        <li>Seeing past aircrafts on the map</li>
                        <li>Seeing an aircrafts past route before the render</li>
                        <li>Aircraft categories are not coming from the api(its coming but its always 0)</li>
                    </ul>
                </div>
            )}
        </div>
    );
}