import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Html } from "@react-three/drei";
import "./App.css";

function SelectableItem({
  name,
  position,
  children,
  selectedItem,
  setSelectedItem,
}) {
  const isSelected = selectedItem === name;

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        setSelectedItem(name);
      }}
    >
      {children}
      {isSelected && (
        <Text
          position={[0, 1.2, 0]}
          fontSize={0.22}
          color="black"
          anchorX="center"
          anchorY="middle"
        >
          {name}
        </Text>
      )}
    </group>
  );
}

function Sofa({ selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name="Sofa"
      position={[-2.2, 0, 0]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      {/* Base */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.5, 0.9]} />
        <meshStandardMaterial color="#5c677d" />
      </mesh>

      {/* Back */}
      <mesh position={[0, 0.95, -0.32]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.8, 0.18]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Arms */}
      <mesh position={[-1.02, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.7, 0.9]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      <mesh position={[1.02, 0.82, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.18, 0.7, 0.9]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>

      {/* Legs */}
      {[
        [-0.9, 0.12, -0.32],
        [0.9, 0.12, -0.32],
        [-0.9, 0.12, 0.32],
        [0.9, 0.12, 0.32],
      ].map((leg, i) => (
        <mesh key={i} position={leg} castShadow>
          <boxGeometry args={[0.08, 0.24, 0.08]} />
          <meshStandardMaterial color="#2d3748" />
        </mesh>
      ))}
    </SelectableItem>
  );
}

function CoffeeTable({ selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name="Table"
      position={[0, 0, 0.4]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      {/* Top */}
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.1, 0.8]} />
        <meshStandardMaterial color="#9c6644" />
      </mesh>

      {/* Legs */}
      {[
        [-0.58, 0.25, -0.28],
        [0.58, 0.25, -0.28],
        [-0.58, 0.25, 0.28],
        [0.58, 0.25, 0.28],
      ].map((leg, i) => (
        <mesh key={i} position={leg} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#6b4226" />
        </mesh>
      ))}
    </SelectableItem>
  );
}

function TVStand({ selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name="TV Stand"
      position={[2.35, 0, -2.25]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      {/* Cabinet */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.7, 0.45]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>

      {/* TV */}
      <mesh position={[0, 1.45, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.9, 0.08]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      {/* TV screen */}
      <mesh position={[0, 1.45, -0.095]}>
        <boxGeometry args={[1.35, 0.75, 0.02]} />
        <meshStandardMaterial color="#0f172a" emissive="#1e293b" />
      </mesh>
    </SelectableItem>
  );
}

function Rug() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0.4]} receiveShadow>
      <planeGeometry args={[4.8, 3]} />
      <meshStandardMaterial color="#d6c6a8" />
    </mesh>
  );
}

function Room({ selectedItem, setSelectedItem }) {
  return (
    <>
      {/* Floor */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onClick={() => setSelectedItem(null)}
      >
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#d9c2a3" />
      </mesh>

      {/* Back Wall */}
      <mesh position={[0, 2.5, -5]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#ece7e1" />
      </mesh>

      {/* Left Wall */}
      <mesh position={[-6, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 10]} />
        <meshStandardMaterial color="#f4f1ed" />
      </mesh>

      {/* Right Wall */}
      <mesh position={[6, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 10]} />
        <meshStandardMaterial color="#f4f1ed" />
      </mesh>

      <Rug />
      <Sofa selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <CoffeeTable selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <TVStand selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
    </>
  );
}

function Scene({ selectedItem, setSelectedItem }) {
  return (
    <Canvas
      shadows
      camera={{ position: [6, 4.5, 8], fov: 45 }}
    >
      <color attach="background" args={["#e5e7eb"]} />

      <ambientLight intensity={0.7} />
      <directionalLight
        position={[6, 8, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-4, 6, -2]} intensity={0.5} />

      <Room selectedItem={selectedItem} setSelectedItem={setSelectedItem} />

      <OrbitControls
        target={[0, 1, 0]}
        minDistance={6}
        maxDistance={14}
        maxPolarAngle={Math.PI / 2.1}
      />
    </Canvas>
  );
}

export default function App() {
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <div className="app">
      <div className="sidebar">
        <h1>3D Living Room</h1>
        <p className="selected">
          <strong>Selected:</strong> {selectedItem || "None"}
        </p>

        <div className="panel">
          <h3>Click items in the room</h3>
          <ul>
            <li>Sofa</li>
            <li>Table</li>
            <li>TV Stand</li>
          </ul>
        </div>

        <div className="panel">
          <h3>Controls</h3>
          <p>Drag to rotate</p>
          <p>Scroll to zoom</p>
          <p>Click empty floor to clear selection</p>
        </div>
      </div>

      <div className="viewer">
        <Scene selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      </div>
    </div>
  );
}