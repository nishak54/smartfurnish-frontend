import React, { useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [screen, setScreen] = useState("input");
  const [budget, setBudget] = useState(2000);
  const [room] = useState("Living Room");
  const [style, setStyle] = useState("Modern");
  const [design, setDesign] = useState(null);

  const generateDesign = async () => {
    setScreen("loading");

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          budget,
          room,
          style,
        }),
      });

      const data = await res.json();
      setDesign(data);
      setScreen("design");
    } catch (err) {
      console.error(err);
      setScreen("input");
    }
  };

  const regenerateDesign = async () => {
    try {
      const res = await fetch(`${API_URL}/regenerate`);
      const data = await res.json();
      setDesign(data);
    } catch (err) {
      console.error(err);
    }
  };

  const totalCost =
    design?.items?.reduce((sum, item) => sum + item.price, 0) || 0;

  return (
    <div className="app">
      {screen === "input" && (
        <div className="card">
          <h2>SmartFurnish</h2>
          <p>Design your living space within budget</p>

          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value))}
            placeholder="Enter Budget"
          />

          <div className="styles">
            {["Modern", "Boho", "Minimal"].map((s) => (
              <button
                key={s}
                className={style === s ? "active" : ""}
                onClick={() => setStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>

          <button onClick={generateDesign} className="primary-btn">
            Generate Design
          </button>
        </div>
      )}

      {screen === "loading" && (
        <div className="loading">
          <h2>Designing your space...</h2>
          <p>Optimizing layout and selecting furniture</p>
        </div>
      )}

      {screen === "design" && design && (
        <div className="design-container">
          <div className="top-bar">
            <h3>
              Budget: ${totalCost} / ${budget}
            </h3>
            <button onClick={regenerateDesign} className="secondary-btn">
              🔄 Regenerate
            </button>
          </div>

          <p className={design.within_budget ? "budget-ok" : "budget-over"}>
            {design.within_budget ? "Within Budget" : "Over Budget"}
          </p>

          <div className="content">
            {/* Room Visualization */}
            <div className="room">
              <div className="zone tv-zone">TV Area</div>
              <div className="zone sofa-zone">Seating Area</div>
              <div className="zone center-zone">Center</div>

              {design.layout.map((item, i) => (
                <div key={i} className="box">
                  {item}
                </div>
              ))}
            </div>

            {/* Items */}
            <div className="products">
              <h3>Furniture Items</h3>

              {design.items.map((item, i) => (
                <div key={i} className="product">
                  <h4>{item.name}</h4>
                  <p>${item.price}</p>
                  <button className="view-btn">View</button>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setScreen("input")} className="back-btn">
            ← Back
          </button>
        </div>
      )}
    </div>
  );
}

export default App;