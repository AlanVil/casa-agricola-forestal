/* Asesor determinista que reutiliza los escenarios técnicos del comparador. */
(function () {
    "use strict";

    const ESTADOS = {
        recomendado: { etiqueta: "Adecuada", clase: "es-recomendado", icono: "✓", orden: 0 },
        condicionado: { etiqueta: "Adecuada con condiciones", clase: "es-condicionado", icono: "!", orden: 1 },
        insuficiente: { etiqueta: "Información insuficiente", clase: "es-insuficiente", icono: "?", orden: 2 },
        no: { etiqueta: "No es la opción ideal", clase: "es-no-recomendado", icono: "×", orden: 3 }
    };

    const CUESTIONARIOS = {
        motosierras: {
            titulo: "Encuentra la motosierra apropiada para tu trabajo",
            preguntas: [
                { id: "trabajo", titulo: "¿Qué trabajo necesitas realizar?", opciones: [["poda-suelo", "Poda de ramas desde el suelo"], ["lena-ocasional", "Cortar leña ocasionalmente"], ["lena-frecuente", "Cortar leña con frecuencia"], ["finca", "Mantenimiento de terrenos o fincas"], ["troncos", "Trocear troncos"], ["forestal", "Trabajo forestal profesional"], ["incierto", "No estoy seguro"]] },
                { id: "frecuencia", titulo: "¿Con qué frecuencia utilizarás la máquina?", opciones: [["ocasional", "Ocasionalmente"], ["mensual", "Varias veces al mes"], ["semanal", "Varias veces por semana"], ["profesional", "Uso profesional frecuente"], ["incierto", "No estoy seguro"]] },
                { id: "preferencia", titulo: "¿Qué es más importante para ti?", opciones: [["manejo", "Facilidad de manejo"], ["peso", "Menor peso"], ["capacidad", "Capacidad de trabajo apropiada"], ["frecuente", "Uso frecuente"], ["precio", "Precio, entre las opciones técnicamente adecuadas"], ["asesoria", "Necesito asesoría"]] },
                { id: "experiencia", titulo: "¿Tienes experiencia utilizando motosierras?", opciones: [["primera", "Primera vez"], ["basica", "Experiencia básica"], ["intermedia", "Experiencia intermedia"], ["profesional", "Experiencia profesional"]] }
            ]
        },
        desbrozadoras: {
            titulo: "Encuentra la desbrozadora apropiada para tu trabajo",
            preguntas: [
                { id: "trabajo", titulo: "¿Qué necesitas cortar?", opciones: [["bordes", "Césped y bordes"], ["jardin", "Pasto bajo"], ["pasto-alto", "Pasto alto"], ["maleza", "Maleza densa"], ["extenso", "Vegetación en terrenos extensos"], ["profesional", "Mantenimiento profesional frecuente"], ["incierto", "No estoy seguro"]] },
                { id: "area", titulo: "¿Qué tamaño tiene el área?", opciones: [["pequena", "Jardín pequeño"], ["mediana", "Terreno mediano"], ["grande", "Terreno grande"], ["extensa", "Superficie extensa"], ["incierto", "No estoy seguro"]] },
                { id: "frecuencia", titulo: "¿Con qué frecuencia trabajarás?", opciones: [["ocasional", "Ocasionalmente"], ["mensual", "Varias veces al mes"], ["semanal", "Varias veces por semana"], ["profesional", "Uso profesional frecuente"], ["incierto", "No estoy seguro"]] },
                { id: "preferencia", titulo: "¿Qué prefieres?", opciones: [["peso", "Equipo ligero"], ["manejo", "Facilidad de manejo"], ["capacidad", "Capacidad para vegetación exigente"], ["frecuente", "Trabajo frecuente"], ["precio", "Precio entre opciones técnicamente adecuadas"], ["asesoria", "Necesito asesoría"]] }
            ]
        }
    };

    const normalizarNumero = valor => {
        const coincidencia = String(valor || "").replace(",", ".").match(/\d+(?:\.\d+)?/);
        return coincidencia ? Number(coincidencia[0]) : Number.POSITIVE_INFINITY;
    };
    const seguro = valor => String(valor ?? "").replace(/[&<>'"]/g, caracter => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[caracter]);
    const precioNumero = producto => Number.isFinite(producto.carrito?.precio) ? producto.carrito.precio : Number.POSITIVE_INFINITY;
    const esAgrupado = (producto, datos) => /\/|exhibición/i.test(producto.nombre) || /variante por confirmar/i.test(datos.alimentacion || "");

    function prioridadContextual(item, respuestas) {
        const textoVerificado = `${item.datos.ventaja || ""} ${item.evaluacion.porque || ""}`.toLowerCase();
        let prioridad = 0;
        if (["semanal", "profesional"].includes(respuestas.frecuencia) && /profesional|frecuente|intensiv/.test(textoVerificado)) prioridad -= 2;
        if (["grande", "extensa"].includes(respuestas.area) && /grande|extens/.test(textoVerificado)) prioridad -= 1;
        if (["ocasional", "mensual"].includes(respuestas.frecuencia) || ["primera", "basica"].includes(respuestas.experiencia)) {
            prioridad += normalizarNumero(item.datos.peso) / 100;
        }
        return prioridad;
    }

    function ordenarResultados(resultados, respuestas) {
        return resultados.sort((a, b) => {
            const diferenciaEstado = ESTADOS[a.evaluacion.estado].orden - ESTADOS[b.evaluacion.estado].orden;
            if (diferenciaEstado) return diferenciaEstado;
            const diferenciaContexto = prioridadContextual(a, respuestas) - prioridadContextual(b, respuestas);
            if (diferenciaContexto) return diferenciaContexto;
            if (respuestas.preferencia === "precio") return precioNumero(a.producto) - precioNumero(b.producto);
            if (["peso", "manejo"].includes(respuestas.preferencia)) return normalizarNumero(a.datos.peso) - normalizarNumero(b.datos.peso);
            return a.producto.nombre.localeCompare(b.producto.nombre, "es");
        });
    }

    function obtenerResultados(categoria, respuestas) {
        const config = window.COMPARADORES_DATOS?.[categoria];
        if (!config || !respuestas.trabajo || respuestas.trabajo === "incierto") return { escenario: null, adecuados: [], descartados: [], incertidumbre: true };
        const productos = new Map((window.PRODUCTOS || []).map(producto => [producto.id, producto]));
        const evaluados = Object.entries(config.modelos).map(([id, datos]) => ({
            id,
            datos,
            producto: productos.get(id),
            evaluacion: datos.escenarios[respuestas.trabajo]
        })).filter(item => item.producto && item.evaluacion && !esAgrupado(item.producto, item.datos));
        const adecuados = ordenarResultados(evaluados.filter(item => ["recomendado", "condicionado"].includes(item.evaluacion.estado)), respuestas);
        return {
            escenario: respuestas.trabajo,
            adecuados,
            descartados: evaluados.filter(item => !["recomendado", "condicionado"].includes(item.evaluacion.estado)),
            incertidumbre: false
        };
    }

    function crearMensajeWhatsApp(categoria, producto, respuestas, cuestionario) {
        const respuesta = id => {
            const pregunta = cuestionario.preguntas.find(item => item.id === id);
            return pregunta?.opciones.find(([valor]) => valor === respuestas[id])?.[1] || "No indicado";
        };
        const lineas = [
            `Hola, quiero recibir asesoría sobre ${producto?.nombre || (categoria === "motosierras" ? "una motosierra" : "una desbrozadora")}.`,
            `Trabajo: ${respuesta("trabajo")}.`,
            `Frecuencia: ${respuesta("frecuencia")}.`
        ];
        if (respuestas.preferencia) lineas.push(`Preferencia: ${respuesta("preferencia")}.`);
        if (respuestas.experiencia) lineas.push(`Experiencia: ${respuesta("experiencia")}.`);
        lineas.push("Agradezco confirmar el modelo, su configuración, disponibilidad y precio final.");
        return lineas.join("\n");
    }

    function inicializarAsesor(categoria, contenedor) {
        const cuestionario = CUESTIONARIOS[categoria];
        const config = window.COMPARADORES_DATOS?.[categoria];
        if (!cuestionario || !config || !contenedor) return;
        let paso = 0;
        let respuestas = {};
        let seleccionComparacion = new Set();

        contenedor.innerHTML = `<section class="asesor-inteligente" aria-labelledby="asesor-titulo">
            <div class="asesor-portada"><span>Asesoramiento inteligente</span><h2 id="asesor-titulo">Encuentra la máquina ideal para tu trabajo</h2><p>Responde unas preguntas y descubre qué equipos de nuestro catálogo pueden adaptarse mejor a tus necesidades.</p><button class="asesor-iniciar" type="button" aria-expanded="false">Ayúdame a elegir</button></div>
            <div class="asesor-panel" hidden></div>
        </section>`;
        const panel = contenedor.querySelector(".asesor-panel");
        const iniciar = contenedor.querySelector(".asesor-iniciar");

        function renderPregunta() {
            const pregunta = cuestionario.preguntas[paso];
            panel.innerHTML = `<div class="asesor-progreso" aria-label="Paso ${paso + 1} de ${cuestionario.preguntas.length}"><span style="--progreso:${((paso + 1) / cuestionario.preguntas.length) * 100}%"></span><small>Paso ${paso + 1} de ${cuestionario.preguntas.length}</small></div>
                <fieldset class="asesor-pregunta"><legend>${seguro(pregunta.titulo)}</legend><div class="asesor-opciones">${pregunta.opciones.map(([valor, etiqueta]) => `<label><input type="radio" name="asesor-${seguro(pregunta.id)}" value="${seguro(valor)}" ${respuestas[pregunta.id] === valor ? "checked" : ""}><span>${seguro(etiqueta)}</span></label>`).join("")}</div></fieldset>
                <p class="asesor-estado" role="status" aria-live="polite"></p><div class="asesor-navegacion"><button class="asesor-anterior" type="button" ${paso === 0 ? "disabled" : ""}>← Anterior</button><button class="asesor-siguiente" type="button">${paso === cuestionario.preguntas.length - 1 ? "Ver opciones" : "Siguiente →"}</button></div>`;
            panel.querySelector(".asesor-anterior").addEventListener("click", () => { if (paso > 0) { paso--; renderPregunta(); } });
            panel.querySelector(".asesor-siguiente").addEventListener("click", () => {
                const elegida = panel.querySelector("input:checked");
                if (!elegida) { panel.querySelector(".asesor-estado").textContent = "Selecciona una respuesta para continuar."; panel.querySelector("input")?.focus(); return; }
                respuestas[pregunta.id] = elegida.value;
                if (paso < cuestionario.preguntas.length - 1) { paso++; renderPregunta(); } else renderResultados();
            });
            panel.querySelector("input:checked, input")?.focus();
        }

        function tarjetaResultado(item) {
            const estado = ESTADOS[item.evaluacion.estado];
            const producto = item.producto;
            const datos = item.datos;
            const falta = [datos.potencia, datos.peso, datos.corte, datos.limitacion].filter(valor => /confirmar/i.test(valor || ""));
            return `<article class="asesor-resultado ${estado.clase}" data-producto-id="${seguro(item.id)}">
                <img src="${seguro(producto.imagenes?.[0]?.src || "")}" alt="${seguro(producto.imagenes?.[0]?.alt || producto.nombre)}" loading="lazy" decoding="async">
                <p class="asesor-idoneidad"><span aria-hidden="true">${estado.icono}</span>${estado.etiqueta}</p><h3>${seguro(producto.nombre)}</h3><p class="asesor-precio">${seguro(producto.precioTexto || "Consultar precio")}</p>
                <div class="asesor-explicacion"><strong>¿Por qué aparece?</strong><p>${seguro(item.evaluacion.porque)}</p></div>
                <dl><div><dt>Ventaja</dt><dd>${seguro(datos.ventaja)}</dd></div><div><dt>Limitación</dt><dd>${seguro(datos.limitacion)}</dd></div><div><dt>Potencia</dt><dd>${seguro(datos.potencia)}</dd></div><div><dt>Peso</dt><dd>${seguro(datos.peso)}</dd></div><div><dt>${categoria === "motosierras" ? "Espada / corte" : "Sistema de corte"}</dt><dd>${seguro(datos.corte)}</dd></div></dl>
                ${falta.length ? `<p class="asesor-pendiente"><strong>Dato por confirmar:</strong> ${seguro([...new Set(falta)].join("; "))}</p>` : ""}
                <div class="asesor-acciones"><a href="producto.html?id=${encodeURIComponent(item.id)}">Ver ficha completa</a><button class="asesor-agregar-comparacion" type="button" aria-pressed="${seleccionComparacion.has(item.id)}">${seleccionComparacion.has(item.id) ? "Quitar de comparación" : "Agregar a comparación"}</button><button class="asesor-whatsapp" type="button">Consultar por WhatsApp</button></div>
            </article>`;
        }

        function renderResultados() {
            const evaluacion = obtenerResultados(categoria, respuestas);
            seleccionComparacion = new Set();
            if (evaluacion.incertidumbre || !evaluacion.adecuados.length) {
                panel.innerHTML = `<section class="asesor-sin-resultados" aria-labelledby="asesor-sin-titulo"><span>Orientación responsable</span><h2 id="asesor-sin-titulo" tabindex="-1">Necesitamos conocer mejor tu trabajo</h2><p>No hay información suficiente para recomendar un modelo con seguridad a partir de esta respuesta. Una sucursal puede ayudarte a confirmar el equipo y la configuración apropiados.</p><button class="asesor-consultar-general" type="button">Solicitar asesoría por WhatsApp</button><button class="asesor-modificar" type="button">← Modificar respuestas</button></section>`;
                panel.querySelector(".asesor-consultar-general").addEventListener("click", () => window.Contactos?.abrirSelector({ titulo: "Elige una sucursal para recibir asesoría", mensaje: crearMensajeWhatsApp(categoria, null, respuestas, cuestionario) }));
                panel.querySelector(".asesor-modificar").addEventListener("click", () => { paso = 0; renderPregunta(); });
                panel.querySelector("h2")?.focus?.();
                return;
            }
            const visibles = evaluacion.adecuados.slice(0, 3);
            panel.innerHTML = `<section class="asesor-resultados" aria-labelledby="asesor-resultados-titulo"><div class="asesor-resultados-encabezado"><span>Orientación basada en datos verificados</span><h2 id="asesor-resultados-titulo" tabindex="-1">Estas son las opciones que encontramos para tu trabajo</h2><p>Primero se evaluó la idoneidad técnica. La frecuencia, el área, la experiencia y tus preferencias sólo ordenan opciones que ya resultaron adecuadas o condicionadas. Se muestran hasta tres alternativas.</p></div><div class="asesor-resultados-grid">${visibles.map(tarjetaResultado).join("")}</div><p class="asesor-estado" role="status" aria-live="polite"></p><div class="asesor-resultados-acciones"><button class="asesor-comparar" type="button">Comparar estas opciones</button><button class="asesor-modificar" type="button">Modificar respuestas</button><button class="asesor-reiniciar" type="button">Reiniciar asesoría</button></div></section>`;
            panel.querySelectorAll(".asesor-resultado").forEach(tarjeta => {
                const id = tarjeta.dataset.productoId;
                tarjeta.querySelector(".asesor-agregar-comparacion").addEventListener("click", evento => {
                    if (seleccionComparacion.has(id)) seleccionComparacion.delete(id);
                    else if (seleccionComparacion.size >= 3) { panel.querySelector(".asesor-estado").textContent = "Puedes agregar un máximo de tres modelos a la comparación."; return; }
                    else seleccionComparacion.add(id);
                    evento.currentTarget.setAttribute("aria-pressed", String(seleccionComparacion.has(id)));
                    evento.currentTarget.textContent = seleccionComparacion.has(id) ? "Quitar de comparación" : "Agregar a comparación";
                    panel.querySelector(".asesor-estado").textContent = `${seleccionComparacion.size} de 3 modelos seleccionados para comparar.`;
                });
                tarjeta.querySelector(".asesor-whatsapp").addEventListener("click", () => window.Contactos?.abrirSelector({ titulo: `Asesoría sobre ${evaluacion.adecuados.find(item => item.id === id).producto.nombre}`, mensaje: crearMensajeWhatsApp(categoria, evaluacion.adecuados.find(item => item.id === id).producto, respuestas, cuestionario) }));
            });
            panel.querySelector(".asesor-comparar").addEventListener("click", () => {
                const ids = seleccionComparacion.size >= 2 ? [...seleccionComparacion] : evaluacion.adecuados.slice(0, 3).map(item => item.id);
                if (ids.length < 2 || !window.Comparadores?.preseleccionar(categoria, ids, evaluacion.escenario)) { panel.querySelector(".asesor-estado").textContent = "Selecciona al menos dos modelos para comparar."; return; }
                panel.querySelector(".asesor-estado").textContent = "Los modelos se enviaron al comparador.";
            });
            panel.querySelector(".asesor-modificar").addEventListener("click", () => { paso = cuestionario.preguntas.length - 1; renderPregunta(); });
            panel.querySelector(".asesor-reiniciar").addEventListener("click", () => { paso = 0; respuestas = {}; seleccionComparacion.clear(); renderPregunta(); });
            panel.querySelector("#asesor-resultados-titulo")?.focus();
        }

        iniciar.addEventListener("click", () => {
            const abrir = panel.hidden;
            panel.hidden = !abrir;
            iniciar.setAttribute("aria-expanded", String(abrir));
            iniciar.textContent = abrir ? "Cerrar asesor" : "Ayúdame a elegir";
            if (abrir) renderPregunta();
        });
    }

    window.inicializarAsesor = inicializarAsesor;
    window.AsesorMaquinaria = Object.freeze({ obtenerResultados });
}());
