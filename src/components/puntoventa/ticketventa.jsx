import React from 'react';

const TicketVenta = ({ items, total, onCobrar, onAbrirCatalogo }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden w-full max-w-2xl mx-auto">
            {/* Cabecera del Ticket */}
            <div className="bg-[#1e293b] p-4 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span className="font-bold text-sm">Ticket de Venta</span>
                </div>
                <span className="bg-gray-700 px-3 py-1 rounded text-[10px] uppercase font-medium text-gray-300">
                    Venta #231
                </span>
            </div>

            {/* Cuerpo del Carrito */}
            <div className="p-12 flex flex-col items-center justify-center min-h-[300px] border-b border-gray-100">
                {items && items.length > 0 ? (
                    /* Aquí iría el mapeo de productos si hubiera */
                    <div className="w-full"> {/* Lista de productos */} </div>
                ) : (
                    <div className="text-center">
                        <svg className="w-16 h-16 text-gray-100 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        <p className="text-gray-400 font-semibold text-lg">El carrito está vacío</p>
                        <p className="text-gray-300 text-sm">Selecciona productos a la izquierda para agregarlos</p>
                    </div>
                )}
            </div>

            {/* Footer con Total y Botones */}
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-medium text-lg">Total a pagar:</span>
                    <span className="text-gray-800 font-bold text-4xl">${total.toFixed(2)}</span>
                </div>

                {/* CONTENEDOR DE BOTONES */}
                <div className="flex gap-4">
                    {/* NUEVO BOTÓN: AÑADIR PRODUCTOS */}
                    <button
                        onClick={onAbrirCatalogo}
                        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-md flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Añadir Productos
                    </button>

                    {/* BOTÓN COBRAR */}
                    <button
                        onClick={onCobrar}
                        className="flex-1 bg-[#86efac] hover:bg-[#4ade80] text-[#166534] font-bold py-4 rounded-xl transition-all active:scale-95 shadow-md"
                    >
                        Cobrar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketVenta;