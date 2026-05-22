# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from database import get_db_connection
from psycopg2.extras import RealDictCursor
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
# Verifica que tengas esta importación arriba

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Schemas ────────────────────────────────────────────────────────────────

class ProductoSchema(BaseModel):
    codigo_barras: Optional[str] = None
    nombre: Optional[str] = None
    id_categoria: Optional[int] = None
    stock_actual: Optional[int] = None
    stock_minimo: Optional[int] = None
    precio_venta: Optional[float] = None
    precio_compra: Optional[float] = None

class ItemVenta(BaseModel):
    id_producto: int
    cantidad: int
    precio: float

class VentaSchema(BaseModel):
    items: list[ItemVenta]
    total: float
    id_cliente: int

class ItemCompra(BaseModel):
    id_producto: int
    cantidad: int
    precio_compra: float

class RegistroCompra(BaseModel):
    id_proveedor: int
    items: list[ItemCompra]

class ProveedorSchema(BaseModel):
    nombre: str

class ClienteSchema(BaseModel):
    nombre: str
    telefono: str
    email: str


# ─── Helper ─────────────────────────────────────────────────────────────────

def get_conn():
    """Obtiene conexión o lanza 503 inmediatamente."""
    conn = get_db_connection()
    if conn is None:
        raise HTTPException(status_code=503, detail="No se pudo conectar a la base de datos")
    return conn


# ─── Root ────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"status": "Servidor de Python funcionando"}


# ─── Categorías ─────────────────────────────────────────────────────────────

@app.get("/api/categorias")
def obtener_categorias():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id_categoria, nombre FROM categorias ORDER BY nombre ASC")
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# ─── Productos ───────────────────────────────────────────────────────────────

