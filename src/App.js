import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://smartfurnish-backend.onrender.com/api/get_items";

function App() {
  const [budget, setBudget] = useState("");
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleSubmit = async () => {
    if (!budget || isNaN(budget)) {
      alert("Enter valid budget");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(BACKEND_URL, {
        budget: parseFloat(budget),
        room: "living_room",
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      alert("Backend error");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial" }}>
      <h1>Smart Furnish 🏠</h1>

      {/* INPUT */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="number"
          placeholder="Enter Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          style={{ padding: 8, marginRight: 10 }}
        />
        <button onClick={handleSubmit}>Generate</button>
      </div>

      {loading && <p>Loading...</p>}

      {items && (
        <>
          {/* 🏠 ROOM */}
          <div
            style={{
              position: "relative",
              width: "800px",
              height: "500px",
              marginBottom: 30,
              background: "#e8e5df",
              border: "6px solid #444",
              borderRadius: "8px",
            }}
          >
            {/* ROOM LABEL */}
            <div style={{ position: "absolute", top: 5, left: 10 }}>
              Living Room (12ft x 8ft)
            </div>

            {/* SOFA */}
            {items.sofa?.[0] && (
              <img
                src={items.sofa[0].image}
                alt="sofa"
                onClick={() => setSelectedItem(items.sofa[0])}
                style={{
                  position: "absolute",
                  bottom: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "260px",
                  height: "140px",
                  objectFit: "contain",
                  cursor: "pointer",
                  filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))",
                }}
              />
            )}

            {/* COFFEE TABLE */}
            {items.coffee_table?.[0] && (
              <img
                src={items.coffee_table[0].image}
                alt="table"
                onClick={() => setSelectedItem(items.coffee_table[0])}
                style={{
                  position: "absolute",
                  bottom: "180px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "120px",
                  height: "80px",
                  objectFit: "contain",
                  cursor: "pointer",
                  filter: "drop-shadow(0px 3px 5px rgba(0,0,0,0.3))",
                }}
              />
            )}

            {/* TV STAND */}
            {items.tv_stand?.[0] && (
              <img
                src={items.tv_stand[0].image}
                alt="tv"
                onClick={() => setSelectedItem(items.tv_stand[0])}
                style={{
                  position: "absolute",
                  top: "40px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "200px",
                  height: "100px",
                  objectFit: "contain",
                  cursor: "pointer",
                  filter: "drop-shadow(0px 3px 5px rgba(0,0,0,0.3))",
                }}
              />
            )}

            {/* FLOOR GRID (visual realism) */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* 🛍️ PRODUCT LIST */}
          {Object.keys(items).map((category) => (
            <div key={category}>
              <h3>{category}</h3>
              <div style={{ display: "flex", gap: 10 }}>
                {items[category].map((item, i) => (
                  <div
                    key={i}
                    style={{
                      border: "1px solid #ccc",
                      padding: 10,
                      width: 180,
                      borderRadius: "8px",
                    }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{
                        width: "100%",
                        height: "120px",
                        objectFit: "cover",
                      }}
                    />
                    <p>{item.name}</p>
                    <b>${item.price}</b>
                    <br />
                    <a href={item.link} target="_blank" rel="noreferrer">
                      Buy
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {/* 🧾 DETAILS POPUP */}
      {selectedItem && (
        <div
          style={{
            position: "fixed",
            top: "20%",
            left: "35%",
            background: "white",
            padding: 20,
            border: "2px solid #333",
            borderRadius: "10px",
            width: "300px",
            zIndex: 1000,
          }}
        >
          <h3>{selectedItem.name}</h3>
          <img
            src={selectedItem.image}
            alt=""
            style={{ width: "100%", marginBottom: 10 }}
          />
          <p><b>Price:</b> ${selectedItem.price}</p>
          <p><b>Material:</b> Wood / Fabric</p>
          <p><b>Color:</b> Grey / Brown</p>
          <p><b>Dimensions:</b> 80 x 35 x 30 inches</p>

          <a href={selectedItem.link} target="_blank" rel="noreferrer">
            View on Amazon
          </a>

          <br /><br />
          <button onClick={() => setSelectedItem(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default App;