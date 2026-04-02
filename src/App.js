import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

const API_BASE = "https://smartfurnish-backend.onrender.com";

const ROOM = {
  floorWidth: 14,
  floorDepth: 11,
  backWallZ: -5.3,
  leftWallX: -7,
  rightWallX: 7,
  frontLimitZ: 5.5,
};

const SOFA_OPTIONS = [
  {
    id: "sofa1",
    name: "Sofa 1",
    price: 650,
    imagePath: "/assets/items/sofa/sofa1.webp",
    width: 5.4,
    height: 2.8,
    minScale: 0.9,
    maxScale: 2.3,
    details: {
      rating: "4.4",
      material: "Fabric",
      inStock: "Yes",
      dimensions: '84" W × 35" D × 34" H',
    },
  },
  {
    id: "sofa2",
    name: "Sofa 2",
    price: 720,
    imagePath: "/assets/items/sofa/sofa2.webp",
    width: 5.4,
    height: 2.8,
    minScale: 0.9,
    maxScale: 2.3,
    details: {
      rating: "4.6",
      material: "Linen Blend",
      inStock: "Yes",
      dimensions: '88" W × 36" D × 35" H',
    },
  },
];

const TABLE_OPTIONS = [
  {
    id: "table1",
    name: "Center Table 1",
    price: 220,
    imagePath: "/assets/items/tables/table1.webp",
    width: 3.9,
    height: 1.8,
    minScale: 0.8,
    maxScale: 2.2,
    details: {
      rating: "4.5",
      material: "Wood",
      inStock: "Yes",
      dimensions: '42" W × 22" D × 18" H',
    },
  },
];

function getDefaultLayout() {
  return {
    sofa: { position: [0, 0, -1.7], rotationY: 0, scale: 1.28 },
    table: { position: [0, 0, 0.45], rotationY: 0, scale: 1.25 },
  };
}

function useItemTexture(path) {
  const texture = useLoader(THREE.TextureLoader, path);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function ItemObject({
  item,
  itemState,
  setItemState,
  selected,
  setSelectedId,
  transformMode,
  orbitRef,
}) {
  const texture = useItemTexture(item.imagePath);
  const groupRef = useRef(null);

  return (
    <>
      <group
        ref={groupRef}
        position={itemState.position}
        rotation={[0, itemState.rotationY, 0]}
        scale={[itemState.scale, itemState.scale, itemState.scale]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(item.id);
        }}
      >
        <mesh position={[0, item.height / 2, 0]}>
          <planeGeometry args={[item.width, item.height]} />
          <meshBasicMaterial map={texture} transparent />
        </mesh>
      </group>

      {selected && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          onMouseUp={() => {
            const pos = groupRef.current.position;
            const rot = groupRef.current.rotation;
            const scale = groupRef.current.scale;

            setItemState({
              position: [pos.x, 0, pos.z],
              rotationY: rot.y,
              scale: scale.x,
            });

            orbitRef.current.enabled = true;
          }}
          onMouseDown={() => {
            orbitRef.current.enabled = false;
          }}
        />
      )}
    </>
  );
}

function LivingRoomScene({
  selectedSofa,
  selectedTable,
  sofaState,
  setSofaState,
  tableState,
  setTableState,
  transformMode,
  selectedId,
  setSelectedId,
}) {
  const orbitRef = useRef(null);

  return (
    <Canvas camera={{ position: [0, 3.6, 8.8], fov: 34 }}>
      <ambientLight intensity={0.8} />

      <Suspense fallback={null}>
        <ItemObject
          item={selectedSofa}
          itemState={sofaState}
          setItemState={setSofaState}
          selected={selectedId === selectedSofa.id}
          setSelectedId={setSelectedId}
          transformMode={transformMode}
          orbitRef={orbitRef}
        />

        <ItemObject
          item={selectedTable}
          itemState={tableState}
          setItemState={setTableState}
          selected={selectedId === selectedTable.id}
          setSelectedId={setSelectedId}
          transformMode={transformMode}
          orbitRef={orbitRef}
        />
      </Suspense>

      <OrbitControls ref={orbitRef} />
    </Canvas>
  );
}
function RealViewPanel({ realview, angle, setAngle, loading, error }) {
  const view = realview?.views?.[angle];

  return (
    <div className="real-view-panel">
      {loading && <div>Generating...</div>}
      {error && <div style={{ color: "red" }}>{error}</div>}

      {!realview && !loading && <div>Click Generate Real View</div>}

      {view && (
        <>
          <div>
            {realview.angles.map((a) => (
              <button key={a} onClick={() => setAngle(a)}>
                {a}
              </button>
            ))}
          </div>

          <div style={{ position: "relative", width: "100%" }}>
            <img src={view.background} style={{ width: "100%" }} />

            {view.items.map((item) => (
              <img
                key={item.id}
                src={item.image}
                style={{
                  position: "absolute",
                  left: `${(item.position.x / view.room.width) * 100}%`,
                  top: `${(item.position.y / view.room.height) * 100}%`,
                  width: `${(item.position.width / view.room.width) * 100}%`,
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function App() {
  const [selectedSofa, setSelectedSofa] = useState(SOFA_OPTIONS[0]);
  const [selectedTable, setSelectedTable] = useState(TABLE_OPTIONS[0]);

  const [sofaState, setSofaState] = useState(getDefaultLayout().sofa);
  const [tableState, setTableState] = useState(getDefaultLayout().table);

  const [transformMode, setTransformMode] = useState("translate");
  const [selectedId, setSelectedId] = useState(null);

  const [realViewData, setRealViewData] = useState(null);
  const [realViewAngle, setRealViewAngle] = useState("front");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerateRealView = async () => {
    try {
      setLoading(true);
      setError("");

      const design = {
        items: [
          {
            id: selectedSofa.id,
            type: "sofa",
            name: selectedSofa.name,
            price: selectedSofa.price,
            images: {
              front: selectedSofa.imagePath,
              left: selectedSofa.imagePath,
              right: selectedSofa.imagePath,
            },
            positions: {
              front: { x: 120, y: 285, width: 300, height: 145 },
              left: { x: 150, y: 290, width: 250, height: 138 },
              right: { x: 520, y: 290, width: 250, height: 138 },
            },
          },
          {
            id: selectedTable.id,
            type: "center_table",
            name: selectedTable.name,
            price: selectedTable.price,
            images: {
              front: selectedTable.imagePath,
              left: selectedTable.imagePath,
              right: selectedTable.imagePath,
            },
            positions: {
              front: { x: 425, y: 325, width: 145, height: 88 },
              left: { x: 430, y: 328, width: 130, height: 82 },
              right: { x: 360, y: 328, width: 130, height: 82 },
            },
          },
        ],
      };

      const response = await fetch(`${API_BASE}/generate-realview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design }),
      });

      const text = await response.text();
      const data = text ? JSON.parse(text) : {};

      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }

      setRealViewData(data.realview);
      setRealViewAngle("front");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleGenerateRealView}>
        Generate Real View
      </button>

      <LivingRoomScene
        selectedSofa={selectedSofa}
        selectedTable={selectedTable}
        sofaState={sofaState}
        setSofaState={setSofaState}
        tableState={tableState}
        setTableState={setTableState}
        transformMode={transformMode}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />

      <RealViewPanel
        realview={realViewData}
        angle={realViewAngle}
        setAngle={setRealViewAngle}
        loading={loading}
        error={error}
      />
    </div>
  );
}