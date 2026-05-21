import React, { useState, useEffect } from 'react';
import { Package, Plus, Pencil, Trash2, X, Save, Search, AlertCircle } from 'lucide-react';

const Productos = () => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [busqueda, setBusqueda] = useState("");

    const [mostrarModalNuevo, setMostrarModalNuevo] = useState(false);
    const [mostrarModalEdit, setMostrarModalEdit] = useState(false);

    const [nuevoProducto, setNuevoProducto] = useState({
        codigo_barras: '', nombre: '', id_categoria: '', stock_actual: 0, stock_minimo: 0, precio_venta: 0
    });
    const [productoEditando, setProductoEditando] = useState(null);

    const apiBase = "http://127.0.0.1:8000/api";

    const traerDatos = async () => {
        setCargando(true);
        try {
            const [resProd, resCat] = await Promise.all([
                fetch(`${apiBase}/productos`),
                fetch(`${apiBase}/categorias`)
            ]);
            if (resProd.ok) setProductos(await resProd.json());
            if (resCat.ok) setCategorias(await resCat.json());
        } catch (error) { console.error("Error:", error); }
        finally { setCargando(false); }
    };

    useEffect(() => { traerDatos(); }, []);

    const guardarNuevo = async (e) => {
        e.preventDefault();
        try {
            const body = {
                codigo_barras: String(nuevoProducto.codigo_barras),
                nombre: String(nuevoProducto.nombre),
                id_categoria: parseInt(nuevoProducto.id_categoria),
                stock_actual: parseInt(nuevoProducto.stock_actual),
                stock_minimo: parseInt(nuevoProducto.stock_minimo),
                precio_venta: parseFloat(nuevoProducto.precio_venta)
            };
            const res = await fetch(`${apiBase}/productos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) {
                setMostrarModalNuevo(false);
                setNuevoProducto({ codigo_barras: '', nombre: '', id_categoria: '', stock_actual: 0, stock_minimo: 0, precio_venta: 0 });
                traerDatos();
            }
        } catch (error) { alert("Error al guardar"); }
    };

    const actualizarProducto = async (e) => {
        e.preventDefault();
        try {
            // ✅ BLINDAJE TOTAL: Solo enviamos lo que ProductoSchema pide
            // Convertimos todo a número/string explícitamente
            const bodyParaEnviar = {
                codigo_barras: String(productoEditando.codigo_barras || ""),
                nombre: String(productoEditando.nombre || ""),
                id_categoria: parseInt(productoEditando.id_categoria),
                stock_actual: parseInt(productoEditando.stock_actual || 0),
                stock_minimo: parseInt(productoEditando.stock_minimo || 0),
                precio_venta: parseFloat(productoEditando.precio_venta || 0)
            };

            const res = await fetch(`${apiBase}/productos/${productoEditando.id_producto}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bodyParaEnviar)
            });

            if (res.ok) {
                setMostrarModalEdit(false);
                traerDatos();
                alert("¡Producto actualizado!");
            } else {
                const err = await res.json();
                console.error("Detalle del error:", err.detail);
                alert(`Error 422: El campo '${err.detail[0].loc[1]}' tiene un formato inválido.`);
            }
        } catch (error) { alert("Error de conexión"); }
    };

    const eliminarProducto = async (id) => {
        if (!window.confirm("¿Eliminar producto?")) return;
        try {
            const res = await fetch(`${apiBase}/productos/${id}`, { method: 'DELETE' });
            if (res.ok) traerDatos();
        } catch (error) { alert("Error al eliminar"); }
    };

    const filtrados = productos.filter(p => p.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
                <button onClick={() => setMostrarModalNuevo(true)} className="bg-slate-900 text-white px-6 py-2 rounded-xl font-bold">+ Nuevo</button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Nombre</th>
                            <th className="px-6 py-4">Categoría</th>
                            <th className="px-6 py-4">Stock</th>
                            <th className="px-6 py-4">Precio</th>
                            <th className="px-6 py-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtrados.map((p) => (
                            <tr key={p.id_producto} className="hover:bg-slate-50/50">
                                <td className="px-6 py-4 font-bold text-slate-700">{p.nombre}</td>
                                <td className="px-6 py-4 text-xs font-semibold text-blue-600 uppercase">{p.categoria || 'General'}</td>
                                <td className="px-6 py-4 text-center font-bold text-slate-600">{p.stock_actual}</td>
                                <td className="px-6 py-4 font-black text-slate-800">${parseFloat(p.precio_venta).toFixed(2)}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => { setProductoEditando({ ...p }); setMostrarModalEdit(true); }} className="text-slate-400 hover:text-blue-600 transition-colors"><Pencil size={18} /></button>
                                        <button onClick={() => eliminarProducto(p.id_producto)} className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL EDITAR */}
            {mostrarModalEdit && productoEditando && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h2 className="font-bold text-slate-800">Editar Producto</h2>
                            <button onClick={() => setMostrarModalEdit(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={actualizarProducto} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase">Nombre</label>
                                <input className="w-full p-3 bg-slate-50 border rounded-xl" value={productoEditando.nombre} onChange={e => setProductoEditando({ ...productoEditando, nombre: e.target.value })} required />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase">Categoría</label>
                                <select className="w-full p-3 bg-slate-50 border rounded-xl" value={productoEditando.id_categoria} onChange={e => setProductoEditando({ ...productoEditando, id_categoria: e.target.value })} required>
                                    {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Stock Actual</label>
                                    <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl" value={productoEditando.stock_actual} onChange={e => setProductoEditando({ ...productoEditando, stock_actual: e.target.value })} required />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Stock Mínimo</label>
                                    <input type="number" className="w-full p-3 bg-slate-50 border rounded-xl" value={productoEditando.stock_minimo} onChange={e => setProductoEditando({ ...productoEditando, stock_minimo: e.target.value })} required />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase">Precio Venta</label>
                                <input type="number" step="0.01" className="w-full p-3 bg-slate-50 border rounded-xl" value={productoEditando.precio_venta} onChange={e => setProductoEditando({ ...productoEditando, precio_venta: e.target.value })} required />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold shadow-lg">GUARDAR CAMBIOS</button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL NUEVO */}
            {mostrarModalNuevo && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
                        <div className="flex justify-between items-center pb-2 border-b">
                            <h2 className="font-bold text-slate-800">Registrar Producto</h2>
                            <button onClick={() => setMostrarModalNuevo(false)}><X size={20} /></button>
                        </div>
                        <form onSubmit={guardarNuevo} className="space-y-4">
                            <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Nombre" onChange={e => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })} required />
                            <input className="w-full p-3 bg-slate-50 border rounded-xl" placeholder="Código Barras" onChange={e => setNuevoProducto({ ...nuevoProducto, codigo_barras: e.target.value })} required />
                            <select className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setNuevoProducto({ ...nuevoProducto, id_categoria: e.target.value })} required>
                                <option value="">Categoría...</option>
                                {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
                            </select>
                            <div className="grid grid-cols-2 gap-4">
                                <input type="number" step="0.01" placeholder="Precio" className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setNuevoProducto({ ...nuevoProducto, precio_venta: e.target.value })} required />
                                <input type="number" placeholder="Stock" className="w-full p-3 bg-slate-50 border rounded-xl" onChange={e => setNuevoProducto({ ...nuevoProducto, stock_actual: e.target.value })} required />
                            </div>
                            <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold">REGISTRAR</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Productos;