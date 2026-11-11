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
        principal.loading = "eager";
        principal.decoding = "async";
        principal.fetchPriority = "high";
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

    function crearOrientacionTrabajo(producto) {
        const config = window.COMPARADORES_DATOS?.[producto.categoria];
        const datos = config?.modelos?.[producto.id];
        if (!config) return null;

        if (!datos) {
            const seccion = elemento("section", "producto-orientacion-trabajo orientacion-sin-datos");
            seccion.setAttribute("aria-labelledby", "titulo-orientacion-trabajo");
            const encabezado = elemento("div", "producto-orientacion-encabezado");
            encabezado.append(
                elemento("span", "producto-eyebrow", "Orientación técnica"),
                elemento("h2", null, "¿PARA QUÉ TRABAJOS ES IDEAL ESTA MÁQUINA?"),
                elemento("p", null, "Esta ficha agrupa modelos o tiene datos pendientes. No hay información suficiente para recomendarla con seguridad como una sola máquina.")
            );
            encabezado.querySelector("h2").id = "titulo-orientacion-trabajo";
            const aviso = elemento("aside", "orientacion-resumen");
            const bloque = elemento("div");
            bloque.append(
                elemento("strong", null, "Requiere confirmar modelo"),
                elemento("p", null, "Confirma el modelo exacto, su configuración y el trabajo previsto con una sucursal antes de elegir.")
            );
            aviso.appendChild(bloque);
            const consultar = elemento("button", "comprar consulta-aplicacion", "Solicitar asesoría por WhatsApp");
            consultar.type = "button";
            consultar.addEventListener("click", () => window.Contactos?.abrirSelector({
                titulo: "Elige una sucursal para recibir asesoría",
                mensaje: window.Contactos.mensajeProducto(producto, window.Promociones?.obtenerPrecio(producto))
            }));
            seccion.append(encabezado, aviso, consultar);
            return seccion;
        }

        const nombresEstado = {
            recomendado: "Recomendado",
            condicionado: "Adecuado con condiciones",
            no: "No es la opción ideal",
            insuficiente: "Información insuficiente"
        };
        const seccion = elemento("section", "producto-orientacion-trabajo");
        seccion.setAttribute("aria-labelledby", "titulo-orientacion-trabajo");
        const cabecera = elemento("div", "producto-orientacion-cabecera");
        const etiqueta = elemento("span", "producto-etiqueta", "Orientación técnica");
        const titulo = elemento("h2", null, "¿PARA QUÉ TRABAJOS ES IDEAL ESTA MÁQUINA?");
        titulo.id = "titulo-orientacion-trabajo";
        const introduccion = elemento(
            "p",
            null,
            "Esta orientación utiliza las aplicaciones y especificaciones verificadas del comparador. No sustituye el manual ni una evaluación de seguridad."
        );
        cabecera.append(etiqueta, titulo, introduccion);

        const escenarios = elemento("div", "producto-orientacion-escenarios");
        config.escenarios.forEach(function ([id, nombre]) {
            const evaluacion = datos.escenarios[id];
            const tarjeta = elemento("article", `orientacion-escenario estado-${evaluacion?.estado || "insuficiente"}`);
            tarjeta.append(
                elemento("span", "orientacion-estado", nombresEstado[evaluacion?.estado] || nombresEstado.insuficiente),
                elemento("h3", null, nombre),
                elemento("p", null, evaluacion?.porque || "No hay información suficiente para recomendar este modelo con seguridad.")
            );
            escenarios.appendChild(tarjeta);
        });

        const resumen = elemento("div", "producto-orientacion-resumen");
        const ventaja = elemento("div", null);
        ventaja.append(elemento("strong", null, "Ventaja relevante"), elemento("p", null, datos.ventaja));
        const limitacion = elemento("div", null);
        limitacion.append(elemento("strong", null, "Limitación o precaución"), elemento("p", null, datos.limitacion));
        resumen.append(ventaja, limitacion);

        const asesoria = elemento("button", "producto-boton producto-boton-whatsapp", "Solicitar asesoría por WhatsApp");
        asesoria.type = "button";
        asesoria.addEventListener("click", function () {
            if (!window.Contactos) return;
            window.Contactos.abrirSelector({
                titulo: `Asesoría sobre ${producto.nombre}`,
                mensaje: `Hola, quiero recibir asesoría sobre ${producto.nombre} y confirmar para qué trabajos es adecuado.`
            });
        });
        seccion.append(cabecera, escenarios, resumen, asesoria);
        return seccion;
    }

    function crearAplicacionesOpcionales(producto) {
        if (!producto.aplicacionesDetalle || typeof producto.aplicacionesDetalle !== "object") return null;
        const seccion = elemento("section", "producto-orientacion-trabajo producto-orientacion-opcional");
        seccion.appendChild(elemento("h2", null, "¿PARA QUÉ TRABAJOS ES IDEAL ESTA MÁQUINA?"));
        ["trabajos", "frecuencia", "ventajas", "limitaciones", "precauciones"].forEach(campo => {
            const valor = producto.aplicacionesDetalle[campo];
            if (!valor) return;
            const bloque = elemento("div", "producto-aplicacion-campo");
            bloque.append(elemento("strong", null, campo.charAt(0).toUpperCase() + campo.slice(1)), elemento("p", null, valor));
            seccion.appendChild(bloque);
        });
        return seccion;
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
        const descripcionMeta = producto.descripcion.slice(0, 155);
        document.querySelector('meta[name="description"]').content = descripcionMeta;
        document.querySelector('meta[property="og:title"]')?.setAttribute("content", `${producto.nombre} | Casa Agrícola y Forestal`);
        document.querySelector('meta[property="og:description"]')?.setAttribute("content", descripcionMeta);
        document.querySelector('meta[property="og:image"]')?.setAttribute("content", new URL(producto.imagenes[0].src, window.location.href).href);
        document.querySelector('meta[property="og:url"]')?.setAttribute("content", window.location.href.split("&")[0]);
        document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", `${producto.nombre} | Casa Agrícola y Forestal`);
        document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", descripcionMeta);
        document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", new URL(producto.imagenes[0].src, window.location.href).href);
        document.querySelector('link[rel="canonical"]')?.setAttribute(
            "href",
            `${window.location.origin}${window.location.pathname}?id=${encodeURIComponent(producto.id)}`
        );
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

        const whatsapp = elemento("button", "producto-boton producto-boton-whatsapp", "Consultar por WhatsApp");
        whatsapp.type = "button";
        whatsapp.addEventListener("click", function () {
            if (!window.Contactos) return;
            window.Contactos.abrirSelector({
                titulo: `Consultar ${producto.nombre}`,
                mensaje: window.Contactos.mensajeProducto(producto, datosPrecio)
            });
        });
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
        const orientacion = crearOrientacionTrabajo(producto) || crearAplicacionesOpcionales(producto);
        if (orientacion) contenedor.appendChild(orientacion);
    }

    const id = new URLSearchParams(window.location.search).get("id");
    const producto = (window.PRODUCTOS || []).find(item => item.id === id);
    if (!producto || !producto.imagenes?.length) mostrarError();
    else renderizar(producto);
}());
