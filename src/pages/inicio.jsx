import React, { useState, useEffect } from 'react';
import StatCard from '../components/dashboard/statcard';
import { TrendingUp, Package, AlertTriangle, Users, RefreshCw, ArrowRight } from 'lucide-react';

const Inicio = () => {
    // 1. Estados inicializados en 0 o vacío
    const [stats, setStats] = useState({
        ventasDia: 0,
        stockTotal: 0,
        alertas: 0,
        clientesNuevos: 0
    });
    const [productosCriticos, setProductosCriticos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 2. Función que conecta con el Backend (FastAPI)
    const cargarDashboard = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:8000/api/dashboard');

            if (!response.ok) throw new Error("Error al obtener datos");

            const data = await response.json();

            setStats({
                ventasDia: data.ventas_totales || 0,
                stockTotal: data.stock_total || 0,
                alertas: data.conteo_alertas || 0,
                clientesNuevos: data.clientes_recientes || 0
            });
            setProductosCriticos(data.lista_critica || []);

        } catch (err) {
            setError("No hay conexión con el servidor de Python en el puerto 8000");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarDashboard();
    }, []);

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center space-y-4">
                <RefreshCw className="animate-spin text-blue-600" size={48} />
                <p className="text-slate-500 font-medium animate-pulse">Sincronizando con PostgreSQL...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Panel de Control</h1>
                    <p className="text-sm text-slate-500">Estado actual del inventario en tiempo real</p>
                </div>
                <button
                    onClick={cargarDashboard}
                    className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                >
                    <RefreshCw size={20} className="text-slate-600" />
                </button>
            </div>

            {error && (
                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 text-orange-700 text-sm font-medium rounded-r-lg">
                    ⚠️ {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Ventas del Día"
                    value={`$${Number(stats.ventasDia).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                    color="bg-blue-50 text-blue-600"
                    icon={<TrendingUp size={24} />}
                />

                <StatCard
                    title="Productos Stock"
                    value={stats.stockTotal}
                    color="bg-emerald-50 text-emerald-600"
                    icon={<Package size={24} />}
                />
                <StatCard
                    title="Alertas Activas"
                    value={stats.alertas}
                    color="bg-red-50 text-red-600"
                    icon={<AlertTriangle size={24} />}
                />
                <StatCard
                    title="Clientes Nuevos"
                    value={stats.clientesNuevos}
                    color="bg-purple-50 text-purple-600"
                    icon={<Users size={24} />}
                />
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50/50 border-b border-slate-200">
                    <h2 className="font-bold text-slate-700 text-sm uppercase tracking-wider">Productos por debajo del mínimo</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <tbody className="divide-y divide-slate-100">
                            {productosCriticos.length > 0 ? (
                                /* CORRECCIÓN AQUÍ: Se añade index al map */
                                productosCriticos.map((prod, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{prod.nombre}</div>
                                            <div className="text-[10px] text-slate-400 font-mono">{prod.codigo_barras}</div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-black">
                                                {prod.stock_actual} en existencia
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td className="px-6 py-12 text-center text-slate-400 italic">
                                        No hay productos con stock bajo actualmente.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Inicio;