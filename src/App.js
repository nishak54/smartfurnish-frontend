import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://smartfurnish-backend.onrender.com/api/get_items";

function App() {
  const [budget, setBudget] = useState("");
  const [items, setItems] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSubmit = async () => {
    if (!budget) return alert("Enter budget");

    const res = await axios.post(BACKEND_URL, {
      budget: parseFloat(budget),
      room: "living_room",
    });

    setItems(res.data);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Smart Furnish 🏠</h1>

      <input
        type="number"
        placeholder="Enter Budget"
        value={budget}
        onChange={(e) => setBudget(e.target.value)}
      />
      <button onClick={handleSubmit}>Generate</button>

      {/* ROOM */}
      {items && (
        <div
          style={{
            position: "relative",
            width: "800px",
            height: "500px",
            marginTop: 20,
            background: "#e8e5df",
            border: "6px solid #444",
            borderRadius: "10px",
          }}
        >
          <div style={{ position: "absolute", top: 10, left: 10 }}>
            Living Room (12ft x 8ft)
          </div>

          {/* SOFA */}
          <div
            onClick={() => setSelectedItem(items.sofa[0])}
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              width: 260,
              height: 140,
              background: "#d6d3ce",
              borderRadius: 20,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <img
              src={items.sofa[0]?.image}
              alt=""
              style={{ width: "90%", height: "90%", objectFit: "contain" }}
            />
          </div>

          {/* COFFEE TABLE */}
          <div
            onClick={() => setSelectedItem(items.coffee_table[0])}
            style={{
              position: "absolute",
              bottom: 180,
              left: "50%",
              transform: "translateX(-50%)",
              width: 120,
              height: 80,
              background: "#c4b7a6",
              borderRadius: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <img
              src={items.coffee_table[0]?.image}
              alt=""
              style={{ width: "85%", height: "85%", objectFit: "contain" }}
            />
          </div>

          {/* TV STAND */}
          <div
            onClick={() => setSelectedItem(items.tv_stand[0])}
            style={{
              position: "absolute",
              top: 40,
              left: "50%",
              transform: "translateX(-50%)",
              width: 220,
              height: 100,
              background: "#b0a79f",
              borderRadius: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
          >
            <img
              src={items.tv_stand[0]?.image}
              alt=""
              style={{ width: "90%", height: "90%", objectFit: "contain" }}
            />
          </div>

          {/* GRID */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      )}

      {/* PRODUCT LIST */}
      {items &&
        Object.keys(items).map((cat) => (
          <div key={cat}>
            <h3>{cat}</h3>
            <div style={{ display: "flex", gap: 10 }}>
              {items[cat].map((item, i) => (
                <div
                  key={i}
                  style={{
                    border: "1px solid #ccc",
                    padding: 10,
                    width: 180,
                  }}
                >
                  <img
                    src={item.image}
                    alt=""
                    style={{ width: "100%", height: 120, objectFit: "cover" }}
                  />
                  <p>{item.name}</p>
                  <b>${item.price}</b>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* POPUP */}
      {selectedItem && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "35%",
            background: "white",
            padding: 20,
            border: "2px solid black",
          }}
        >
          <h3>{selectedItem.name}</h3>
          <img src={selectedItem.image} alt="" style={{ width: "100%" }} />
          <p>Price: ${selectedItem.price}</p>
          <p>Material: Wood / Fabric</p>
          <p>Color: Grey / Brown</p>
          <p>Dimensions: 80 x 35 x 30 inches</p>

          <button onClick={() => setSelectedItem(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;