@app.get("/api/productos/lista")
def listar_productos_nombres():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id_producto, nombre FROM productos ORDER BY nombre ASC")
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/productos/lista-venta")
def lista_productos_venta():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT id_producto, codigo_barras, nombre, precio_venta, stock_actual 
            FROM productos 
            WHERE stock_actual > 0
        """)
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/productos")
def obtener_productos():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT 
                p.id_producto, 
                p.codigo_barras, 
                p.nombre, 
                p.stock_actual, 
                p.stock_minimo, 
                p.precio_venta,
                p.precio_compra,
                c.nombre AS categoria
            FROM productos p
            LEFT JOIN categorias c ON p.id_categoria = c.id_categoria
            ORDER BY p.id_producto DESC
        """)
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/productos")
def crear_producto(item: ProductoSchema):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO productos 
                (codigo_barras, nombre, id_categoria, stock_actual, stock_minimo, precio_venta, precio_compra)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            item.codigo_barras, item.nombre, item.id_categoria,
            item.stock_actual, item.stock_minimo, item.precio_venta, item.precio_compra
        ))
        conn.commit()
        return {"mensaje": "Producto agregado"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.put("/api/productos/{id_producto}")
def actualizar_producto(id_producto: int, item: ProductoSchema):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE productos 
            SET codigo_barras=%s, nombre=%s, id_categoria=%s, 
                stock_actual=%s, stock_minimo=%s, precio_venta=%s, precio_compra=%s
            WHERE id_producto = %s
        """, (
            item.codigo_barras, item.nombre, item.id_categoria,
            item.stock_actual, item.stock_minimo, item.precio_venta, item.precio_compra,
            id_producto
        ))
        conn.commit()
        return {"mensaje": "Producto actualizado"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
# ───login───────────────────────────────────────────────────────────────
# pyrefly: ignore [missing-import]
# ─── Login & Usuarios ───────────────────────────────────────────────────────

class RegistroUsuarioSchema(BaseModel):
    name: str       
    username: str   
    email: str
    password: str

@app.post("/api/usuarios/registrar")
def registrar_usuario(datos: RegistroUsuarioSchema):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("""
            INSERT INTO usuarios (name, username, email, password, id_rol)
            VALUES (%s, %s, %s, %s, 1)
        """, (datos.name, datos.username, datos.email, datos.password))
        conn.commit()
        return {"status": "success", "mensaje": "Usuario registrado"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=400, detail="Error: El username o email ya existen")
    finally:
        cur.close()
        conn.close()

# ─── Esquema de Login Actualizado ───────────────────────────────────────────

# 1. Asegúrate de que el Schema reciba 'username'

class LoginSchema(BaseModel):
    username: str  # Cambiado de email a username
    password: str

@app.post("/api/login")
def login(datos: LoginSchema):
    conn = get_conn()
    # Usamos RealDictCursor para que React reciba un objeto JSON con nombres de columnas
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # Consulta ajustada exactamente a image_e9dbf9.png
        cur.execute("""
            SELECT id_usuario, name, email, id_rol, username 
            FROM usuarios 
            WHERE username = %s AND password = %s
        """, (datos.username, datos.password))
        
        usuario = cur.fetchone()
        
        if usuario:
            # Si lo encuentra, regresamos el usuario
            return {"status": "success", "usuario": usuario}
        else:
            # Si no coincide, error 401
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    except Exception as e:
        # ESTO ES LO QUE DEBES BUSCAR EN TU TERMINAL NEGRA:
        print(f"DEBUG LOGIN ERROR: {e}") 
        raise HTTPException(status_code=500, detail="Error interno del servidor")
    finally:
        cur.close()
        conn.close()
# ─── Dashboard ───────────────────────────────────────────────────────────────

@app.get("/api/dashboard")
def datos_dashboard():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        # 1. Ventas del día
        cur.execute("SELECT COALESCE(SUM(total), 0) as ventas_dia FROM ventas WHERE fecha::date = CURRENT_DATE;")
        ventas_dia = cur.fetchone()["ventas_dia"]

        # 2. Total de productos en inventario
        cur.execute("SELECT COUNT(*) as total FROM productos;")
        total_prod = cur.fetchone()["total"]
        
        # 3. Obtener la LISTA de productos con stock bajo (Alertas)
        # Importante: Aquí obtenemos los datos para la tabla del inicio
        cur.execute("""
            SELECT nombre, stock_actual, stock_minimo, codigo_barras 
            FROM productos 
            WHERE stock_actual <= stock_minimo;
        """)
        productos_alerta = cur.fetchall()
        conteo_alertas = len(productos_alerta)

        # 4. Conteo de Clientes (ID > 1 para ignorar al genérico)
        cur.execute("SELECT COUNT(*) as nuevos FROM clientes WHERE id_cliente > 1;")
        clientes_totales = cur.fetchone()["nuevos"]

        return {
            "ventas_totales": float(ventas_dia),
            "stock_total": total_prod,
            "conteo_alertas": conteo_alertas,
            "clientes_recientes": clientes_totales,
            "lista_critica": productos_alerta  # <-- Esta es la clave que lee tu tabla de inicio
        }
    except Exception as e:
        print(f"Error en dashboard: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# ─── Compras ─────────────────────────────────────────────────────────────────

@app.get("/api/compras/historial")
def obtener_historial_compras():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT 
                c.folio, 
                COALESCE(p.nombre, 'Proveedor Desconocido') AS proveedor, 
                c.fecha::text, 
                c.total_factura AS total
            FROM compras c
            LEFT JOIN proveedores p ON c.id_proveedor = p.id_proveedor
            ORDER BY c.id_compra DESC
        """)
        return cur.fetchall()
    except Exception as e:
        print(f"Error en historial compras: {e}")
        return []
    finally:
        cur.close()
        conn.close()

