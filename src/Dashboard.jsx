import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { XYPlot, VerticalGridLines, HorizontalGridLines, XAxis, YAxis, VerticalBarSeries } from "react-vis";

const App = () => {
    const [data, setData] = useState({});
    const [text, setText] = useState("Getting data");
    const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

    const get_data = async () => {
        try {
            const res = await fetch(`https://api.atlc.dev/v1/bills`);
            const bills = await res.json();

            const separated = {};

            bills.forEach(bill => {
                const slimmed = { id: bill.id, amount: bill.amount, date: bill.payment_date };

                if (separated[`${bill.utility_name}`]) {
                    separated[`${bill.utility_name}`].push(slimmed);
                } else {
                    separated[`${bill.utility_name}`] = [slimmed];
                }
            });

            setData(separated);
            setText("Bill Tracker :)");
        } catch (error) {
            console.log({ error });
            setText("You fucked something up");
            alert(error.message);
        }
    };

    useEffect(() => {
        document.body.classList.add("bg-secondary");
        window.addEventListener("resize", () => setDimensions({ width: window.innerWidth, height: window.innerHeight }));

        get_data();

        return () => window.addEventListener("resize", () => setDimensions({ width: window.innerWidth, height: window.innerHeight }));
    }, []);

    const d_format = date => {
        const d = new Date(date);
        const yyyy = d.getFullYear();
        const mm = d.getMonth() + 1 < 10 ? "0" + Number(d.getMonth() + 1) : Number(d.getMonth() + 1);
        const dd = d.getDate() + 1;
        return `${yyyy}-${mm}-${dd}`;
    };

    return (
        <div className="container">
            <div className="text-center row mt-5 display-1">{text}</div>
            {Object.keys(data).map(util_type => (
                <div id={util_type} key={`${util_type}-chart`} className="card bg-light my-4">
                    <h6 className="text-center display-6 m-2 shadow">{util_type.replaceAll("_", " ")}</h6>
                    <XYPlot
                        className="px-2 my-2 mx-auto shadow-lg rounded-3"
                        width={dimensions.width * 0.7 || 400}
                        height={dimensions.height * 0.5 || 400}>
                        <VerticalGridLines />
                        <HorizontalGridLines />
                        <XAxis />
                        <YAxis />
                        <VerticalBarSeries
                            color="indigo"
                            data={data[util_type].map(bill => ({ x: new Date(bill.date).getTime(), y: bill.amount }))}
                        />
                    </XYPlot>
                    <div className="my-4">
                        <ul className="mx-5 shadow-lg rounded-3 list-group text-center">
                            <li className="list-group-item">
                                <p className="text-success fw-bold">
                                    Bill Amount <span className="mx-5">Payment Date</span>
                                </p>
                            </li>
                            {data[util_type].map(bill => (
                                <li key={`${util_type}-bill-${bill.id}`} className="list-group-item">
                                    <p className="text-success  py-n5">
                                        ${bill.amount} <span className="mx-5">{d_format(bill.date)}</span>
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default App;
