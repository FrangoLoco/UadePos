import React from 'react';
import { UserCircle, Bell, Settings } from 'lucide-react';

const Navbar = ({ usuario }) => {
    return (
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center shadow-sm">
            {/* Texto a la izquierda */}
            <div>
                <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                    Panel de Control
                </h2>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                    Sistema de Inventarios UAdeO
                </p>
            </div>

            {/* Sección Derecha: Notificaciones + Usuario */}
            <div className="flex items-center gap-6">

                {/* Botón de notificaciones decorativo */}
                <button className="text-slate-400 hover:text-blue-600 transition-colors">
                    <Bell size={20} />
                </button>

                <div className="h-8 w-[1px] bg-slate-100"></div>

                {/* Información del usuario logeado */}
                <div className="flex items-center space-x-3">
                    <div className="flex flex-col text-right">
                        {/* Estado en línea */}
                        <span className="text-[10px] font-black text-green-600 leading-none flex items-center justify-end uppercase tracking-tighter">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                            En línea
                        </span>

                        {/* NOMBRE REAL: Usamos el campo 'name' de tu tabla de PostgreSQL */}
                        <span className="text-sm font-black text-slate-700 mt-1 capitalize">
                            {usuario?.name || 'Invitado'}
                        </span>

                        {/* USERNAME: Para darle un toque extra */}
                        <span className="text-[9px] text-slate-400 font-bold italic">
                            @{usuario?.username || 'user'}
                        </span>
                    </div>

                    {/* Avatar con fondo dinámico */}
                    <div className="bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                        <UserCircle size={28} className="text-slate-400" />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;