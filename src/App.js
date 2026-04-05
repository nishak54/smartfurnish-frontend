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

function RealViewCard({ imageUrl, loading, error, onOpen, onCompare }) {
  return (
    <div className="real-view-card">
      <div className="section-head">
        <div>
          <div className="section-title">Real View</div>
          <div className="section-subtitle">
            Realistic front-view preview generated from your selected layout.
          </div>
        </div>

        {imageUrl && !loading && (
          <div className="section-actions">
            <button className="ghost-button" onClick={onCompare}>
              Compare
            </button>
            <button className="primary-button small-button" onClick={onOpen}>
              Open
            </button>
          </div>
        )}
      </div>

      {loading && (
        <div className="real-view-placeholder">
          Generating natural front view...
        </div>
      )}

      {!loading && error && <div className="real-view-error">{error}</div>}

      {!loading && !error && !imageUrl && (
        <div className="real-view-placeholder">
          Finalize your 3D layout and click <strong>Generate Real View</strong>.
        </div>
      )}

      {!loading && !error && imageUrl && (
        <div className="real-view-image-wrap compact-real-view">
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
          <div className="compare-panel-title">3D Scene</div>
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
  const [showRealViewFullscreen, setShowRealViewFullscreen] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  const totalCost = selectedSofa.price + selectedTable.price;
  const withinBudget = totalCost <= budget;

  const clearRealView = () => {
    setRealViewImageUrl("");
    setRealViewError("");
    setShowRealViewFullscreen(false);
    setShowCompare(false);
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
      setShowCompare(false);
    } catch (error) {
      setRealViewError(error.message || "Something went wrong");
    } finally {
      setRealViewLoading(false);
    }
  };

  return (
    <>
      <div className="workspace-page">
        <div className="workspace-topbar polished-topbar">
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

        <div className="tool-row polished-tool-row">
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
          <button onClick={handleRegenerate}>Regenerate View</button>
          <button className="primary-button" onClick={handleGenerateRealView}>
            Generate Real View
          </button>
        </div>

        <div className="pro-layout">
          <div className="pro-main">
            <div className="hero-grid">
              <div className="scene-card">
                <div className="section-head">
                  <div>
                    <div className="section-title">3D Scene</div>
                    <div className="section-subtitle">
                      Position, rotate, and scale your selected items.
                    </div>
                  </div>
                </div>

                <div className="viewer-frame large-scene-frame">
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

              <RealViewCard
                imageUrl={realViewImageUrl}
                loading={realViewLoading}
                error={realViewError}
                onOpen={() => setShowRealViewFullscreen(true)}
                onCompare={() => setShowCompare(true)}
              />
            </div>
          </div>

          <aside className="pro-sidebar">
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

            <DummyOptionSection title="Rugs" items={RUG_OPTIONS} label="Rug" />
          </aside>
        </div>
      </div>

      {showRealViewFullscreen && (
        <RealViewFullscreen
          imageUrl={realViewImageUrl}
          loading={realViewLoading}
          error={realViewError}
          onBack={() => {
            setShowRealViewFullscreen(false);
            setShowCompare(false);
          }}
          onCompare={() => setShowCompare(true)}
        />
      )}

      {showCompare && (
        <CompareOverlay
          onClose={() => setShowCompare(false)}
          realViewImageUrl={realViewImageUrl}
          selectedSofa={selectedSofa}
          selectedTable={selectedTable}
          sofaState={sofaState}
          setSofaState={setSofaState}
          tableState={tableState}
          setTableState={setTableState}
        />
      )}
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