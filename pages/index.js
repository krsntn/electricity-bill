import Head from "next/head";
import React, { useState, useEffect, useCallback } from "react";
import { Decimal } from "decimal.js";

const rates = [21.8, 33.4, 51.6, 54.6, 57.1];
const stages = [200, 100, 300, 300];
const MODE = {
  kWh: "kWh",
  W: "W",
};

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
        new Decimal(stages[index]).times(rates[index]).dividedBy(100),
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
  const [mode, setMode] = useState(MODE.kWh);
  const [inputKWH, setInputKWH] = useState("");
  const [inputW, setInputW] = useState("");
  const [inputHours, setInputHours] = useState("12");
  const [inputDays, setInputDays] = useState("30");
  const [bill, setBill] = useState(null);

  const calc = useCallback(
    (e) => {
      e.preventDefault();

      if (mode === MODE.kWh) {
        setBill(calcBill(inputKWH));
      } else if (mode === MODE.W) {
        const input = new Decimal(inputW);
        setBill(
          calcBill(input.dividedBy(1000).times(inputHours).times(inputDays)),
        );
      }

      setTimeout(() => {
        document.getElementById("estimatedBill").scrollIntoView();
      }, 50);
    },
    [mode, inputKWH, inputW, inputHours, inputDays],
  );

  useEffect(() => {
    if (mode === MODE.kWh) {
      setInputW("");
      setInputHours(12);
      setInputDays(30);
    } else if (mode === MODE.W) {
      setInputKWH("");
    }
    setBill(null);
  }, [mode]);

  return (
    <div className="bg-green-500 min-h-screen text-white">
      <Head>
        <title>Electricity Bill Calculator</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex flex-col items-center justify-between xl:flex-row m-auto max-w-screen-xl">
        <section className="mx-auto py-6 w-9/12 xl:w-7/12 xl:mx-0 xl:px-6">
          <h1 className="font-semibold text-xl py-6">
            FORECAST YOUR ELECTRICITY BILL
          </h1>

          <p className="mb-4 py-2 px-4 bg-red-400 rounded-xl">
            Disclaimer: This calculation is mainly for Residential Customer's
            reference. Please note that this only serves as a general estimate
            and consumers should not rely on this as a final figure.
          </p>

          <div className="flex flex-col items-stretch md:flex-row justify-between md:items-center">
            <button
              type="button"
              className={`md:rounded-tl-lg flex-1 ${
                mode === MODE.kWh ? "bg-green-700" : "bg-green-600"
              } py-4 font-semibold hover:bg-green-700 focus:bg-green-700`}
              onClick={() => setMode(MODE.kWh)}
            >
              kilowatt-hours (kWh)
            </button>
            <button
              type="button"
              className={`md:rounded-tr-lg flex-1 ${
                mode === MODE.W ? "bg-green-700" : "bg-green-600"
              } py-4 font-semibold hover:bg-green-700 focus:bg-green-700`}
              onClick={() => setMode(MODE.W)}
            >
              watts (W)
            </button>
          </div>

          <form className="pt-4 md:pt-0 grid grid-cols-3" onSubmit={calc}>
            {mode === MODE.kWh && (
              <div className="col-span-full bg-green-700 py-4 px-8 flex flex-col items-start md:flex-row justify-between md:items-center mb-4">
                <div className="pb-4 md:pb-0">Total Consumption (kWh)</div>
                <input
                  type="number"
                  step={0.0001}
                  className="bg-green-800 p-2 focus:outline-none focus:ring-2 focus:border-blue-500 w-full md:w-auto"
                  value={inputKWH}
                  onChange={(e) => setInputKWH(e.target.value)}
                />
              </div>
            )}

            {mode === MODE.W && (
              <React.Fragment>
                <div className="col-span-full bg-green-700 py-4 px-8 flex flex-col items-start md:flex-row justify-between md:items-center">
                  <div className="pb-4 md:pb-0">Power Comsumption (W)</div>
                  <input
                    type="number"
                    step={0.0001}
                    className="bg-green-800 p-2 focus:outline-none focus:ring-2 focus:border-blue-500 w-full md:w-auto"
                    value={inputW}
                    onChange={(e) => setInputW(e.target.value)}
                  />
                </div>
                <div className="col-span-full bg-green-700 py-4 px-8 flex flex-col items-start md:flex-row justify-between md:items-center">
                  <div className="pb-4 md:pb-0">Total Hours Per Day</div>
                  <input
                    type="number"
                    max="24"
                    className="bg-green-800 p-2 focus:outline-none focus:ring-2 focus:border-blue-500 w-full md:w-auto"
                    value={inputHours}
                    onChange={(e) => setInputHours(e.target.value)}
                  />
                </div>
                <div className="col-span-full bg-green-700 py-4 px-8 flex flex-col items-start md:flex-row justify-between md:items-center mb-4">
                  <div className="pb-4 md:pb-0">Total Days Per Month</div>
                  <input
                    type="number"
                    max="31"
                    className="bg-green-800 p-2 focus:outline-none focus:ring-2 focus:border-blue-500 w-full md:w-auto"
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

        <div className="mx-auto py-6 w-9/12 xl:mr-0 xl:w-5/12 xl:px-6">
          <section className="mx-auto xl:mr-0 grid grid-cols-3">
            <h1
              id="estimatedBill"
              className="col-span-full font-semibold text-xl pb-4 text-center"
            >
              Estimated Bill
            </h1>

            <div className="col-span-full bg-blue-100 text-black py-6 px-8 mb-4 flex flex-col items-start md:flex-row justify-between md:items-center">
              <div className="text-lg mb-4 md:mb-0 font-semibold">
                Total kWh
              </div>
              <div className="self-end md:self-auto">
                {mode === MODE.kWh && inputKWH
                  ? inputKWH
                  : mode === MODE.W && inputW
                    ? new Decimal(inputW)
                        .dividedBy(1000)
                        .times(inputHours)
                        .times(inputDays)
                        .toString()
                    : "0"}
              </div>
            </div>

            <div className="text-black col-span-full flex flex-col items-stretch justify-between gap-2 md:flex-row md:items-stretch mb-2">
              <table className="table-auto w-full bg-blue-200 text-center border-collapse">
                <thead>
                  <tr className="text-md">
                    <th className="border-b border-green-600 py-4">kWh</th>
                    <th className="border-b border-green-600 py-4">Rate</th>
                    <th className="border-b border-green-600 py-4">
                      Cost + <span className="text-blue-400">Service Tax</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="bg-blue-100 p-2">1 - 200</td>
                    <td className="bg-blue-100 p-2">
                      {new Decimal(rates[0]).dividedBy(100).toString()}
                    </td>
                    <td className="bg-blue-100 p-2">
                      <em className="text-base align-top mr-2">RM</em>
                      {bill ? bill[0].toFixed(2) : "0.00"}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2">201 - 300</td>
                    <td className="p-2">
                      {new Decimal(rates[1]).dividedBy(100).toString()}
                    </td>
                    <td className="p-2">
                      <em className="text-base align-top mr-2">RM</em>
                      {bill ? bill[1].toFixed(2) : "0.00"}
                    </td>
                  </tr>

                  <tr>
                    <td className="bg-blue-100 p-2">301 - 600</td>
                    <td className="bg-blue-100 p-2">
                      {new Decimal(rates[2]).dividedBy(100).toString()}
                    </td>
                    <td className="bg-blue-100 p-2">
                      <em className="text-base align-top mr-2">RM</em>
                      {bill ? bill[2].toFixed(2) : "0.00"}
                    </td>
                  </tr>

                  <tr>
                    <td className="p-2">601 - 900</td>
                    <td className="p-2">
                      {new Decimal(rates[3]).dividedBy(100).toString()}
                    </td>
                    <td className="p-2">
                      <em className="text-base align-top mr-2">RM</em>
                      {bill ? bill[3].toFixed(2) : "0.00"}
                      {bill && bill[3] > 0 ? (
                        <React.Fragment>
                          {" "}
                          +{" "}
                          <span className="text-blue-400">
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
                    <td className="bg-blue-100 p-2">{">"} 900</td>
                    <td className="bg-blue-100 p-2">
                      {new Decimal(rates[4]).dividedBy(100).toString()}
                    </td>
                    <td className="bg-blue-100 p-2">
                      <em className="text-base align-top mr-2">RM</em>
                      {bill ? bill[4].toFixed(2) : "0.00"}
                      {bill && bill[4] > 0 ? (
                        <React.Fragment>
                          {" "}
                          +{" "}
                          <span className="text-blue-400">
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

            <div className="col-span-full flex flex-col items-stretch justify-between gap-2 md:flex-row md:items-stretch mb-2">
              <div className="flex-1 bg-blue-200 text-black p-8 text-right">
                <div className="mb-4 text-lg font-semibold text-left">Bill</div>

                <div>
                  <em className="text-base align-top mr-2">RM</em>
                  {bill
                    ? bill.reduce((amt, cur) => amt.add(cur)).toFixed(2)
                    : "0.00"}
                </div>
              </div>

              <div className="flex-1 bg-blue-200 text-black p-8 text-right">
                <div className="mb-4 text-lg font-semibold text-left">
                  Service Tax
                </div>
                <div>
                  <em className="text-base align-top mr-2">RM</em>
                  {bill
                    ? bill
                        .reduce((amt, cur, index) => {
                          if (index >= 3) {
                            return amt.add(cur.times(0.06));
                          }
                          return new Decimal(0);
                        })
                        .toFixed(2)
                    : "0.00"}
                </div>
              </div>
            </div>

            <div className="col-span-full bg-blue-100 text-black py-6 px-8 mb-4 flex flex-col items-start md:flex-row justify-between md:items-center">
              <div className="text-lg mb-4 md:mb-0 font-semibold">
                Total Bill
              </div>
              <div className="self-end md:self-auto">
                <em className="text-base align-top mr-2">RM</em>
                {bill
                  ? bill
                      .reduce((amt, cur, index) => {
                        if (index >= 3) {
                          cur = cur.times(1.06);
                        }
                        return amt.add(cur);
                      })
                      .toFixed(2)
                  : "0.00"}
              </div>
            </div>

            <div className="col-span-full text-right text-xs text-gray-700">
              Crafted by{" "}
              <a
                className="text-blue-800"
                href="https://krsn.xyz"
                target="_blank"
                rel="noopener noreferrer"
              >
                karson
              </a>
            </div>
          </section>
        </div>
      </main>

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }

        * {
          box-sizing: border-box;
        }
      `}</style>
    </div>
  );
}
