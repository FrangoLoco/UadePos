import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    ArrowDownCircle,
    Users,
    BarChart3,
    LogOut
} from 'lucide-react';

// Recibimos onLogout como prop desde App.jsx
const Sidebar = ({ onLogout }) => {
    const location = useLocation();

    const menuItems = [
        { name: 'Inicio', icon: <LayoutDashboard size={20} />, path: '/' },
        { name: 'Punto de Venta', icon: <ShoppingCart size={20} />, path: '/puntoventa' },
        { name: 'Productos', icon: <Package size={20} />, path: '/productos' },
        { name: 'Compras (Entradas)', icon: <ArrowDownCircle size={20} />, path: '/compras' },
        { name: 'Clientes', icon: <Users size={20} />, path: '/clientes' },
        { name: 'Reportes', icon: <BarChart3 size={20} />, path: '/reportes' },
    ];

    return (
        <div className="w-64 bg-[#1e293b] text-white flex flex-col h-screen shadow-xl">
            <div className="p-6 border-b border-slate-700">
                <h1 className="text-xl font-black tracking-tighter uppercase italic">
                    UAdeO<span className="text-blue-500 text-sm not-italic ml-1">POS</span>
                </h1>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        to={item.path}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${location.pathname === item.path
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 scale-[1.02]'
                            : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                    >
                        <div className={`${location.pathname === item.path ? 'text-white' : 'text-slate-500'}`}>
                            {item.icon}
                        </div>
                        <span className="font-bold text-sm tracking-tight">{item.name}</span>
                    </Link>
                ))}
            </nav>

            <div className="p-4 border-t border-slate-800/50">
                {/* Agregamos el onClick para ejecutar el cierre de sesión */}
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-3 p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all w-full group font-bold text-sm"
                >
                    <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;