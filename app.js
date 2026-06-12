class Cliente {

    constructor(datos) {
        this.edad = Number(datos.edad);
        this.sexo = datos.sexo;
        this.estado = datos.estado;
        this.vehiculo = datos.vehiculo;
        this.valor = Number(datos.valor);
        this.accidentes = Number(datos.accidentes);
    }

}

class Poliza {

    constructor(cliente) {
        this.cliente = cliente;
    }

    calcularPrima() {

        let prima = 5000;

        // valor vehículo
        prima += this.cliente.valor * 0.02;

        // edad
        if(this.cliente.edad < 25){
            prima *= 1.25;
        }

        if(this.cliente.edad > 60){
            prima *= 1.15;
        }

        // accidentes
        prima += this.cliente.accidentes * 1200;

        // vehículo

        const factorVehiculo = {
            sedan:1,
            suv:1.15,
            pickup:1.20,
            deportivo:1.45
        };

        prima *= factorVehiculo[this.cliente.vehiculo];

        // estado

        const factorEstado = {
            CDMX:1.15,
            JAL:1.10,
            NL:1.12,
            PUE:1
        };

        prima *= factorEstado[this.cliente.estado];

        return Math.round(prima);
    }

}

class Cotizador {

    constructor(cliente) {
        this.cliente = cliente;
        this.poliza = new Poliza(cliente);
    }

    generarOpciones() {

        const base = this.poliza.calcularPrima();

        return [
            {
                plan:"Básico",
                precio:base,
                coberturas:[
                    "Responsabilidad Civil",
                    "Daños a terceros",
                    "Asistencia vial"
                ]
            },
            {
                plan:"Plus",
                precio:Math.round(base * 1.35),
                coberturas:[
                    "Todo Básico",
                    "Robo total",
                    "Cristales",
                    "Auto sustituto"
                ]
            },
            {
                plan:"Premium",
                precio:Math.round(base * 1.90),
                coberturas:[
                    "Todo Plus",
                    "Daños materiales",
                    "Gastos médicos",
                    "Defensa legal"
                ]
            }
        ];
    }

    recomendar() {

        if(this.cliente.accidentes >= 2){
            return "Premium";
        }

        if(this.cliente.valor >= 500000){
            return "Premium";
        }

        if(this.cliente.edad < 25){
            return "Plus";
        }

        return "Básico";
    }

}

const formulario = document.getElementById("formCotizador");
const resultado = document.getElementById("resultado");
const recomendacion = document.getElementById("recomendacion");

let chart;

formulario.addEventListener("submit", (e)=>{

    e.preventDefault();

    const datos = {
        edad: document.getElementById("edad").value,
        sexo: document.getElementById("sexo").value,
        estado: document.getElementById("estado").value,
        vehiculo: document.getElementById("vehiculo").value,
        valor: document.getElementById("valor").value,
        accidentes: document.getElementById("accidentes").value
    };

    if(Object.values(datos).some(v => v === "")){
        alert("Completa todos los campos");
        return;
    }

    const cliente = new Cliente(datos);

    const cotizador = new Cotizador(cliente);

    const planes = cotizador.generarOpciones();

    const recomendado = cotizador.recomendar();

    renderizarPlanes(planes,recomendado);

    guardarHistorial(datos);

    renderizarGrafica(planes);

});

function renderizarPlanes(planes,recomendado){

    resultado.innerHTML = "";

    recomendacion.style.display = "block";
    recomendacion.innerHTML =
        `⭐ Recomendación automática: Plan ${recomendado}`;

    planes.forEach(plan=>{

        const card = document.createElement("div");

        card.classList.add("card");

        if(plan.plan === recomendado){
            card.classList.add("recomendada");
        }

        card.innerHTML = `
            <h3>Plan ${plan.plan}</h3>

            <div class="precio">
                $${plan.precio.toLocaleString()}
            </div>

            <h4>Coberturas</h4>

            <ul>
                ${plan.coberturas
                    .map(c=>`<li>${c}</li>`)
                    .join("")}
            </ul>
        `;

        resultado.appendChild(card);

    });

}

function guardarHistorial(datos){

    const historial =
        JSON.parse(localStorage.getItem("cotizaciones")) || [];

    historial.push({
        fecha:new Date(),
        ...datos
    });

    localStorage.setItem(
        "cotizaciones",
        JSON.stringify(historial)
    );
}

function renderizarGrafica(planes){

    const ctx = document
        .getElementById("grafica")
        .getContext("2d");

    if(chart){
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type:'bar',
        data:{
            labels:planes.map(p=>p.plan),
            datasets:[{
                label:'Costo anual',
                data:planes.map(p=>p.precio)
            }]
        },
        options:{
            responsive:true
        }
    });

}
