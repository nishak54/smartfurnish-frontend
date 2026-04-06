import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  TransformControls,
  Environment,
} from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

const API_BASE =
  process.env.REACT_APP_API_BASE || "https://smartfurnish-backend.onrender.com";

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
    visualWidth: 7.2,
    footprintWidth: 5.9,
    footprintDepth: 1.6,
    minScale: 0.9,
    maxScale: 1.6,
    details: {
      rating: "4.4",
      purchases: "1,280+",
      material: "Fabric",
      inStock: "Yes",
      condition: "New",
      dimensions: '84" W × 35" D × 34" H',
      color: "Dark Green",
      style: "Modern",
    },
  },
  {
    id: "sofa2",
    name: "Sofa 2",
    price: 720,
    imagePath: "/assets/items/sofa/sofa2.webp",
    visualWidth: 7.2,
    footprintWidth: 5.9,
    footprintDepth: 1.6,
    minScale: 0.9,
    maxScale: 1.6,
    details: {
      rating: "4.6",
      purchases: "2,030+",
      material: "Linen Blend",
      inStock: "Yes",
      condition: "New",
      dimensions: '88" W × 36" D × 35" H',
      color: "Dark Green",
      style: "Minimal",
    },
  },
  {
    id: "sofa3",
    name: "Sofa 3",
    price: 810,
    imagePath: "/assets/items/sofa/sofa3.webp",
    visualWidth: 7.0,
    footprintWidth: 5.7,
    footprintDepth: 1.55,
    minScale: 0.9,
    maxScale: 1.6,
    details: {
      rating: "4.3",
      purchases: "860+",
      material: "Velvet",
      inStock: "Limited",
      condition: "Used",
      dimensions: '82" W × 34" D × 33" H',
      color: "Dark Green",
      style: "Curved Modern",
    },
  },
];

const TABLE_OPTIONS = [
  {
    id: "table1",
    name: "Center Table 1",
    price: 220,
    imagePath: "/assets/items/tables/table1.webp",
    visualWidth: 4.4,
    footprintWidth: 3.3,
    footprintDepth: 1.9,
    minScale: 0.9,
    maxScale: 1.35,
    details: {
      rating: "4.5",
      purchases: "940+",
      material: "Engineered Wood",
      inStock: "Yes",
      condition: "New",
      dimensions: '42" W × 22" D × 18" H',
      color: "Beige",
      style: "Modern",
    },
  },
  {
    id: "table2",
    name: "Center Table 2",
    price: 260,
    imagePath: "/assets/items/tables/table2.webp",
    visualWidth: 4.4,
    footprintWidth: 3.3,
    footprintDepth: 1.9,
    minScale: 0.9,
    maxScale: 1.35,
    details: {
      rating: "4.2",
      purchases: "610+",
      material: "Solid Wood",
      inStock: "Yes",
      condition: "New",
      dimensions: '40" W × 24" D × 17" H',
      color: "Beige",
      style: "Minimal",
    },
  },
  {
    id: "table3",
    name: "Center Table 3",
    price: 310,
    imagePath: "/assets/items/tables/table3.webp",
    visualWidth: 4.4,
    footprintWidth: 3.3,
    footprintDepth: 1.9,
    minScale: 0.9,
    maxScale: 1.35,
    details: {
      rating: "4.7",
      purchases: "1,420+",
      material: "Tempered Glass + Metal",
      inStock: "Yes",
      condition: "New",
      dimensions: '44" W × 24" D × 18" H',
      color: "Beige",
      style: "Luxury Modern",
    },
  },
];

const TV_STAND_OPTIONS = [
  { id: "tv1", name: "Modern TV Stand", price: 340 },
  { id: "tv2", name: "Walnut TV Console", price: 420 },
  { id: "tv3", name: "Compact Media Unit", price: 280 },
];

const FLOOR_LAMP_OPTIONS = [
  { id: "lamp1", name: "Arc Floor Lamp", price: 110 },
  { id: "lamp2", name: "Minimal Floor Lamp", price: 95 },
  { id: "lamp3", name: "Tripod Lamp", price: 135 },
];

