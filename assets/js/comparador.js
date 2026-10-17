function abrirComparador() {
    const panel = document.getElementById('panel-comparador');
    if (!panel) return;
    const estaAbierto = getComputedStyle(panel).display !== 'none';
    panel.style.display = estaAbierto ? 'none' : 'block';

    if (estaAbierto) {
        document.getElementById('resultado-comparacion').replaceChildren();
    }
}
const datosMotosierras = window.DATOS_MOTOSIERRAS = {
    ms162: {
        imagen: "ms162.png",
        nombre: "MS 162",
        potencia: "1.3 kW / 1.7 HP",
        cilindrada: "30.1 cm³",
        peso: "4.5 kg",
        espada: '16" (configuración STIHL México)',
        precio: "$4,500"
    },

    ms172: {
        imagen: "Ms172.png",
        nombre: "MS 172",
        potencia: "1.5 kW / 2.01 HP",
        cilindrada: "31.8 cm³",
        peso: "4.5 kg",
        espada: '16" (configuración STIHL México)',
        precio: "$4,500"
    },

    ms182: {
        imagen: "Ms182.png",
        nombre: "MS 182 C-BE",
        potencia: "1.6 kW / 2.15 HP",
        cilindrada: "35.8 cm³",
        peso: "4.8 kg",
        espada: '16" (configuración STIHL México)',
        precio: "$5,911"
    },

    ms212: {
        imagen: "Ms212.png",
        nombre: "MS 212",
        potencia: "1.8 kW / 2.4 HP",
        cilindrada: "38.6 cm³",
        peso: "4.6 kg",
        espada: '18" (configuración STIHL México)',
        precio: "$5,900"
    },

    ms250: {
        imagen: "Ms250.png",
        nombre: "MS 250",
        potencia: "2.3 kW / 3.1 HP",
        cilindrada: "45.4 cm³",
        peso: "4.6 kg",
        espada: '18" (configuración STIHL México)',
        precio: "$6,900"
    },

    ms260: {
        imagen: "Ms260.png",
        nombre: "MS 260",
        potencia: "2.6 kW / 3.5 HP",
        cilindrada: "50.2 cm³",
        peso: "4.9 kg",
        espada: '20" (configuración STIHL México)',
        precio: "$12,989"
    },

    ms310: {
        imagen: "Ms310.png",
        nombre: "MS 310",
        potencia: "3.2 kW / 4.3 HP",
        cilindrada: "59 cm³",
        peso: "6.1 kg",
        espada: '25" (configuración STIHL México)',
        precio: "$14,272"
    },

    ms363: {
        imagen: "Ms363.png",
        nombre: "MS 363",
        potencia: "3.5 kW / 4.8 HP",
        cilindrada: "62.6 cm³",
        peso: "5.5 kg",
        espada: '25" (configuración STIHL México)',
        precio: "$15,861"
    },

    ms382: {
    imagen: "Ms382.png",
    nombre: "MS 382",
    potencia: "5.2 HP",
    cilindrada: "72.2 cm³",
    peso: "6.2 kg",
    espada: '25-30"',
    precio: "$14,778"
},

    ms462: {
    imagen: "Ms462.png",
    nombre: "MS 462 C-M",
    potencia: "5.9 HP",
    cilindrada: "72.2 cm³",
    peso: "6.0 kg",
    espada: '30"',
    precio: "$23,311"
},

    ms651: {
    imagen: "Ms651-Ms661.png",
    nombre: "MS 651",
    potencia: "5.0 kW / 6.7 HP",
    cilindrada: "91.1 cm³",
    peso: "7.3 kg",
    espada: '25-30"',
    precio: "$23,728"
},

    ms661: {
    imagen: "Ms651-Ms661.png",
    nombre: "MS 661",
    potencia: "5.4 kW / 7.2 HP",
    cilindrada: "91.1 cm³",
    peso: "7.5 kg",
    espada: '25-36"',
    precio: "$29,644"
},

    ms194t: {
        imagen: "Ms194T.png",
        nombre: "MS 194 T",
        potencia: "1.8 HP",
        cilindrada: "31.8 cm³",
        peso: "3.3 kg",
        espada: '14-16"',
        precio: "$12,039"
    },

    ms201tcm: {
        imagen: "Ms201TCM.png",
        nombre: "MS 201 TC-M",
        potencia: "2.4 HP",
        cilindrada: "35.2 cm³",
        peso: "3.7 kg",
        espada: '16"',
        precio: "$15,411"
    }
};
function generarRecomendacion(a, b) {
    let texto = "";

    const potenciaA = parseFloat(a.potencia);
    const potenciaB = parseFloat(b.potencia);

    const pesoA = parseFloat(a.peso);
    const pesoB = parseFloat(b.peso);

    if (potenciaA > potenciaB) {
        texto += `<br><br>💪 ${a.nombre} ofrece mayor potencia. `;
    } else if (potenciaB > potenciaA) {
        texto += `<br><br>💪 ${b.nombre} ofrece mayor potencia. `;
    } else {
        texto += `<br><br>⚖️ Ambos modelos tienen una potencia similar. `;
    }

    if (pesoA < pesoB) {
        texto += `<br><br>🪶 ${a.nombre} es más ligera, lo que puede facilitar su manejo.`;
    } else if (pesoB < pesoA) {
        texto += `<br><br>🪶 ${b.nombre} es más ligera, lo que puede facilitar su manejo.`;
    } else {
        texto += `<br><br>⚖️ Ambos modelos tienen un peso similar.`;
    }
    const cilindradaA = parseFloat(a.cilindrada);
const cilindradaB = parseFloat(b.cilindrada);

if (cilindradaA > cilindradaB) {
    texto += `<br><br>⚙️ ${a.nombre} tiene mayor cilindrada (${a.cilindrada} frente a ${b.cilindrada}).`;
} else if (cilindradaB > cilindradaA) {
    texto += `<br><br>⚙️ ${b.nombre} tiene mayor cilindrada (${b.cilindrada} frente a ${a.cilindrada}).`;
} else {
    texto += `<br><br>⚙️ Ambos modelos tienen la misma cilindrada.`;
}
const precioA = parseFloat(a.precio.replace(/[$,]/g, ""));
const precioB = parseFloat(b.precio.replace(/[$,]/g, ""));

if (precioA < precioB) {
    texto += `<br><br>💰 ${a.nombre} tiene un precio menor: ${a.precio} frente a ${b.precio}.`;
} else if (precioB < precioA) {
    texto += `<br><br>💰 ${b.nombre} tiene un precio menor: ${b.precio} frente a ${a.precio}.`;
} else {
    texto += `<br><br>💰 Ambos modelos tienen el mismo precio.`;
}
    return texto;
}
function compararMotosierras() {
    const resultado = document.getElementById("resultado-comparacion");
    const selector1 = document.getElementById("modelo1");
    const selector2 = document.getElementById("modelo2");
    if (!resultado || !selector1 || !selector2) return;

    if (resultado.childElementCount > 0) {
        resultado.replaceChildren();
        return;
    }

    const modelo1 = selector1.value;
    const modelo2 = selector2.value;

    if (!modelo1 || !modelo2) {
        alert("Selecciona dos motosierras.");
        return;
    }

    if (modelo1 === modelo2) {
        alert("Selecciona dos modelos diferentes.");
        return;
    }

    const moto1 = datosMotosierras[modelo1];
    const moto2 = datosMotosierras[modelo2];

    const numeroVisual = valor => parseFloat(valor.replace(/[$,]/g, ""));
    const favorable = (valor, otro, menor = false) => menor
        ? numeroVisual(valor) < numeroVisual(otro)
        : numeroVisual(valor) > numeroVisual(otro);
    const caracteristicas = [
        ["Potencia", "potencia", false, "Mayor potencia"],
        ["Cilindrada", "cilindrada", false, "Mayor cilindrada"],
        ["Peso", "peso", true, "Menor peso"],
        ["Espada", "espada", false, ""]
    ];

    resultado.innerHTML = `
        <div class="tarjeta-comparacion">
            <h3>⚖️ Resultado de la comparación</h3>

            <div class="duelo-comparacion">
                ${[moto1, moto2].map((moto, indice) => {
                    const menorPrecio = favorable(moto.precio, [moto2, moto1][indice].precio, true);
                    return `
                    ${indice === 1 ? '<span class="vs-comparacion" aria-hidden="true">VS</span>' : ''}
                    <div class="modelo-comparacion">
                        <img class="imagen-comparacion" src="${moto.imagen}" alt="Motosierra STIHL ${moto.nombre}">
                        <h4>${moto.nombre}</h4>
                        <div class="precio-comparacion${menorPrecio ? ' dato-favorable' : ''}">
                            ${moto.precio}
                            ${menorPrecio ? '<span class="ventaja-comparacion">Menor precio</span>' : ''}
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <table class="tabla-comparacion">
                <thead>
                    <tr>
                        <th scope="col">Característica</th>
                        <th scope="col">${moto1.nombre}</th>
                        <th scope="col">${moto2.nombre}</th>
                    </tr>
                </thead>
                <tbody>
                    ${caracteristicas.map(([titulo, campo, menor, etiqueta]) => `
                    <tr>
                        <th scope="row">${titulo}</th>
                        ${[moto1, moto2].map((moto, indice) => {
                            const destacado = etiqueta && favorable(moto[campo], [moto2, moto1][indice][campo], menor);
                            return `<td${destacado ? ' class="dato-favorable"' : ''}>${moto[campo]}${destacado ? `<span class="ventaja-comparacion">${etiqueta}</span>` : ''}</td>`;
                        }).join('')}
                    </tr>`).join('')}
                </tbody>
            </table>
            <div class="recomendacion-comparacion">
    <h3>💡 ¿Cuál te conviene?</h3>
    <p id="recomendacion-motosierra"></p>
</div>
        </div>
    `;
    const recomendacion = generarRecomendacion(moto1, moto2);

document.getElementById("recomendacion-motosierra").innerHTML =
    recomendacion;
}
