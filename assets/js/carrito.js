function cargarCarritoGuardado() {
    try {
        const guardado = JSON.parse(localStorage.getItem("carrito") || "[]");
        if (!Array.isArray(guardado)) return [];
        return guardado
            .filter(item => item && typeof item === "object")
            .map(item => {
                const precio = item.precio === null || item.precio === undefined || item.precio === ""
                    ? null
                    : Number(item.precio);
                return {
                    productoId: typeof item.productoId === "string" ? item.productoId : null,
                    nombre: typeof item.nombre === "string" ? item.nombre : "Producto",
                    modelo: typeof item.modelo === "string" ? item.modelo : (typeof item.nombre === "string" ? item.nombre : "Producto"),
                    precio: Number.isFinite(precio) && precio >= 0 ? precio : null,
                    requiereCotizacion: Boolean(item.requiereCotizacion) || !(Number.isFinite(precio) && precio >= 0),
                    cantidad: Math.min(99, Math.max(1, Math.trunc(Number(item.cantidad) || 1)))
                };
            })
            .filter(item => item.nombre && (item.requiereCotizacion || Number.isFinite(item.precio)));
    } catch (error) {
        console.warn("No fue posible recuperar el carrito guardado; se iniciará uno nuevo.");
        return [];
    }
}

let carrito = cargarCarritoGuardado();
let elementoFocoAnterior = null;

const SUCURSALES_RECOGIDA = Object.freeze({
    "san-felipe": Object.freeze({
        nombre: "Sucursal San Felipe / Zitácuaro",
        direccion: "Carretera Toluca–Morelia km 105 SN, CP 61529, Zitácuaro, Michoacán",
        telefono: "7151348109",
        whatsapp: "527151348109"
    }),
    "ciudad-hidalgo": Object.freeze({
        nombre: "Sucursal Ciudad Hidalgo",
        direccion: "Av. Morelos Oriente N342, Col. El Paraíso, CP 61183, Ciudad Hidalgo, Michoacán",
        telefono: "7861256908",
        whatsapp: "527861256908"
    })
});

