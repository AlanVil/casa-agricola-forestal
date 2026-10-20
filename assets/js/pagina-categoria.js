/* Comportamiento compartido de las páginas independientes de categorías. */
(function () {
    "use strict";

    const categoria = document.body.dataset.categoria;
    const buscadorPrincipal = document.getElementById("buscarProducto");
    const mensajeSinResultados = document.getElementById("sinResultados");
    const buscadorFlotante = document.getElementById("buscar-producto");
    const productosCatalogo = new Map(
        (window.PRODUCTOS || []).map(producto => [producto.id, producto])
    );

    function normalizarTexto(valor) {
        return String(valor || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, " ")
            .trim()
            .replace(/\s+/g, " ");
    }

    function compactarTexto(valor) {
        return valor.replace(/\s/g, "");
    }

    function crearIndiceBusqueda(tarjeta) {
        const producto = productosCatalogo.get(tarjeta.dataset.productoId);
        if (!producto) return normalizarTexto(tarjeta.textContent);

        return normalizarTexto([
            producto.nombre,
            producto.id,
            producto.codigo,
            producto.descripcion
        ].filter(Boolean).join(" "));
    }

    const botonLimpiar = document.createElement("button");
    botonLimpiar.type = "button";
    botonLimpiar.className = "limpiar-busqueda";
    botonLimpiar.textContent = "Limpiar";
    botonLimpiar.setAttribute("aria-label", "Limpiar búsqueda y mostrar todos los productos");
    botonLimpiar.hidden = true;
    buscadorPrincipal.parentElement.appendChild(botonLimpiar);

    mensajeSinResultados.textContent = "No encontramos productos con esa búsqueda. Prueba con otro nombre o modelo";
    mensajeSinResultados.classList.add("mensaje-sin-resultados");
    mensajeSinResultados.setAttribute("role", "status");
    mensajeSinResultados.setAttribute("aria-live", "polite");

    function filtrarProductos() {
        const texto = normalizarTexto(buscadorPrincipal.value);
        const textoCompacto = compactarTexto(texto);
        const hayConsulta = buscadorPrincipal.value.trim().length > 0;
        const productos = Array.from(document.querySelectorAll(".producto"));
        let visibles = 0;

        productos.forEach(function (producto) {
            const indice = producto.dataset.indiceBusqueda || crearIndiceBusqueda(producto);
            producto.dataset.indiceBusqueda = indice;
            const coincide = !texto
                || indice.includes(texto)
                || compactarTexto(indice).includes(textoCompacto);
            producto.style.display = coincide ? "" : "none";
            if (coincide) visibles++;
        });

        mensajeSinResultados.style.display = visibles === 0 ? "block" : "none";
        botonLimpiar.hidden = !hayConsulta;
        if (buscadorFlotante && buscadorFlotante.value !== buscadorPrincipal.value) {
            buscadorFlotante.value = buscadorPrincipal.value;
        }
    }

    function limpiarBusqueda() {
        buscadorPrincipal.value = "";
        if (buscadorFlotante) buscadorFlotante.value = "";
        filtrarProductos();
        buscadorPrincipal.focus();
    }

    function prepararComparador() {
        const contenedor = document.getElementById("comparador-categoria");
        if (!contenedor || categoria !== "motosierras") return;

        const datos = window.DATOS_MOTOSIERRAS || {};
        const opciones = Object.entries(datos)
            .map(([id, moto]) => `<option value="${id}">STIHL ${moto.nombre}</option>`)
            .join("");

        contenedor.innerHTML = `
            <div class="comparador-motosierras" id="zona-comparador">
                <h2>🪚 ¿Cuál motosierra elegir?</h2>
                <p>Compara nuestros modelos y encuentra la motosierra más adecuada para tu trabajo.</p>
                <button class="boton-comparar" type="button" onclick="abrirComparador()">⚖️ Comparar motosierras</button>
            </div>
            <div id="panel-comparador" class="panel-comparador">
                <h3>⚖️ Comparar motosierras</h3>
                <p>Selecciona dos modelos:</p>
                <select id="modelo1" aria-label="Primer modelo"><option value="">Modelo 1</option>${opciones}</select>
                <select id="modelo2" aria-label="Segundo modelo"><option value="">Modelo 2</option>${opciones}</select>
                <button type="button" onclick="compararMotosierras()">⚖️ Comparar</button>
                <div id="resultado-comparacion"></div>
            </div>`;
    }

    window.abrirBuscador = function () {
        const panel = document.getElementById("panel-buscador");
        const abierto = getComputedStyle(panel).display !== "none";
        panel.style.display = abierto ? "none" : "block";
        if (!abierto) buscadorFlotante.focus();
    };

    window.sincronizarBusquedaFlotante = function () {
        buscadorPrincipal.value = buscadorFlotante.value;
        filtrarProductos();
    };

    window.buscarProductos = filtrarProductos;
    botonLimpiar.addEventListener("click", limpiarBusqueda);
    buscadorPrincipal.addEventListener("input", filtrarProductos);
    prepararComparador();
}());
