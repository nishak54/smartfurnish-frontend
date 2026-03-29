import React, { Suspense, useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  TransformControls,
  useTexture,
} from "@react-three/drei";
import "./App.css";

/* =========================
   PRODUCT CATALOG
   ========================= */

const CATALOG = {
  sofa: [
    {
      id: "sofa-1",
      category: "sofa",
      name: "Compact Sofa",
      price: 640,
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
      visual: { width: 2.3, height: 1.2, y: 0.8 },
    },
    {
      id: "sofa-2",
      category: "sofa",
      name: "Modern Beige Sofa",
      price: 520,
      image:
        "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80",
      visual: { width: 2.3, height: 1.2, y: 0.8 },
    },
    {
      id: "sofa-3",
      category: "sofa",
      name: "Premium Lounge Sofa",
      price: 780,
      image:
        "https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80",
      visual: { width: 2.4, height: 1.25, y: 0.82 },
    },
  ],
  coffeeTable: [
    {
      id: "table-1",
      category: "coffeeTable",
      name: "Glass Coffee Table",
      price: 320,
      image:
        "https://images.unsplash.com/photo-1538688423619-a81d3f23454b?auto=format&fit=crop&w=900&q=80",
      visual: { width: 1.4, height: 0.8, y: 0.45 },
    },
    {
      id: "table-2",
      category: "coffeeTable",
      name: "Wood Coffee Table",
      price: 220,
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=80",
      visual: { width: 1.4, height: 0.8, y: 0.45 },
    },
    {
      id: "table-3",
      category: "coffeeTable",
      name: "Round Accent Table",
      price: 260,
      image:
        "https://images.unsplash.com/photo-1517705008128-361805f42e86?auto=format&fit=crop&w=900&q=80",
      visual: { width: 1.2, height: 0.8, y: 0.45 },
    },
  ],
  tvStand: [
    {
      id: "tv-1",
      category: "tvStand",
      name: "Floating TV Stand",
      price: 360,
      image:
        "https://images.unsplash.com/photo-1615874959474-d609969a20ed?auto=format&fit=crop&w=900&q=80",
      visual: { width: 2.1, height: 1.25, y: 0.85 },
    },
    {
      id: "tv-2",
      category: "tvStand",
      name: "Classic TV Unit",
      price: 280,
      image:
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
      visual: { width: 2.1, height: 1.25, y: 0.85 },
    },
    {
      id: "tv-3",
      category: "tvStand",
      name: "Walnut Media Console",
      price: 430,
      image:
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80",
      visual: { width: 2.1, height: 1.25, y: 0.85 },
    },
  ],
};

const DEFAULT_LAYOUT = {
  sofa: { position: [-2.2, 0, 0.4], rotationY: 0.15 },
  coffeeTable: { position: [0, 0, 0.7], rotationY: 0 },
  tvStand: { position: [2.5, 0, -2.3], rotationY: 0 },
};

function cloneItem(product) {
  const layout = DEFAULT_LAYOUT[product.category];
  return {
    ...product,
    deleted: false,
    position: [...layout.position],
    rotationY: layout.rotationY,
  };
}

function getAllCombos() {
  const combos = [];
  for (const sofa of CATALOG.sofa) {
    for (const coffeeTable of CATALOG.coffeeTable) {
      for (const tvStand of CATALOG.tvStand) {
        combos.push([sofa, coffeeTable, tvStand]);
      }
    }
  }
  return combos;
}

function getComboPrice(combo) {
  return combo.reduce((sum, item) => sum + item.price, 0);
}

function buildDesignWithinBudget(budget) {
  const combos = getAllCombos();
  const valid = combos.filter((combo) => getComboPrice(combo) <= budget);

  let selectedCombo;

  if (valid.length > 0) {
    selectedCombo = valid.sort(
      (a, b) => getComboPrice(b) - getComboPrice(a)
    )[0];
  } else {
    selectedCombo = combos.sort(
      (a, b) => getComboPrice(a) - getComboPrice(b)
    )[0];
  }

  return selectedCombo.map((item) => cloneItem(item));
}

function calculateVisibleTotal(items) {
  return items
    .filter((item) => !item.deleted)
    .reduce((sum, item) => sum + item.price, 0);
}

function getItemLabel(category) {
  if (category === "sofa") return "Sofa";
  if (category === "coffeeTable") return "Coffee Table";
  if (category === "tvStand") return "TV Table";
  return category;
}

function getOtherOptions(category, currentId) {
  return CATALOG[category].filter((item) => item.id !== currentId);
}

function chooseReplacement(currentItems, targetItem, budget) {
  const othersTotal = currentItems
    .filter((item) => item.id !== targetItem.id && !item.deleted)
    .reduce((sum, item) => sum + item.price, 0);

  const candidates = getOtherOptions(targetItem.category, targetItem.id)
    .filter((option) => othersTotal + option.price <= budget)
    .sort((a, b) => b.price - a.price);

  if (candidates.length > 0) {
    const replacement = cloneItem(candidates[0]);
    replacement.position = [...targetItem.position];
    replacement.rotationY = targetItem.rotationY;
    return replacement;
  }

  const fallback = getOtherOptions(targetItem.category, targetItem.id).sort(
    (a, b) => a.price - b.price
  )[0];

  if (!fallback) return targetItem;

  const replacement = cloneItem(fallback);
  replacement.position = [...targetItem.position];
  replacement.rotationY = targetItem.rotationY;
  return replacement;
}

