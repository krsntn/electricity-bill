import Head from "next/head";
import React, { useState, useEffect, useCallback } from "react";
import { Decimal } from "decimal.js";

const rates = [21.8, 33.4, 51.6, 54.6, 57.1];
const stages = [200, 100, 300, 300];

function calcBill(kwh) {
  const results = [];

  for (
    let index = 0, remainingKWH = new Decimal(kwh);
    index < rates.length;
    index++
  ) {
    let remainKWH = remainingKWH;
    if (stages[index]) {
      remainKWH = remainingKWH.minus(stages[index]);
    } else {
      remainKWH = new Decimal(0);
    }

    if (remainKWH.greaterThan(0)) {
      results.push(
        new Decimal(stages[index]).times(rates[index]).dividedBy(100)
      );
      remainingKWH = remainKWH;
    } else {
      results.push(remainingKWH.times(rates[index]).dividedBy(100));
      remainingKWH = new Decimal(0);
    }
  }

  return results;
}

export default function Home() {
  const [mode, setMode] = useState("basic");
  const [inputKWH, setInputKWH] = useState("");
  const [inputW, setInputW] = useState("");
  const [inputHours, setInputHours] = useState("12");
  const [inputDays, setInputDays] = useState("30");
  const [bill, setBill] = useState(null);

  const calc = useCallback(
    (e) => {
      e.preventDefault();

      if (mode === "basic") {
        setBill(calcBill(inputKWH));
      } else if (mode === "advance") {
        const input = new Decimal(inputW);
        setBill(
          calcBill(input.dividedBy(1000).times(inputHours).times(inputDays))
        );
      }

      setTimeout(() => {
        document.getElementById("estimatedBill").scrollIntoView();
      }, 50);
    },
    [mode, inputKWH, inputW, inputHours, inputDays]
  );

  useEffect(() => {
    if (mode === "basic") {
      setInputW("");
      setInputHours(12);
      setInputDays(30);
    } else if (mode === "advance") {
      setInputKWH("");
    }
    setBill(null);
  }, [mode]);

  return (
    <div>
      <Head>
        <title>Electricity Bill Calculator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="text-white min-h-full">
        <div className="bg-green-500  divide-y-2 divide-solid">
          <section className="mx-auto py-16 text-3xl w-10/12 max-w-4xl">
            <h1 className="font-semibold text-4xl md:text-6xl pb-2 mb-4">
              FORECAST YOUR ELECTRICITY BILL
            </h1>

            <p className="mb-4 py-2 px-4 text-base bg-red-400 rounded-xl">
              Disclaimer: This calculation is mainly for Residential Customer's
              reference. Please note that this only serves as a general estimate
              and consumers should not rely on this as a final figure.
            </p>

            <div className="flex flex-col items-stretch gap-2 md:flex-row justify-between md:items-center mb-4">
              <button
                type="button"
                className={`flex-1 ${
                  mode === "basic" ? "bg-green-700" : "bg-green-600"
                } py-4 font-bold hover:bg-green-700 focus:bg-green-700`}
                onClick={() => setMode("basic")}
              >
                Basic
              </button>
              <button
                type="button"
                className={`flex-1 ${
                  mode === "advance" ? "bg-green-700" : "bg-green-600"
                } py-4 font-bold hover:bg-green-700 focus:bg-green-700`}
                onClick={() => setMode("advance")}
              >
                Advance
              </button>
            </div>

            <form className="grid grid-cols-3" onSubmit={calc}>
              {mode === "basic" && (
                <div className="col-span-full bg-white text-black py-6 px-8 flex flex-col items-start md:flex-row justify-between md:items-center mb-4">
                  <div className="pb-4 md:pb-0">Total Consumption (kWh)</div>
                  <input
                    type="number"
                    step={0.0001}
                    className="rounded-lg border border-gray-700 p-2 focus:outline-none focus:ring-2 focus:border-blue-500 w-full md:w-auto"
                    value={inputKWH}
                    onChange={(e) => setInputKWH(e.target.value)}
                  />
                </div>
              )}

              {mode === "advance" && (
                <React.Fragment>
                  <div className="col-span-full bg-white text-black py-6 px-8 flex flex-col items-start md:flex-row justify-between md:items-center mb-4">
                    <div className="pb-4 md:pb-0">Power Comsumption (W)</div>
                    <input
                      type="number"
                      step={0.0001}
                      className="rounded-lg border border-gray-700 p-2 focus:outline-none focus:ring-2 focus:border-blue-500 w-full md:w-auto"
                      value={inputW}
                      onChange={(e) => setInputW(e.target.value)}
                    />
                  </div>
                  <div className="col-span-full bg-white text-black py-6 px-8 flex flex-col items-start md:flex-row justify-between md:items-center mb-4">
                    <div className="pb-4 md:pb-0">Total Hours Per Day</div>
                    <input
                      type="number"
                      max="24"
                      className="rounded-lg border border-gray-700 p-2 focus:outline-none focus:ring-2 focus:border-blue-500 w-full md:w-auto"
                      value={inputHours}
                      onChange={(e) => setInputHours(e.target.value)}
                    />
                  </div>
                  <div className="col-span-full bg-white text-black py-6 px-8 flex flex-col items-start md:flex-row justify-between md:items-center mb-4">
                    <div className="pb-4 md:pb-0">Total Days Per Month</div>
                    <input
                      type="number"
                      max="31"
                      className="rounded-lg border border-gray-700 p-2 focus:outline-none focus:ring-2 focus:border-blue-500 w-full md:w-auto"
                      value={inputDays}
                      onChange={(e) => setInputDays(e.target.value)}
                    />
                  </div>
                </React.Fragment>
              )}

              <button
                type="submit"
                className="col-span-full md:col-span-1 md:col-start-3 bg-yellow-500 py-4 font-bold hover:bg-yellow-600 focus:bg-yellow-600"
              >
                Calculate
              </button>
            </form>
          </section>

          {bill !== null && (
            <section className="mx-auto grid grid-cols-3 py-16 text-3xl w-10/12 max-w-4xl">
              <h1
                id="estimatedBill"
                className="col-span-full font-semibold text-2xl pb-4"
              >
                YOUR ESTIMATED BILL
              </h1>

              <div className="col-span-full text-2xl flex flex-col items-stretch justify-between gap-2 md:flex-row md:items-stretch mb-2">
                <div className="flex-1 bg-white text-black p-8">
                  <div className="mb-4">Bill</div>

                  <div className="font-bold">
                    <em className="text-base align-top mr-2">RM</em>
                    {bill.reduce((amt, cur) => amt.add(cur)).toFixed(2)}
                  </div>
                </div>

                <div className="flex-1 bg-white text-black p-8">
                  <div className="mb-4">Service Tax</div>
                  <div className="font-bold">
                    <em className="text-base align-top mr-2">RM</em>
                    {bill
                      .reduce((amt, cur, index) => {
                        if (index >= 3) {
                          return amt.add(cur.times(0.06));
                        }
                        return new Decimal(0);
                      })
                      .toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="col-span-full bg-red-500 text-white py-6 px-8 mb-4 flex flex-col items-start md:flex-row justify-between md:items-center">
                <div className="text-2xl mb-4 md:mb-0">
                  Total bill inclusive of Service Tax is
                </div>
                <div className="text-3xl font-bold self-end md:self-auto">
                  <em className="text-base align-top mr-2">RM</em>
                  {bill
                    .reduce((amt, cur, index) => {
                      if (index >= 3) {
                        cur = cur.times(1.06);
                      }
                      return amt.add(cur);
                    })
                    .toFixed(2)}
                </div>
              </div>
            </section>
          )}

          {bill !== null && (
            <section className="mx-auto grid grid-cols-3 py-16 text-3xl w-10/12 max-w-4xl">
              <h1
                id="estimatedBill"
                className="col-span-full font-semibold text-2xl pb-4"
              >
                CALCULATION DETAILS
              </h1>

              <div className="col-span-full text-2xl flex flex-col items-stretch justify-between gap-2 md:flex-row md:items-stretch mb-4">
                <table className="table-auto w-full bg-green-800 text-center border-collapse">
                  <thead>
                    <tr className="text-lg">
                      <th className="p-2">Total kWh</th>
                      <th className="p-2">
                        Cost +{" "}
                        <span className="text-purple-400">Service Tax</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-green-600 p-2">1 - 200</td>
                      <td className="border border-green-600 p-2 font-bold">
                        <em className="text-base align-top mr-2">RM</em>
                        {bill[0].toFixed(2)}
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-green-600 p-2">201 - 300</td>
                      <td className="border border-green-600 p-2 font-bold">
                        <em className="text-base align-top mr-2">RM</em>
                        {bill[1].toFixed(2)}
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-green-600 p-2">301 - 600</td>
                      <td className="border border-green-600 p-2 font-bold">
                        <em className="text-base align-top mr-2">RM</em>
                        {bill[2].toFixed(2)}
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-green-600 p-2">601 - 900</td>
                      <td className="border border-green-600 p-2 font-bold">
                        <em className="text-base align-top mr-2">RM</em>
                        {bill[3].toFixed(2)}{" "}
                        {bill[3] > 0 ? (
                          <React.Fragment>
                            +{" "}
                            <span className="text-purple-400">
                              <em className="text-base align-top mr-2">RM</em>
                              {(bill[3] * 0.06).toFixed(2)}
                            </span>
                          </React.Fragment>
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>

                    <tr>
                      <td className="border border-green-600 p-2">> 900</td>
                      <td className="border border-green-600 p-2 font-bold">
                        <em className="text-base align-top mr-2">RM</em>
                        {bill[4].toFixed(2)}{" "}
                        {bill[4] > 0 ? (
                          <React.Fragment>
                            +{" "}
                            <span className="text-purple-400">
                              <em className="text-base align-top mr-2">RM</em>
                              {(bill[4] * 0.06).toFixed(2)}
                            </span>
                          </React.Fragment>
                        ) : (
                          ""
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="w-full h-16 border-t-2 border-fuchsia-500 flex justify-center items-center">
        <div>
          Crafted by{" "}
          <a
            className="text-blue-500"
            href="https://dev.krsn.xyz"
            target="_blank"
            rel="noopener noreferrer"
          >
            karson
          </a>
        </div>
      </footer>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto,
            Oxygen, Ubuntu, Cantarell, Fira Sans, Droid Sans, Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
