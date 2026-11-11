/* Contactos oficiales y selector compartido de sucursal. */
(function () {
    "use strict";

    const CLAVE_SUCURSAL = "casa-agricola-sucursal-preferida";
    const SUCURSALES = Object.freeze({
        "ciudad-hidalgo": Object.freeze({
            id: "ciudad-hidalgo",
            nombre: "Ciudad Hidalgo",
            telefono: "7861256908",
            telefonoTexto: "786 125 6908",
            whatsapp: "527861256908",
            direccion: "Av. Morelos Oriente N342, Col. El Paraíso, CP 61183, Ciudad Hidalgo, Michoacán."
        }),
        "san-felipe": Object.freeze({
            id: "san-felipe",
            nombre: "San Felipe / Zitácuaro",
            telefono: "7151348109",
            telefonoTexto: "715 134 8109",
            whatsapp: "527151348109",
            direccion: "Carretera Toluca–Morelia km 105 SN, CP 61529, Zitácuaro, Michoacán."
        })
    });

    let contextoActual = null;
    let focoAnterior = null;

    function sucursalPreferida() {
        try {
            const id = localStorage.getItem(CLAVE_SUCURSAL);
            return SUCURSALES[id] ? id : null;
        } catch (_) {
            return null;
        }
    }

    function guardarPreferencia(id) {
        if (!SUCURSALES[id]) return;
        try { localStorage.setItem(CLAVE_SUCURSAL, id); } catch (_) { /* Preferencia opcional. */ }
    }

    function crearEnlaceWhatsApp(id, mensaje) {
        const sucursal = SUCURSALES[id];
        if (!sucursal) return null;
        const texto = String(mensaje || "Hola, quiero recibir asesoría sobre sus productos.").trim();
        return `https://wa.me/${sucursal.whatsapp}?text=${encodeURIComponent(texto)}`;
    }

    function mensajeProducto(producto, datosPrecio) {
        const lineas = [`Hola, quiero recibir asesoría sobre ${producto.nombre}.`];
        if (producto.codigo) lineas.push(`Código: ${producto.codigo}.`);
        if (datosPrecio?.promocion && window.Promociones) {
            lineas.push(`Precio promocional vigente: ${window.Promociones.textoPrecio(datosPrecio.precioActual)}.`);
        } else if (producto.precioTexto) {
            lineas.push(`Precio publicado: ${producto.precioTexto}.`);
        }
        lineas.push("Agradezco confirmar disponibilidad, configuración y precio final.");
        return lineas.join("\n");
    }

    function construirModal() {
        if (document.getElementById("selector-contacto-sucursal")) return;
        const modal = document.createElement("div");
        modal.id = "selector-contacto-sucursal";
        modal.className = "selector-contacto-modal";
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        modal.innerHTML = `
            <div class="selector-contacto-dialogo" role="dialog" aria-modal="true" aria-labelledby="selector-contacto-titulo" aria-describedby="selector-contacto-descripcion">
                <button class="selector-contacto-cerrar" type="button" aria-label="Cerrar selección de sucursal">×</button>
                <span class="contacto-eyebrow">Atención directa</span>
                <h2 id="selector-contacto-titulo">Elige la sucursal</h2>
                <p id="selector-contacto-descripcion">Tu consulta se abrirá en el WhatsApp oficial de la sucursal seleccionada.</p>
                <fieldset class="selector-contacto-opciones">
                    <legend>Sucursal para recibir asesoría</legend>
                    ${Object.values(SUCURSALES).map(sucursal => `
                        <label>
                            <input type="radio" name="contacto-sucursal" value="${sucursal.id}">
                            <span><strong>${sucursal.nombre}</strong><small>WhatsApp y llamadas: ${sucursal.telefonoTexto}</small><small>${sucursal.direccion}</small></span>
                        </label>`).join("")}
                </fieldset>
                <p class="selector-contacto-error" role="alert" hidden>Selecciona una sucursal para continuar.</p>
                <button class="selector-contacto-continuar" type="button">Continuar en WhatsApp</button>
                <p class="selector-contacto-aviso">Abrir WhatsApp no confirma disponibilidad, precio final ni pedido.</p>
            </div>`;
        document.body.appendChild(modal);

        const cerrar = () => cerrarSelector();
        modal.querySelector(".selector-contacto-cerrar").addEventListener("click", cerrar);
        modal.addEventListener("click", evento => { if (evento.target === modal) cerrar(); });
        modal.querySelectorAll('input[name="contacto-sucursal"]').forEach(input => {
            input.addEventListener("change", () => {
                guardarPreferencia(input.value);
                modal.querySelector(".selector-contacto-error").hidden = true;
            });
        });
        modal.querySelector(".selector-contacto-continuar").addEventListener("click", function () {
            const seleccionada = modal.querySelector('input[name="contacto-sucursal"]:checked');
            if (!seleccionada) {
                modal.querySelector(".selector-contacto-error").hidden = false;
                modal.querySelector('input[name="contacto-sucursal"]')?.focus();
                return;
            }
            const enlace = crearEnlaceWhatsApp(seleccionada.value, contextoActual?.mensaje);
            if (!enlace) return;
            const ventana = window.open(enlace, "_blank", "noopener,noreferrer");
            if (ventana) ventana.opener = null;
            cerrarSelector();
        });
    }

    function abrirSelector(opciones) {
        construirModal();
        const modal = document.getElementById("selector-contacto-sucursal");
        contextoActual = opciones || {};
        focoAnterior = document.activeElement;
        const titulo = modal.querySelector("#selector-contacto-titulo");
        titulo.textContent = contextoActual.titulo || "Elige la sucursal";
        modal.querySelector(".selector-contacto-error").hidden = true;
        const preferida = sucursalPreferida();
        if (preferida) modal.querySelector(`input[value="${preferida}"]`).checked = true;
        modal.hidden = false;
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-contacto-abierto");
        (modal.querySelector('input[name="contacto-sucursal"]:checked') || modal.querySelector('input[name="contacto-sucursal"]'))?.focus();
    }

    function cerrarSelector() {
        const modal = document.getElementById("selector-contacto-sucursal");
        if (!modal || modal.hidden) return;
        modal.hidden = true;
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-contacto-abierto");
        focoAnterior?.focus?.();
    }

    function crearTarjetaSucursal(sucursal) {
        const tarjeta = document.createElement("article");
        tarjeta.className = "footer-sucursal";
        const titulo = document.createElement("h3");
        titulo.textContent = sucursal.nombre;
        const telefono = document.createElement("p");
        telefono.textContent = sucursal.telefonoTexto;
        const acciones = document.createElement("div");
        const llamar = document.createElement("a");
        llamar.href = `tel:${sucursal.telefono}`;
        llamar.textContent = "Llamar";
        const whatsapp = document.createElement("a");
        whatsapp.href = crearEnlaceWhatsApp(sucursal.id, `Hola, quiero recibir asesoría de la sucursal ${sucursal.nombre}.`);
        whatsapp.target = "_blank";
        whatsapp.rel = "noopener noreferrer";
        whatsapp.textContent = "WhatsApp";
        acciones.append(llamar, whatsapp);
        tarjeta.append(titulo, telefono, acciones);
        return tarjeta;
    }

    function enriquecerInterfaz() {
        document.querySelectorAll(".contacto-general").forEach(control => {
            control.addEventListener("click", evento => {
                evento.preventDefault();
                abrirSelector({ mensaje: "Hola, quiero recibir asesoría sobre maquinaria y productos." });
            });
        });

        const header = document.querySelector("header .header-actions");
        if (header && !header.querySelector(".asesoria-header")) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "asesoria-header";
            boton.textContent = "Asesoría";
            boton.addEventListener("click", () => abrirSelector({ mensaje: "Hola, quiero recibir asesoría para elegir un equipo." }));
            header.appendChild(boton);
        }

        document.querySelectorAll("footer.site-footer").forEach(footer => {
            if (footer.querySelector(".footer-sucursales-contacto")) return;
            const bloque = document.createElement("section");
            bloque.className = "footer-sucursales-contacto";
            bloque.setAttribute("aria-label", "Contacto de sucursales");
            const encabezado = document.createElement("div");
            encabezado.className = "footer-contacto-encabezado";
            encabezado.innerHTML = "<span>Atención en tienda</span><h2>Elige tu sucursal</h2>";
            const lista = document.createElement("div");
            lista.className = "footer-sucursales-lista";
            Object.values(SUCURSALES).forEach(sucursal => lista.appendChild(crearTarjetaSucursal(sucursal)));
            bloque.append(encabezado, lista);
            const credito = footer.querySelector(".developer-credit");
            footer.insertBefore(bloque, credito || null);
        });

        const preferida = sucursalPreferida();
        document.querySelectorAll('input[name="sucursal-recogida"]').forEach(input => {
            const sucursal = SUCURSALES[input.value];
            if (!sucursal) return;
            if (input.value === preferida) input.checked = true;
            input.addEventListener("change", () => guardarPreferencia(input.value));
            const texto = input.closest("label")?.querySelector("small");
            if (texto && !texto.parentElement.querySelector(".telefono-sucursal-pedido")) {
                const telefono = document.createElement("small");
                telefono.className = "telefono-sucursal-pedido";
                telefono.textContent = `Llamadas y WhatsApp: ${sucursal.telefonoTexto}`;
                texto.before(telefono);
            }
        });
    }

    function agregarDatosEstructurados() {
        if (document.getElementById("datos-estructurados-sucursales")) return;
        const script = document.createElement("script");
        script.id = "datos-estructurados-sucursales";
        script.type = "application/ld+json";
        script.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@graph": Object.values(SUCURSALES).map(sucursal => ({
                "@type": "Store",
                name: `Casa Agrícola y Forestal — ${sucursal.nombre}`,
                telephone: `+52 ${sucursal.telefono}`,
                address: { "@type": "PostalAddress", streetAddress: sucursal.direccion, addressCountry: "MX" }
            }))
        });
        document.head.appendChild(script);
    }

    document.addEventListener("keydown", evento => {
        const modal = document.getElementById("selector-contacto-sucursal");
        if (!modal || modal.hidden) return;
        if (evento.key === "Escape") {
            cerrarSelector();
            return;
        }
        if (evento.key !== "Tab") return;
        const elementos = Array.from(modal.querySelectorAll(
            'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
        )).filter(elemento => elemento.offsetParent !== null);
        if (!elementos.length) return;
        const primero = elementos[0];
        const ultimo = elementos[elementos.length - 1];
        if (evento.shiftKey && document.activeElement === primero) {
            evento.preventDefault();
            ultimo.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primero.focus();
        }
    });

    window.Contactos = Object.freeze({
        SUCURSALES,
        obtenerSucursal: id => SUCURSALES[id] || null,
        crearEnlaceWhatsApp,
        mensajeProducto,
        abrirSelector,
        cerrarSelector
    });

    agregarDatosEstructurados();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", enriquecerInterfaz);
    else enriquecerInterfaz();
}());