/* =========================
   3D ROOM
   ========================= */

function RoomShell() {
  return (
    <>
      <color attach="background" args={["#eef2f7"]} />

      <ambientLight intensity={0.95} />
      <directionalLight
        position={[8, 10, 6]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-6, 5, -3]} intensity={0.35} />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[14, 11]} />
        <meshStandardMaterial color="#ddc7a7" />
      </mesh>

      <mesh position={[0, 2.6, -5.3]} receiveShadow>
        <boxGeometry args={[14, 5.2, 0.2]} />
        <meshStandardMaterial color="#eee9e1" />
      </mesh>

      <mesh position={[-7, 2.6, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5.2, 11]} />
        <meshStandardMaterial color="#f6f2ec" />
      </mesh>

      <mesh position={[7, 2.6, 0]} receiveShadow>
        <boxGeometry args={[0.2, 5.2, 11]} />
        <meshStandardMaterial color="#f6f2ec" />
      </mesh>

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[-0.1, 0.01, 0.6]}
        receiveShadow
      >
        <planeGeometry args={[5.4, 3.3]} />
        <meshStandardMaterial color="#d9d0f2" />
      </mesh>

      <mesh position={[-5.8, 2.2, -2.8]}>
        <boxGeometry args={[0.12, 1.7, 1.5]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-5.72, 2.2, -2.8]}>
        <boxGeometry args={[0.05, 1.45, 1.25]} />
        <meshStandardMaterial color="#cfe5ff" />
      </mesh>

      <group position={[5.3, 0, 2.2]}>
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

function ItemPlane({
  item,
  isSelected,
  transformMode,
  onSelect,
  onUpdate,
  orbitRef,
}) {
  const groupRef = useRef(null);
  const texture = useTexture(item.image);

  const width = item.visual.width;
  const height = item.visual.height;
  const y = item.visual.y;

  const saveTransform = () => {
    if (!groupRef.current) return;
    onUpdate(item.id, {
      position: [
        Number(groupRef.current.position.x.toFixed(2)),
        0,
        Number(groupRef.current.position.z.toFixed(2)),
      ],
      rotationY: Number(groupRef.current.rotation.y.toFixed(2)),
    });
  };

  return (
    <>
      <group
        ref={groupRef}
        position={item.position}
        rotation={[0, item.rotationY, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(item.id);
        }}
      >
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, 0.02, 0]}
          receiveShadow
        >
          <circleGeometry args={[Math.max(width * 0.42, 0.5), 32]} />
          <meshStandardMaterial color="#000000" transparent opacity={0.12} />
        </mesh>

        <mesh position={[0, y, 0]} castShadow receiveShadow>
          <planeGeometry args={[width, height]} />
          <meshStandardMaterial map={texture} transparent />
        </mesh>

        {isSelected && (
          <Html position={[0, y + height / 2 + 0.25, 0]} center>
            <div className="item-badge">{item.name}</div>
          </Html>
        )}
      </group>

      {isSelected && groupRef.current && !item.deleted && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          showX
          showY={false}
          showZ
          onMouseDown={() => {
            if (orbitRef.current) orbitRef.current.enabled = false;
          }}
          onMouseUp={() => {
            if (orbitRef.current) orbitRef.current.enabled = true;
            saveTransform();
          }}
          onObjectChange={saveTransform}
        />
      )}
    </>
  );
}
function Scene({
  items,
  selectedId,
  setSelectedId,
  transformMode,
  updateItemPose,
}) {
  const orbitRef = useRef(null);

  return (
    <Canvas shadows camera={{ position: [6.8, 4.8, 8.5], fov: 42 }}>
      <RoomShell />

      {items
        .filter((item) => !item.deleted)
        .map((item) => (
          <ItemPlane
            key={item.id}
            item={item}
            isSelected={selectedId === item.id}
            transformMode={transformMode}
            onSelect={setSelectedId}
            onUpdate={updateItemPose}
            orbitRef={orbitRef}
          />
        ))}

      <OrbitControls
        ref={orbitRef}
        target={[0, 1, 0]}
        minDistance={5}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2.02}
      />
    </Canvas>
  );
}

/* =========================
   PAGE 1
   ========================= */