const RUG_OPTIONS = [
  { id: "rug1", name: "Soft Area Rug", price: 180 },
  { id: "rug2", name: "Modern Pattern Rug", price: 220 },
  { id: "rug3", name: "Neutral Living Rug", price: 160 },
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeAngle(angle) {
  let a = angle % (Math.PI * 2);
  if (a > Math.PI) a -= Math.PI * 2;
  if (a < -Math.PI) a += Math.PI * 2;
  return a;
}

function snapRotationY(angle) {
  const snaps = [0, Math.PI / 2, Math.PI, -Math.PI / 2];
  let best = snaps[0];
  let minDiff = Infinity;

  for (const candidate of snaps) {
    const diff = Math.abs(normalizeAngle(angle - candidate));
    if (diff < minDiff) {
      minDiff = diff;
      best = candidate;
    }
  }

  return minDiff < 0.22 ? best : angle;
}

function getFootprint(item, scale, rotationY) {
  const snapped = snapRotationY(rotationY);
  const isSideways =
    Math.abs(Math.abs(normalizeAngle(snapped)) - Math.PI / 2) < 0.01;

  const baseWidth = item.footprintWidth || item.visualWidth || 4;
  const baseDepth = item.footprintDepth || 1.2;

  return {
    width: (isSideways ? baseDepth : baseWidth) * scale,
    depth: (isSideways ? baseWidth : baseDepth) * scale,
  };
}

function snapToWalls(position, item, scale, rotationY) {
  const wallGap = item.id.startsWith("sofa") ? 0.22 : 0.18;
  const snapThreshold = 0.45;
  const { width, depth } = getFootprint(item, scale, rotationY);

  let [x, , z] = position;

  const minX = ROOM.leftWallX + width / 2 + wallGap;
  const maxX = ROOM.rightWallX - width / 2 - wallGap;
  const minZ = ROOM.backWallZ + depth / 2 + wallGap;
  const maxZ = ROOM.frontLimitZ - depth / 2 - wallGap;

  x = clamp(x, minX, maxX);
  z = clamp(z, minZ, maxZ);

  if (Math.abs(x - minX) < snapThreshold) x = minX;
  if (Math.abs(x - maxX) < snapThreshold) x = maxX;
  if (Math.abs(z - minZ) < snapThreshold) z = minZ;
  if (Math.abs(z - maxZ) < snapThreshold) z = maxZ;

  return [Number(x.toFixed(2)), 0, Number(z.toFixed(2))];
}

function getDefaultLayout() {
  return {
    sofa: {
      position: [0, 0, -2.25],
      rotationY: 0,
      scale: 0.98,
    },
    table: {
      position: [0, 0, 0.55],
      rotationY: 0,
      scale: 0.92,
    },
  };
}

function useWoodTexture() {
  return useMemo(() => {
    const size = 512;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#d6b48e";
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 12; i++) {
      const y = i * 42;
      ctx.fillStyle = i % 2 === 0 ? "#d9b690" : "#cfa57f";
      ctx.fillRect(0, y, size, 36);
      ctx.strokeStyle = "rgba(95, 58, 28, 0.12)";
      ctx.lineWidth = 2;

      for (let j = 0; j < 8; j++) {
        const x = j * 64 + (i % 2) * 18;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + 14, y + 36);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 3);
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, []);
}

function useTrimmedTextureData(path) {
  const texture = useLoader(THREE.TextureLoader, path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;

  const trimmed = useMemo(() => {
    const img = texture.image;
    if (!img || !img.width || !img.height) {
      return {
        texture,
        aspect: 1,
        offsetX: 0,
        offsetY: 0,
        visibleWidthRatio: 1,
        visibleHeightRatio: 1,
      };
    }

    const canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);

    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;
    let found = false;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 10) {
          found = true;
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (!found) {
      return {
        texture,
        aspect: width / height,
        offsetX: 0,
        offsetY: 0,
        visibleWidthRatio: 1,
        visibleHeightRatio: 1,
      };
    }

    const trimmedWidth = maxX - minX + 1;
    const trimmedHeight = maxY - minY + 1;

    return {
      texture,
      aspect: trimmedWidth / trimmedHeight,
      offsetX: (minX + trimmedWidth / 2) / width - 0.5,
      offsetY: (minY + trimmedHeight / 2) / height - 0.5,
      visibleWidthRatio: trimmedWidth / width,
      visibleHeightRatio: trimmedHeight / height,
    };
  }, [texture]);

  return trimmed;
}

function SetupPage({ budget, setBudget, onGenerate }) {
  return (
    <div className="setup-page">
      <div className="setup-card">
        <div className="setup-kicker">Smart Furnish</div>
        <h1>Design your living room</h1>
        <p className="setup-subtitle">
          Enter your budget and generate a furnished living room concept.
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
function RoomDecor() {
  return (
    <>
      <group position={[5.15, 0, 2.15]}>
        <mesh position={[0, 0.28, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.56, 24]} />
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

      <group position={[-5.2, 0, 1.7]}>
        <mesh position={[0, 0.06, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.12, 30]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 2.2, 18]} />
          <meshStandardMaterial color="#6b7280" />
        </mesh>
        <mesh position={[0, 2.2, 0]}>
          <coneGeometry args={[0.42, 0.6, 30]} />
          <meshStandardMaterial color="#f3efe7" />
        </mesh>
      </group>

      <group position={[0, 2.55, -5.17]}>
        <mesh>
          <planeGeometry args={[2.1, 1.2]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[-0.45, 0.05, 0.01]}>
          <planeGeometry args={[0.5, 0.75]} />
          <meshStandardMaterial color="#d4a373" />
        </mesh>
        <mesh position={[0.2, -0.03, 0.01]}>
          <planeGeometry args={[0.8, 0.55]} />
          <meshStandardMaterial color="#84a59d" />
        </mesh>
      </group>

      <group position={[-4.8, 0, -1.8]}>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.16, 0.12, 0.68, 24]} />
          <meshStandardMaterial color="#ddd6fe" />
        </mesh>
        <mesh position={[0.05, 0.84, 0]}>
          <capsuleGeometry args={[0.05, 0.42, 4, 8]} />
          <meshStandardMaterial color="#7fb069" />
        </mesh>
        <mesh position={[-0.06, 0.9, 0.04]}>
          <capsuleGeometry args={[0.04, 0.32, 4, 8]} />
          <meshStandardMaterial color="#6aa84f" />
        </mesh>
      </group>
    </>
  );
}

