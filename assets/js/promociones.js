/* Reglas compartidas de vigencia, precios promocionales y componentes de Inicio. */
(function () {
    "use strict";

    const ZONA_HORARIA = "America/Mexico_City";
    const formatoPrecio = new Intl.NumberFormat("es-MX");
    const formatoFechaMexico = new Intl.DateTimeFormat("en-CA", {
        timeZone: ZONA_HORARIA,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
    let detenerCarrusel = function () {};
    let ultimaFirma = null;

    function fechaValida(valor) {
        if (typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor)) return null;
        const [anio, mes, dia] = valor.split("-").map(Number);
        const fecha = new Date(Date.UTC(anio, mes - 1, dia));
        if (fecha.getUTCFullYear() !== anio || fecha.getUTCMonth() !== mes - 1 || fecha.getUTCDate() !== dia) return null;
        return valor;
    }

    function fechaActualMexico(ahora) {
        const momento = ahora instanceof Date ? ahora : new Date(ahora ?? Date.now());
        if (Number.isNaN(momento.getTime())) return null;
        const partes = Object.fromEntries(
            formatoFechaMexico.formatToParts(momento)
                .filter(parte => parte.type !== "literal")
                .map(parte => [parte.type, parte.value])
        );
        return `${partes.year}-${partes.month}-${partes.day}`;
    }

    function estaVigente(configuracion, ahora) {
        if (!configuracion || configuracion.activa === false) return false;
        const inicio = fechaValida(configuracion.fechaInicio);
        const fin = fechaValida(configuracion.fechaFin);
        const hoyMexico = fechaActualMexico(ahora);
        return Boolean(inicio && fin && hoyMexico && inicio <= fin && hoyMexico >= inicio && hoyMexico <= fin);
    }

    function buscarPromocion(productoId, ahora, promociones) {
        const configuradas = promociones ?? window.PROMOCIONES_CONFIG?.promociones;
        const lista = Array.isArray(configuradas) ? configuradas : [];
        return lista.find(function (promocion) {
            return promocion && promocion.productoId === productoId
                && Number.isFinite(promocion.precioPromocional)
                && promocion.precioPromocional > 0
                && estaVigente(promocion, ahora);
        }) || null;
    }

    function obtenerPrecio(producto, ahora, promociones) {
        const precioNormal = producto?.carrito?.precio ?? null;
        const promocion = buscarPromocion(producto?.id, ahora, promociones);
        if (!promocion || precioNormal === null || promocion.precioPromocional >= precioNormal) {
            return { precioNormal, precioActual: precioNormal, promocion: null };
        }
        return {
            precioNormal,
            precioActual: promocion.precioPromocional,
            promocion
        };
    }

    function textoPrecio(valor) {
        return `$${formatoPrecio.format(valor)} MXN`;
    }

    function crearWhatsApp(producto, datosPrecio) {
        if (!producto.whatsapp || !datosPrecio.promocion) return producto.whatsapp;
        const url = new URL(producto.whatsapp);
        const mensajeOriginal = url.searchParams.get("text") || `Hola, me interesa ${producto.nombre}`;
        url.searchParams.set("text", `${mensajeOriginal}. Precio promocional vigente: ${textoPrecio(datosPrecio.precioActual)}.`);
        return url.toString();
    }

    function crearTarjetaPromocion(producto, datosPrecio) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "promocion-tarjeta";
        tarjeta.dataset.productoId = producto.id;

        const imagen = document.createElement("img");
        imagen.src = producto.imagenes[0].src;
        imagen.alt = producto.imagenes[0].alt;
        imagen.loading = "lazy";

        const contenido = document.createElement("div");
        contenido.className = "promocion-contenido";
        const titulo = document.createElement("h3");
        titulo.textContent = producto.nombre;
        const precios = document.createElement("p");
        precios.className = "promocion-precios";
        precios.innerHTML = `<del>${textoPrecio(datosPrecio.precioNormal)}</del><strong>${textoPrecio(datosPrecio.precioActual)}</strong>`;
        const acciones = document.createElement("div");
        acciones.className = "promocion-acciones";
        const ficha = document.createElement("a");
        ficha.href = `categorias/${producto.categoria === "maquinaria" ? "maquinaria" : producto.categoria}.html#${producto.id}`;
        ficha.textContent = "Ver producto";
        ficha.className = "boton-promocion secundario";
        const agregar = document.createElement("button");
        agregar.type = "button";
        agregar.className = "boton-promocion";
        agregar.textContent = "Agregar al carrito";
        agregar.addEventListener("click", () => agregarProductoAlCarrito(producto.id));
        acciones.append(ficha, agregar);
        contenido.append(titulo, precios, acciones);
        tarjeta.append(imagen, contenido);
        return tarjeta;
    }

    function activarCarrusel(contenedor) {
        let temporizador = null;
        const avanzar = direccion => contenedor.scrollBy({ left: direccion * contenedor.clientWidth * 0.85, behavior: "smooth" });
        const iniciar = () => {
            if (contenedor.children.length < 2 || temporizador) return;
            temporizador = setInterval(function () {
                const llegoAlFinal = contenedor.scrollLeft + contenedor.clientWidth >= contenedor.scrollWidth - 4;
                if (llegoAlFinal) contenedor.scrollTo({ left: 0, behavior: "smooth" });
                else avanzar(1);
            }, 5000);
        };
        const pausar = () => { clearInterval(temporizador); temporizador = null; };
        const anterior = document.querySelector("[data-promocion-anterior]");
        const siguiente = document.querySelector("[data-promocion-siguiente]");
        if (anterior) anterior.onclick = () => avanzar(-1);
        if (siguiente) siguiente.onclick = () => avanzar(1);
        ["mouseenter", "focusin", "pointerdown"].forEach(evento => contenedor.addEventListener(evento, pausar));
        ["mouseleave", "focusout", "pointerup"].forEach(evento => contenedor.addEventListener(evento, iniciar));
        iniciar();
        return pausar;
    }

    function renderizarPromociones(ahora) {
        const seccion = document.getElementById("promociones");
        const carrusel = document.querySelector("[data-carrusel-promociones]");
        if (!seccion || !carrusel) return;
        const productos = window.PRODUCTOS || [];
        detenerCarrusel();
        const vigentes = productos.map(producto => ({ producto, precio: obtenerPrecio(producto, ahora) }))
            .filter(item => item.precio.promocion);
        carrusel.replaceChildren(...vigentes.map(item => crearTarjetaPromocion(item.producto, item.precio)));
        seccion.hidden = vigentes.length === 0;
        detenerCarrusel = vigentes.length ? activarCarrusel(carrusel) : function () {};
    }

    function renderizarBuenFin(ahora) {
        const seccion = document.getElementById("buen-fin");
        if (!seccion) return;
        const campana = window.PROMOCIONES_CONFIG?.buenFin;
        const vigente = campana?.activo === true && estaVigente({
            fechaInicio: campana.fechaInicio,
            fechaFin: campana.fechaFin
        }, ahora);
        const contenedor = seccion.querySelector("[data-productos-buen-fin]");
        const idsParticipantes = Array.isArray(campana?.productos) ? campana.productos : [];
        const participantes = vigente
            ? (window.PRODUCTOS || [])
                .filter(producto => idsParticipantes.includes(producto.id))
                .map(producto => ({ producto, precio: obtenerPrecio(producto, ahora) }))
                .filter(item => item.precio.promocion)
            : [];
        if (contenedor) {
            contenedor.className = "promociones-carrusel";
            contenedor.replaceChildren(...participantes.map(function (item) {
                return crearTarjetaPromocion(item.producto, item.precio);
            }));
        }
        seccion.hidden = !vigente || participantes.length === 0;
    }

    function firmaEstado(ahora) {
        const promociones = (window.PRODUCTOS || [])
            .map(producto => ({ id: producto.id, precio: obtenerPrecio(producto, ahora) }))
            .filter(item => item.precio.promocion)
            .map(item => `${item.id}:${item.precio.precioActual}`);
        const campana = window.PROMOCIONES_CONFIG?.buenFin;
        const buenFinVigente = campana?.activo === true && estaVigente({
            fechaInicio: campana.fechaInicio,
            fechaFin: campana.fechaFin
        }, ahora);
        return JSON.stringify({ promociones, buenFinVigente });
    }

    function refrescarPromociones(ahora, forzar) {
        const firma = firmaEstado(ahora);
        if (!forzar && firma === ultimaFirma) return false;
        ultimaFirma = firma;
        if (typeof window.renderizarCatalogo === "function") window.renderizarCatalogo(ahora);
        renderizarPromociones(ahora);
        renderizarBuenFin(ahora);
        if (typeof window.actualizarCarrito === "function") window.actualizarCarrito(ahora);
        return true;
    }

    window.Promociones = Object.freeze({
        ZONA_HORARIA,
        fechaActualMexico,
        estaVigente,
        buscarPromocion,
        obtenerPrecio,
        textoPrecio,
        crearWhatsApp,
        renderizarPromociones,
        renderizarBuenFin,
        refrescarPromociones
    });

    refrescarPromociones(undefined, true);
    window.setInterval(refrescarPromociones, 30000);
}());
