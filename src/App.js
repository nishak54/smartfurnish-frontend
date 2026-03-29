import React, { useMemo, useState } from "react";
import "./App.css";

const API_URL =
  process.env.REACT_APP_API_URL || "https://smartfurnish-backend.onrender.com";

const ITEM_LABELS = {
  sofa: "Sofa",
  center_table: "Center Table",
  tv_stand: "TV Stand",
};

const ANGLES = ["front", "left", "right"];

const MIN_SIZE = {
  sofa: { width: 180, height: 90 },
  center_table: { width: 95, height: 55 },
  tv_stand: { width: 120, height: 55 },
};

function App() {
  const [screen, setScreen] = useState("input");
  const [budget, setBudget] = useState(2000);
  const [style, setStyle] = useState("Modern");
  const [design, setDesign] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [detailItem, setDetailItem] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [currentAngle, setCurrentAngle] = useState("front");
  const [dragItemId, setDragItemId] = useState(null);
  const [resizeItemId, setResizeItemId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const totalCost = useMemo(() => {
    return design?.items?.reduce((sum, item) => sum + item.price, 0) || 0;
  }, [design]);

  const generateDesign = async () => {
    setScreen("loading");
    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, room: "Living Room", style }),
      });

      if (!res.ok) {
        throw new Error(`Generate failed: ${res.status}`);
      }

      const data = await res.json();
      setDesign(data);
      setSelectedItem(data.items?.[0] || null);
      setScreen("design");
    } catch (e) {
      console.error(e);
      alert("Failed to generate design");
      setScreen("input");
    }
  };

  const regenerateDesign = async () => {
    try {
      const res = await fetch(`${API_URL}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget }),
      });

      if (!res.ok) {
        throw new Error(`Regenerate failed: ${res.status}`);
      }

      const data = await res.json();
      setDesign(data);
      setSelectedItem(data.items?.[0] || null);
    } catch (e) {
      console.error(e);
      alert("Failed to regenerate design");
    }
  };

  const regenerateItem = async (itemType) => {
    try {
      const res = await fetch(`${API_URL}/regenerate-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, design, budget }),
      });

      if (!res.ok) {
        throw new Error(`Regenerate item failed: ${res.status}`);
      }

      const data = await res.json();
      setDesign(data);
      const updated = data.items.find((x) => x.type === itemType);
      if (updated) setSelectedItem(updated);
      if (detailItem?.type === itemType) setDetailItem(updated);
    } catch (e) {
      console.error(e);
      alert("Failed to regenerate item");
    }
  };

  const removeItem = async (itemType) => {
    try {
      const res = await fetch(`${API_URL}/remove-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemType, design, budget }),
      });

      if (!res.ok) {
        throw new Error(`Remove item failed: ${res.status}`);
      }

      const data = await res.json();
      setDesign(data);

      if (selectedItem?.type === itemType) setSelectedItem(null);
      if (detailItem?.type === itemType) setDetailItem(null);
    } catch (e) {
      console.error(e);
      alert("Failed to remove item");
    }
  };

  const persistLayout = async (nextDesign) => {
    try {
      await fetch(`${API_URL}/update-layout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ design: nextDesign, budget }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDragStart = (e, item) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDragItemId(item.id);
    setResizeItemId(null);
    setSelectedItem(item);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleResizeStart = (e, item) => {
    e.stopPropagation();
    setResizeItemId(item.id);
    setDragItemId(null);
    setSelectedItem(item);
  };

  const handleRoomMove = (e, scale = 1) => {
    if ((!dragItemId && !resizeItemId) || !design) return;

    const roomRect = e.currentTarget.getBoundingClientRect();

    setDesign((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (dragItemId && item.id === dragItemId) {
          const pos = item.positions[currentAngle];
          const width = pos.width * scale;
          const height = pos.height * scale;

          const rawX = e.clientX - roomRect.left - dragOffset.x;
          const rawY = e.clientY - roomRect.top - dragOffset.y;

          const maxX = roomRect.width - width;
          const maxY = roomRect.height - height;

          return {
            ...item,
            positions: {
              ...item.positions,
              [currentAngle]: {
                ...pos,
                x: Math.max(0, Math.min(rawX, maxX)) / scale,
                y: Math.max(0, Math.min(rawY, maxY)) / scale,
              },
            },
          };
        }

        if (resizeItemId && item.id === resizeItemId) {
          const pos = item.positions[currentAngle];
          const minW = MIN_SIZE[item.type]?.width || 80;
          const minH = MIN_SIZE[item.type]?.height || 50;

          const rawWidth = (e.clientX - roomRect.left - pos.x * scale) / scale;
          const rawHeight = (e.clientY - roomRect.top - pos.y * scale) / scale;

          const maxWidthByRoom = roomRect.width / scale - pos.x - 10;
          const maxHeightByRoom = roomRect.height / scale - pos.y - 10;

          const finalWidth = Math.max(minW, Math.min(rawWidth, maxWidthByRoom));
          const finalHeight = Math.max(minH, Math.min(rawHeight, maxHeightByRoom));

          return {
            ...item,
            positions: {
              ...item.positions,
              [currentAngle]: {
                ...pos,
                width: finalWidth,
                height: finalHeight,
              },
            },
          };
        }

        return item;
      }),
    }));
  };

  const handleMouseEnd = async () => {
    if ((!dragItemId && !resizeItemId) || !design) return;

    const latestDesign = design;
    setDragItemId(null);
    setResizeItemId(null);

    await persistLayout(latestDesign);
  };

  const renderRoomScene = () => (
    <>
      <div className={`room-wall room-wall-${currentAngle}`} />
      <div className={`room-wall-panel panel-left-${currentAngle}`} />
      <div className={`room-wall-panel panel-right-${currentAngle}`} />
      <div className={`room-floor room-floor-${currentAngle}`} />
      <div className={`room-rug room-rug-${currentAngle}`} />
      <div className={`room-window room-window-${currentAngle}`}>
        <div className="window-cross-x" />
        <div className="window-cross-y" />
      </div>
      <div className={`room-tv-frame room-tv-frame-${currentAngle}`}>
        <div className="room-tv-screen" />
      </div>
      <div className={`room-console console-${currentAngle}`} />
      <div className={`room-plant room-plant-${currentAngle}`}>
        <span className="room-plant-pot" />
        <span className="room-plant-leaf leaf-1" />
        <span className="room-plant-leaf leaf-2" />
        <span className="room-plant-leaf leaf-3" />
      </div>
      <div className={`room-lamp room-lamp-${currentAngle}`}>
        <span className="lamp-head" />
        <span className="lamp-rod" />
        <span className="lamp-base" />
      </div>
    </>
  );

  const renderRoom = (large = false) => {
    if (!design) return null;

    const scale = large ? 1 : 0.62;

    return (
      <div
        className={`room-stage ${large ? "room-stage-large" : ""}`}
        style={{
          width: design.room.width * scale,
          height: design.room.height * scale,
        }}
        onClick={() => {
          if (!large) setEditorOpen(true);
        }}
        onMouseMove={(e) => handleRoomMove(e, scale)}
        onMouseUp={handleMouseEnd}
        onMouseLeave={handleMouseEnd}
      >
        {renderRoomScene()}

        {design.items.map((item) => {
          const pos = item.positions[currentAngle];
          if (!pos) return null;

          return (
            <div
              key={item.id}
              className={`room-item ${
                selectedItem?.id === item.id ? "room-item-selected" : ""
              }`}
              style={{
                left: pos.x * scale,
                top: pos.y * scale,
                width: pos.width * scale,
                height: pos.height * scale,
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItem(item);
              }}
              onMouseDown={(e) => handleDragStart(e, item)}
            >
              <div className="item-shadow" />
              <img
                src={item.images[currentAngle] || item.images.front}
                alt={item.name}
                draggable={false}
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />

              <div className="item-toolbar">
                <button
                  className="icon-btn remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeItem(item.type);
                  }}
                  title="Remove item"
                >
                  ✕
                </button>
                <button
                  className="icon-btn regen-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    regenerateItem(item.type);
                  }}
                  title="Regenerate item"
                >
                  ↻
                </button>
              </div>

              <button
                className="resize-handle"
                onMouseDown={(e) => handleResizeStart(e, item)}
                title="Resize item"
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="app-shell">
      {screen === "input" && (
        <div className="hero-card">
          <div className="hero-badge">SmartFurnish</div>
          <h1>Design your living room within budget</h1>
          <p className="hero-sub">
            A generated living room scene with your furniture images placed inside it.
          </p>

          <div className="field">
            <label>Budget</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label>Style</label>
            <div className="styles">
              {["Modern", "Boho", "Minimal"].map((s) => (
                <button
                  key={s}
                  className={`style-pill ${style === s ? "active-style" : ""}`}
                  onClick={() => setStyle(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button className="primary-btn" onClick={generateDesign}>
            Generate Design
          </button>
        </div>
      )}

      {screen === "loading" && (
        <div className="loading-state">
          <div className="spinner" />
          <h2>Designing your space...</h2>
          <p>Optimizing layout and selecting furniture</p>
        </div>
      )}

      {screen === "design" && design && (
        <div className="page-wrap">
          <div className="top-row">
            <div>
              <h2 className="page-title">Your Living Room Concept</h2>
              <p className="page-subtitle">
                Click the layout to open the bigger editor.
              </p>
            </div>

            <div className="budget-panel">
              <div className="budget-line">
                <span>Budget</span>
                <strong>${totalCost} / ${budget}</strong>
              </div>
              <div className={`budget-status ${design.within_budget ? "ok" : "over"}`}>
                {design.within_budget ? "Within Budget" : "Over Budget"}
              </div>
            </div>
          </div>

          <div className="angle-bar">
            {ANGLES.map((angle) => (
              <button
                key={angle}
                className={`angle-btn ${currentAngle === angle ? "angle-btn-active" : ""}`}
                onClick={() => setCurrentAngle(angle)}
              >
                {angle.charAt(0).toUpperCase() + angle.slice(1)} View
              </button>
            ))}
          </div>

          <div className="main-grid">
            <div className="preview-card">
              <div className="card-head">
                <h3>Room Preview</h3>
                <button className="secondary-btn" onClick={regenerateDesign}>
                  Regenerate Full Design
                </button>
              </div>
              {renderRoom(false)}
            </div>

            <div className="products-card">
              <div className="card-head">
                <h3>Selected Items</h3>
              </div>

              <div className="product-list">
                {design.items.map((item) => (
                  <div
                    key={item.id}
                    className={`product-card ${
                      selectedItem?.id === item.id ? "selected-product" : ""
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <div className="product-thumb">
                      <img
                        src={item.images.front}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>

                    <div className="product-info">
                      <div className="product-type">{ITEM_LABELS[item.type]}</div>
                      <h4>{item.name}</h4>
                      <p className="price">${item.price}</p>

                      <div className="product-actions">
                        <button
                          className="ghost-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            regenerateItem(item.type);
                          }}
                        >
                          Regenerate
                        </button>
                        <button
                          className="ghost-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeItem(item.type);
                          }}
                        >
                          Remove
                        </button>
                        <button
                          className="primary-small-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailItem(item);
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {editorOpen && (
            <div className="modal-overlay" onClick={() => setEditorOpen(false)}>
              <div className="editor-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div>
                    <h3>Living Room Editor</h3>
                    <p>Drag items, resize them, regenerate, remove, and switch viewing angles.</p>
                  </div>
                  <button className="close-btn" onClick={() => setEditorOpen(false)}>
                    ✕
                  </button>
                </div>

                <div className="angle-bar editor-angle-bar">
                  {ANGLES.map((angle) => (
                    <button
                      key={angle}
                      className={`angle-btn ${
                        currentAngle === angle ? "angle-btn-active" : ""
                      }`}
                      onClick={() => setCurrentAngle(angle)}
                    >
                      {angle.charAt(0).toUpperCase() + angle.slice(1)} View
                    </button>
                  ))}
                </div>

                <div className="editor-grid">
                  <div className="editor-canvas-wrap">{renderRoom(true)}</div>

                  <div className="editor-side-panel">
                    {design.items.map((item) => (
                      <div key={item.id} className="editor-item-card">
                        <div className="editor-item-top">
                          <img
                            src={item.images.front}
                            alt={item.name}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                          <div>
                            <div className="product-type">{ITEM_LABELS[item.type]}</div>
                            <div className="editor-item-name">{item.name}</div>
                            <div className="price">${item.price}</div>
                          </div>
                        </div>

                        <div className="editor-actions">
                          <button
                            className="ghost-btn"
                            onClick={() => regenerateItem(item.type)}
                          >
                            Regenerate
                          </button>
                          <button
                            className="ghost-btn"
                            onClick={() => removeItem(item.type)}
                          >
                            Remove
                          </button>
                          <button
                            className="primary-small-btn"
                            onClick={() => setDetailItem(item)}
                          >
                            View
                          </button>
                        </div>
                      </div>
                    ))}

                    <button className="secondary-btn full-width" onClick={regenerateDesign}>
                      Regenerate Full Design
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {detailItem && (
            <div className="modal-overlay" onClick={() => setDetailItem(null)}>
              <div className="details-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>{detailItem.name}</h3>
                  <button className="close-btn" onClick={() => setDetailItem(null)}>
                    ✕
                  </button>
                </div>

                <div className="details-grid">
                  <div className="details-image-wrap">
                    <img
                      src={detailItem.images.front}
                      alt={detailItem.name}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  <div className="details-info">
                    <div className="detail-row"><span>Type</span><strong>{ITEM_LABELS[detailItem.type]}</strong></div>
                    <div className="detail-row"><span>Price</span><strong>${detailItem.price}</strong></div>
                    <div className="detail-row"><span>Dimensions</span><strong>{detailItem.dimensions}</strong></div>
                    <div className="detail-row"><span>Rating</span><strong>{detailItem.rating} / 5</strong></div>
                    <div className="detail-row"><span>Reviews</span><strong>{detailItem.reviews}</strong></div>
                    <div className="detail-row"><span>Purchases</span><strong>{detailItem.purchases}</strong></div>
                    <div className="detail-row"><span>Stock</span><strong>{detailItem.in_stock ? "In Stock" : "Out of Stock"}</strong></div>
                    <div className="detail-row"><span>Material</span><strong>{detailItem.material}</strong></div>
                    <div className="detail-row"><span>Brand</span><strong>{detailItem.brand}</strong></div>
                    <div className="detail-row"><span>Color</span><strong>{detailItem.color}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;