@app.post("/api/compras/registrar")
def registrar_compra(datos: RegistroCompra):
    conn = get_conn()
    cur = conn.cursor()
    try:
        total_factura = sum(item.cantidad * item.precio_compra for item in datos.items)

        cur.execute("""
            INSERT INTO compras (id_proveedor, total_factura)
            VALUES (%s, %s)
            RETURNING folio
        """, (datos.id_proveedor, total_factura))
        nuevo_folio = cur.fetchone()[0]

        for item in datos.items:
            cur.execute("""
                UPDATE productos 
                SET stock_actual = stock_actual + %s 
                WHERE id_producto = %s
            """, (item.cantidad, item.id_producto))

        conn.commit()
        return {"status": "success", "mensaje": f"Compra {nuevo_folio} registrada"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# ─── Clientes ────────────────────────────────────────────────────────────────

@app.get("/api/clientes")
def obtener_clientes():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id_cliente, nombre, telefono, email FROM clientes ORDER BY id_cliente DESC")
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/clientes")
def crear_cliente(item: ClienteSchema):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute(
            "INSERT INTO clientes (nombre, telefono, email) VALUES (%s, %s, %s)",
            (item.nombre, item.telefono, item.email)
        )
        conn.commit()
        return {"status": "success", "mensaje": "Cliente guardado"}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# ─── Ventas ──────────────────────────────────────────────────────────────────

@app.post("/api/ventas")
def realizar_venta(datos: VentaSchema):
    conn = get_conn()
    cur = conn.cursor()
    try:
        # Validar stock antes de insertar nada
        for item in datos.items:
            cur.execute(
                "SELECT stock_actual, nombre FROM productos WHERE id_producto = %s",
                (item.id_producto,)
            )
            producto = cur.fetchone()
            if producto is None:
                raise HTTPException(status_code=404, detail=f"Producto {item.id_producto} no encontrado")
            stock_actual, nombre = producto
            if stock_actual < item.cantidad:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente para '{nombre}': disponible {stock_actual}, solicitado {item.cantidad}"
                )

        cur.execute(
            "INSERT INTO ventas (total, fecha, id_cliente, usuario_id) VALUES (%s, NOW(), %s, 1) RETURNING id_venta",
            (datos.total, datos.id_cliente)
        )
        id_venta = cur.fetchone()[0]

        for item in datos.items:
            cur.execute(
                "INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio_venta) VALUES (%s, %s, %s, %s)",
                (id_venta, item.id_producto, item.cantidad, item.precio)
            )
            cur.execute(
                "UPDATE productos SET stock_actual = stock_actual - %s WHERE id_producto = %s",
                (item.cantidad, item.id_producto)
            )

        conn.commit()
        return {"status": "success", "mensaje": "Venta guardada"}
    except HTTPException:
        conn.rollback()
        raise
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# ─── Proveedores ─────────────────────────────────────────────────────────────

@app.get("/api/proveedores")
def listar_proveedores():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT id_proveedor, nombre FROM proveedores ORDER BY nombre ASC")
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.post("/api/proveedores")
def crear_proveedor(prov: ProveedorSchema):
    conn = get_conn()
    cur = conn.cursor()
    try:
        cur.execute("INSERT INTO proveedores (nombre) VALUES (%s) RETURNING id_proveedor", (prov.nombre,))
        id_nuevo = cur.fetchone()[0]
        conn.commit()
        return {"id_proveedor": id_nuevo}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# ─── Reportes ────────────────────────────────────────────────────────────────

@app.get("/api/reportes/ventas-totales")
def reporte_ventas():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT v.id_venta, v.fecha::text, v.total, c.nombre as cliente
            FROM ventas v
            JOIN clientes c ON v.id_cliente = c.id_cliente
            ORDER BY v.fecha DESC
            LIMIT 50
        """)
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/reportes/top-productos")
def reporte_productos():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("""
            SELECT p.nombre, SUM(dv.cantidad) as total_vendido
            FROM detalle_venta dv
            JOIN productos p ON dv.id_producto = p.id_producto
            GROUP BY p.nombre
            ORDER BY total_vendido DESC
            LIMIT 5
        """)
        return cur.fetchall()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()

@app.get("/api/reportes/ganancias")
def obtener_reporte_ganancias():
    conn = get_conn()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    try:
        cur.execute("SELECT * FROM reporte_ganancias")
        resultado = cur.fetchone()
        return resultado if resultado else {
            "ingresos_brutos": 0,
            "costo_inventario": 0,
            "margen_ganancia": 0
        }
    except Exception as e:
        print(f"Error en reporte: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()


# ─── Entry point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)