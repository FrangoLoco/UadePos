import React, { useState, useEffect } from 'react';
import { FileText, Download } from 'lucide-react';

const Reportes = () => {
    const [datos, setDatos] = useState({
        ingresos_brutos: 0,
        costo_inventario: 0,
        margen_ganancia: 0
    });

    const cargarDatos = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/reportes/ganancias');
            if (!res.ok) throw new Error("No se encontró la ruta");
            const data = await res.json();
            if (data) setDatos(data);
        } catch (error) {
            console.error("Error al cargar reporte:", error);
        }
    };

    useEffect(() => { cargarDatos(); }, []);

    // --- FUNCIÓN PARA EXPORTAR ---
    const exportarCSV = () => {
        // Definir las columnas y los datos
        const encabezados = "Concepto,Monto\n";
        const filas = [
            `Ingresos Totales Brutos,${Number(datos.ingresos_brutos).toFixed(2)}`,
            `Costo de Inventario,${Number(datos.costo_inventario).toFixed(2)}`,
            `Margen de Ganancia,${Number(datos.margen_ganancia).toFixed(2)}`
        ].join("\n");

        const contenidoFinal = encabezados + filas;

        // Crear el archivo para descargar
        const blob = new Blob([contenidoFinal], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.setAttribute("href", url);
        link.setAttribute("download", `Reporte_Ganancias_${new Date().toLocaleDateString()}.csv`);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="p-8 bg-[#f8fafc] min-h-full">
            <h1 className="text-2xl font-semibold text-slate-700 mb-8">Reportes</h1>

            <div className="bg-white rounded-xl border border-slate-200 p-10 shadow-sm max-w-5xl mx-auto">

                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <FileText className="text-slate-700" size={24} />
                        <h2 className="text-xl font-bold text-slate-800">
                            Reporte de Ganancias Estimadas
                        </h2>
                    </div>
                    {/* Botón con la función conectada */}
                    <button
                        onClick={exportarCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-all text-sm font-medium shadow-sm active:scale-95"
                    >
                        <Download size={18} /> Exportar CSV
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
                        <p className="text-slate-400 text-sm mb-2 font-medium">Ingresos Totales Brutos</p>
                        <p className="text-4xl font-bold text-[#22c55e]">
                            ${Number(datos.ingresos_brutos).toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-xl p-8 shadow-sm">
                        <p className="text-slate-400 text-sm mb-2 font-medium">Costo de Inventario</p>
                        <p className="text-4xl font-bold text-[#ef4444]">
                            ${Number(datos.costo_inventario).toFixed(2)}
                        </p>
                    </div>

                    <div className="bg-[#eff6ff] border border-blue-100 rounded-xl p-8 shadow-sm">
                        <p className="text-blue-600/70 text-sm mb-2 font-medium">Margen de Ganancia</p>
                        <p className="text-4xl font-bold text-[#2563eb]">
                            ${Number(datos.margen_ganancia).toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reportes;