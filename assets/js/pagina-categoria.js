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
    const listaProductos = document.querySelector("[data-categoria-productos]");

    function obtenerMarca(producto) {
        if (producto?.marca) return producto.marca;
        const primeraPalabra = String(producto?.nombre || "").trim().split(/\s+/)[0];
        const marcasReconocidas = ["STIHL", "FARMTRAC", "Honda", "Kawashima", "Kohler", "PARAZZINI"];
        return marcasReconocidas.includes(primeraPalabra) ? primeraPalabra : "Sin marca especificada";
    }

    function obtenerAlimentacion(producto) {
        if (producto?.alimentacion) return producto.alimentacion;
        const texto = normalizarTexto([
            producto?.descripcion,
            ...(producto?.caracteristicas || [])
        ].join(" "));
        if (texto.includes("bateria")) return "Batería";
        if (texto.includes("gasolina") || texto.includes("2 tiempos") || texto.includes("4 tiempos")) return "Gasolina";
        if (texto.includes("electrico") || texto.includes("voltaje") || texto.includes("watt")) return "Eléctrica";
        if (texto.includes("manual")) return "Manual";
        return "Por confirmar";
    }

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

    const controles = document.createElement("section");
    controles.className = "controles-catalogo";
    controles.setAttribute("aria-label", "Filtros y orden del catálogo");

    function crearSelector(etiqueta, nombre) {
        const grupo = document.createElement("label");
        grupo.className = "control-catalogo";
        const texto = document.createElement("span");
        texto.textContent = etiqueta;
        const selector = document.createElement("select");
        selector.name = nombre;
        grupo.append(texto, selector);
        controles.appendChild(grupo);
        return selector;
    }

    const selectorCategoria = crearSelector("Categoría", "categoria");
    const categorias = [
        ["motosierras", "Motosierras"],
        ["desbrozadoras", "Desbrozadoras"],
        ["maquinaria", "Maquinaria agrícola"],
        ["herramientas", "Herramientas"],
        ["refacciones", "Refacciones"],
        ["limpieza", "Limpieza y jardín"],
        ["motores-bombeo", "Motores y bombeo"]
    ];
    categorias.forEach(([valor, nombre]) => selectorCategoria.add(new Option(nombre, valor, false, valor === categoria)));

    const productosCategoria = (window.PRODUCTOS || []).filter(producto => producto.categoria === categoria);
    const selectorMarca = crearSelector("Marca", "marca");
    selectorMarca.add(new Option("Todas las marcas", ""));
    [...new Set(productosCategoria.map(obtenerMarca))]
        .sort((a, b) => a.localeCompare(b, "es"))
        .forEach(marca => selectorMarca.add(new Option(marca, marca)));

    const selectorAlimentacion = crearSelector("Alimentación", "alimentacion");
    selectorAlimentacion.add(new Option("Todos los tipos", ""));
    [...new Set(productosCategoria.map(obtenerAlimentacion))]
        .sort((a, b) => a.localeCompare(b, "es"))
        .forEach(tipo => selectorAlimentacion.add(new Option(tipo, tipo)));

    const selectorOrden = crearSelector("Ordenar", "orden");
    [
        ["catalogo", "Orden del catálogo"],
        ["nombre-asc", "Nombre: A–Z"],
        ["nombre-desc", "Nombre: Z–A"],
        ["precio-asc", "Precio: menor a mayor"],
        ["precio-desc", "Precio: mayor a menor"]
    ].forEach(([valor, nombre]) => selectorOrden.add(new Option(nombre, valor)));
    buscadorPrincipal.parentElement.insertAdjacentElement("afterend", controles);

    mensajeSinResultados.textContent = "No encontramos productos con esa búsqueda. Prueba con otro nombre o modelo";
    mensajeSinResultados.classList.add("mensaje-sin-resultados");
    mensajeSinResultados.setAttribute("role", "status");
    mensajeSinResultados.setAttribute("aria-live", "polite");

    function filtrarProductos() {
        const texto = normalizarTexto(buscadorPrincipal.value);
        const textoCompacto = compactarTexto(texto);
        const hayConsulta = buscadorPrincipal.value.trim().length > 0;
        const productos = Array.from(document.querySelectorAll(".producto"));
        const marca = selectorMarca.value;
        const alimentacion = selectorAlimentacion.value;
        let visibles = 0;

        productos.forEach(function (tarjeta) {
            const producto = productosCatalogo.get(tarjeta.dataset.productoId);
            const indice = tarjeta.dataset.indiceBusqueda || crearIndiceBusqueda(tarjeta);
            tarjeta.dataset.indiceBusqueda = indice;
            const coincideTexto = !texto
                || indice.includes(texto)
                || compactarTexto(indice).includes(textoCompacto);
            const coincideMarca = !marca || obtenerMarca(producto) === marca;
            const coincideAlimentacion = !alimentacion || obtenerAlimentacion(producto) === alimentacion;
            const coincide = coincideTexto && coincideMarca && coincideAlimentacion;
            tarjeta.style.display = coincide ? "" : "none";
            if (coincide) visibles++;
        });

        if (listaProductos) {
            const orden = selectorOrden.value;
            productos.sort(function (a, b) {
                const productoA = productosCatalogo.get(a.dataset.productoId);
                const productoB = productosCatalogo.get(b.dataset.productoId);
                if (orden === "nombre-asc" || orden === "nombre-desc") {
                    const resultado = productoA.nombre.localeCompare(productoB.nombre, "es");
                    return orden === "nombre-desc" ? -resultado : resultado;
                }
                if (orden === "precio-asc" || orden === "precio-desc") {
                    const precioA = productoA.carrito?.precio;
                    const precioB = productoB.carrito?.precio;
                    if (precioA == null && precioB == null) return productoA.orden - productoB.orden;
                    if (precioA == null) return 1;
                    if (precioB == null) return -1;
                    return orden === "precio-desc" ? precioB - precioA : precioA - precioB;
                }
                return productoA.orden - productoB.orden;
            }).forEach(tarjeta => listaProductos.appendChild(tarjeta));
        }

        mensajeSinResultados.style.display = visibles === 0 ? "block" : "none";
        botonLimpiar.hidden = !hayConsulta;
        if (buscadorFlotante && buscadorFlotante.value !== buscadorPrincipal.value) {
            buscadorFlotante.value = buscadorPrincipal.value;
        }
    }

    function limpiarBusqueda() {
        buscadorPrincipal.value = "";
        if (buscadorFlotante) buscadorFlotante.value = "";
        selectorMarca.value = "";
        selectorAlimentacion.value = "";
        selectorOrden.value = "catalogo";
        filtrarProductos();
        buscadorPrincipal.focus();
    }

    function prepararComparador() {
        const contenedor = document.getElementById("comparador-categoria");
        if (!contenedor || !window.inicializarComparador) return;
        if (categoria === "motosierras" || categoria === "desbrozadoras") {
            window.inicializarComparador(categoria, contenedor);
        }
    }

    function prepararAsesor() {
        const contenedor = document.getElementById("asesor-categoria");
        if (!contenedor || !window.inicializarAsesor) return;
        if (categoria === "motosierras" || categoria === "desbrozadoras") {
            window.inicializarAsesor(categoria, contenedor);
        }
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
    selectorMarca.addEventListener("change", filtrarProductos);
    selectorAlimentacion.addEventListener("change", filtrarProductos);
    selectorOrden.addEventListener("change", filtrarProductos);
    selectorCategoria.addEventListener("change", function () {
        window.location.assign(new URL(`categorias/${selectorCategoria.value}.html`, document.baseURI).href);
    });
    prepararAsesor();
    prepararComparador();
}());