function SetupPage({
  budget,
  setBudget,
  roomType,
  setRoomType,
  onGenerate,
}) {
  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-kicker">Smart Furnish</div>
        <h1>Design your room within budget</h1>
        <p className="setup-subtitle">
          Enter your budget, select a room, and generate a furnished 3D layout.
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
          <select
            value={roomType}
            onChange={(e) => setRoomType(e.target.value)}
          >
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

/* =========================
   PAGE 2
   ========================= */

function ItemCard({
  item,
  selected,
  onSelect,
  onChangeItem,
  onDeleteItem,
  onRotateLeft,
  onRotateRight,
}) {
  return (
    <div className={`workspace-card ${selected ? "selected-card" : ""}`}>
      <img src={item.image} alt={item.name} />
      <div className="workspace-card-content">
        <div className="workspace-card-category">
          {getItemLabel(item.category)}
        </div>
        <div className="workspace-card-title">{item.name}</div>
        <div className="workspace-card-price">
          {item.deleted ? "$0 (removed)" : `$${item.price}`}
        </div>

        <div className="workspace-card-actions">
          <button onClick={onSelect}>Select</button>
          <button onClick={onChangeItem}>Change</button>
          <button onClick={onDeleteItem}>
            {item.deleted ? "Restore" : "Delete"}
          </button>
        </div>

        <div className="workspace-card-actions secondary">
          <button onClick={onRotateLeft}>Rotate -</button>
          <button onClick={onRotateRight}>Rotate +</button>
        </div>
      </div>
    </div>
  );
}

function WorkspacePage({
  budget,
  roomType,
  items,
  setItems,
  selectedId,
  setSelectedId,
  onBack,
  onRegenerateAll,
}) {
  const [transformMode, setTransformMode] = useState("translate");

  const selectedItem = items.find((item) => item.id === selectedId) || null;
  const visibleTotal = calculateVisibleTotal(items);
  const roomTitle = roomType === "living" ? "Living Room" : "Room";

  const updateItemPose = (itemId, pose) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              position: pose.position ?? item.position,
              rotationY:
                typeof pose.rotationY === "number"
                  ? pose.rotationY
                  : item.rotationY,
            }
          : item
      )
    );
  };

  const rotateItem = (itemId, delta) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, rotationY: Number((item.rotationY + delta).toFixed(2)) }
          : item
      )
    );
  };

  const toggleDeleteItem = (itemId) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, deleted: !item.deleted } : item
      )
    );
  };

  const changeItem = (itemId) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === itemId);
      if (!target) return prev;

      const replacement = chooseReplacement(prev, target, budget);

      return prev.map((item) => (item.id === itemId ? replacement : item));
    });
    setSelectedId(null);
  };

  return (
    <div className="workspace-page">
      <div className="workspace-topbar">
        <div>
          <div className="workspace-title">Your {roomTitle} Concept</div>
          <div className="workspace-subtitle">
            Rotate the room, select items, drag them, rotate them, delete them,
            or regenerate the design.
          </div>
        </div>

        <div className="budget-pill">
          <span>Budget</span>
          <strong>
            ${visibleTotal} / ${budget}
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
              Move Selected
            </button>
            <button
              className={transformMode === "rotate" ? "tool-active" : ""}
              onClick={() => setTransformMode("rotate")}
            >
              Rotate Selected
            </button>
            <button onClick={onBack}>Back</button>
          </div>

          <div className="viewer-frame">
            <Scene
              items={items}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              transformMode={transformMode}
              updateItemPose={updateItemPose}
            />
          </div>

          <div className="helper-bar">
            <span>Tip: Click an item to select it.</span>
            <span>Use Move Selected to drag it around.</span>
            <span>Use Rotate Selected to rotate it.</span>
          </div>
        </div>

        <div className="workspace-right">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              selected={selectedId === item.id}
              onSelect={() => setSelectedId(item.id)}
              onChangeItem={() => changeItem(item.id)}
              onDeleteItem={() => toggleDeleteItem(item.id)}
              onRotateLeft={() => rotateItem(item.id, -0.2)}
              onRotateRight={() => rotateItem(item.id, 0.2)}
            />
          ))}

          <button className="regen-full-button" onClick={onRegenerateAll}>
            Regenerate Full Design
          </button>

          {selectedItem && (
            <div className="selection-panel">
              <div className="selection-heading">Selected Item</div>
              <div className="selection-title">{selectedItem.name}</div>
              <div className="selection-meta">
                Mode:{" "}
                {transformMode === "translate" ? "Move / Drag" : "Rotate"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================
   APP
   ========================= */

export default function App() {
  const [page, setPage] = useState("setup");
  const [budget, setBudget] = useState(2000);
  const [roomType, setRoomType] = useState("living");
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  const numericBudget = useMemo(() => Number(budget) || 0, [budget]);

  const handleGenerate = () => {
    const generated = buildDesignWithinBudget(numericBudget);
    setItems(generated);
    setSelectedId(null);
    setPage("workspace");
  };

  const handleRegenerateAll = () => {
    const regenerated = buildDesignWithinBudget(numericBudget);
    setItems(regenerated);
    setSelectedId(null);
  };

  return (
    <div className="app-shell">
      {page === "setup" ? (
        <SetupPage
          budget={budget}
          setBudget={setBudget}
          roomType={roomType}
          setRoomType={setRoomType}
          onGenerate={handleGenerate}
        />
      ) : (
        <WorkspacePage
          budget={numericBudget}
          roomType={roomType}
          items={items}
          setItems={setItems}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          onBack={() => setPage("setup")}
          onRegenerateAll={handleRegenerateAll}
        />
      )}
    </div>
  );
}