function RoomShell() {
  const woodTexture = useWoodTexture();

  return (
    <>
      <color attach="background" args={["#eef2f7"]} />
      <Environment preset="apartment" />
      <ambientLight intensity={0.65} />
      <directionalLight position={[4, 7, 6]} intensity={0.8} />
      <directionalLight position={[-5, 4, -3]} intensity={0.15} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM.floorWidth, ROOM.floorDepth]} />
        <meshStandardMaterial
          map={woodTexture}
          roughness={0.82}
          metalness={0.04}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.4]}>
        <planeGeometry args={[5.8, 3.6]} />
        <meshStandardMaterial color="#d8d0f0" roughness={0.92} />
      </mesh>

      <mesh position={[0, 2.6, ROOM.backWallZ]}>
        <boxGeometry args={[ROOM.floorWidth, 5.2, 0.2]} />
        <meshStandardMaterial color="#f1ece5" roughness={1} />
      </mesh>

      <mesh position={[ROOM.leftWallX, 2.6, 0]}>
        <boxGeometry args={[0.2, 5.2, ROOM.floorDepth]} />
        <meshStandardMaterial color="#faf6f0" roughness={1} />
      </mesh>

      <mesh position={[ROOM.rightWallX, 2.6, 0]}>
        <boxGeometry args={[0.2, 5.2, ROOM.floorDepth]} />
        <meshStandardMaterial color="#faf6f0" roughness={1} />
      </mesh>

      <mesh position={[-5.8, 2.2, -2.7]}>
        <boxGeometry args={[0.12, 1.7, 1.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-5.72, 2.2, -2.7]}>
        <boxGeometry args={[0.05, 1.45, 1.3]} />
        <meshStandardMaterial
          color="#d6edff"
          emissive="#cde7ff"
          emissiveIntensity={0.25}
        />
      </mesh>

      <RoomDecor />
    </>
  );
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
  const groupRef = useRef(null);
  const {
    texture,
    aspect,
    offsetX,
    offsetY,
    visibleWidthRatio,
    visibleHeightRatio,
  } = useTrimmedTextureData(item.imagePath);

  const baseVisualWidth = item.visualWidth || 4;
  const visibleWidth = baseVisualWidth;
  const visibleHeight = visibleWidth / aspect;

  const fullPlaneWidth = visibleWidth / visibleWidthRatio;
  const fullPlaneHeight = visibleHeight / visibleHeightRatio;

  const offsetWorldX = offsetX * fullPlaneWidth;
  const offsetWorldY = offsetY * fullPlaneHeight;

  const visualLift = item.id.startsWith("sofa")
    ? visibleHeight / 2 - 0.02
    : visibleHeight / 2 - 0.01;

  const saveTransform = () => {
    if (!groupRef.current) return;

    let x = groupRef.current.position.x;
    let z = groupRef.current.position.z;
    let ry = groupRef.current.rotation.y;
    let s = groupRef.current.scale.x;

    s = clamp(s, item.minScale, item.maxScale);
    ry = snapRotationY(ry);

    const snappedPos = snapToWalls([x, 0, z], item, s, ry);

    groupRef.current.position.set(snappedPos[0], 0, snappedPos[2]);
    groupRef.current.rotation.set(0, ry, 0);
    groupRef.current.scale.set(s, s, s);

    setItemState({
      position: snappedPos,
      rotationY: Number(ry.toFixed(2)),
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
        position={itemState.position}
        rotation={[0, itemState.rotationY, 0]}
        scale={[itemState.scale, itemState.scale, itemState.scale]}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedId(item.id);
        }}
      >
        {!item.id.startsWith("sofa") && (
          <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[visibleWidth * 0.9, visibleWidth * 0.52]} />
            <meshBasicMaterial transparent opacity={0.12} color="#000000" />
          </mesh>
        )}

        {item.id.startsWith("sofa") && (
          <mesh position={[0, 0.03, -0.08]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[visibleWidth * 0.95, visibleWidth * 0.28]} />
            <meshBasicMaterial transparent opacity={0.1} color="#000000" />
          </mesh>
        )}

        <mesh position={[offsetWorldX, visualLift + offsetWorldY, 0]}>
          <planeGeometry args={[fullPlaneWidth, fullPlaneHeight]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.02}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {selected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          size={0.95}
          space="local"
          {...axisProps}
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

function CameraController() {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 4.2, 11.5);
    camera.fov = 30;
    camera.lookAt(0, 1.15, 0);
    camera.updateProjectionMatrix();
  }, [camera]);

  return null;
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
    <Canvas
      camera={{ position: [0, 4.2, 11.5], fov: 30 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMissed={() => setSelectedId(null)}
    >
      <CameraController />

      <Suspense fallback={null}>
        <RoomShell />

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

      <OrbitControls
        ref={orbitRef}
        target={[0, 1.15, 0]}
        minDistance={5}
        maxDistance={26}
        maxPolarAngle={Math.PI / 2.02}
      />
    </Canvas>
  );
}

