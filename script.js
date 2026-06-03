const CSV_URL = "data/resultados.csv";

fetch(CSV_URL)
    .then(response => response.text())
    .then(data => procesarCSV(data))
    .catch(error => {
        console.error(error);
        alert("No se pudo cargar el archivo CSV");
    });

function procesarCSV(texto){

    const filas = texto.trim().split("\n");

    filas.shift();

    const equipos = {};

    const partidos = [];

    filas.forEach(fila => {

        const [
            fecha,
            local,
            puntosLocal,
            visitante,
            puntosVisitante
        ] = fila.split(";");

        partidos.push({
            fecha,
            local,
            visitante,
            puntosLocal:Number(puntosLocal),
            puntosVisitante:Number(puntosVisitante)
        });

        [local, visitante].forEach(equipo => {

            if(!equipos[equipo]){
                equipos[equipo] = {
                    pj:0,
                    pg:0,
                    pp:0,
                    pf:0,
                    pc:0,
                    pts:0
                };
            }

        });

        equipos[local].pj++;
        equipos[visitante].pj++;

        equipos[local].pf += Number(puntosLocal);
        equipos[local].pc += Number(puntosVisitante);

        equipos[visitante].pf += Number(puntosVisitante);
        equipos[visitante].pc += Number(puntosLocal);

        if(Number(puntosLocal) > Number(puntosVisitante)){

            equipos[local].pg++;
            equipos[local].pts += 2;

            equipos[visitante].pp++;

        }else{

            equipos[visitante].pg++;
            equipos[visitante].pts += 2;

            equipos[local].pp++;
        }

    });

    generarTabla(equipos);
    generarPodio(equipos);
    generarResultados(partidos);
}

function generarTabla(equipos){

    const tbody = document.getElementById("tabla-body");

    tbody.innerHTML = "";

    const ranking = Object.entries(equipos)
        .sort((a,b) => {

            if(b[1].pts !== a[1].pts){
                return b[1].pts - a[1].pts;
            }

            return (b[1].pf - b[1].pc) -
                   (a[1].pf - a[1].pc);
        });

    ranking.forEach(([nombre, datos], index) => {

        const tr = document.createElement("tr");

        if(index === 0) tr.classList.add("top1");
        if(index === 1) tr.classList.add("top2");
        if(index === 2) tr.classList.add("top3");

        tr.innerHTML = `
            <td>${index + 1}</td>
            <td>${nombre}</td>
            <td>${datos.pj}</td>
            <td>${datos.pg}</td>
            <td>${datos.pp}</td>
            <td>${datos.pf}</td>
            <td>${datos.pc}</td>
            <td>${datos.pf - datos.pc}</td>
            <td>${datos.pts}</td>
        `;

        tbody.appendChild(tr);

    });

}

function generarPodio(equipos){

    const podio = document.getElementById("podio");

    podio.innerHTML = "";

    const ranking = Object.entries(equipos)
        .sort((a,b) => b[1].pts - a[1].pts)
        .slice(0,3);

    const medallas = ["🥇","🥈","🥉"];

    ranking.forEach(([nombre, datos], index) => {

        const card = document.createElement("div");

        card.className = "podio-card";

        card.innerHTML = `
            <div class="emoji">${medallas[index]}</div>
            <h3>${nombre}</h3>
            <p>${datos.pts} puntos</p>
        `;

        podio.appendChild(card);

    });

}

function generarResultados(partidos){

    const contenedor = document.getElementById("resultados");

    contenedor.innerHTML = "";

    partidos.reverse().forEach(partido => {

        const div = document.createElement("div");

        div.className = "partido";

        div.innerHTML = `
            <div class="fecha">${partido.fecha}</div>

            <div class="marcador">
                ${partido.local}
                ${partido.puntosLocal}
                -
                ${partido.puntosVisitante}
                ${partido.visitante}
            </div>
        `;

        contenedor.appendChild(div);

    });

}