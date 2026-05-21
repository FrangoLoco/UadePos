import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layouts/sidebar';
import Navbar from './components/layouts/navbar';

// Importación de las páginas
import Login from './pages/Login'; // Importamos tu nueva página de Login
import Inicio from './pages/inicio';
import PuntoVenta from './pages/puntoventa';
import Productos from './pages/productos';
import Compras from './pages/compras';
import Clientes from './pages/clientes';
import Reportes from './pages/reportes';

function App() {
    // Estado para verificar si el usuario está logueado
    const [usuario, setUsuario] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        // Al cargar la app, revisamos si ya existe una sesión guardada
        const sesionGuardada = localStorage.getItem('usuario');
        if (sesionGuardada) {
            setUsuario(JSON.parse(sesionGuardada));
        }
        setCargando(false);
    }, []);

    // Función para cerrar sesión
    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        setUsuario(null);
    };

    if (cargando) return null; // Evita parpadeos mientras lee el localStorage

    // Si NO hay usuario, solo mostramos la página de Login
    if (!usuario) {
        return <Login onLogin={(user) => setUsuario(user)} />;
    }

    // Si HAY usuario, mostramos toda la estructura del inventario
    return (
        <Router>
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                {/* Menú lateral fijo */}
                <Sidebar onLogout={cerrarSesion} />

                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Barra superior fija pasándole los datos del usuario */}
                    <Navbar usuario={usuario} />

                    <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
                        <Routes>
                            <Route path="/" element={<Inicio />} />
                            <Route path="/puntoventa" element={<PuntoVenta />} />
                            <Route path="/reportes" element={<Reportes />} />
                            <Route path="/productos" element={<Productos />} />
                            <Route path="/clientes" element={<Clientes />} />
                            <Route path="/compras" element={<Compras />} />

                            {/* Redirección por defecto si la ruta no existe */}
                            <Route path="*" element={<Navigate to="/" />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </Router>
    );
}

export default App;