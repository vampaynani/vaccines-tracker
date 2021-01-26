import React, { useState } from "react";
import Numeral from "numeral";
import moment from "moment";
import "./styles.css";

moment.locale("es-mx", {
  months: "Enero Febrero Marzo Abril Mayo Junio Julio Agosto Septiembre Octubre Noviembre Diciembre".split(
    " "
  ),
});

function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = strDelimiter || ",";

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    // Delimiters.
    "(\\" +
      strDelimiter +
      "|\\r?\\n|\\r|^)" +
      // Quoted fields.
      '(?:"([^"]*(?:""[^"]*)*)"|' +
      // Standard fields.
      '([^"\\' +
      strDelimiter +
      "\\r\\n]*))",
    "gi"
  );

  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;

  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while ((arrMatches = objPattern.exec(strData))) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
    } else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }

    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return arrData;
}

async function getData() {
  const res = await fetch(
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/vaccinations.csv"
  );
  const data = await res.text();
  const csvArr = CSVToArray(data);
  const mexicoRows = csvArr
    .filter((item) => item[0] === "Mexico")
    .map((item) => {
      const parsedItem = {};
      csvArr[0].forEach((field, index) => {
        parsedItem[field] = item[index];
      });
      return parsedItem;
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));
  return mexicoRows;
}

async function getSource() {
  const res = await fetch(
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/vaccinations/locations.csv"
  );
  const data = await res.text();
  const csvArr = CSVToArray(data);
  return csvArr.find((row) => row[0] === "Mexico");
}

function getCalculations(population, doses, daily) {
  const progress = doses / population;
  const daysLeft = Math.trunc((population - doses) / daily);
  const futureDate = moment().add(daysLeft, "days");
  const duration = moment.duration(futureDate.diff(moment()));
  const timeLeft = `${duration.years()} años, ${duration.months()} meses y ${duration.days()} días`;
  return {
    progress,
    daysLeft,
    timeLeft,
  };
}

export default function App() {
  const [doses, setDoses] = useState(0);
  const [start, setStart] = useState(moment("20201224"));
  const [latest, setLatest] = useState(moment());
  const [dailyAmount, setDaily] = useState(0);
  const [source, setSource] = useState(null);

  const population = 94006461;
  const diff = Math.trunc(moment.duration(latest.diff(start)).as("days"));
  const { progress, daysLeft, timeLeft } = getCalculations(
    population,
    doses,
    dailyAmount
  );
  const {
    progress: progress70,
    daysLeft: daysLeft70,
    timeLeft: timeLeft70,
  } = getCalculations(population * 0.7, doses, dailyAmount);
  const DATE_FORMAT = "LLL";
  if (doses === 0) {
    getData().then((data) => {
      setDoses(data[0].people_vaccinated);
      setStart(moment(data[data.length - 1].date)); //.format();
      setLatest(moment(data[0].date)); //.format("dddd, MMMM Do YYYY, h:mm:ss a");
      setDaily(data[0].daily_vaccinations);
    });
  }

  if (!source) {
    getSource().then((data) => {
      setSource(data);
    });
  }

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
              <span>{latest.format(DATE_FORMAT)}</span>
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
          <p>
            Porcentaje de población vacunada con al menos una dosis -{" "}
            {Numeral(progress).format("0.000%")}
          </p>
          <progress
            className="progress is-primary"
            value={doses}
            max={population}
          >
            {Numeral(progress).format("0.000%")}
          </progress>
          <table className="table is-bordered is-striped">
            <tbody>
              <tr>
                <td>
                  Días adicionales requeridos para cubrir la población total
                </td>
                <td>{daysLeft}</td>
              </tr>
              <tr>
                <td>
                  Tiempo adicional requerido para cubrir la población total
                </td>
                <td>{timeLeft}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="block is-flex is-flex-direction-column">
          <h2 className="subtitle">
            Considerando que la inmunidad de rebaño se alcanzaría con un 70%
          </h2>
          <p>
            Porcentaje de población vacunada con al menos una dosis -{" "}
            {Numeral(progress70).format("0.000%")}
          </p>
          <progress
            className="progress is-primary"
            value={doses}
            max={Math.trunc(population * 0.7)}
          >
            {Numeral(progress70).format("0.000%")}
          </progress>
          <table className="table is-bordered is-striped">
            <tbody>
              <tr>
                <td>
                  Días adicionales requeridos para cubrir la inmunidad de rebaño
                </td>
                <td>{daysLeft70}</td>
              </tr>
              <tr>
                <td>
                  Tiempo adicional requerido para cubrir la imunidad de rebaño
                </td>
                <td>{timeLeft70}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
      <footer className="footer">
        <div className="content has-text-centered">
          <p>
            <strong>COVID-19 Vaccine Expectations</strong> by{" "}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://github.com/vampaynani/vaccines-tracker"
            >
              vampaynani
            </a>
            . The source code is licensed{" "}
            <a href="http://opensource.org/licenses/mit-license.php">MIT</a>.
          </p>
          <p>
            (1) INEGI (2020), Población de 15 años y más.{" "}
            <a
              target="_blank"
              rel="noreferrer noopener"
              href="https://www.inegi.org.mx/temas/estructura/"
            >
              https://www.inegi.org.mx/temas/estructura/
            </a>
          </p>
          {source && (
            <p>
              (2) Secretaría de Salud México (2020).{" "}
              <a target="_blank" rel="noreferrer noopener" href={source[5]}>
                {source[5]}
              </a>
            </p>
          )}
        </div>
      </footer>
    </div>
  );
}
