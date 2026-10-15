let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

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

        contenedor.innerHTML += `
    <div class="item-carrito">

        <strong>${producto.nombre}</strong>

        <p>
            $${producto.precio.toLocaleString()} MXN
        </p>

        <div class="cantidad-carrito">

            <button onclick="disminuirCantidad(${indice})">
                ➖
            </button>

            <span>${producto.cantidad}</span>

            <button onclick="aumentarCantidad(${indice})">
                ➕
            </button>

        </div>

        <button class="eliminar-producto"
                onclick="quitarProducto(${indice})">
            🗑️ Eliminar
        </button>

    </div>
`;
    });

    if (carrito.length === 0) {
        contenedor.innerHTML = "<p>Tu carrito está vacío.</p>";
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    contador.textContent = cantidadTotal;
    totalElemento.textContent = total.toLocaleString();
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
    document.getElementById("ventana-carrito").style.display = "block";
}

function cerrarCarrito() {
    document.getElementById("ventana-carrito").style.display = "none";
}

function generarEnlacePedidoWhatsApp(ahora) {
    actualizarCarrito(ahora);
    const total = carrito.reduce((suma, producto) => suma + producto.precio * producto.cantidad, 0);
    const detalle = carrito.map(producto =>
        `- ${producto.nombre} x${producto.cantidad}: $${(producto.precio * producto.cantidad).toLocaleString("es-MX")} MXN`
    );
    const mensaje = [
        "Hola, quiero consultar este pedido:",
        ...detalle,
        `Total: $${total.toLocaleString("es-MX")} MXN`
    ].join("\n");
    return `https://wa.me/523461230733?text=${encodeURIComponent(mensaje)}`;
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
        total.toLocaleString();

    cerrarCarrito();

    document.getElementById("checkout").style.display = "block";
}

function cerrarCheckout() {
    document.getElementById("checkout").style.display = "none";
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
