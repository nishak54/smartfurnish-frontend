import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./RoomDesigner.css";

// ----------- MOCK DATA (Replace with Amazon API later) -----------

const SOFAS = [
  {
    name: "Compact Sofa",
    price: 640,
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7",
    color: "#6b7280",
  },
  {
    name: "Luxury Sofa",
    price: 920,
    image: "https://images.unsplash.com/photo-1616627981235-68eec7d3c61c",
    color: "#374151",
  },
];

const TABLES = [
  {
    name: "Glass Center Table",
    price: 320,
    image: "https://images.unsplash.com/photo-1616628182507-3a0b2c3c6b0f",
    color: "#9a5b2e",
  },
  {
    name: "Wood Table",
    price: 180,
    image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    color: "#7c3aed",
  },
];

const TVS = [
  {
    name: "Floating TV Stand",
    price: 360,
    image: "https://images.unsplash.com/photo-1598300053653-4f1a3c9d2f1d",
    color: "#111827",
  },
  {
    name: "Classic TV Unit",
    price: 250,
    image: "https://images.unsplash.com/photo-1582582494700-6bff0b2c36d7",
    color: "#1f2937",
  },
];

// ----------- 3D ITEMS -----------

function Sofa({ color }) {
  return (
    <mesh position={[-2, 0.5, 0]}>
      <boxGeometry args={[2.5, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function Table({ color }) {
  return (
    <mesh position={[0, 0.4, 0.6]}>
      <boxGeometry args={[1.5, 0.2, 0.8]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}

function TVStand({ color }) {
  return (
    <>
      <mesh position={[2.5, 0.4, -2]}>
        <boxGeometry args={[2, 0.6, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      <mesh position={[2.5, 1.4, -2]}>
        <boxGeometry args={[1.4, 0.8, 0.05]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </>
  );
}

// ----------- ROOM -----------

function Room({ sofa, table, tv }) {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#d9c8aa" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.5, -5]}>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#ece7e1" />
      </mesh>

      <mesh position={[-6, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 10]} />
        <meshStandardMaterial color="#f4f1ed" />
      </mesh>

      <mesh position={[6, 2.5, 0]}>
        <boxGeometry args={[0.2, 5, 10]} />
        <meshStandardMaterial color="#f4f1ed" />
      </mesh>

      <Sofa color={sofa.color} />
      <Table color={table.color} />
      <TVStand color={tv.color} />
    </>
  );
}

// ----------- MAIN COMPONENT -----------

export default function RoomDesigner() {
  const [sofa, setSofa] = useState(SOFAS[0]);
  const [table, setTable] = useState(TABLES[0]);
  const [tv, setTV] = useState(TVS[0]);

  const regenerateAll = () => {
    setSofa(SOFAS[Math.floor(Math.random() * SOFAS.length)]);
    setTable(TABLES[Math.floor(Math.random() * TABLES.length)]);
    setTV(TVS[Math.floor(Math.random() * TVS.length)]);
  };

  const total = sofa.price + table.price + tv.price;
    return (
    <div className="designer">
      {/* LEFT - 3D VIEW */}
      <div className="canvas-section">
        <Canvas camera={{ position: [6, 4, 8], fov: 45 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[5, 8, 5]} intensity={1} />

          <Room sofa={sofa} table={table} tv={tv} />

          <OrbitControls />
        </Canvas>
      </div>

      {/* RIGHT PANEL */}
      <div className="side-panel">
        <h2>Budget: ${total}</h2>

        {/* SOFA CARD */}
        <div className="card">
          <img src={sofa.image} alt="" />
          <div>
            <h4>SOFA</h4>
            <p>{sofa.name}</p>
            <strong>${sofa.price}</strong>

            <div className="actions">
              <button
                onClick={() =>
                  setSofa(SOFAS[Math.floor(Math.random() * SOFAS.length)])
                }
              >
                Regenerate
              </button>
              <button onClick={() => setSofa({ price: 0, color: "transparent" })}>
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="card">
          <img src={table.image} alt="" />
          <div>
            <h4>TABLE</h4>
            <p>{table.name}</p>
            <strong>${table.price}</strong>

            <div className="actions">
              <button
                onClick={() =>
                  setTable(TABLES[Math.floor(Math.random() * TABLES.length)])
                }
              >
                Regenerate
              </button>
              <button
                onClick={() => setTable({ price: 0, color: "transparent" })}
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* TV */}
        <div className="card">
          <img src={tv.image} alt="" />
          <div>
            <h4>TV UNIT</h4>
            <p>{tv.name}</p>
            <strong>${tv.price}</strong>

            <div className="actions">
              <button
                onClick={() =>
                  setTV(TVS[Math.floor(Math.random() * TVS.length)])
                }
              >
                Regenerate
              </button>
              <button onClick={() => setTV({ price: 0, color: "transparent" })}>
                Remove
              </button>
            </div>
          </div>
        </div>

        {/* FULL REGENERATE */}
        <button className="regen-all" onClick={regenerateAll}>
          Regenerate Full Design
        </button>
      </div>
    </div>
  );
}