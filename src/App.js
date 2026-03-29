import React, { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text } from "@react-three/drei";
import "./App.css";

function SelectableItem({
  name,
  position,
  selectedItem,
  setSelectedItem,
  children,
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
          position={[0, 1.6, 0]}
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
      position={[-2.2, 0, 0.3]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.5, 1]} />
        <meshStandardMaterial color="#55627a" />
      </mesh>

      <mesh position={[0, 0.95, -0.35]} castShadow receiveShadow>
        <boxGeometry args={[2.3, 0.8, 0.2]} />
        <meshStandardMaterial color="#445066" />
      </mesh>

      <mesh position={[-1.05, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.7, 1]} />
        <meshStandardMaterial color="#445066" />
      </mesh>

      <mesh position={[1.05, 0.8, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.7, 1]} />
        <meshStandardMaterial color="#445066" />
      </mesh>

      {[
        [-0.95, 0.12, -0.35],
        [0.95, 0.12, -0.35],
        [-0.95, 0.12, 0.35],
        [0.95, 0.12, 0.35],
      ].map((leg, index) => (
        <mesh key={index} position={leg} castShadow>
          <boxGeometry args={[0.08, 0.24, 0.08]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
    </SelectableItem>
  );
}

function CoffeeTable({ selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name="Coffee Table"
      position={[0, 0, 0.7]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.12, 0.8]} />
        <meshStandardMaterial color="#9a5b2e" />
      </mesh>

      {[
        [-0.62, 0.24, -0.28],
        [0.62, 0.24, -0.28],
        [-0.62, 0.24, 0.28],
        [0.62, 0.24, 0.28],
      ].map((leg, index) => (
        <mesh key={index} position={leg} castShadow>
          <boxGeometry args={[0.08, 0.48, 0.08]} />
          <meshStandardMaterial color="#6f3f1f" />
        </mesh>
      ))}
    </SelectableItem>
  );
}

function TVStand({ selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name="TV Stand"
      position={[2.5, 0, -2.2]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.7, 0.5]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <mesh position={[0, 1.45, -0.03]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.9, 0.08]} />
        <meshStandardMaterial color="#0b0f17" />
      </mesh>
    </SelectableItem>
  );
}

function Bed({ selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name="Bed"
      position={[-0.8, 0, 0]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 0.3, 2]} />
        <meshStandardMaterial color="#8b5a3c" />
      </mesh>

      <mesh position={[0, 0.65, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.8, 0.3, 1.8]} />
        <meshStandardMaterial color="#dbe4f0" />
      </mesh>

      <mesh position={[0, 1.1, -0.9]} castShadow receiveShadow>
        <boxGeometry args={[3, 1, 0.15]} />
        <meshStandardMaterial color="#6b4b35" />
      </mesh>
    </SelectableItem>
  );
}

function SideTable({ selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name="Side Table"
      position={[2.2, 0, -0.4]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.1, 0.7]} />
        <meshStandardMaterial color="#8b5a3c" />
      </mesh>

      {[
        [-0.25, 0.2, -0.25],
        [0.25, 0.2, -0.25],
        [-0.25, 0.2, 0.25],
        [0.25, 0.2, 0.25],
      ].map((leg, index) => (
        <mesh key={index} position={leg} castShadow>
          <boxGeometry args={[0.06, 0.4, 0.06]} />
          <meshStandardMaterial color="#6b4b35" />
        </mesh>
      ))}
    </SelectableItem>
  );
}

function DiningTable({ selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name="Dining Table"
      position={[0, 0, 0.2]}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 0.12, 1.2]} />
        <meshStandardMaterial color="#8b5a3c" />
      </mesh>

      {[
        [-0.9, 0.34, -0.45],
        [0.9, 0.34, -0.45],
        [-0.9, 0.34, 0.45],
        [0.9, 0.34, 0.45],
      ].map((leg, index) => (
        <mesh key={index} position={leg} castShadow>
          <boxGeometry args={[0.1, 0.68, 0.1]} />
          <meshStandardMaterial color="#6f3f1f" />
        </mesh>
      ))}
    </SelectableItem>
  );
}

function Chair({ name, position, selectedItem, setSelectedItem }) {
  return (
    <SelectableItem
      name={name}
      position={position}
      selectedItem={selectedItem}
      setSelectedItem={setSelectedItem}
    >
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshStandardMaterial color="#475569" />
      </mesh>

      <mesh position={[0, 0.85, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.8, 0.08]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

      {[
        [-0.22, 0.18, -0.22],
        [0.22, 0.18, -0.22],
        [-0.22, 0.18, 0.22],
        [0.22, 0.18, 0.22],
      ].map((leg, index) => (
        <mesh key={index} position={leg} castShadow>
          <boxGeometry args={[0.05, 0.36, 0.05]} />
          <meshStandardMaterial color="#1f2937" />
        </mesh>
      ))}
    </SelectableItem>
  );
}
function RoomShell({ children, setSelectedItem }) {
  return (
    <>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
        onClick={() => setSelectedItem(null)}
      >
        <planeGeometry args={[12, 10]} />
        <meshStandardMaterial color="#d9c8aa" />
      </mesh>

      <mesh position={[0, 2.5, -5]} receiveShadow>
        <boxGeometry args={[12, 5, 0.2]} />
        <meshStandardMaterial color="#e8e5df" />
      </mesh>

      <mesh position={[-6, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 10]} />
        <meshStandardMaterial color="#efede8" />
      </mesh>

      <mesh position={[6, 2.5, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5, 10]} />
        <meshStandardMaterial color="#efede8" />
      </mesh>

      {children}
    </>
  );
}

function LivingRoomScene({ selectedItem, setSelectedItem }) {
  return (
    <RoomShell setSelectedItem={setSelectedItem}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0.6]}
        receiveShadow
      >
        <planeGeometry args={[4.8, 3]} />
        <meshStandardMaterial color="#d8ccb4" />
      </mesh>

      <Sofa selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <CoffeeTable
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      <TVStand selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
    </RoomShell>
  );
}

