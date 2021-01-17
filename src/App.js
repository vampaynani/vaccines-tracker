import React from "react";
import Numeral from "numeral";
import moment from "moment";
import "./styles.css";

moment.locale("es-mx", {
  months: "Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(
    " "
  )
});

function getCalculations(population, doses, daily) {
  const progress = doses / population;
  const daysLeft = Math.trunc((population - doses) / daily);
  const monthsLeft = Math.trunc(daysLeft / 30);
  const yearsLeft = Math.trunc(monthsLeft / 12);
  return {
    progress,
    daysLeft,
    monthsLeft,
    yearsLeft
  };
}

export default function App() {
  const population = 85382288;
  const doses = 461025;
  const start = moment("20201225"); //.format();
  const last = moment("2021-01-16"); //.format("dddd, MMMM Do YYYY, h:mm:ss a");
  const diff = Math.trunc(moment.duration(last.diff(start)).as("days"));
  const dailyAmount = Math.trunc(doses / diff);
  const { progress, daysLeft, monthsLeft, yearsLeft } = getCalculations(
    population,
    doses,
    dailyAmount
  );
  const {
    progress: progress70,
    daysLeft: daysLeft70,
    monthsLeft: monthsLeft70,
    yearsLeft: yearsLeft70
  } = getCalculations(population * 0.7, doses, dailyAmount);
  const DATE_FORMAT = "LLL";

  return (
    <div className="App">
      <section className="section">
        <h1 className="title">Progreso vacunación COVID-19 México</h1>
        <div className="block">
          <h2 className="subtitle">
            Poblacion de 18 años o más {Numeral(population).format("0,0")}
            <sup>(1)</sup>
          </h2>
          <h2 className="subtitle">
            Total de dosis aplicadas {Numeral(doses).format("0,0")}
            <sup>(2)</sup>
          </h2>
        </div>
        <div className="block">
          <div className="columns">
            <p className="column box is-flex is-flex-direction-column">
              <span>Inicio vacunacion</span>
              <span>{start.format(DATE_FORMAT)}</span>
            </p>
            <p className="column box is-flex is-flex-direction-column">
              <span>Ultima fecha de actualización</span>
              <span>{last.format(DATE_FORMAT)}</span>
            </p>
            <p className="column box is-flex is-flex-direction-column">
              <span>Días transcurridos</span>
              <span>{diff}</span>
            </p>
            <p
              style={{ marginBottom: "1.5rem" }}
              className="column box is-flex is-flex-direction-column"
            >
              <span>Promedio diario</span>
              <span>{dailyAmount}</span>
            </p>
          </div>
        </div>
        <div className="block is-flex is-flex-direction-column">
          <p>Porcentaje de población vacunada con al menos una dosis</p>
          <progress class="progress is-primary" value={doses} max={population}>
            {Numeral(progress).format("0.000%")}
          </progress>
          <table class="table is-bordered is-striped">
            <tbody>
              <tr>
                <td>Días para cubrir la población total</td>
                <td>{daysLeft}</td>
              </tr>
              <tr>
                <td>Meses para cubrir la población total</td>
                <td>{monthsLeft}</td>
              </tr>
              <tr>
                <td>Años para cubrir la población total</td>
                <td>{yearsLeft}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="block is-flex is-flex-direction-column">
          <h2 className="subtitle">
            Considerando que la inmunidad de rebaño se alcanzaría con un 70%
          </h2>
          <p>Porcentaje de población vacunada con al menos una dosis</p>
          <progress
            class="progress is-primary"
            value={doses}
            max={Math.trunc(population * 0.7)}
          >
            {Numeral(progress70).format("0.000%")}
          </progress>
          <table class="table is-bordered is-striped">
            <tbody>
              <tr>
                <td>Días para cubrir la población total</td>
                <td>{daysLeft70}</td>
              </tr>
              <tr>
                <td>Meses para cubrir la población total</td>
                <td>{monthsLeft70}</td>
              </tr>
              <tr>
                <td>Años para cubrir la población total</td>
                <td>{yearsLeft70}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <footer class="footer">
        <div class="content has-text-centered">
          <p>
            <strong>COVID-19 Vaccine Expectations</strong> by{" "}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://github.com/vampaynani"
            >
              Vampaynani
            </a>
            . The source code is licensed{" "}
            <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
          </p>
          <p>
            (1) INEGI (2018), Población de 18 años y más.{" "}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://www.inegi.org.mx/app/indicadores/?t=123&ag=00#tabMCcollapse-Indicadores"
            >
              https://www.inegi.org.mx/app/indicadores/?t=123&ag=00#tabMCcollapse-Indicadores
            </a>
          </p>
          <!--p>
            (2) Secretaría de Salud México (2020), Número de personas que han
            recibido por lo menos una dosis de la vacuna.{" "}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://www.gob.mx/salud/prensa/018-inicia-aplicacion-de-segunda-dosis-de-vacuna-contra-covid-19-para-personal-de-salud?idiom=es"
            >
              https://www.gob.mx/salud/prensa/018-inicia-aplicacion-de-segunda-dosis-de-vacuna-contra-covid-19-para-personal-de-salud?idiom=es
            </a>
          </p-->
        </div>
      </footer>
    </div>
  );
}
