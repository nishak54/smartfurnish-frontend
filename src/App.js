import React, { Suspense, useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

const SOFA_OPTIONS = [
  {
    id: "sofa1",
    name: "Sofa 1",
    price: 650,
    imagePath: "/assets/items/sofa/sofa1.webp",
  },
  {
    id: "sofa2",
    name: "Sofa 2",
    price: 720,
    imagePath: "/assets/items/sofa/sofa2.webp",
  },
  {
    id: "sofa3",
    name: "Sofa 3",
    price: 810,
    imagePath: "/assets/items/sofa/sofa3.webp",
  },
];

function SetupPage({ budget, setBudget, onGenerate }) {
  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-kicker">Smart Furnish</div>
        <h1>Design your living room</h1>
        <p className="setup-subtitle">
          Enter your budget and generate a living room concept.
        </p>

        <div className="field-group">
          <label>Budget</label>
          <input
            type="number"
            min="0"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="Enter your budget"
          />
        </div>

        <div className="field-group">
          <label>Room</label>
          <select value="living" disabled>
            <option value="living">Living Room</option>
          </select>
        </div>

        <button className="primary-button" onClick={onGenerate}>
          Generate Design
        </button>
      </div>
    </div>
  );
}

function RoomShell() {
  return (
    <>
      <color attach="background" args={["#eef2f7"]} />

      <ambientLight intensity={1.0} />
      <directionalLight position={[8, 10, 6]} intensity={1.1} />
      <directionalLight position={[-5, 5, -3]} intensity={0.25} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 11]} />
        <meshStandardMaterial color="#dec8a8" />
      </mesh>

      {/* Rug */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-0.4, 0.01, 0.4]}>
        <planeGeometry args={[5.5, 3.4]} />
        <meshStandardMaterial color="#d8d0f0" />
      </mesh>

      {/* Walls */}
      <mesh position={[0, 2.6, -5.3]}>
        <boxGeometry args={[14, 5.2, 0.2]} />
        <meshStandardMaterial color="#eee9e1" />
      </mesh>

      <mesh position={[-7, 2.6, 0]}>
        <boxGeometry args={[0.2, 5.2, 11]} />
        <meshStandardMaterial color="#f7f2eb" />
      </mesh>

      <mesh position={[7, 2.6, 0]}>
        <boxGeometry args={[0.2, 5.2, 11]} />
        <meshStandardMaterial color="#f7f2eb" />
      </mesh>

      {/* Window */}
      <mesh position={[-5.8, 2.2, -2.7]}>
        <boxGeometry args={[0.12, 1.7, 1.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-5.72, 2.2, -2.7]}>
        <boxGeometry args={[0.05, 1.45, 1.3]} />
        <meshStandardMaterial color="#cfe7ff" />
      </mesh>

      {/* Plant */}
      <group position={[5.2, 0, 2.2]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.6, 24]} />
          <meshStandardMaterial color="#b57412" />
        </mesh>

        <mesh position={[-0.18, 0.88, 0]}>
          <capsuleGeometry args={[0.14, 0.7, 4, 8]} />
          <meshStandardMaterial color="#13a34a" />
        </mesh>

        <mesh position={[0.02, 1, 0.06]}>
          <capsuleGeometry args={[0.14, 0.8, 4, 8]} />
          <meshStandardMaterial color="#2ecb62" />
        </mesh>

        <mesh position={[0.24, 0.86, -0.02]}>
          <capsuleGeometry args={[0.14, 0.7, 4, 8]} />
          <meshStandardMaterial color="#1ea24f" />
        </mesh>
      </group>
    </>
  );
}

