/* Comparadores deterministas por tipo de trabajo. El precio nunca determina la recomendación. */
(function () {
    "use strict";

    const estados = {
        recomendado: ["Adecuado", "es-recomendado"],
        condicionado: ["Adecuado con condiciones", "es-condicionado"],
        no: ["No es la opción ideal", "es-no-recomendado"],
        insuficiente: ["Información insuficiente", "es-insuficiente"]
    };
    const escenariosMoto = [
        ["poda-suelo", "Poda y mantenimiento desde el suelo"], ["lena-ocasional", "Corte ocasional de leña"],
        ["lena-frecuente", "Corte frecuente de leña"], ["finca", "Mantenimiento de finca"],
        ["troncos", "Troceo de troncos"], ["forestal", "Trabajo forestal profesional"]
    ];
    const escenariosDesbro = [
        ["jardin", "Jardín pequeño y mantenimiento ligero"], ["bordes", "Césped y bordes"],
        ["pasto-alto", "Pasto alto"], ["maleza", "Maleza densa"],
        ["extenso", "Terrenos extensos"], ["profesional", "Trabajo profesional frecuente"]
    ];
    const r = (estado, porque) => ({ estado, porque });
    const datosPendientes = "El catálogo confirma datos técnicos, pero no documenta con suficiente precisión la aplicación para este escenario.";
    const podaEspecializada = "Es una motosierra especializada en cuidado de árboles. El trabajo en altura exige capacitación, técnica y protección específicas; no es una tarea doméstica ordinaria.";

    function moto(potencia, cilindrada, peso, alimentacion, corte, ventaja, limitacion, escenarios) {
        return { potencia, cilindrada, peso, alimentacion, corte, ventaja, limitacion, escenarios };
    }
    const desbro = moto;
    const insuficientes = (texto, escenarios) => Object.fromEntries(escenarios.map(([id]) => [id, r("insuficiente", texto)]));
    const noMotos = texto => Object.fromEntries(escenariosMoto.map(([id]) => [id, r("no", texto)]));

    function usosDomesticos() {
        return {
            "poda-suelo": r("recomendado", "Está declarada para mantenimiento de terrenos y trabajo doméstico desde el suelo."),
            "lena-ocasional": r("recomendado", "Su aplicación oficial incluye cortar leña."),
            "lena-frecuente": r("condicionado", "Puede cortar leña, pero conviene confirmar volumen y frecuencia."),
            finca: r("recomendado", "Su aplicación oficial incluye mantenimiento de terrenos."),
            troncos: r("condicionado", "La idoneidad depende de especie, diámetro, volumen y experiencia; esos datos no están confirmados."),
            forestal: r("no", "No se documenta como equipo forestal profesional.")
        };
    }
    function usosVersatiles() {
        const usos = usosDomesticos();
        usos["lena-frecuente"] = r("recomendado", "Su aplicación publicada incluye leña y mantenimiento con mayor capacidad que los modelos de entrada.");
        return usos;
    }
    function usosFinca(pesoElevado) {
        return {
            "poda-suelo": r("condicionado", pesoElevado ? "Su peso y potencia pueden ser excesivos para poda ligera." : "Puede servir, aunque hay opciones más ligeras."),
            "lena-ocasional": r("recomendado", "El fabricante declara el corte de leña entre sus aplicaciones."),
            "lena-frecuente": r("recomendado", "Su potencia y aplicación declarada respaldan el corte frecuente de leña."),
            finca: r("recomendado", "El fabricante declara mantenimiento de terrenos."),
            troncos: r("condicionado", "No existe un diámetro universal: deben valorarse madera, volumen y experiencia."),
            forestal: r("insuficiente", "La ficha no la clasifica inequívocamente para trabajo forestal profesional continuo.")
        };
    }
    function usosProfesionales(aplicacion) {
        return {
            "poda-suelo": r("no", "Su aplicación profesional no es proporcional para poda ligera desde el suelo."),
            "lena-ocasional": r("condicionado", "Puede realizar el trabajo, pero excede la necesidad habitual de un uso ocasional."),
            "lena-frecuente": r("recomendado", `Su aplicación profesional en ${aplicacion} respalda trabajos frecuentes con capacitación adecuada.`),
            finca: r("condicionado", "Es adecuada para tareas exigentes; puede ser excesiva para mantenimiento ligero."),
            troncos: r("recomendado", "Su aplicación profesional respalda troceo exigente, sin afirmar un diámetro universal."),
            forestal: r("recomendado", `El fabricante la orienta a ${aplicacion}.`)
        };
    }
    function usosDesbroLigera() {
        return { jardin: r("recomendado", "Es el modelo de entrada ligero declarado para jardines."), bordes: r("recomendado", "El fabricante declara recorte de césped, caminos y bordes."), "pasto-alto": r("condicionado", "Puede atender vegetación ligera; no se documenta para pasto alto persistente."), maleza: r("no", "No está orientada a maleza densa."), extenso: r("no", "Su aplicación es jardín y espacios reducidos."), profesional: r("no", "No se documenta para trabajo profesional frecuente.") };
    }
    function usosDesbroMedia() {
        return { jardin: r("recomendado", "Es multiuso para propietarios de jardines exigentes."), bordes: r("recomendado", "La configuración permite mantenimiento de césped y jardín."), "pasto-alto": r("recomendado", "El fabricante declara superficies mayores y hierba compactada."), maleza: r("condicionado", "Admite aplicaciones ligeras; debe confirmarse herramienta y densidad."), extenso: r("condicionado", "Puede cubrir superficies mayores, pero no se declara para uso profesional continuo."), profesional: r("no", "Su aplicación publicada es jardinería, no trabajo profesional frecuente.") };
    }
    function usosDesbroProfesional() {
        return { jardin: r("no", "Su orientación a superficies grandes o corte exigente resulta desproporcionada para jardín pequeño."), bordes: r("condicionado", "Puede cortar césped, pero su tamaño y manillar no son la opción más maniobrable."), "pasto-alto": r("recomendado", "La aplicación publicada incluye hierba densa o corte exigente."), maleza: r("recomendado", "Su uso declarado respalda trabajo exigente con herramienta compatible."), extenso: r("recomendado", "El fabricante declara superficies grandes o aplicaciones agrícolas."), profesional: r("recomendado", "Está orientada a trabajo exigente o profesional frecuente.") };
    }
    function usosPorFrecuencia(frecuencia) {
        const texto = `La ficha confirma uso ${frecuencia}, pero no especifica con precisión la vegetación de este escenario.`;
        return { jardin: r("no", "Su orientación de uso no es proporcional para mantenimiento ligero."), bordes: r("condicionado", texto), "pasto-alto": r("condicionado", texto), maleza: r("condicionado", texto), extenso: r("condicionado", texto), profesional: r("condicionado", texto) };
    }

    const matrices = {
        motosierras: {
            titulo: "Comparador inteligente de motosierras",
            introduccion: "Elige de dos a tres modelos y el trabajo que realizarás. La orientación usa aplicaciones publicadas y datos confirmados; no sustituye el manual ni una evaluación de seguridad.",
            escenarios: escenariosMoto,
            modelos: {
                "stihl-ms-162": moto("1.3 kW / 1.7 HP", "30.1 cm³", "4.5 kg", "Gasolina, 2 tiempos", "Espada Light de 16 pulgadas", "Ligera para jardín, poda desde el suelo y leña ocasional.", "No está orientada al trabajo forestal profesional frecuente.", usosDomesticos()),
                "stihl-ms-172": moto("1.5 kW / 2.01 HP", "31.8 cm³", "4.5 kg", "Gasolina, 2 tiempos", "Espada Light 04 de 16 pulgadas", "Compacta para leña, mantenimiento y pequeños derribos.", "No se documenta como motosierra forestal profesional.", usosDomesticos()),
                "stihl-ms-182-c-be": moto("1.6 kW / 2.15 HP", "35.8 cm³", "4.8 kg", "Gasolina, 2 tiempos", "Espada Light 04 de 16 pulgadas", "Versátil para leña, horticultura, paisajismo y mantenimiento.", "Para trabajo forestal continuo conviene un modelo declarado para ese uso.", usosVersatiles()),
                "stihl-ms-212": moto("1.8 kW / 2.4 HP", "38.6 cm³", "4.6 kg", "Gasolina, STIHL 2-MIX", "Espada Light 04 de 18 pulgadas", "Para leña, mantenimiento, paisajismo y tareas con madera.", "Los pequeños derribos requieren preparación y evaluación del entorno.", usosVersatiles()),
                "stihl-ms-250": moto("2.3 kW / 3.1 HP", "45.4 cm³", "4.6 kg", "Gasolina, 2 tiempos", "Espada Rollomatic de 18 pulgadas", "Aplicación publicada para leña y mantenimiento de terrenos.", "No se presenta como equipo forestal profesional continuo.", usosFinca(false)),
                "stihl-ms-260": moto("2.6 kW / 3.5 HP", "50.2 cm³", "4.8 kg", "Gasolina, 2 tiempos", "Espada Rollomatic de 20 pulgadas", "Profesional para aclarado y bosque de baja y media densidad.", "Para tareas ligeras puede aportar más capacidad de la necesaria.", usosProfesionales("bosque de baja y media densidad")),
                "stihl-ms-310": moto("3.2 kW / 4.3 HP", "59 cm³", "6.1 kg", "Gasolina, 2 tiempos", "Espada Rollomatic de 25 pulgadas", "Potencia para leña y mantenimiento de terrenos.", "Su peso exige valorar experiencia y duración de la jornada.", usosFinca(true)),
                "stihl-ms-363": moto("3.5 kW / 4.8 HP", "62.6 cm³", "5.5 kg", "Gasolina, 2 tiempos", "Espada Light 06 de 25 pulgadas", "Uso intensivo para árbol mediano y silvicultura.", "No es proporcional para jardinería o poda ligera.", usosProfesionales("árbol mediano y silvicultura")),
                "stihl-ms-382": moto("5.2 HP", "72.2 cm³", "6.2 kg", "Gasolina, 2 tiempos", "Espada de 25 a 30 pulgadas", "Profesional, resistente y de alto rendimiento.", "Requiere experiencia y planificación del trabajo.", usosProfesionales("trabajo profesional")),
                "stihl-ms-462-c-m": moto("5.9 HP", "72.2 cm³", "6 kg", "Gasolina, STIHL 2-MIX", "Espada de 30 pulgadas", "Ligera y potente dentro del segmento forestal profesional.", "No es la opción ideal para mantenimiento ligero.", usosProfesionales("trabajo forestal")),
                "stihl-ms-651-ms-661": moto("5.0–5.4 kW / 6.7–7.2 HP", "91.1 cm³", "7.3–7.5 kg", "Gasolina; variante por confirmar", "25 a 36 pulgadas según variante", "La ficha reúne dos modelos profesionales.", "Debe confirmarse la variante individual y su configuración.", insuficientes("La ficha agrupa MS 651 y MS 661; no se puede recomendar una variante individual con seguridad.", escenariosMoto)),
                "stihl-ms-194-t": moto("1.8 HP", "31.8 cm³", "3.3 kg", "Gasolina, STIHL 2-MIX", "14 a 16 pulgadas", "Especializada en cuidado profesional de árboles.", podaEspecializada, noMotos(podaEspecializada)),
                "stihl-ms-201-tc-m": moto("2.4 HP", "35.2 cm³", "3.7 kg", "Gasolina, STIHL 2-MIX", "16 pulgadas", "Especializada en cuidado profesional de árboles.", podaEspecializada, noMotos(podaEspecializada)),
                "stihl-msa-120-c": moto("Información por confirmar", "No aplica", "2.3 kg sin batería, espada ni cadena", "Batería STIHL AK de 36 V", "Paso 1/4 pulgada P; longitud por confirmar", "Bajo peso del equipo sin batería.", "Aplicación y configuración comercial por confirmar.", insuficientes(datosPendientes, escenariosMoto))
            }
        },
        desbrozadoras: {
            titulo: "Comparador inteligente de desbrozadoras",
            introduccion: "Compara únicamente desbrozadoras identificadas. Las podadoras de altura y fichas de exhibición quedan fuera porque realizan trabajos distintos o agrupan modelos ambiguos.",
            escenarios: escenariosDesbro,
            modelos: {
                "stihl-fs-38": desbro("0.9 HP", "27.2 cm³", "4.1–4.2 kg, según la medición publicada", "Gasolina, 2 tiempos", "AutoCut C 6-2", "Muy ligera para jardín, césped y bordes.", "No está destinada a maleza densa ni uso profesional continuo.", usosDesbroLigera()),
                "stihl-fs-55": desbro("1 HP", "27.2 cm³", "4.8 kg", "Gasolina, 2 tiempos", "AutoCut 27-2", "Multiuso para superficies mayores y hierba compactada.", "Para maleza densa conviene confirmar herramienta y capacidad.", usosDesbroMedia()),
                "stihl-fs-120": desbro("1.74 HP", "30.8 cm³", "6.3 kg", "Gasolina, 2 tiempos", "AutoCut 27-2", "Manillar doble para superficies grandes con hierba densa.", "Puede ser menos maniobrable en bordes estrechos.", usosDesbroProfesional()),
                "stihl-fs-230": desbro("2 HP", "40.2 cm³", "7.5 kg", "Gasolina, 2 tiempos", "AutoCut 27-2; admite herramienta según aplicación", "Corte exigente y grandes superficies agrícolas.", "No es proporcional para mantenimiento ligero.", usosDesbroProfesional()),
                "stihl-fs-161-l": desbro("1.5 kW / 2.0 HP", "37.7 cm³", "7.6 kg sin combustible", "Gasolina, STIHL 2-MIX", "Cuchilla BrushCut 300-3", "Herramienta metálica confirmada.", "Fotografía grupal y aplicación por confirmar.", insuficientes(datosPendientes, escenariosDesbro)),
                "stihl-fs-221-l": desbro("1.7 kW / 2.2 HP", "37.7 cm³", "7.7 kg sin combustible", "Gasolina, STIHL 2-MIX", "Cuchilla BrushCut 300-3", "Mayor potencia que FS 161 L.", "Fotografía grupal y aplicación por confirmar.", insuficientes(datosPendientes, escenariosDesbro)),
                "stihl-fs-235": desbro("2.1 HP", "36.3 cm³", "6.8 kg", "Gasolina, STIHL 2-MIX", "AutoCut 27-2", "Uso frecuente confirmado.", "Vegetación y superficie exactas por confirmar.", usosPorFrecuencia("frecuente")),
                "stihl-fs-255": desbro("2.01 HP", "36.3 cm³", "7.9 kg", "Gasolina, STIHL 2-MIX", "AutoCut 46-2", "Uso intensivo y cabezal confirmado.", "Tipo exacto de vegetación por confirmar.", usosPorFrecuencia("intensivo")),
                "stihl-fs-261-l": desbro("2.7 HP", "41.6 cm³", "7.8 kg", "Gasolina, STIHL 2-MIX", "AutoCut 46-2", "Uso intensivo y potencia elevada.", "Tipo exacto de vegetación por confirmar.", usosPorFrecuencia("intensivo")),
                "stihl-fs-291-l": desbro("2.7 HP", "41.6 cm³", "8 kg", "Gasolina, STIHL 2-MIX", "Cuchilla 300-3", "Uso intensivo con cuchilla confirmada.", "Debe verificarse la herramienta para la vegetación concreta.", usosPorFrecuencia("intensivo")),
                "stihl-fs-351-l": desbro("2.3 HP", "37.7 cm³", "8.8 kg", "Gasolina, STIHL 2-MIX", "Cuchilla 305-2", "Uso intensivo con cuchilla confirmada.", "Tipo exacto de vegetación por confirmar.", usosPorFrecuencia("intensivo")),
                "stihl-fs-460-l": desbro("3.0 HP", "45.6 cm³", "8.8 kg", "Gasolina, STIHL 2-MIX", "AutoCut 46-2", "Uso intensivo y alta potencia.", "No debe elegirse solo por potencia; confirma herramienta y vegetación.", usosPorFrecuencia("intensivo")),
                "stihl-fr-235": desbro("2.1 HP", "36.3 cm³", "10.3 kg", "Gasolina, 2 tiempos", "AutoCut 36-2", "Uso frecuente confirmado.", "Aplicación y configuración de transporte por confirmar.", usosPorFrecuencia("frecuente")),
                "stihl-fsa-56": desbro("Información por confirmar", "No aplica", "2.1 kg sin protector ni herramienta", "Batería STIHL AK de 36 V", "Herramienta por confirmar", "Bajo peso y uso doméstico.", "Herramienta incluida y capacidad para vegetación exigente por confirmar.", { jardin: r("recomendado", "Su uso doméstico y bajo peso encajan con mantenimiento ligero."), bordes: r("condicionado", "Puede ser adecuada, pero la herramienta incluida debe confirmarse."), "pasto-alto": r("insuficiente", datosPendientes), maleza: r("no", "No hay respaldo para recomendarla en maleza densa."), extenso: r("no", "No se documenta para terrenos extensos."), profesional: r("no", "La ficha la identifica para uso doméstico.") }),
                "stihl-fsa-85": desbro("Información por confirmar", "No aplica", "2.8 kg sin batería, protector ni herramienta", "Batería STIHL AP o AR de 36 V", "Herramienta por confirmar", "Sistema de batería y bajo peso confirmados.", "Aplicación, herramienta y autonomía por confirmar.", insuficientes(datosPendientes, escenariosDesbro))
            }
        }
    };
    const instancias = new Map();

    const seguro = valor => String(valor ?? "").replace(/[&<>'"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[c]);
    const imagen = producto => producto.imagenes?.[0]?.src || "";
    const precio = producto => producto.precioTexto || "Consultar precio";
    const fila = (titulo, valor) => `<div><dt>${seguro(titulo)}</dt><dd>${seguro(valor || "Información por confirmar")}</dd></div>`;

    function crearResumenDiferencias(config, ids, escenarioId, productos) {
        const adecuados = ids.map(id => ({
            id,
            producto: productos.get(id),
            datos: config.modelos[id],
            evaluacion: config.modelos[id].escenarios[escenarioId]
        })).filter(item => ["recomendado", "condicionado"].includes(item.evaluacion?.estado));
        if (adecuados.length < 2) return "";

        const campos = [
            ["Potencia", "potencia"],
            ["Cilindrada", "cilindrada"],
            ["Peso", "peso"],
            ["Alimentación", "alimentacion"],
            [config === matrices.motosierras ? "Espada / corte" : "Sistema de corte", "corte"]
        ];
        const camposDiferentes = campos.filter(([, clave]) => new Set(adecuados.map(item => item.datos[clave])).size > 1);
        const camposVisibles = (camposDiferentes.length ? camposDiferentes : campos).slice(0, 4);
        const lineas = adecuados.map(item => `<li><strong>${seguro(item.producto.nombre)}:</strong> ${camposVisibles.map(([etiqueta, clave]) => `${seguro(etiqueta.toLowerCase())} ${seguro(item.datos[clave] || "por confirmar")}`).join("; ")}.</li>`).join("");
        return `<aside class="comparador-diferencias" aria-label="Diferencias verificadas entre modelos adecuados"><strong>Diferencias verificadas entre las opciones adecuadas</strong><p>No se declara un ganador: la opción conveniente depende del trabajo documentado, la frecuencia de uso, el peso, la herramienta de corte y las condiciones reales.</p><ul>${lineas}</ul></aside>`;
    }

    function renderizarResultado(config, ids, escenarioId, resultado) {
        resultado.style.setProperty("--comparador-columnas", String(ids.length));
        const productos = new Map((window.PRODUCTOS || []).map(producto => [producto.id, producto]));
        const escenario = config.escenarios.find(([id]) => id === escenarioId)?.[1] || "Escenario";
        const tarjetas = ids.map(id => {
            const producto = productos.get(id);
            const datos = config.modelos[id];
            const evaluacion = datos.escenarios[escenarioId] || r("insuficiente", "No hay información suficiente para recomendar este modelo con seguridad.");
            const [etiqueta, clase] = estados[evaluacion.estado];
            const iconoEstado = { recomendado: "✓", condicionado: "!", no: "×", insuficiente: "?" }[evaluacion.estado] || "?";
            const requiereConfirmarModelo = /\/|exhibición/i.test(producto.nombre) || /variante por confirmar/i.test(datos.alimentacion);
            return `<article class="comparador-modelo ${clase}">
                <img src="${seguro(imagen(producto))}" alt="${seguro(producto.imagenes?.[0]?.alt || producto.nombre)}" loading="lazy" decoding="async">
                <p class="comparador-estado"><span aria-hidden="true">${iconoEstado}</span>${etiqueta}</p>${requiereConfirmarModelo ? '<p class="comparador-confirmacion">Requiere confirmar modelo</p>' : ""}<h3>${seguro(producto.nombre)}</h3><p class="comparador-precio">${seguro(precio(producto))}</p>
                <dl class="comparador-datos">${fila("Potencia", datos.potencia)}${fila("Cilindrada", datos.cilindrada)}${fila("Peso", datos.peso)}${fila("Alimentación", datos.alimentacion)}${fila(config === matrices.motosierras ? "Espada / corte" : "Sistema de corte", datos.corte)}</dl>
                <div class="comparador-criterio"><strong>${evaluacion.estado === "no" ? "No es la opción ideal porque…" : evaluacion.estado === "insuficiente" ? "No hay información suficiente para recomendar este modelo con seguridad porque…" : "Recomendado para este trabajo porque…"}</strong><p>${seguro(evaluacion.porque)}</p></div>
                <div class="comparador-criterio comparador-limitacion"><strong>Ventaja relevante</strong><p>${seguro(datos.ventaja)}</p><strong>Limitación</strong><p>${seguro(datos.limitacion)}</p></div>
                <div class="comparador-acciones"><a class="ver-detalles" href="producto.html?id=${encodeURIComponent(producto.id)}">Ver detalles</a><button class="comprar consulta-comparador" type="button" data-producto-id="${seguro(producto.id)}" data-escenario="${seguro(escenario)}" data-estado="${seguro(etiqueta)}">Consultar por WhatsApp</button></div>
            </article>`;
        }).join("");
        const diferencias = crearResumenDiferencias(config, ids, escenarioId, productos);
        resultado.innerHTML = `<div class="comparador-resultado-encabezado"><span>Orientación para</span><h2>${seguro(escenario)}</h2><p>La recomendación usa aplicaciones y especificaciones confirmadas, no el precio. Confirma herramienta, condiciones y seguridad antes de decidir.</p></div>${diferencias}<div class="comparador-resultados-grid">${tarjetas}</div>`;
        resultado.querySelectorAll(".consulta-comparador").forEach(boton => {
            boton.addEventListener("click", function () {
                const producto = productos.get(boton.dataset.productoId);
                if (!producto || !window.Contactos) return;
                const mensaje = [
                    `Hola, quiero recibir asesoría sobre ${producto.nombre}.`,
                    `Trabajo seleccionado: ${boton.dataset.escenario}.`,
                    `Orientación mostrada: ${boton.dataset.estado}.`,
                    `Precio publicado: ${precio(producto)}.`,
                    "Agradezco confirmar si es adecuado para mi trabajo, su disponibilidad y precio final."
                ].join("\n");
                window.Contactos.abrirSelector({ titulo: `Asesoría sobre ${producto.nombre}`, mensaje });
            });
        });
        resultado.focus();
    }

    function inicializarComparador(categoria, contenedor) {
        const config = matrices[categoria];
        if (!config || !contenedor) return;
        const productos = new Map((window.PRODUCTOS || []).map(producto => [producto.id, producto]));
        const ids = Object.keys(config.modelos).filter(id => productos.has(id));
        contenedor.innerHTML = `<section class="comparador-inteligente" aria-labelledby="comparador-titulo">
            <div class="comparador-portada"><span class="comparador-eyebrow">Orientación técnica responsable</span><h2 id="comparador-titulo">${seguro(config.titulo)}</h2><p>${seguro(config.introduccion)}</p><button class="boton-comparar" type="button" aria-expanded="false" aria-controls="panel-comparador">Abrir comparador</button></div>
            <div id="panel-comparador" class="panel-comparador panel-comparador-inteligente" hidden>
                <div class="comparador-paso"><span>1</span><div><label for="escenario-comparador">¿Qué trabajo necesitas realizar?</label><select id="escenario-comparador"><option value="">Selecciona un escenario</option>${config.escenarios.map(([id, label]) => `<option value="${id}">${seguro(label)}</option>`).join("")}</select></div></div>
                <fieldset class="comparador-paso comparador-seleccion"><legend><span>2</span> Elige dos o tres modelos</legend><p>La selección no usa el precio como criterio técnico.</p><div class="comparador-opciones">${ids.map(id => `<label><input type="checkbox" value="${seguro(id)}"><span>${seguro(productos.get(id).nombre)}</span></label>`).join("")}</div></fieldset>
                <p class="comparador-mensaje" role="status" aria-live="polite"></p><button class="comparador-generar" type="button">Comparar modelos seleccionados</button><div id="resultado-comparacion" class="comparador-resultado" tabindex="-1"></div>
            </div></section>`;
        const abrir = contenedor.querySelector(".boton-comparar");
        const panel = contenedor.querySelector("#panel-comparador");
        const casillas = [...contenedor.querySelectorAll('input[type="checkbox"]')];
        const escenario = contenedor.querySelector("#escenario-comparador");
        const mensaje = contenedor.querySelector(".comparador-mensaje");
        const resultado = contenedor.querySelector("#resultado-comparacion");
        abrir.addEventListener("click", () => { const mostrar = panel.hidden; panel.hidden = !mostrar; abrir.setAttribute("aria-expanded", String(mostrar)); abrir.textContent = mostrar ? "Cerrar comparador" : "Abrir comparador"; if (mostrar) escenario.focus(); });
        casillas.forEach(casilla => casilla.addEventListener("change", () => { const elegidas = casillas.filter(item => item.checked); if (elegidas.length > 3) { casilla.checked = false; mensaje.textContent = "Puedes comparar un máximo de tres modelos."; } else mensaje.textContent = `${elegidas.length} de 3 modelos seleccionados.`; }));
        contenedor.querySelector(".comparador-generar").addEventListener("click", () => { const elegidas = casillas.filter(item => item.checked).map(item => item.value); if (!escenario.value) { mensaje.textContent = "Selecciona el tipo de trabajo antes de comparar."; escenario.focus(); return; } if (elegidas.length < 2) { mensaje.textContent = "Selecciona al menos dos modelos diferentes."; casillas[0]?.focus(); return; } mensaje.textContent = ""; renderizarResultado(config, elegidas, escenario.value, resultado); });
        instancias.set(categoria, { abrir, panel, casillas, escenario, mensaje, resultado, config });
    }

    function preseleccionar(categoria, ids, escenarioId) {
        const instancia = instancias.get(categoria);
        if (!instancia) return false;
        const unicos = [...new Set(ids)].slice(0, 3);
        instancia.casillas.forEach(casilla => { casilla.checked = unicos.includes(casilla.value); });
        if (escenarioId && instancia.config.escenarios.some(([id]) => id === escenarioId)) instancia.escenario.value = escenarioId;
        if (instancia.panel.hidden) instancia.abrir.click();
        if (unicos.length < 2) {
            instancia.mensaje.textContent = "Selecciona al menos dos modelos diferentes.";
            return false;
        }
        instancia.mensaje.textContent = `${unicos.length} de 3 modelos seleccionados desde el asesor.`;
        renderizarResultado(instancia.config, unicos, instancia.escenario.value, instancia.resultado);
        instancia.resultado.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
        return true;
    }

    window.inicializarComparador = inicializarComparador;
    window.COMPARADORES_DATOS = matrices;
    window.Comparadores = Object.freeze({ preseleccionar });
}());
