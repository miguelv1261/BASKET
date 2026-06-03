const logos = {
    "Tigres": "logos/tigres.png",
    "Leones": "logos/leones.png",
    "Condores": "logos/condores.png",
    "Tiburones": "logos/tiburones.png",
    "Panteras": "logos/panteras.png",
    "Halcones": "logos/halcones.png",
    "Guerreros": "logos/guerreros.png",
    "Dragones": "logos/dragones.png"
};

cargarResultados();
cargarProximos();

function obtenerSeparador(texto) {

    return texto.includes(";")
        ? ";"
        : ",";
}

function cargarResultados() {

    fetch("data/resultados.csv")
        .then(r => r.text())
        .then(csv => {

            const filas = csv.trim().split("\n");

            // Eliminar encabezado
            filas.shift();

            const equipos = {};
            const partidos = [];

            filas.forEach(fila => {

                const sep = obtenerSeparador(fila);

                const [
                    fecha,
                    local,
                    puntosLocal,
                    visitante,
                    puntosVisitante,
                    estado = "NORMAL"
                ] = fila.split(sep);

                const pl = Number(puntosLocal);
                const pv = Number(puntosVisitante);

                partidos.push({
                    fecha,
                    local,
                    visitante,
                    puntosLocal: pl,
                    puntosVisitante: pv
                });

                // Crear equipos si no existen
                [local, visitante].forEach(eq => {

                    if (!equipos[eq]) {

                        equipos[eq] = {
                            pj: 0,
                            pg: 0,
                            pp: 0,
                            pf: 0,
                            pc: 0,
                            pts: 0
                        };

                    }

                });

                // Partidos jugados
                equipos[local].pj++;
                equipos[visitante].pj++;

                // Puntos a favor y en contra
                equipos[local].pf += pl;
                equipos[local].pc += pv;

                equipos[visitante].pf += pv;
                equipos[visitante].pc += pl;

                // ===== SISTEMA DE PUNTUACIÓN =====

                if (estado === "NO_PRESENTA_VISITA") {

                    equipos[local].pg++;
                    equipos[local].pts += 2;

                    equipos[visitante].pp++;
                    // visitante recibe 0 puntos

                }
                else if (estado === "NO_PRESENTA_LOCAL") {

                    equipos[visitante].pg++;
                    equipos[visitante].pts += 2;

                    equipos[local].pp++;
                    // local recibe 0 puntos

                }
                else {

                    // Partido normal

                    if (pl > pv) {

                        // gana local
                        equipos[local].pg++;
                        equipos[local].pts += 2;

                        // pierde visitante
                        equipos[visitante].pp++;
                        equipos[visitante].pts += 1;

                    }
                    else if (pv > pl) {

                        // gana visitante
                        equipos[visitante].pg++;
                        equipos[visitante].pts += 2;

                        // pierde local
                        equipos[local].pp++;
                        equipos[local].pts += 1;

                    }

                }

            });

            generarTabla(equipos);
            generarPodio(equipos);
            generarResultados(partidos);

        })
        .catch(error => {
            console.error("Error al cargar resultados:", error);
        });

}

function generarTabla(equipos) {

    const tbody =
        document.getElementById("tabla-body");

    tbody.innerHTML = "";

    const ranking =
        Object.entries(equipos)
            .sort((a, b) => {

                if (b[1].pts !== a[1].pts) {
                    return b[1].pts - a[1].pts;
                }

                return (b[1].pf - b[1].pc) - (a[1].pf - a[1].pc);

            });

    ranking.forEach(([nombre, d], i) => {

        const tr =
            document.createElement("tr");

        if (i === 0) tr.classList.add("top1");
        if (i === 1) tr.classList.add("top2");
        if (i === 2) tr.classList.add("top3");

        tr.innerHTML = `
        <td>${i + 1}</td>

        <td>
            <div class="equipo-cell">
                <img src="${logos[nombre]}" class="logo-equipo">
                <span>${nombre}</span>
            </div>
        </td>

        <td>${d.pj}</td>
        <td>${d.pg}</td>
        <td>${d.pp}</td>
        <td>${d.pf}</td>
        <td>${d.pc}</td>
        <td>${d.pf - d.pc}</td>
        <td>${d.pts}</td>
        `;

        tbody.appendChild(tr);

    });

}

function generarPodio(equipos) {

    const podio =
        document.getElementById("podio");

    podio.innerHTML = "";

    const ranking = Object.entries(equipos)
        .sort((a, b) => {

            if (b[1].pts !== a[1].pts) {
                return b[1].pts - a[1].pts;
            }

            return (b[1].pf - b[1].pc) - (a[1].pf - a[1].pc);

        })
        .slice(0, 3);

    const medallas = ["🥇", "🥈", "🥉"];

    ranking.forEach(([nombre, d], i) => {

        podio.innerHTML += `

        <div class="podio-card">

            <h1>${medallas[i]}</h1>

            <img src="${logos[nombre]}">

            <h3>${nombre}</h3>

            <p>${d.pts} pts</p>

        </div>

        `;

    });

}

function generarResultados(partidos) {

    const div =
        document.getElementById("resultados");

    div.innerHTML = "";

    partidos.reverse().forEach(p => {

        div.innerHTML += `

        <div class="partido">

            <div class="fecha">
                ${p.fecha}
            </div>

            <div class="vs">

                <div class="team">
                    <img src="${logos[p.local]}">
                    <span>${p.local}</span>
                </div>

                <div class="score">
                    ${p.puntosLocal}
                    -
                    ${p.puntosVisitante}
                </div>

                <div class="team">
                    <img src="${logos[p.visitante]}">
                    <span>${p.visitante}</span>
                </div>

            </div>

        </div>

        `;

    });

}

function cargarProximos() {

    fetch("data/proximos_partidos.csv")
        .then(r => r.text())
        .then(csv => {

            const filas =
                csv.trim().split("\n");

            filas.shift();

            const div =
                document.getElementById("proximosPartidos");

            filas.forEach(fila => {

                const sep =
                    obtenerSeparador(fila);

                const [
                    fecha,
                    hora,
                    local,
                    visitante
                ] = fila.split(sep);

                div.innerHTML += `

            <div class="partido-futuro">

                <div class="fecha">
                    ${fecha} - ${hora}
                </div>

                <div class="vs">

                    <div class="team">
                        <img src="${logos[local]}">
                        <span>${local}</span>
                    </div>

                    <div class="versus">
                        VS
                    </div>

                    <div class="team">
                        <img src="${logos[visitante]}">
                        <span>${visitante}</span>
                    </div>

                </div>

            </div>

            `;

            });

        });

}