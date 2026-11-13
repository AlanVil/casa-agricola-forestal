/* Renderizado compartido de las fichas del catálogo. */
(function () {
    "use strict";

    function crearImagen(datos) {
        const imagen = document.createElement("img");
        imagen.src = datos.src;
        imagen.alt = datos.alt;
        imagen.loading = datos.loading || "lazy";
        imagen.decoding = "async";
        imagen.fetchPriority = datos.loading === "eager" ? "high" : "low";
        return imagen;
    }

    function crearMarcadorImagen(producto) {
        const marcador = document.createElement("div");
        marcador.className = "producto-marcador-imagen";
        marcador.setAttribute("role", "img");
        marcador.setAttribute("aria-label", `Fotografía pendiente para ${producto.nombre}`);

        const identidad = document.createElement("span");
        identidad.className = "producto-marcador-identidad";
        identidad.textContent = "Casa Agrícola y Forestal";
        const estado = document.createElement("strong");
        estado.textContent = "Fotografía en preparación";
        const modelo = document.createElement("small");
        modelo.textContent = producto.nombre;
        marcador.append(identidad, estado, modelo);
        return marcador;
    }

    function textoPrecioPublico(producto) {
        const precio = producto.carrito?.precio;
        if (Number.isFinite(precio) && /^\$/.test(producto.precioTexto || "")) {
            return precio.toLocaleString("es-MX", {
                style: "currency",
                currency: "MXN",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }) + " MXN";
        }
        return producto.precioTexto;
    }

    function crearTarjeta(producto, ahora) {
        const datosPrecio = window.Promociones
            ? window.Promociones.obtenerPrecio(producto, ahora)
            : { precioNormal: producto.carrito?.precio ?? null, precioActual: producto.carrito?.precio ?? null, promocion: null };
        const tarjeta = document.createElement("div");
        tarjeta.className = "producto";
        tarjeta.id = producto.id;
        tarjeta.dataset.productoId = producto.id;

        if (producto.sinImagen || !producto.imagenes?.length) {
            tarjeta.appendChild(crearMarcadorImagen(producto));
        } else if (producto.galeria) {
            const fotos = document.createElement("div");
            fotos.className = "fotos-producto";
            producto.imagenes.forEach(datos => fotos.appendChild(crearImagen(datos)));
            tarjeta.appendChild(fotos);
        } else {
            producto.imagenes.forEach(datos => tarjeta.appendChild(crearImagen(datos)));
        }

        const titulo = document.createElement("h4");
        titulo.textContent = producto.nombre;
        tarjeta.appendChild(titulo);

        const descripcion = document.createElement("p");
        descripcion.className = "descripcion";
        descripcion.textContent = producto.descripcion;
        tarjeta.appendChild(descripcion);

        if (producto.pendiente) {
            const estado = document.createElement("p");
            estado.className = "estado-pendiente";
            estado.textContent = producto.estadoTexto;
            tarjeta.appendChild(estado);
        }

        const precio = document.createElement("p");
        precio.className = "precio";
        if (datosPrecio.promocion) {
            precio.classList.add("precio-promocional");
            const normal = document.createElement("del");
            normal.textContent = window.Promociones.textoPrecio(datosPrecio.precioNormal);
            const promocional = document.createElement("strong");
            promocional.textContent = window.Promociones.textoPrecio(datosPrecio.precioActual);
            precio.append(normal, promocional);
        } else {
            precio.textContent = textoPrecioPublico(producto);
        }
        tarjeta.appendChild(precio);

        const detalles = document.createElement("a");
        detalles.href = `producto.html?id=${encodeURIComponent(producto.id)}`;
        detalles.className = "ver-detalles";
        detalles.textContent = "Ver detalles";
        detalles.setAttribute("aria-label", `Ver detalles de ${producto.nombre}`);
        tarjeta.appendChild(detalles);

        if (!producto.soloCotizacion) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "agregar-carrito";
            boton.textContent = producto.carrito ? "🛒 Agregar al carrito" : "Agregar a solicitud";
            boton.setAttribute(
                "aria-label",
                producto.carrito ? `Agregar ${producto.nombre} al carrito` : `Agregar ${producto.nombre} a la solicitud de cotización`
            );
            boton.addEventListener("click", function () {
                agregarProductoAlCarrito(producto.id);
            });
            tarjeta.appendChild(boton);
        }

        if (producto.whatsapp) {
            const consulta = document.createElement("button");
            consulta.type = "button";
            consulta.className = "comprar consulta-sucursal";
            consulta.textContent = producto.soloCotizacion ? "Consultar modelo y precio" : "Consultar por WhatsApp";
            consulta.setAttribute("aria-label", `Elegir sucursal para consultar por ${producto.nombre}`);
            consulta.addEventListener("click", function () {
                if (!window.Contactos) return;
                window.Contactos.abrirSelector({
                    titulo: `Consultar ${producto.nombre}`,
                    mensaje: window.Contactos.mensajeProducto(producto, datosPrecio)
                });
            });
            tarjeta.appendChild(consulta);
        }

        return tarjeta;
    }

    function renderizarCatalogo(ahora) {
        const productos = window.PRODUCTOS || [];
        document.querySelectorAll("[data-categoria-productos]").forEach(function (lista) {
            const categoria = lista.dataset.categoriaProductos;
            const fragmento = document.createDocumentFragment();
            productos
                .filter(producto => producto.categoria === categoria)
                .sort((a, b) => a.orden - b.orden)
                .forEach(producto => fragmento.appendChild(crearTarjeta(producto, ahora)));
            lista.replaceChildren(fragmento);
        });
    }

    window.renderizarCatalogo = renderizarCatalogo;
    renderizarCatalogo();
}());