function BedroomScene({ selectedItem, setSelectedItem }) {
  return (
    <RoomShell setSelectedItem={setSelectedItem}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-0.2, 0.01, 0]}
        receiveShadow
      >
        <planeGeometry args={[5.4, 3.6]} />
        <meshStandardMaterial color="#d7d1c7" />
      </mesh>

      <Bed selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
      <SideTable selectedItem={selectedItem} setSelectedItem={setSelectedItem} />
    </RoomShell>
  );
}

function DiningRoomScene({ selectedItem, setSelectedItem }) {
  return (
    <RoomShell setSelectedItem={setSelectedItem}>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0.2]}
        receiveShadow
      >
        <planeGeometry args={[4.5, 3.5]} />
        <meshStandardMaterial color="#d8ccb4" />
      </mesh>

      <DiningTable
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      <Chair
        name="Chair 1"
        position={[-1.4, 0, 0.2]}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      <Chair
        name="Chair 2"
        position={[1.4, 0, 0.2]}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      <Chair
        name="Chair 3"
        position={[0, 0, -1]}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
      <Chair
        name="Chair 4"
        position={[0, 0, 1.4]}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
      />
    </RoomShell>
  );
}

function Scene({ roomType, selectedItem, setSelectedItem }) {
  return (
    <Canvas shadows camera={{ position: [6, 4.5, 8], fov: 45 }}>
      <color attach="background" args={["#e5e7eb"]} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[6, 8, 6]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-4, 5, -2]} intensity={0.4} />

      {roomType === "living" && (
        <LivingRoomScene
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
      )}

      {roomType === "bedroom" && (
        <BedroomScene
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
      )}

      {roomType === "dining" && (
        <DiningRoomScene
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
      )}

      <OrbitControls
        target={[0, 1, 0]}
        minDistance={6}
        maxDistance={14}
        maxPolarAngle={Math.PI / 2.05}
      />
    </Canvas>
  );
}

export default function App() {
  const [budget, setBudget] = useState(500);
  const [roomType, setRoomType] = useState("living");
  const [selectedItem, setSelectedItem] = useState(null);
  const [submittedBudget, setSubmittedBudget] = useState(500);
  const [submittedRoom, setSubmittedRoom] = useState("living");

  const roomCost = useMemo(() => {
    if (submittedRoom === "living") return 420;
    if (submittedRoom === "bedroom") return 650;
    if (submittedRoom === "dining") return 780;
    return 0;
  }, [submittedRoom]);

  const budgetStatus =
    submittedBudget >= roomCost
      ? `Within budget. Estimated room cost: $${roomCost}`
      : `Over budget. Estimated room cost: $${roomCost}`;

  const roomTitle =
    submittedRoom === "living"
      ? "Living Room"
      : submittedRoom === "bedroom"
      ? "Bedroom"
      : "Dining Room";

  const handleGenerate = () => {
    setSubmittedBudget(Number(budget) || 0);
    setSubmittedRoom(roomType);
    setSelectedItem(null);
  };

  return (
    <div className="app">
      <div className="sidebar">
        <h1>3D Room Planner</h1>

        <div className="panel">
          <h3>Enter your budget</h3>
          <input
            type="number"
            value={budget}
            min="0"
            onChange={(e) => setBudget(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              marginBottom: "14px",
              fontSize: "16px",
            }}
          />

          <h3>Select room</h3>
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "10px",
              border: "1px solid #d1d5db",
              marginBottom: "14px",
              fontSize: "16px",
            }}
          >
            <option value="living">Living Room</option>
            <option value="bedroom">Bedroom</option>
            <option value="dining">Dining Room</option>
          </select>

          <button
            onClick={handleGenerate}
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              background: "#111827",
              color: "#ffffff",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Generate Design
          </button>
        </div>

        <p className="selected">
          <strong>Budget:</strong> ${submittedBudget}
        </p>
        <p className="selected">
          <strong>Room:</strong> {roomTitle}
        </p>
        <p className="selected">
          <strong>Selected:</strong> {selectedItem || "None"}
        </p>

        <div className="panel">
          <h3>Budget status</h3>
          <p>{budgetStatus}</p>
        </div>

        <div className="panel">
          <h3>Flow</h3>
          <p>1. Enter budget</p>
          <p>2. Select room from dropdown</p>
          <p>3. Click Generate Design</p>
          <p>4. Rotate and inspect the room</p>
        </div>
      </div>

      <div className="viewer">
        <Scene
          roomType={submittedRoom}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </div>
  );
}