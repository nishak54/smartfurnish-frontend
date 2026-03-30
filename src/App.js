import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

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
      purchases: "1,280+",
      material: "Fabric",
      inStock: "Yes",
      condition: "New",
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
      purchases: "2,030+",
      material: "Linen Blend",
      inStock: "Yes",
      condition: "New",
      dimensions: '88" W × 36" D × 35" H',
    },
  },
  {
    id: "sofa3",
    name: "Sofa 3",
    price: 810,
    imagePath: "/assets/items/sofa/sofa3.webp",
    width: 5.4,
    height: 2.8,
    minScale: 0.9,
    maxScale: 2.3,
    details: {
      rating: "4.3",
      purchases: "860+",
      material: "Velvet",
      inStock: "Limited",
      condition: "Used",
      dimensions: '82" W × 34" D × 33" H',
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
      purchases: "940+",
      material: "Engineered Wood",
      inStock: "Yes",
      condition: "New",
      dimensions: '42" W × 22" D × 18" H',
    },
  },
  {
    id: "table2",
    name: "Center Table 2",
    price: 260,
    imagePath: "/assets/items/tables/table2.webp",
    width: 3.9,
    height: 1.8,
    minScale: 0.8,
    maxScale: 2.2,
    details: {
      rating: "4.2",
      purchases: "610+",
      material: "Solid Wood",
      inStock: "Yes",
      condition: "New",
      dimensions: '40" W × 24" D × 17" H',
    },
  },
  {
    id: "table3",
    name: "Center Table 3",
    price: 310,
    imagePath: "/assets/items/tables/table3.webp",
    width: 3.9,
    height: 1.8,
    minScale: 0.8,
    maxScale: 2.2,
    details: {
      rating: "4.7",
      purchases: "1,420+",
      material: "Tempered Glass + Metal",
      inStock: "Yes",
      condition: "New",
      dimensions: '44" W × 24" D × 18" H',
    },
  },
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

  const baseWidth = item.width;
  const baseDepth = item.id.startsWith("sofa") ? 1.45 : 1.05;

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
      position: [0, 0, -1.7],
      rotationY: 0,
      scale: 1.28,
    },
    table: {
      position: [0, 0, 0.45],
      rotationY: 0,
      scale: 1.25,
    },
  };
}

function useItemTexture(path) {
  const texture = useLoader(THREE.TextureLoader, path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
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
    </>
  );
}

