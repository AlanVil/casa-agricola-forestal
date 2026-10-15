/* Comportamiento compartido de las páginas independientes de categorías. */
(function () {
    "use strict";

    const categoria = document.body.dataset.categoria;
    const buscadorPrincipal = document.getElementById("buscarProducto");
    const mensajeSinResultados = document.getElementById("sinResultados");

    function filtrarProductos() {
        const texto = buscadorPrincipal.value.toLowerCase().trim();
        const productos = Array.from(document.querySelectorAll(".producto"));
        let visibles = 0;

        productos.forEach(function (producto) {
            const coincide = producto.textContent.toLowerCase().includes(texto);
            producto.style.display = coincide ? "" : "none";
            if (coincide) visibles++;
        });

        mensajeSinResultados.style.display = visibles === 0 ? "block" : "none";
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
        const buscadorFlotante = document.getElementById("buscar-producto");
        const abierto = getComputedStyle(panel).display !== "none";
        panel.style.display = abierto ? "none" : "block";
        if (!abierto) buscadorFlotante.focus();
    };

    window.sincronizarBusquedaFlotante = function () {
        const buscadorFlotante = document.getElementById("buscar-producto");
        buscadorPrincipal.value = buscadorFlotante.value;
        filtrarProductos();
    };

    window.buscarProductos = filtrarProductos;
    buscadorPrincipal.addEventListener("input", filtrarProductos);
    prepararComparador();
}());
