/* Ficha individual reutilizable del catálogo. */
(function () {
    "use strict";

    const categorias = Object.freeze({
        motosierras: { nombre: "Motosierras", url: "categorias/motosierras.html" },
        desbrozadoras: { nombre: "Desbrozadoras", url: "categorias/desbrozadoras.html" },
        maquinaria: { nombre: "Maquinaria agrícola", url: "categorias/maquinaria.html" },
        herramientas: { nombre: "Herramientas", url: "categorias/herramientas.html" },
        refacciones: { nombre: "Refacciones", url: "categorias/refacciones.html" },
        limpieza: { nombre: "Limpieza y jardín", url: "categorias/limpieza.html" },
        "motores-bombeo": { nombre: "Motores y bombeo", url: "categorias/motores-bombeo.html" }
    });

    const contenedor = document.getElementById("detalle-producto");
    const enlaceCategoria = document.getElementById("enlace-categoria-superior");
    const migaProducto = document.getElementById("miga-producto");

    function elemento(etiqueta, clase, texto) {
        const nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (texto !== undefined) nodo.textContent = texto;
        return nodo;
    }

    function mostrarError() {
        const idSolicitado = new URLSearchParams(window.location.search).get("id");
        document.title = "Producto no encontrado | Casa Agrícola y Forestal";
        document.querySelector('meta[name="description"]').content = "Producto no encontrado en el catálogo de Casa Agrícola y Forestal.";
        migaProducto.textContent = "Producto no encontrado";
        contenedor.className = "producto-premium producto-no-encontrado";
        contenedor.setAttribute("aria-busy", "false");
        contenedor.replaceChildren();

        const distintivo = elemento("span", "producto-etiqueta", "Catálogo");
        const titulo = elemento("h1", null, "No encontramos este producto");
        const texto = elemento(
            "p",
            null,
            idSolicitado
                ? "El producto solicitado no existe en el catálogo. Puedes volver para seguir consultando productos."
                : "Este enlace no incluye un identificador de producto. Puedes volver al catálogo para seguir consultando productos."
        );
        const acciones = elemento("div", "producto-acciones-error");
        const volver = elemento("a", "producto-boton producto-boton-principal", "Ver categorías");
        volver.href = "index.html#productos";
        acciones.appendChild(volver);
        contenedor.append(distintivo, titulo, texto, acciones);
    }

    function crearGaleria(producto) {
        const galeria = elemento("div", "producto-galeria");
        const marco = elemento("div", "producto-imagen-marco");
        const principal = document.createElement("img");
        const alternativa = elemento("p", "producto-imagen-no-disponible", "Imagen no disponible");
        const primera = producto.imagenes[0];
        principal.className = "producto-imagen-principal";
        principal.src = primera.src;
        principal.alt = primera.alt;
        principal.decoding = "async";
        alternativa.hidden = true;
        principal.addEventListener("error", function () {
            principal.hidden = true;
            alternativa.hidden = false;
            galeria.classList.add("sin-imagen");
        });
        marco.append(principal, alternativa);
        galeria.appendChild(marco);

        if (producto.imagenes.length > 1) {
            const miniaturas = elemento("div", "producto-miniaturas");
            miniaturas.setAttribute("aria-label", "Seleccionar fotografía del producto");
            producto.imagenes.forEach(function (datos, indice) {
                const boton = elemento("button", "producto-miniatura");
                boton.type = "button";
                boton.setAttribute("aria-label", `Mostrar fotografía ${indice + 1} de ${producto.nombre}`);
                if (indice === 0) boton.setAttribute("aria-current", "true");
                const imagen = document.createElement("img");
                imagen.src = datos.src;
                imagen.alt = "";
                imagen.loading = "lazy";
                imagen.addEventListener("error", function () {
                    boton.hidden = true;
                });
                boton.appendChild(imagen);
                boton.addEventListener("click", function () {
                    principal.src = datos.src;
                    principal.alt = datos.alt;
                    miniaturas.querySelectorAll("button").forEach(item => item.removeAttribute("aria-current"));
                    boton.setAttribute("aria-current", "true");
                });
                miniaturas.appendChild(boton);
            });
            galeria.appendChild(miniaturas);
        }

        return galeria;
    }

    function crearPrecio(producto, datosPrecio) {
        const bloque = elemento("div", "producto-precio-bloque");
        bloque.appendChild(elemento("span", "producto-precio-label", "Precio actual"));
        const precio = elemento("p", "producto-precio");
        if (datosPrecio.promocion) {
            const normal = elemento("del", null, window.Promociones.textoPrecio(datosPrecio.precioNormal));
            const promocional = elemento("strong", null, window.Promociones.textoPrecio(datosPrecio.precioActual));
            precio.append(normal, promocional);
        } else {
            precio.textContent = producto.precioTexto;
        }
        bloque.appendChild(precio);
        return bloque;
    }

    function renderizar(producto) {
        const categoria = categorias[producto.categoria] || { nombre: "Productos", url: "index.html#productos" };
        const datosPrecio = window.Promociones
            ? window.Promociones.obtenerPrecio(producto)
            : { precioNormal: producto.carrito?.precio ?? null, precioActual: producto.carrito?.precio ?? null, promocion: null };
        const partesDescripcion = producto.descripcion.split(" • ").filter(Boolean);
        const esAclaracion = texto => /pendiente|no (?:puede|permite) confirmarse|no se (?:distingue|observa)|sin confirmar/i.test(texto);
        const caracteristicasEstructuradas = Array.isArray(producto.caracteristicas)
            ? producto.caracteristicas.filter(Boolean)
            : [];
        const caracteristicas = caracteristicasEstructuradas.length
            ? caracteristicasEstructuradas
            : producto.pendiente
                ? []
                : partesDescripcion.slice(1).filter(parte => !esAclaracion(parte));
        const aclaraciones = producto.pendiente
            ? []
            : partesDescripcion.slice(1).filter(esAclaracion);

        document.title = `${producto.nombre} | Casa Agrícola y Forestal`;
        document.querySelector('meta[name="description"]').content = producto.descripcion.slice(0, 155);
        enlaceCategoria.textContent = categoria.nombre;
        enlaceCategoria.href = categoria.url;
        migaProducto.textContent = producto.nombre;
        contenedor.setAttribute("aria-busy", "false");
        contenedor.replaceChildren();

        const galeria = crearGaleria(producto);
        const contenido = elemento("div", "producto-premium-informacion");
        const etiqueta = elemento("span", "producto-etiqueta", categoria.nombre);
        const titulo = elemento("h1", null, producto.nombre);
        const introduccion = elemento(
            "p",
            "producto-introduccion",
            producto.pendiente ? producto.descripcion : (partesDescripcion[0] || producto.descripcion)
        );
        const precio = crearPrecio(producto, datosPrecio);
        const acciones = elemento("div", "producto-premium-acciones");
        const estadoAccion = elemento("p", "producto-estado-accion");
        estadoAccion.setAttribute("role", "status");
        estadoAccion.setAttribute("aria-live", "polite");

        if (producto.carrito) {
            const agregar = elemento("button", "producto-boton producto-boton-principal", "Agregar al carrito");
            agregar.type = "button";
            agregar.addEventListener("click", function () {
                agregarProductoAlCarrito(producto.id);
                estadoAccion.textContent = `${producto.nombre} se agregó al carrito.`;
            });
            acciones.appendChild(agregar);
        }

        const whatsapp = elemento("a", "producto-boton producto-boton-whatsapp", "Consultar por WhatsApp");
        whatsapp.href = window.Promociones
            ? window.Promociones.crearWhatsApp(producto, datosPrecio)
            : producto.whatsapp;
        whatsapp.target = producto.whatsappTarget || "_blank";
        whatsapp.rel = "noopener noreferrer";
        acciones.appendChild(whatsapp);

        const volver = elemento("a", "producto-regresar", `← Volver a ${categoria.nombre}`);
        volver.href = categoria.url;
        contenido.append(etiqueta, titulo, introduccion, precio, acciones, estadoAccion, volver);

        const detalles = elemento("section", "producto-caracteristicas");
        detalles.setAttribute("aria-label", "Información adicional del producto");

        if (caracteristicas.length) {
            const tituloDetalles = elemento("h2", null, "Características e información del catálogo");
            const lista = elemento("ul", "producto-lista-caracteristicas");
            caracteristicas.forEach(function (caracteristica) {
                const texto = typeof caracteristica === "object"
                    ? [caracteristica.etiqueta, caracteristica.valor].filter(Boolean).join(": ")
                    : caracteristica;
                lista.appendChild(elemento("li", null, texto));
            });
            detalles.append(tituloDetalles, lista);
        }

        if (Array.isArray(producto.aplicaciones) && producto.aplicaciones.length) {
            const aplicaciones = elemento("div", "producto-aplicaciones");
            aplicaciones.appendChild(elemento("h2", null, "Aplicaciones"));
            const listaAplicaciones = elemento("ul", "producto-lista-caracteristicas");
            producto.aplicaciones.forEach(aplicacion => listaAplicaciones.appendChild(elemento("li", null, aplicacion)));
            aplicaciones.appendChild(listaAplicaciones);
            detalles.appendChild(aplicaciones);
        }

        if (aclaraciones.length) {
            const aclaracion = elemento("aside", "producto-aviso-pendiente");
            aclaracion.appendChild(elemento("strong", null, "Aclaración del catálogo"));
            aclaraciones.forEach(texto => aclaracion.appendChild(elemento("p", null, texto)));
            detalles.appendChild(aclaracion);
        }

        if (producto.pendiente && producto.estadoTexto) {
            const aviso = elemento("aside", "producto-aviso-pendiente");
            const tituloPendiente = "Información pendiente de confirmar";
            aviso.appendChild(elemento("strong", null, tituloPendiente));
            if (producto.estadoTexto.trim().toLowerCase() !== tituloPendiente.toLowerCase()) {
                aviso.appendChild(elemento("p", null, producto.estadoTexto));
            }
            detalles.appendChild(aviso);
        }

        contenedor.append(galeria, contenido);
        if (detalles.childElementCount) contenedor.appendChild(detalles);
    }

    const id = new URLSearchParams(window.location.search).get("id");
    const producto = (window.PRODUCTOS || []).find(item => item.id === id);
    if (!producto || !producto.imagenes?.length) mostrarError();
    else renderizar(producto);
}());