function RoomShell() {
  return (
    <>
      <color attach="background" args={["#eef2f7"]} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 8, 8]} intensity={1.0} />
      <directionalLight position={[-5, 5, -3]} intensity={0.18} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM.floorWidth, ROOM.floorDepth]} />
        <meshStandardMaterial color="#dec8a8" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.4]}>
        <planeGeometry args={[5.8, 3.6]} />
        <meshStandardMaterial color="#d8d0f0" />
      </mesh>

      <mesh position={[0, 2.6, ROOM.backWallZ]}>
        <boxGeometry args={[ROOM.floorWidth, 5.2, 0.2]} />
        <meshStandardMaterial color="#eee9e1" />
      </mesh>

      <mesh position={[ROOM.leftWallX, 2.6, 0]}>
        <boxGeometry args={[0.2, 5.2, ROOM.floorDepth]} />
        <meshStandardMaterial color="#f7f2eb" />
      </mesh>

      <mesh position={[ROOM.rightWallX, 2.6, 0]}>
        <boxGeometry args={[0.2, 5.2, ROOM.floorDepth]} />
        <meshStandardMaterial color="#f7f2eb" />
      </mesh>

      <mesh position={[-5.8, 2.2, -2.7]}>
        <boxGeometry args={[0.12, 1.7, 1.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-5.72, 2.2, -2.7]}>
        <boxGeometry args={[0.05, 1.45, 1.3]} />
        <meshStandardMaterial color="#cfe7ff" />
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
  const texture = useItemTexture(item.imagePath);
  const groupRef = useRef(null);

  const visualLift =
    item.id.startsWith("sofa")
      ? item.height / 2 - 0.18
      : item.height / 2 - 0.08;

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
        <mesh position={[0, visualLift, 0]}>
          <planeGeometry args={[item.width, item.height]} />
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
            saveTransform();
          }}
          onObjectChange={saveTransform}
        />
      )}
    </>
  );
}
import React, { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, TransformControls } from "@react-three/drei";
import * as THREE from "three";
import "./App.css";

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
      purchases: "1,280+",
      material: "Fabric",
      inStock: "Yes",
      condition: "New",
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
      purchases: "2,030+",
      material: "Linen Blend",
      inStock: "Yes",
      condition: "New",
      dimensions: '88" W × 36" D × 35" H',
    },
  },
  {
    id: "sofa3",
    name: "Sofa 3",
    price: 810,
    imagePath: "/assets/items/sofa/sofa3.webp",
    width: 5.4,
    height: 2.8,
    minScale: 0.9,
    maxScale: 2.3,
    details: {
      rating: "4.3",
      purchases: "860+",
      material: "Velvet",
      inStock: "Limited",
      condition: "Used",
      dimensions: '82" W × 34" D × 33" H',
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
      purchases: "940+",
      material: "Engineered Wood",
      inStock: "Yes",
      condition: "New",
      dimensions: '42" W × 22" D × 18" H',
    },
  },
  {
    id: "table2",
    name: "Center Table 2",
    price: 260,
    imagePath: "/assets/items/tables/table2.webp",
    width: 3.9,
    height: 1.8,
    minScale: 0.8,
    maxScale: 2.2,
    details: {
      rating: "4.2",
      purchases: "610+",
      material: "Solid Wood",
      inStock: "Yes",
      condition: "New",
      dimensions: '40" W × 24" D × 17" H',
    },
  },
  {
    id: "table3",
    name: "Center Table 3",
    price: 310,
    imagePath: "/assets/items/tables/table3.webp",
    width: 3.9,
    height: 1.8,
    minScale: 0.8,
    maxScale: 2.2,
    details: {
      rating: "4.7",
      purchases: "1,420+",
      material: "Tempered Glass + Metal",
      inStock: "Yes",
      condition: "New",
      dimensions: '44" W × 24" D × 18" H',
    },
  },
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

  const baseWidth = item.width;
  const baseDepth = item.id.startsWith("sofa") ? 1.45 : 1.05;

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
      position: [0, 0, -1.7],
      rotationY: 0,
      scale: 1.28,
    },
    table: {
      position: [0, 0, 0.45],
      rotationY: 0,
      scale: 1.25,
    },
  };
}

function useItemTexture(path) {
  const texture = useLoader(THREE.TextureLoader, path);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
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
    </>
  );
}

function RoomShell() {
  return (
    <>
      <color attach="background" args={["#eef2f7"]} />
      <ambientLight intensity={1.0} />
      <directionalLight position={[5, 8, 8]} intensity={1.0} />
      <directionalLight position={[-5, 5, -3]} intensity={0.18} />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[ROOM.floorWidth, ROOM.floorDepth]} />
        <meshStandardMaterial color="#dec8a8" />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0.4]}>
        <planeGeometry args={[5.8, 3.6]} />
        <meshStandardMaterial color="#d8d0f0" />
      </mesh>

      <mesh position={[0, 2.6, ROOM.backWallZ]}>
        <boxGeometry args={[ROOM.floorWidth, 5.2, 0.2]} />
        <meshStandardMaterial color="#eee9e1" />
      </mesh>

      <mesh position={[ROOM.leftWallX, 2.6, 0]}>
        <boxGeometry args={[0.2, 5.2, ROOM.floorDepth]} />
        <meshStandardMaterial color="#f7f2eb" />
      </mesh>

      <mesh position={[ROOM.rightWallX, 2.6, 0]}>
        <boxGeometry args={[0.2, 5.2, ROOM.floorDepth]} />
        <meshStandardMaterial color="#f7f2eb" />
      </mesh>

      <mesh position={[-5.8, 2.2, -2.7]}>
        <boxGeometry args={[0.12, 1.7, 1.6]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-5.72, 2.2, -2.7]}>
        <boxGeometry args={[0.05, 1.45, 1.3]} />
        <meshStandardMaterial color="#cfe7ff" />
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
  const texture = useItemTexture(item.imagePath);
  const groupRef = useRef(null);

  const visualLift =
    item.id.startsWith("sofa")
      ? item.height / 2 - 0.18
      : item.height / 2 - 0.08;

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
        <mesh position={[0, visualLift, 0]}>
          <planeGeometry args={[item.width, item.height]} />
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
            saveTransform();
          }}
          onObjectChange={saveTransform}
        />
      )}
    </>
  );
}