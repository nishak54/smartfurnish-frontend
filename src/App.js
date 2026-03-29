 import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import "./App.css";

// ---- SIMPLE 3D FURNITURE ---- //

function Sofa({ position, selected, onClick }) {
  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[2.5, 1, 1]} />
      <meshStandardMaterial color={selected ? "orange" : "#6b7280"} />
    </mesh>
  );
}

function Table({ position, selected, onClick }) {
  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[1.5, 0.5, 1]} />
      <meshStandardMaterial color={selected ? "orange" : "#a16207"} />
    </mesh>
  );
}

function TVStand({ position, selected, onClick }) {
  return (
    <mesh position={position} onClick={onClick}>
      <boxGeometry args={[2, 0.7, 0.6]} />
      <meshStandardMaterial color={selected ? "orange" : "#1f2937"} />
    </mesh>
  );
}

// ---- ROOM ---- //

function Room() {
  return (
    <>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#d6c3a3" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2.5, -5]}>
        <boxGeometry args={[20, 5, 0.2]} />
        <meshStandardMaterial color="#f5efe6" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color="#f5efe6" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[5, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[10, 5, 0.2]} />
        <meshStandardMaterial color="#f5efe6" />
      </mesh>
    </>
  );
}

// ---- MAIN SCENE ---- //

function Scene({ selected, setSelected }) {
  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

      <Room />

      {/* Furniture */}
      <Sofa
        position={[-2, 0.5, 1]}
        selected={selected === "sofa"}
        onClick={() => setSelected("sofa")}
      />

      <Table
        position={[0, 0.25, 0]}
        selected={selected === "table"}
        onClick={() => setSelected("table")}
      />

      <TVStand
        position={[2, 0.35, -2]}
        selected={selected === "tv"}
        onClick={() => setSelected("tv")}
      />

      {/* Camera controls */}
      <OrbitControls />
    </>
  );
}

// ---- APP ---- //

function App() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="app">
      <div className="sidebar">
        <h2>3D Living Room</h2>

        <p>Selected: {selected || "None"}</p>

        <p>Click items in the room</p>

        <ul>
          <li>Sofa</li>
          <li>Table</li>
          <li>TV Stand</li>
        </ul>
      </div>

      <div className="canvas">
        <Canvas shadows camera={{ position: [5, 5, 5], fov: 50 }}>
          <Scene selected={selected} setSelected={setSelected} />
        </Canvas>
      </div>
    </div>
  );
}

export default App;