function ProductCard({ item, active, label, onUse }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className={`product-card ${active ? "active-card" : ""}`}>
      <div className="product-image-wrap">
        <img src={item.imagePath} alt={item.name} className="product-image" />
      </div>

      <div className="product-content">
        <div className="product-top-row">
          <div>
            <div className="product-label">{label}</div>
            <div className="product-name">{item.name}</div>
          </div>
          <div className="product-price">${item.price}</div>
        </div>

        <div className="product-actions">
          <button
            className="product-btn product-btn-primary"
            onClick={() => onUse(item)}
          >
            Use This
          </button>
          <button
            className="product-btn product-btn-secondary"
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? "Hide Details" : "Details"}
          </button>
        </div>

        {showDetails && (
          <div className="product-details-card">
            <div className="product-details-grid">
              <div className="product-detail-item">
                <span className="detail-key">Rating</span>
                <span className="detail-value">⭐ {item.details.rating}</span>
              </div>
              <div className="product-detail-item">
                <span className="detail-key">Purchases</span>
                <span className="detail-value">{item.details.purchases}</span>
              </div>
              <div className="product-detail-item">
                <span className="detail-key">Material</span>
                <span className="detail-value">{item.details.material}</span>
              </div>
              <div className="product-detail-item">
                <span className="detail-key">Stock</span>
                <span className="detail-value">{item.details.inStock}</span>
              </div>
              <div className="product-detail-item">
                <span className="detail-key">Condition</span>
                <span className="detail-value">{item.details.condition}</span>
              </div>
              <div className="product-detail-item product-detail-item-full">
                <span className="detail-key">Dimensions</span>
                <span className="detail-value">{item.details.dimensions}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OptionSection({ title, items, activeId, label, onUse, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="option-section">
      <button
        className="option-section-header"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="option-section-body">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              item={item}
              active={activeId === item.id}
              label={label}
              onUse={onUse}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DummyProductCard({ item, label }) {
  return (
    <div className="dummy-card">
      <div className="dummy-card-icon">{label.slice(0, 1)}</div>
      <div className="dummy-card-content">
        <div className="dummy-card-label">{label}</div>
        <div className="dummy-card-name">{item.name}</div>
        <div className="dummy-card-price">${item.price}</div>
      </div>
    </div>
  );
}

function DummyOptionSection({ title, items, label }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="option-section">
      <button
        className="option-section-header"
        onClick={() => setOpen((v) => !v)}
      >
        <span>{title}</span>
        <span>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="option-section-body">
          {items.map((item) => (
            <DummyProductCard key={item.id} item={item} label={label} />
          ))}
        </div>
      )}
    </div>
  );
}

function buildScenePayload({
  selectedSofa,
  selectedTable,
  sofaState,
  tableState,
  budget,
}) {
  return {
    roomType: "living_room",
    view: "front",
    budget: Number(budget) || 0,
    scene: {
      sofa: {
        id: selectedSofa.id,
        name: selectedSofa.name,
        imagePath: selectedSofa.imagePath,
        position: sofaState.position,
        rotationY: sofaState.rotationY,
        scale: sofaState.scale,
        material: selectedSofa.details?.material || "",
        color: selectedSofa.details?.color || "Dark Green",
        style: selectedSofa.details?.style || "Modern",
        dimensions: selectedSofa.details?.dimensions || "",
      },
      table: {
        id: selectedTable.id,
        name: selectedTable.name,
        imagePath: selectedTable.imagePath,
        position: tableState.position,
        rotationY: tableState.rotationY,
        scale: tableState.scale,
        material: selectedTable.details?.material || "",
        color: selectedTable.details?.color || "Beige",
        style: selectedTable.details?.style || "Modern",
        dimensions: selectedTable.details?.dimensions || "",
      },
    },
  };
}

function RealViewCard({ imageUrl, loading, error, onGenerate }) {
  return (
    <div className="panel-card split-panel-card">
      <div className="panel-header">
        <div>
          <div className="panel-title">Real View</div>
          <div className="panel-subtitle">
            Realistic front-view preview generated from your selected layout.
          </div>
        </div>
      </div>

      {loading && (
        <div className="real-view-placeholder split-placeholder">
          Generating natural front view...
        </div>
      )}

      {!loading && error && (
        <div className="real-view-error split-placeholder">{error}</div>
      )}

      {!loading && !error && !imageUrl && (
        <div className="real-view-placeholder split-placeholder">
          <div className="empty-realview-content">
            <div>Finalize your 3D layout and generate a realistic preview.</div>
            <button className="primary-button" onClick={onGenerate}>
              Generate Real View
            </button>
          </div>
        </div>
      )}

      {!loading && !error && imageUrl && (
        <div className="real-view-image-wrap split-real-view">
          <img
            src={imageUrl}
            alt="Generated realistic living room"
            className="real-view-image"
          />
        </div>
      )}
    </div>
  );
}

function CompareOverlay({
  onClose,
  realViewImageUrl,
  selectedSofa,
  selectedTable,
  sofaState,
  setSofaState,
  tableState,
  setTableState,
}) {
  const [selectedId, setSelectedId] = useState(null);
  const [transformMode] = useState("translate");

  return (
    <div className="compare-overlay">
      <div className="compare-topbar">
        <button onClick={onClose} aria-label="Back">
          ←
        </button>
        <div className="compare-title">Compare 3D vs Real View</div>
      </div>

      <div className="compare-grid">
        <div className="compare-panel">
          <div className="compare-panel-title">3D</div>
          <div className="viewer-frame compare-viewer-frame">
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
          </div>
        </div>

        <div className="compare-panel">
          <div className="compare-panel-title">Real View</div>
          <div className="compare-image-wrap">
            {realViewImageUrl ? (
              <img
                src={realViewImageUrl}
                alt="Real view comparison"
                className="compare-image"
              />
            ) : (
              <div className="real-view-placeholder">No real view image</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function RealViewFullscreen({ imageUrl, onBack, onCompare, loading, error }) {
  return (
    <div className="realview-fullscreen">
      <div className="realview-fullscreen-topbar">
        <button onClick={onBack} aria-label="Back">
          ←
        </button>
        <div className="realview-fullscreen-title">Real View</div>
        <button onClick={onCompare} disabled={!imageUrl || loading}>
          Compare
        </button>
      </div>

      <div className="realview-fullscreen-body">
        {loading && (
          <div className="real-view-placeholder big-real-placeholder">
            Generating natural front view...
          </div>
        )}

        {!loading && error && (
          <div className="real-view-error big-real-placeholder">{error}</div>
        )}

        {!loading && !error && imageUrl && (
          <div className="realview-big-image-wrap">
            <img
              src={imageUrl}
              alt="Realistic generated room"
              className="realview-big-image"
            />
          </div>
        )}
      </div>
    </div>
  );
}

function SceneQuickMenu({
  open,
  onClose,
  transformMode,
  setTransformMode,
  onGenerateRealView,
  onToggleRecommendations,
  recommendationsOpen,
}) {
  if (!open) return null;

  return (
    <div className="scene-quick-menu">
      <button
        className={transformMode === "translate" ? "menu-active" : ""}
        onClick={() => {
          setTransformMode("translate");
          onClose();
        }}
      >
        Move
      </button>

      <button
        className={transformMode === "rotate" ? "menu-active" : ""}
        onClick={() => {
          setTransformMode("rotate");
          onClose();
        }}
      >
        Rotate
      </button>

      <button
        className={transformMode === "scale" ? "menu-active" : ""}
        onClick={() => {
          setTransformMode("scale");
          onClose();
        }}
      >
        Resize
      </button>

      <button
        onClick={() => {
          onGenerateRealView();
          onClose();
        }}
      >
        Generate Real View
      </button>

      <button
        onClick={() => {
          onToggleRecommendations();
          onClose();
        }}
      >
        {recommendationsOpen ? "Hide Recommended Items" : "Show Recommended Items"}
      </button>
    </div>
  );
}

function LivingRoomView({
  selectedSofa,
  setSelectedSofa,
  selectedTable,
  setSelectedTable,
  budget,
  onBack,
  sofaState,
  setSofaState,
  tableState,
  setTableState,
}) {
  const [transformMode, setTransformMode] = useState("translate");
  const [selectedId, setSelectedId] = useState(null);

  const [realViewImageUrl, setRealViewImageUrl] = useState("");
  const [realViewLoading, setRealViewLoading] = useState(false);
  const [realViewError, setRealViewError] = useState("");

  const [workspaceMode, setWorkspaceMode] = useState("design");
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showSceneMenu, setShowSceneMenu] = useState(false);

  const totalCost = selectedSofa.price + selectedTable.price;
  const withinBudget = totalCost <= budget;

const clearRealView = () => {
  setRealViewImageUrl("");
  setRealViewError("");
  setWorkspaceMode("design");
};

  const handleRegenerate = () => {
    const nextSofa =
      SOFA_OPTIONS[Math.floor(Math.random() * SOFA_OPTIONS.length)];
    const nextTable =
      TABLE_OPTIONS[Math.floor(Math.random() * TABLE_OPTIONS.length)];

    setSelectedSofa(nextSofa);
    setSelectedTable(nextTable);
    setSelectedId(null);
    setTransformMode("translate");
    clearRealView();

    const layout = getDefaultLayout();
    setSofaState(layout.sofa);
    setTableState(layout.table);
  };

  const handleGenerateRealView = async () => {
    try {
      setRealViewLoading(true);
      setRealViewError("");

      const payload = buildScenePayload({
        selectedSofa,
        selectedTable,
        sofaState,
        tableState,
        budget,
      });

      const response = await fetch(`${API_BASE}/generate-real-image`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      let data = {};

      if (rawText) {
        try {
          data = JSON.parse(rawText);
        } catch (e) {
          throw new Error(
            `Server returned non-JSON response: ${rawText.slice(0, 200)}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.error || `Request failed with status ${response.status}`
        );
      }

      if (!data.imageUrl) {
        throw new Error("No generated image returned from backend");
      }

      setRealViewImageUrl(data.imageUrl);
      setWorkspaceMode("compare");
    } catch (error) {
      setRealViewError(error.message || "Something went wrong");
      setWorkspaceMode("compare");
    } finally {
      setRealViewLoading(false);
    }
  };

  return (
    <>
      <div className="workspace-page redesigned-workspace">
        <div className="workspace-topbar redesigned-topbar">
          <div>
            <div className="workspace-title">Living Room Concept</div>
            <div className="workspace-subtitle">
              Arrange your furniture in 3D, then preview the same setup in a realistic room image.
            </div>
          </div>

          <div className="topbar-actions">
            <div className="budget-pill">
              <span>Budget</span>
              <strong className={withinBudget ? "budget-good" : "budget-bad"}>
                ${totalCost}
              </strong>
              <span>/ ${budget}</span>
            </div>

            <button className="ghost-button" onClick={onBack} aria-label="Back">
              ←
            </button>
          </div>
        </div>

        {workspaceMode === "design" && (
          <div className={`design-layout ${showRecommendations ? "drawer-open" : ""}`}>
            <div className="design-main">
              <div className="panel-card">
                <div className="panel-header scene-panel-header">
                  <div>
                    <div className="panel-title">3D Scene</div>
                    <div className="panel-subtitle">
                      Position, rotate, and scale your selected items.
                    </div>
                  </div>

                  <div className="scene-panel-actions">
                    <button
                      className="icon-button"
                      onClick={handleRegenerate}
                      aria-label="Regenerate View"
                      title="Regenerate View"
                    >
                      ↻
                    </button>

                    <div className="scene-menu-wrap">
                      <button
                        className="icon-button"
                        onClick={() => setShowSceneMenu((v) => !v)}
                        aria-label="More actions"
                        title="More actions"
                      >
                        ⋯
                      </button>

                      <SceneQuickMenu
                        open={showSceneMenu}
                        onClose={() => setShowSceneMenu(false)}
                        transformMode={transformMode}
                        setTransformMode={setTransformMode}
                        onGenerateRealView={handleGenerateRealView}
                        onToggleRecommendations={() =>
                          setShowRecommendations((v) => !v)
                        }
                        recommendationsOpen={showRecommendations}
                      />
                    </div>
                  </div>
                </div>

                <div className="viewer-frame hero-scene-frame">
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
                </div>
              </div>
            </div>

            {showRecommendations && (
              <aside className="design-drawer">
                <div className="recommendation-header">Recommended Items</div>

                <OptionSection
                  title="Sofas"
                  items={SOFA_OPTIONS}
                  activeId={selectedSofa.id}
                  label="Sofa"
                  onUse={(nextSofa) => {
                    setSelectedSofa(nextSofa);
                    setSelectedId(null);
                    setTransformMode("translate");
                    clearRealView();
                  }}
                  defaultOpen={true}
                />

                <OptionSection
                  title="Center Tables"
                  items={TABLE_OPTIONS}
                  activeId={selectedTable.id}
                  label="Center Table"
                  onUse={(nextTable) => {
                    setSelectedTable(nextTable);
                    setSelectedId(null);
                    setTransformMode("translate");
                    clearRealView();
                  }}
                />

                <DummyOptionSection
                  title="TV Stands"
                  items={TV_STAND_OPTIONS}
                  label="TV Stand"
                />

                <DummyOptionSection
                  title="Floor Lamps"
                  items={FLOOR_LAMP_OPTIONS}
                  label="Floor Lamp"
                />

                <DummyOptionSection
                  title="Rugs"
                  items={RUG_OPTIONS}
                  label="Rug"
                />
              </aside>
            )}
          </div>
        )}

        {workspaceMode === "compare" && (
  <div className="split-layout-equal">
    <div className="split-half">
      <div className="panel-card split-panel-card">
        <div className="panel-header">
          <div>
            <div className="panel-title">3D Scene</div>
            <div className="panel-subtitle">
              Position, rotate, and scale your selected items.
            </div>
          </div>

          <div className="scene-panel-actions">
            <button
              className="icon-button"
              onClick={() => setWorkspaceMode("design")}
              title="Back to design"
            >
              ←
            </button>
          </div>
        </div>

        <div className="viewer-frame split-scene-frame">
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
        </div>
      </div>
    </div>

    <div className="split-half">
      <RealViewCard
        imageUrl={realViewImageUrl}
        loading={realViewLoading}
        error={realViewError}
        onGenerate={handleGenerateRealView}
      />
    </div>
  </div>
)}

      </div>
    </>
  );
}

export default function App() {
  const [page, setPage] = useState("setup");
  const [budget, setBudget] = useState(2000);
  const [selectedSofa, setSelectedSofa] = useState(SOFA_OPTIONS[1]);
  const [selectedTable, setSelectedTable] = useState(TABLE_OPTIONS[0]);
  const [sofaState, setSofaState] = useState(getDefaultLayout().sofa);
  const [tableState, setTableState] = useState(getDefaultLayout().table);

  useEffect(() => {
    const layout = getDefaultLayout();
    setSofaState(layout.sofa);
    setTableState(layout.table);
  }, [selectedSofa, selectedTable]);

  return (
    <div className="app-shell">
      {page === "setup" ? (
        <SetupPage
          budget={budget}
          setBudget={setBudget}
          onGenerate={() => {
            const layout = getDefaultLayout();
            setSofaState(layout.sofa);
            setTableState(layout.table);
            setPage("workspace");
          }}
        />
      ) : (
        <LivingRoomView
          selectedSofa={selectedSofa}
          setSelectedSofa={setSelectedSofa}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          budget={Number(budget) || 0}
          onBack={() => setPage("setup")}
          sofaState={sofaState}
          setSofaState={setSofaState}
          tableState={tableState}
          setTableState={setTableState}
        />
      )}
    </div>
  );
}