function formatearMonto(monto) {
    return monto.toLocaleString("es-MX", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function buscarProductoCatalogo(productoId, nombre) {
    return (window.PRODUCTOS || []).find(producto => producto.id === productoId)
        || (window.PRODUCTOS || []).find(producto => producto.carrito?.nombre === nombre)
        || null;
}

function precioVigente(producto, ahora) {
    if (!producto || producto.soloCotizacion || !Number.isFinite(producto.carrito?.precio)) return null;
    if (window.Promociones) return window.Promociones.obtenerPrecio(producto, ahora).precioActual;
    return producto.carrito?.precio ?? null;
}

function requiereCotizacion(producto, precio) {
    return Boolean(producto?.soloCotizacion) || !Number.isFinite(precio);
}

function agregarProductoAlCarrito(productoId) {
    const ficha = buscarProductoCatalogo(productoId);
    if (!ficha) return;
    const precio = precioVigente(ficha);
    agregarCarrito(
        ficha.carrito?.nombre || ficha.nombre,
        precio,
        ficha.id,
        requiereCotizacion(ficha, precio),
        ficha.modelo || ficha.nombre
    );
}

function agregarCarrito(nombre, precio, productoId, pendienteCotizacion, modelo) {
    const precioNormalizado = Number.isFinite(precio) && precio >= 0 ? precio : null;
    const esPendiente = Boolean(pendienteCotizacion) || precioNormalizado === null;
    let producto = carrito.find(item => (productoId && item.productoId === productoId) || item.nombre === nombre);

    if (producto) {
        producto.cantidad++;
        producto.precio = precioNormalizado;
        producto.requiereCotizacion = esPendiente;
        producto.modelo = modelo || producto.modelo || nombre;
        if (productoId) producto.productoId = productoId;
    } else {
        carrito.push({
            productoId: productoId || null,
            nombre: nombre,
            modelo: modelo || nombre,
            precio: precioNormalizado,
            requiereCotizacion: esPendiente,
            cantidad: 1
        });
    }

    actualizarCarrito(); }

function actualizarCarrito(ahora) {
    let contenedor = document.getElementById("productos-carrito");
    let contador = document.getElementById("contador-carrito");
    let totalElemento = document.getElementById("total-carrito");

    contenedor.innerHTML = "";

    let total = 0;
    let cantidadTotal = 0;
    let hayPendientes = false;

    carrito.forEach((producto, indice) => {
        const ficha = buscarProductoCatalogo(producto.productoId, producto.nombre);
        const precioActual = precioVigente(ficha, ahora);
        if (ficha) {
            producto.productoId = ficha.id;
            producto.nombre = ficha.carrito?.nombre || ficha.nombre;
            producto.precio = precioActual;
            producto.requiereCotizacion = requiereCotizacion(ficha, precioActual);
        }

        if (producto.requiereCotizacion || !Number.isFinite(producto.precio)) {
            hayPendientes = true;
        } else {
            total += producto.precio * producto.cantidad;
        }
        cantidadTotal += producto.cantidad;

        const item = document.createElement("div");
        item.className = "item-carrito";

        const nombre = document.createElement("strong");
        nombre.textContent = producto.nombre;
        const precio = document.createElement("p");
        if (producto.requiereCotizacion || !Number.isFinite(producto.precio)) {
            precio.className = "precio-pendiente-carrito";
            precio.textContent = "Pendiente de cotización";
        } else {
            precio.textContent = `$${formatearMonto(producto.precio)} MXN`;
        }

        const controles = document.createElement("div");
        controles.className = "cantidad-carrito";
        const disminuir = document.createElement("button");
        disminuir.type = "button";
        disminuir.textContent = "➖";
        disminuir.setAttribute("aria-label", `Disminuir cantidad de ${producto.nombre}`);
        disminuir.addEventListener("click", () => disminuirCantidad(indice));
        const cantidad = document.createElement("span");
        cantidad.textContent = producto.cantidad;
        cantidad.setAttribute("aria-label", `Cantidad: ${producto.cantidad}`);
        const aumentar = document.createElement("button");
        aumentar.type = "button";
        aumentar.textContent = "➕";
        aumentar.setAttribute("aria-label", `Aumentar cantidad de ${producto.nombre}`);
        aumentar.addEventListener("click", () => aumentarCantidad(indice));
        controles.append(disminuir, cantidad, aumentar);

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "eliminar-producto";
        eliminar.textContent = "🗑️ Eliminar";
        eliminar.setAttribute("aria-label", `Eliminar ${producto.nombre} del carrito`);
        eliminar.addEventListener("click", () => quitarProducto(indice));

        item.append(nombre, precio, controles, eliminar);
        contenedor.appendChild(item);
    });

    if (carrito.length === 0) {
        const vacio = document.createElement("p");
        vacio.textContent = "Tu solicitud está vacía. Explora las categorías para agregar productos.";
        contenedor.appendChild(vacio);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    contador.textContent = cantidadTotal;
    totalElemento.textContent = formatearMonto(total);

    const encabezadoTotal = totalElemento.closest("h3");
    if (encabezadoTotal?.firstChild) {
        encabezadoTotal.firstChild.nodeValue = hayPendientes ? "Total parcial: $" : "Total: $";
    }
    let avisoParcial = document.querySelector(".aviso-total-parcial");
    if (!avisoParcial && encabezadoTotal) {
        avisoParcial = document.createElement("p");
        avisoParcial.className = "aviso-total-parcial";
        avisoParcial.setAttribute("role", "status");
        encabezadoTotal.after(avisoParcial);
    }
    if (avisoParcial) {
        avisoParcial.hidden = !hayPendientes;
        avisoParcial.textContent = hayPendientes
            ? "El total parcial sólo incluye productos con precio publicado; los demás se cotizarán por separado."
            : "";
    }

    const botonPedido = document.querySelector(".boton-pagar");
    if (botonPedido) {
        botonPedido.disabled = carrito.length === 0;
        botonPedido.setAttribute("aria-disabled", String(carrito.length === 0));
    }
}
function aumentarCantidad(indice) {
    carrito[indice].cantidad++;
    actualizarCarrito();
}

function disminuirCantidad(indice) {

    if (carrito[indice].cantidad > 1) {
        carrito[indice].cantidad--;
    } else {
        carrito.splice(indice, 1);
    }

    actualizarCarrito();
}
function quitarProducto(indice) {
    carrito.splice(indice, 1);
    actualizarCarrito();
}

function abrirCarrito() {
    elementoFocoAnterior = document.activeElement;
    const ventana = document.getElementById("ventana-carrito");
    ventana.style.display = "block";
    ventana.setAttribute("aria-hidden", "false");
    ventana.querySelector(".cerrar-carrito")?.focus();
}

function cerrarCarrito() {
    const ventana = document.getElementById("ventana-carrito");
    ventana.style.display = "none";
    ventana.setAttribute("aria-hidden", "true");
    elementoFocoAnterior?.focus?.();
}

function generarEnlacePedidoWhatsApp(sucursalId, ahora) {
    const sucursal = SUCURSALES_RECOGIDA[sucursalId];
    if (!sucursal || carrito.length === 0) return null;

    actualizarCarrito(ahora);
    const hayPendientes = carrito.some(producto => producto.requiereCotizacion || !Number.isFinite(producto.precio));
    const total = carrito.reduce((suma, producto) =>
        suma + (producto.requiereCotizacion || !Number.isFinite(producto.precio) ? 0 : producto.precio * producto.cantidad), 0
    );
    const detalle = carrito.map(producto => producto.requiereCotizacion || !Number.isFinite(producto.precio)
        ? `- ${producto.nombre} x${producto.cantidad}: Pendiente de cotización`
        : `- ${producto.nombre} x${producto.cantidad}: $${formatearMonto(producto.precio * producto.cantidad)} MXN`
    );
    const mensaje = [
        "Hola, quiero consultar este pedido para recoger en tienda:",
        ...detalle,
        `${hayPendientes ? "Total parcial" : "Total estimado"}: $${formatearMonto(total)} MXN`,
        ...(hayPendientes ? ["El total parcial sólo incluye los productos con precio publicado."] : []),
        "",
        `Sucursal para recoger: ${sucursal.nombre}`,
        `Dirección: ${sucursal.direccion}`,
        "",
        "El pedido está sujeto a confirmación de disponibilidad y precio final por parte de la tienda.",
        "El envío de este mensaje no confirma el pedido."
    ].join("\n");
    if (window.Contactos) return window.Contactos.crearEnlaceWhatsApp(sucursalId, mensaje);
    return `https://wa.me/${sucursal.whatsapp}?text=${encodeURIComponent(mensaje)}`;
}

function abrirCheckout() {

    actualizarCarrito();

    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let total = 0;

    carrito.forEach(producto => {
        if (!producto.requiereCotizacion && Number.isFinite(producto.precio)) {
            total += producto.precio * producto.cantidad;
        }
    });

    document.getElementById("checkout-total").textContent =
        formatearMonto(total);
    const resumenCheckout = document.querySelector(".checkout-total");
    if (resumenCheckout?.firstChild) {
        const hayPendientes = carrito.some(producto => producto.requiereCotizacion || !Number.isFinite(producto.precio));
        resumenCheckout.firstChild.nodeValue = hayPendientes ? "Total parcial: " : "Total estimado: ";
    }

    cerrarCarrito();

    const checkout = document.getElementById("checkout");
    checkout.style.display = "block";
    checkout.setAttribute("aria-hidden", "false");

    const errorSucursal = document.getElementById("error-sucursal");
    if (errorSucursal) errorSucursal.hidden = true;
    const sucursalSeleccionada = document.querySelector('input[name="sucursal-recogida"]:checked');
    const primeraSucursal = document.querySelector('input[name="sucursal-recogida"]');
    (sucursalSeleccionada || primeraSucursal)?.focus();
}

function cerrarCheckout() {
    const checkout = document.getElementById("checkout");
    checkout.style.display = "none";
    checkout.setAttribute("aria-hidden", "true");
    elementoFocoAnterior?.focus?.();
}

function volverAlCarrito() {
    cerrarCheckout();
    abrirCarrito();
}

function enviarPedidoWhatsApp() {
    actualizarCarrito();

    if (carrito.length === 0) {
        cerrarCheckout();
        abrirCarrito();
        alert("Tu carrito está vacío. Agrega al menos un producto antes de preparar el pedido.");
        return;
    }

    const totalVigente = carrito.reduce(
        (suma, producto) => suma + (producto.requiereCotizacion || !Number.isFinite(producto.precio) ? 0 : producto.precio * producto.cantidad),
        0
    );
    const totalCheckout = document.getElementById("checkout-total");
    if (totalCheckout) totalCheckout.textContent = formatearMonto(totalVigente);

    const sucursalSeleccionada = document.querySelector('input[name="sucursal-recogida"]:checked');
    const errorSucursal = document.getElementById("error-sucursal");

    if (!sucursalSeleccionada) {
        if (errorSucursal) errorSucursal.hidden = false;
        document.querySelector('input[name="sucursal-recogida"]')?.focus();
        return;
    }

    if (errorSucursal) errorSucursal.hidden = true;
    const enlace = generarEnlacePedidoWhatsApp(sucursalSeleccionada.value);
    if (!enlace) return;

    const ventanaWhatsApp = window.open(enlace, "_blank", "noopener,noreferrer");
    if (ventanaWhatsApp) ventanaWhatsApp.opener = null;
}

function continuarPago() {

    actualizarCarrito();

    let nombre = document.getElementById("cliente-nombre").value.trim();
    let telefono = document.getElementById("cliente-telefono").value.trim();
    let email = document.getElementById("cliente-email").value.trim();

    if (nombre === "") {
        alert("Por favor escribe tu nombre completo.");
        document.getElementById("cliente-nombre").focus();
        return;
    }

    if (!/^[0-9]{10}$/.test(telefono)) {
        alert("Escribe un número de teléfono válido de 10 dígitos.");
        document.getElementById("cliente-telefono").focus();
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        alert("Escribe un correo electrónico válido.");
        document.getElementById("cliente-email").focus();
        return;
    }

    alert("✅ Datos correctos. El pago con tarjeta se habilitará próximamente.");
}

actualizarCarrito();

document.querySelectorAll(".ventana-carrito, .ventana-checkout").forEach(function (ventana) {
    ventana.setAttribute("aria-hidden", ventana.style.display === "block" ? "false" : "true");
    const contenido = ventana.querySelector(".carrito-contenido, .checkout-contenido");
    const titulo = contenido?.querySelector("h2");
    if (!contenido || !titulo) return;
    if (!titulo.id) titulo.id = ventana.id === "checkout" ? "titulo-checkout" : "titulo-carrito";
    contenido.setAttribute("role", "dialog");
    contenido.setAttribute("aria-modal", "true");
    contenido.setAttribute("aria-labelledby", titulo.id);
});

document.addEventListener("keydown", function (evento) {
    if (evento.key !== "Escape") return;
    const checkout = document.getElementById("checkout");
    const ventanaCarrito = document.getElementById("ventana-carrito");
    if (checkout?.style.display === "block") cerrarCheckout();
    else if (ventanaCarrito?.style.display === "block") cerrarCarrito();
});
