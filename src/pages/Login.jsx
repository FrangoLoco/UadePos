import React, { useState } from 'react';
import { Lock, Mail, User, LogIn, UserPlus, ArrowLeft, BadgeCheck } from 'lucide-react';

const Login = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState("");
    const [cargando, setCargando] = useState(false);

    // Estado unificado para Login y Registro
    const [datos, setDatos] = useState({
        name: '',      // nombre completo
        username: '',  // nombre de usuario para login
        email: '',     // correo
        password: ''   // contraseña
    });

    const handleAccion = async (e) => {
        e.preventDefault();
        setError("");
        setCargando(true);

        // Definimos el endpoint según la acción
        const endpoint = isRegistering ? '/api/usuarios/registrar' : '/api/login';

        try {
            const res = await fetch(`http://localhost:8000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datos)
            });

            const resData = await res.json();

            if (res.ok) {
                if (isRegistering) {
                    alert("¡Usuario registrado con éxito! Ahora puedes iniciar sesión.");
                    setIsRegistering(false);
                    setDatos({ ...datos, password: '' }); // Limpiamos contraseña por seguridad
                } else {
                    // Guardamos la sesión y avisamos a App.js
                    localStorage.setItem('usuario', JSON.stringify(resData.usuario));
                    onLogin(resData.usuario);
                }
            } else {
                setError(resData.detail || "Error en la operación. Revisa tus datos.");
            }
        } catch (err) {
            setError("No se pudo conectar con el servidor de Python.");
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header dinámico */}
                <div className="bg-[#1e293b] p-8 text-center relative">
                    <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/20">
                        {isRegistering ? <UserPlus className="text-white" size={30} /> : <Lock className="text-white" size={30} />}
                    </div>
                    <h1 className="text-white text-2xl font-black uppercase tracking-tight">Mi Inventario</h1>
                    <p className="text-slate-400 text-[10px] mt-2 uppercase tracking-[0.2em] font-black">
                        {isRegistering ? 'Crear Cuenta Nueva' : 'Control de Acceso'}
                    </p>
                </div>

                <form onSubmit={handleAccion} className="p-8 space-y-4">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-[11px] font-bold border border-red-100 text-center uppercase tracking-wide">
                            {error}
                        </div>
                    )}

                    {/* Campo NAME (Solo en registro) */}
                    {isRegistering && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Nombre Completo</label>
                            <div className="relative">
                                <BadgeCheck className="absolute left-4 top-3 text-slate-300" size={18} />
                                <input
                                    type="text" required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                                    placeholder="Ej. Sergio Morales"
                                    onChange={(e) => setDatos({ ...datos, name: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Campo USERNAME (Login y Registro) */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Username</label>
                        <div className="relative">
                            <User className="absolute left-4 top-3 text-slate-300" size={18} />
                            <input
                                type="text" required
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                                placeholder="Tu nombre de usuario"
                                value={datos.username}
                                onChange={(e) => setDatos({ ...datos, username: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Campo EMAIL (Solo en registro) */}
                    {isRegistering && (
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3 text-slate-300" size={18} />
                                <input
                                    type="email" required
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                                    placeholder="admin@uadeo.mx"
                                    onChange={(e) => setDatos({ ...datos, email: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {/* Campo PASSWORD */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-3 text-slate-300" size={18} />
                            <input
                                type="password" required
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium text-slate-700"
                                placeholder="••••••••"
                                value={datos.password}
                                onChange={(e) => setDatos({ ...datos, password: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Botón Principal */}
                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none mt-4"
                    >
                        {cargando ? "Procesando..." : isRegistering ? <UserPlus size={18} /> : <LogIn size={18} />}
                        {!cargando && (isRegistering ? 'Crear Usuario' : 'Entrar')}
                    </button>

                    {/* Toggle entre Login/Registro */}
                    <button
                        type="button"
                        onClick={() => { setIsRegistering(!isRegistering); setError(""); }}
                        className="w-full py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                        {isRegistering ? <><ArrowLeft size={12} /> Volver al Inicio de Sesión</> : "Añadir usuario nuevo"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;