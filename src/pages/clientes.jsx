import React, { useState, useEffect } from 'react';
import { Users, UserPlus, X, Save, Search, Phone, Mail, User } from 'lucide-react';

const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [busqueda, setBusqueda] = useState("");
    const [cargando, setCargando] = useState(false);

    // Estado para el formulario dentro del modal
    const [nuevoCliente, setNuevoCliente] = useState({
        nombre: '',
        telefono: '',
        email: ''
    });

    const fetchClientes = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/clientes');
            const data = await res.json();
            setClientes(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error al cargar clientes:", error);
        }
    };

    useEffect(() => { fetchClientes(); }, []);

    const guardarCliente = async (e) => {
        e.preventDefault();
        setCargando(true);
        try {
            const res = await fetch('http://localhost:8000/api/clientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoCliente)
            });

            if (res.ok) {
                alert("¡Cliente registrado con éxito!");
                setNuevoCliente({ nombre: '', telefono: '', email: '' });
                setIsModalOpen(false); // Cerramos el modal
                fetchClientes(); // Refrescamos la lista
            }
        } catch (error) {
            alert("Error de conexión");
        } finally {
            setCargando(false);
        }
    };

    const clientesFiltrados = clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.email.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="p-6 space-y-6">
            {/* Header con Buscador y Botón de Abrir Modal */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Directorio de Clientes</h1>
                    <p className="text-sm text-slate-500">Administra la base de datos de tus compradores</p>
                </div>

                <div className="flex gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-100 transition-all active:scale-95"
                    >
                        <UserPlus size={20} /> <span className="hidden sm:inline">Nuevo</span>
                    </button>
                </div>
            </div>

            {/* Tabla de Clientes */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 border-b border-slate-100">
                            <tr className="text-[10px] uppercase text-slate-400 font-black tracking-widest">
                                <th className="px-6 py-4">Cliente</th>
                                <th className="px-6 py-4">Teléfono</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4 text-right">ID Interno</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {clientesFiltrados.length > 0 ? (
                                clientesFiltrados.map(c => (
                                    <tr key={c.id_cliente} className="hover:bg-blue-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-slate-800">{c.nombre}</div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 flex items-center gap-2">
                                            <Phone size={14} className="text-slate-300" /> {c.telefono || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                <Mail size={14} className="text-slate-300" /> {c.email || 'Sin correo'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right font-mono text-[10px] text-slate-300">
                                            CL-{c.id_cliente}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-20 text-center text-slate-400 italic">
                                        No se encontraron clientes registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL DE REGISTRO (Estilo UAdeO) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest flex items-center gap-2">
                                <UserPlus size={18} className="text-blue-600" /> Registrar Cliente
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="hover:bg-slate-200 rounded-full p-1 transition-colors">
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        <form onSubmit={guardarCliente} className="p-8 space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 text-slate-300" size={18} />
                                    <input
                                        type="text" required
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                        placeholder="Ej. Sergio Morales"
                                        value={nuevoCliente.nombre}
                                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, nombre: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Teléfono</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-slate-300" size={18} />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                        placeholder="687 123 4567"
                                        value={nuevoCliente.telefono}
                                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, telefono: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Correo Electrónico</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 text-slate-300" size={18} />
                                    <input
                                        type="email"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                                        placeholder="correo@ejemplo.com"
                                        value={nuevoCliente.email}
                                        onChange={(e) => setNuevoCliente({ ...nuevoCliente, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={cargando}
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300"
                            >
                                <Save size={18} /> {cargando ? "Guardando..." : "Registrar Cliente"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Clientes;