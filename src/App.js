import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://smartfurnish-backend.onrender.com/api/get_items";

function App() {
  const [budget, setBudget] = useState("");
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);

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
          {/* 🧱 2D ROOM LAYOUT */}
          <div
            style={{
              position: "relative",
              width: "800px",
              height: "500px",
              border: "2px solid black",
              marginBottom: 30,
              background: "#f5f5f5",
            }}
          >
            {/* SOFA */}
            {items.sofa?.[0] && (
              <img
                src={items.sofa[0].image}
                alt="sofa"
                style={{
                  position: "absolute",
                  bottom: "10px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "250px",
                  height: "150px",
                  objectFit: "contain",
                }}
              />
            )}

            {/* COFFEE TABLE */}
            {items.coffee_table?.[0] && (
              <img
                src={items.coffee_table[0].image}
                alt="table"
                style={{
                  position: "absolute",
                  bottom: "180px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "120px",
                  height: "80px",
                  objectFit: "contain",
                }}
              />
            )}

            {/* TV STAND */}
            {items.tv_stand?.[0] && (
              <img
                src={items.tv_stand[0].image}
                alt="tv"
                style={{
                  position: "absolute",
                  top: "20px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "200px",
                  height: "100px",
                  objectFit: "contain",
                }}
              />
            )}
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
    </div>
  );
}

export default App;