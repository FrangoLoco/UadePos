import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Search, X, Trash2, User } from 'lucide-react';

const PuntoVenta = () => {
    // ESTADOS PRINCIPALES
    const [carrito, setCarrito] = useState([]);
    const [productosDB, setProductosDB] = useState([]);
    const [clientes, setClientes] = useState([]); // Estado para la lista de clientes
    const [idClienteSeleccionado, setIdClienteSeleccionado] = useState(1); // Público General por defecto
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(false);
    const [cantidadesTmp, setCantidadesTmp] = useState({});

    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    // 1. CARGAR DATOS (Productos y Clientes)
    const cargarDatosModal = async () => {
        try {
            // Cargar Productos
            const resProd = await fetch('http://127.0.0.1:8000/api/productos/lista-venta');
            const dataProd = await resProd.json();
            setProductosDB(Array.isArray(dataProd) ? dataProd : []);

            // Cargar Clientes
            const resCli = await fetch('http://127.0.0.1:8000/api/clientes');
            const dataCli = await resCli.json();
            setClientes(Array.isArray(dataCli) ? dataCli : []);

            setIsModalOpen(true);
        } catch (error) {
            console.error("Error al sincronizar datos:", error);
        }
    };

    // 2. REGISTRAR VENTA
    const finalizarVenta = async () => {
        if (carrito.length === 0) return;

        setCargando(true);
        try {
            const response = await fetch('http://127.0.0.1:8000/api/ventas', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: carrito.map(i => ({
                        id_producto: i.id_producto,
                        cantidad: i.cantidad,
                        precio: i.precio
                    })),
                    total: total,
                    id_cliente: idClienteSeleccionado // Enviamos el ID del cliente seleccionado
                })
            });

            if (response.ok) {
                alert("¡Venta registrada con éxito!");
                setCarrito([]);
                setIdClienteSeleccionado(1); // Reset a Público General
            } else {
                const err = await response.json();
                alert("Error: " + (err.detail || "No se pudo procesar"));
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setCargando(false);
        }
    };

    // 3. LÓGICA DEL CARRITO
    const ajustarCantidadTmp = (id, delta, stockMax) => {
        setCantidadesTmp(prev => {
            const actual = prev[id] || 1;
            const nueva = actual + delta;
            return (nueva >= 1 && nueva <= stockMax) ? { ...prev, [id]: nueva } : prev;
        });
    };

    const agregarAlCarrito = (prod) => {
        const cantidadAñadir = cantidadesTmp[prod.id_producto] || 1;
        const existe = carrito.find(item => item.id_producto === prod.id_producto);

        if (existe) {
            if (existe.cantidad + cantidadAñadir > prod.stock_actual) return alert("Sin stock suficiente");
            setCarrito(carrito.map(item =>
                item.id_producto === prod.id_producto
                    ? { ...item, cantidad: item.cantidad + cantidadAñadir } : item
            ));
        } else {
            setCarrito([...carrito, {
                id_producto: prod.id_producto,
                nombre: prod.nombre,
                precio: prod.precio_venta,
                cantidad: cantidadAñadir
            }]);
        }
        setCantidadesTmp({ ...cantidadesTmp, [prod.id_producto]: 1 });
    };

    const productosFiltrados = productosDB.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        (p.codigo_barras && p.codigo_barras.includes(busqueda))
    );

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Punto De Venta</h1>

            <div className="max-w-4xl mx-auto bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-[#1e293b] p-4 flex justify-between items-center text-white">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={20} />
                        <span className="font-bold text-sm uppercase">Ticket de Venta</span>
                    </div>
                </div>

                <div className="py-12 min-h-[400px]">
                    {carrito.length === 0 ? (
                        <p className="text-center text-slate-400 font-medium">Ticket vacío</p>
                    ) : (
                        <div className="px-10">
                            <table className="w-full text-left">
                                <tbody className="divide-y divide-slate-50">
                                    {carrito.map((item) => (
                                        <tr key={item.id_producto} className="hover:bg-slate-50 transition-colors">
                                            <td className="py-4 font-bold text-slate-700">{item.nombre}</td>
                                            <td className="py-4 text-center text-slate-500 font-medium">x{item.cantidad}</td>
                                            <td className="py-4 text-right font-black text-slate-800">${(item.precio * item.cantidad).toFixed(2)}</td>
                                            <td className="py-4 text-right">
                                                <button onClick={() => setCarrito(carrito.filter(i => i.id_producto !== item.id_producto))} className="text-red-400 hover:text-red-600 p-2">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-white">
                    <div className="flex justify-between items-center mb-8">
                        <span className="text-slate-500 font-black text-xs uppercase tracking-widest">Total a pagar</span>
                        <span className="text-5xl font-black text-slate-800">${total.toFixed(2)}</span>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={finalizarVenta} disabled={carrito.length === 0 || cargando} className={`flex-[5] py-4 rounded-xl font-black transition-all ${carrito.length > 0 && !cargando ? 'bg-[#86efac] hover:bg-[#4ade80] text-[#166534] shadow-lg' : 'bg-gray-100 text-gray-400'}`}>
                            {cargando ? "PROCESANDO..." : "REALIZAR COBRO"}
                        </button>
                        <button onClick={cargarDatosModal} className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-95">
                            <Plus size={32} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {/* MODAL CONFIGURACIÓN VENTA */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
                        <div className="p-6 border-b flex flex-col gap-5 bg-slate-50/50">
                            <div className="flex justify-between items-center">
                                <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest">Configurar Venta</h3>
                                <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-200 rounded-full p-1"><X size={20} /></button>
                            </div>

                            {/* SELECTOR DE CLIENTES */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1 flex items-center gap-1">
                                    <User size={12} /> Cliente Responsable
                                </label>
                                <select
                                    className="w-full p-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold text-slate-700"
                                    value={idClienteSeleccionado}
                                    onChange={(e) => setIdClienteSeleccionado(parseInt(e.target.value))}
                                >
                                    {clientes.map(c => (
                                        <option key={c.id_cliente} value={c.id_cliente}>
                                            {c.nombre} {c.id_cliente === 1 ? '(Genérico)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* BUSCADOR DE PRODUCTOS */}
                            <div className="relative">
                                <Search className="absolute left-4 top-3 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o código..."
                                    className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 font-bold"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* LISTA DE PRODUCTOS */}
                        <div className="max-h-[350px] overflow-y-auto divide-y divide-slate-50">
                            {productosFiltrados.map(p => (
                                <div key={p.id_producto} className="p-5 flex justify-between items-center hover:bg-emerald-50/30 transition-all">
                                    <div className="flex-1">
                                        <p className="font-black text-slate-800 text-lg">{p.nombre}</p>
                                        <p className="text-[10px] text-slate-400 font-mono font-bold uppercase tracking-widest">COD: {p.codigo_barras || 'N/A'}</p>
                                        <p className={`text-xs font-black mt-1 ${p.stock_actual <= 5 ? 'text-red-500' : 'text-emerald-600'}`}>STOCK: {p.stock_actual}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border-2 border-slate-100 rounded-xl bg-white">
                                            <button onClick={() => ajustarCantidadTmp(p.id_producto, -1, p.stock_actual)} className="px-3 py-1 font-black text-slate-400 hover:text-slate-600">-</button>
                                            <span className="px-3 font-black text-slate-700 min-w-[30px] text-center">{cantidadesTmp[p.id_producto] || 1}</span>
                                            <button onClick={() => ajustarCantidadTmp(p.id_producto, 1, p.stock_actual)} disabled={(cantidadesTmp[p.id_producto] || 1) >= p.stock_actual} className="px-3 py-1 font-black text-slate-400 hover:text-slate-600 disabled:opacity-20">+</button>
                                        </div>
                                        <button onClick={() => agregarAlCarrito(p)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase shadow-md active:scale-95 transition-all">
                                            Añadir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PuntoVenta;