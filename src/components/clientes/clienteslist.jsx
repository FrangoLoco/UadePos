import React from 'react';

const ClientesList = ({ clientes, onOpenModal }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-4 mx-4">
            {/* Header del Directorio */}
            <div className="p-6 flex justify-between items-center bg-white">
                <div className="flex items-center gap-3">
                    {/* Icono de Directorio */}
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <h2 className="text-xl font-semibold text-gray-800">Directorio de Clientes</h2>
                </div>
                {/* 
                    SE AGREGA onClick={onOpenModal} 
                    Este activa el estado isModalOpen en tu archivo pages/clientes.jsx
                */}
                <button
                    onClick={onOpenModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all shadow-sm active:scale-95"
                >
                    <span className="text-lg">+</span> Nuevo Cliente
                </button>
            </div>

            {/* Tabla Estricta */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-t border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre Completo</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Teléfono</th>
                            <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                        {clientes.map((cliente, index) => (
                            <tr key={cliente.id_cliente} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-5 text-gray-400 font-medium">#{index + 1}</td>
                                <td className="px-6 py-5 text-gray-900 font-bold">{cliente.nombre}</td>
                                <td className="px-6 py-5 text-gray-500 font-medium">{cliente.telefono}</td>
                                <td className="px-6 py-5 text-gray-400 font-medium">{cliente.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ClientesList;