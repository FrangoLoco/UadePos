import React, { useState, useEffect } from 'react';
import { Truck, Plus, X, Save, PackageSearch } from 'lucide-react';

const Compras = () => {
    const [historialCompras, setHistorialCompras] = useState([]);
    const [listaProveedores, setListaProveedores] = useState([]);
    const [listaProductos, setListaProductos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [mostrarModal, setMostrarModal] = useState(false);

    const [modoNuevoProveedor, setModoNuevoProveedor] = useState(false);
    const [nombreNuevoProv, setNombreNuevoProv] = useState("");

    const [nuevaCompra, setNuevaCompra] = useState({
        id_proveedor: '',
        id_producto: '',
        cantidad: '',
        precio_compra: ''
    });

    const cargarDatos = async () => {
        setCargando(true);
        try {
            const [resH, resProv, resProd] = await Promise.all([
                fetch('http://127.0.0.1:8000/api/compras/historial'),
                fetch('http://127.0.0.1:8000/api/proveedores'),
                fetch('http://127.0.0.1:8000/api/productos/lista')
            ]);
            setHistorialCompras(await resH.json());
            setListaProveedores(await resProv.json());
            setListaProductos(await resProd.json());
        } catch (e) { console.error("Error cargando datos", e); }
        finally { setCargando(false); }
    };

    useEffect(() => { cargarDatos(); }, []);

    const guardarCompra = async (e) => {
        e.preventDefault();
        let idProvFinal = nuevaCompra.id_proveedor;

        try {
            // 1. Si es proveedor nuevo, lo creamos primero
            if (modoNuevoProveedor) {
                const resP = await fetch('http://127.0.0.1:8000/api/proveedores', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre: nombreNuevoProv })
                });
                const dataP = await resP.json();
                idProvFinal = dataP.id_proveedor;
            }

            // 2. Registramos la compra
            const dataEnvio = {
                id_proveedor: parseInt(idProvFinal),
                items: [{
                    id_producto: parseInt(nuevaCompra.id_producto),
                    cantidad: parseInt(nuevaCompra.cantidad),
                    precio_compra: parseFloat(nuevaCompra.precio_compra)
                }]
            };

            const resC = await fetch('http://127.0.0.1:8000/api/compras/registrar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataEnvio)
            });

            if (resC.ok) {
                alert("Compra registrada correctamente");
                setMostrarModal(false);
                setModoNuevoProveedor(false);
                setNuevaCompra({ id_proveedor: '', id_producto: '', cantidad: '', precio_compra: '' });
                cargarDatos();
            } else {
                const error = await resC.json();
                alert("Error al registrar: " + JSON.stringify(error.detail));
            }
        } catch (err) {
            alert("Error de conexión");
        }
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Historial de Compras</h1>
                <button
                    onClick={() => setMostrarModal(true)}
                    className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                >
                    <Plus size={20} /> Registrar Compra
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                        <tr>
                            <th className="px-8 py-4">Folio</th>
                            <th className="px-8 py-4">Proveedor</th>
                            <th className="px-8 py-4">Fecha</th>
                            <th className="px-8 py-4 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {historialCompras.map((c, i) => (
                            <tr key={i} className="hover:bg-slate-50/50">
                                <td className="px-8 py-5 font-mono text-blue-600 font-bold">{c.folio}</td>
                                <td className="px-8 py-5 font-bold text-slate-700">{c.proveedor}</td>
                                <td className="px-8 py-5 text-slate-500 text-sm">{c.fecha}</td>
                                <td className="px-8 py-5 text-right font-black text-slate-800">${parseFloat(c.total).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {mostrarModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
                            <h2 className="font-bold">Nueva Entrada de Almacén</h2>
                            <button onClick={() => setMostrarModal(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={guardarCompra} className="p-6 space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Proveedor</label>
                                    <button
                                        type="button"
                                        onClick={() => setModoNuevoProveedor(!modoNuevoProveedor)}
                                        className="text-[10px] font-bold text-blue-600 underline"
                                    >
                                        {modoNuevoProveedor ? "Cancelar" : "+ Nuevo"}
                                    </button>
                                </div>
                                {modoNuevoProveedor ? (
                                    <input
                                        className="w-full p-3 bg-blue-50 border border-blue-200 rounded-xl"
                                        placeholder="Nombre del nuevo proveedor"
                                        onChange={e => setNombreNuevoProv(e.target.value)}
                                        required
                                    />
                                ) : (
                                    <select
                                        className="w-full p-3 bg-slate-50 border rounded-xl"
                                        value={nuevaCompra.id_proveedor}
                                        onChange={e => setNuevaCompra({ ...nuevaCompra, id_proveedor: e.target.value })}
                                        required
                                    >
                                        <option value="">Elegir proveedor...</option>
                                        {listaProveedores.map(p => <option key={p.id_proveedor} value={p.id_proveedor}>{p.nombre}</option>)}
                                    </select>
                                )}
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase">Producto</label>
                                <select
                                    className="w-full p-3 bg-slate-50 border rounded-xl"
                                    value={nuevaCompra.id_producto}
                                    onChange={e => setNuevaCompra({ ...nuevaCompra, id_producto: e.target.value })}
                                    required
                                >
                                    <option value="">Elegir producto...</option>
                                    {listaProductos.map(pr => <option key={pr.id_producto} value={pr.id_producto}>{pr.nombre}</option>)}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="number" placeholder="Cantidad"
                                    className="p-3 bg-slate-50 border rounded-xl"
                                    onChange={e => setNuevaCompra({ ...nuevaCompra, cantidad: e.target.value })}
                                    required
                                />
                                <input
                                    type="number" step="0.01" placeholder="Costo Unit"
                                    className="p-3 bg-slate-50 border rounded-xl"
                                    onChange={e => setNuevaCompra({ ...nuevaCompra, precio_compra: e.target.value })}
                                    required
                                />
                            </div>

                            <button type="submit" className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-emerald-700">
                                REGISTRAR ENTRADA
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Compras;