import React, { useState } from "react";
import axios from "axios";

const BACKEND_URL = "https://smartfurnish-backend.onrender.com/api/get_items";

function App() {
  const [budget, setBudget] = useState("");
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!budget || isNaN(budget)) {
      alert("Please enter a valid budget");
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
      alert("Error fetching items from backend.");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Smart Furnish 🛋️</h1>

      {/* Budget Input */}
      <div>
        <input
          type="number"
          placeholder="Enter Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <button onClick={handleSubmit}>Submit</button>
      </div>

      {loading && <p>Loading...</p>}

      {/* Products */}
      {items && (
        <div>
          {Object.keys(items).map((category) => (
            <div key={category}>
              <h2>{category}</h2>
              <div style={{ display: "flex", gap: "10px" }}>
                {items[category].map((item, idx) => (
                  <div key={idx} style={{ border: "1px solid #ccc", padding: 10 }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "150px", height: "100px" }}
                    />
                    <p>{item.name}</p>
                    <p>${item.price}</p>
                    <a href={item.link} target="_blank" rel="noreferrer">
                      Buy on Amazon
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
