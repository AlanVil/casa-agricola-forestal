function cargarCarritoGuardado() {
    try {
        const guardado = JSON.parse(localStorage.getItem("carrito") || "[]");
        if (!Array.isArray(guardado)) return [];
        return guardado
            .filter(item => item && typeof item === "object")
            .map(item => ({
                productoId: typeof item.productoId === "string" ? item.productoId : null,
                nombre: typeof item.nombre === "string" ? item.nombre : "Producto",
                precio: Number(item.precio),
                cantidad: Math.min(99, Math.max(1, Math.trunc(Number(item.cantidad) || 1)))
            }))
            .filter(item => Number.isFinite(item.precio) && item.precio >= 0);
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
    if (!producto) return null;
    if (window.Promociones) return window.Promociones.obtenerPrecio(producto, ahora).precioActual;
    return producto.carrito?.precio ?? null;
}

function agregarProductoAlCarrito(productoId) {
    const ficha = buscarProductoCatalogo(productoId);
    if (!ficha || !ficha.carrito) return;
    agregarCarrito(ficha.carrito.nombre, precioVigente(ficha), ficha.id);
}

function agregarCarrito(nombre, precio, productoId) {
    let producto = carrito.find(item => (productoId && item.productoId === productoId) || item.nombre === nombre);

    if (producto) {
        producto.cantidad++;
        producto.precio = precio;
        if (productoId) producto.productoId = productoId;
    } else {
        carrito.push({
            productoId: productoId || null,
            nombre: nombre,
            precio: precio,
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

    carrito.forEach((producto, indice) => {
        const ficha = buscarProductoCatalogo(producto.productoId, producto.nombre);
        const precioActual = precioVigente(ficha, ahora);
        if (ficha?.carrito) {
            producto.productoId = ficha.id;
            producto.nombre = ficha.carrito.nombre;
            producto.precio = precioActual;
        }

        total += producto.precio * producto.cantidad;
        cantidadTotal += producto.cantidad;

        const item = document.createElement("div");
        item.className = "item-carrito";

        const nombre = document.createElement("strong");
        nombre.textContent = producto.nombre;
        const precio = document.createElement("p");
        precio.textContent = `$${formatearMonto(producto.precio)} MXN`;

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
        vacio.textContent = "Tu carrito está vacío. Explora las categorías para agregar productos con precio disponible.";
        contenedor.appendChild(vacio);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    contador.textContent = cantidadTotal;
    totalElemento.textContent = formatearMonto(total);

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
    const total = carrito.reduce((suma, producto) => suma + producto.precio * producto.cantidad, 0);
    const detalle = carrito.map(producto =>
        `- ${producto.nombre} x${producto.cantidad}: $${formatearMonto(producto.precio * producto.cantidad)} MXN`
    );
    const mensaje = [
        "Hola, quiero consultar este pedido para recoger en tienda:",
        ...detalle,
        `Total estimado: $${formatearMonto(total)} MXN`,
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
        total += producto.precio * producto.cantidad;
    });

    document.getElementById("checkout-total").textContent =
        formatearMonto(total);

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
        (suma, producto) => suma + producto.precio * producto.cantidad,
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