function useSofaTexture(path) {
  const texture = useLoader(THREE.TextureLoader, path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

function SofaObject({
  sofa,
  sofaState,
  setSofaState,
  selected,
  setSelected,
  transformMode,
  orbitRef,
}) {
  const texture = useSofaTexture(sofa.imagePath);
  const groupRef = useRef(null);

  // Increased size so sofa looks correct in the room
  const width = 4.2;
  const height = 2.2;

  // Lower image so visible sofa sits on the floor
  const visualLift = height / 2 - 0.15;

  const clampAndSave = () => {
    if (!groupRef.current) return;

    const x = Number(groupRef.current.position.x.toFixed(2));
    const z = Number(groupRef.current.position.z.toFixed(2));
    const ry = Number(groupRef.current.rotation.y.toFixed(2));

    let s = groupRef.current.scale.x;
    s = Math.max(0.8, Math.min(2.5, s));

    groupRef.current.position.set(x, 0, z);
    groupRef.current.rotation.set(0, ry, 0);
    groupRef.current.scale.set(s, s, s);

    setSofaState({
      position: [x, 0, z],
      rotationY: ry,
      scale: Number(s.toFixed(2)),
    });
  };

  const axisProps =
    transformMode === "translate"
      ? { showX: true, showY: false, showZ: true }
      : transformMode === "rotate"
      ? { showX: false, showY: true, showZ: false }
      : { showX: true, showY: false, showZ: true };

  return (
    <>
      <group
        ref={groupRef}
        position={sofaState.position}
        rotation={[0, sofaState.rotationY, 0]}
        scale={[sofaState.scale, sofaState.scale, sofaState.scale]}
        onClick={(e) => {
          e.stopPropagation();
          setSelected(true);
        }}
      >
        <mesh position={[0, visualLift, 0]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {selected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          size={1}
          space="local"
          {...axisProps}
          onMouseDown={() => {
            if (orbitRef.current) orbitRef.current.enabled = false;
          }}
          onMouseUp={() => {
            if (orbitRef.current) orbitRef.current.enabled = true;
            clampAndSave();
          }}
          onObjectChange={clampAndSave}
        />
      )}
    </>
  );
}
function LivingRoomScene({
  selectedSofa,
  sofaState,
  setSofaState,
  transformMode,
  selected,
  setSelected,
}) {
  const orbitRef = useRef(null);

  return (
    <Canvas
      camera={{ position: [6.8, 4.8, 8.2], fov: 42 }}
      onPointerMissed={() => setSelected(false)}
    >
      <Suspense fallback={null}>
        <RoomShell />
        <SofaObject
          sofa={selectedSofa}
          sofaState={sofaState}
          setSofaState={setSofaState}
          selected={selected}
          setSelected={setSelected}
          transformMode={transformMode}
          orbitRef={orbitRef}
        />
      </Suspense>

      <OrbitControls
        ref={orbitRef}
        target={[0, 1.05, 0]}
        minDistance={4.5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.02}
      />
    </Canvas>
  );
}

function LivingRoomView({
  selectedSofa,
  onChangeSofa,
  budget,
  onBack,
  sofaState,
  setSofaState,
}) {
  const [transformMode, setTransformMode] = useState("translate");
  const [selected, setSelected] = useState(true);

  return (
    <div className="workspace-page">
      <div className="workspace-topbar">
        <div>
          <div className="workspace-title">Living Room Concept</div>
          <div className="workspace-subtitle">
            Click the sofa, then move, rotate, or resize it naturally inside the room.
          </div>
        </div>

        <div className="budget-pill">
          <span>Budget</span>
          <strong>
            ${selectedSofa.price} / ${budget}
          </strong>
        </div>
      </div>

      <div className="workspace-body">
        <div className="workspace-left">
          <div className="tool-row">
            <button
              className={transformMode === "translate" ? "tool-active" : ""}
              onClick={() => setTransformMode("translate")}
            >
              Move
            </button>

            <button
              className={transformMode === "rotate" ? "tool-active" : ""}
              onClick={() => setTransformMode("rotate")}
            >
              Rotate
            </button>

            <button
              className={transformMode === "scale" ? "tool-active" : ""}
              onClick={() => setTransformMode("scale")}
            >
              Resize
            </button>

            <button onClick={onBack}>Back</button>
          </div>

          <div className="viewer-frame">
            <LivingRoomScene
              selectedSofa={selectedSofa}
              sofaState={sofaState}
              setSofaState={setSofaState}
              transformMode={transformMode}
              selected={selected}
              setSelected={setSelected}
            />
          </div>

          <div className="helper-bar">
            <span>Move: drag on floor</span>
            <span>Rotate: use the circular Y-axis handle</span>
            <span>Resize: scale bigger or smaller</span>
          </div>
        </div>

        <div className="workspace-right">
          {SOFA_OPTIONS.map((sofa) => (
            <div
              key={sofa.id}
              className={`workspace-card ${
                sofa.id === selectedSofa.id ? "selected-card" : ""
              }`}
            >
              <img src={sofa.imagePath} alt={sofa.name} />
              <div className="workspace-card-content">
                <div className="workspace-card-category">Sofa</div>
                <div className="workspace-card-title">{sofa.name}</div>
                <div className="workspace-card-price">${sofa.price}</div>

                <div className="workspace-card-actions">
                  <button onClick={() => onChangeSofa(sofa)}>
                    Use This Sofa
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="selection-panel">
            <div className="selection-heading">Current Sofa State</div>
            <div className="selection-title">{selectedSofa.name}</div>
            <div className="selection-meta">
              Position: x {sofaState.position[0]}, z {sofaState.position[2]}
            </div>
            <div className="selection-meta">
              Rotation: {sofaState.rotationY}
            </div>
            <div className="selection-meta">
              Scale: {sofaState.scale}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState("setup");
  const [budget, setBudget] = useState(2000);
  const [selectedSofa, setSelectedSofa] = useState(SOFA_OPTIONS[1]);

  const [sofaState, setSofaState] = useState({
    position: [-2.2, 0, 0.4],
    rotationY: 0.12,
    scale: 1,
  });

  const handleChangeSofa = (sofa) => {
    setSelectedSofa(sofa);
    setSofaState((prev) => ({
      ...prev,
      scale: 1,
    }));
  };

  return (
    <div className="app-shell">
      {page === "setup" ? (
        <SetupPage
          budget={budget}
          setBudget={setBudget}
          onGenerate={() => setPage("workspace")}
        />
      ) : (
        <LivingRoomView
          selectedSofa={selectedSofa}
          onChangeSofa={handleChangeSofa}
          budget={budget}
          onBack={() => setPage("setup")}
          sofaState={sofaState}
          setSofaState={setSofaState}
        />
      )}
    </div>
  );
}