let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function agregarCarrito(nombre, precio) {
    let producto = carrito.find(item => item.nombre === nombre);

    if (producto) {
        producto.cantidad++;
    } else {
        carrito.push({
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }

    actualizarCarrito(); }

function actualizarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carrito));

    let contenedor = document.getElementById("productos-carrito");
    let contador = document.getElementById("contador-carrito");
    let totalElemento = document.getElementById("total-carrito");

    contenedor.innerHTML = "";

    let total = 0;
    let cantidadTotal = 0;

    carrito.forEach((producto, indice) => {

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
function abrirCheckout() {

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
