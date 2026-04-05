import React, { useState } from "react";
import "./App.css";

const API_BASE = "https://smartfurnish-backend.onrender.com";

function App() {
  const [page, setPage] = useState("workspace");
  const [realViewImageUrl, setRealViewImageUrl] = useState("");
  const [realViewLoading, setRealViewLoading] = useState(false);
  const [realViewError, setRealViewError] = useState("");
  const [compareMode, setCompareMode] = useState(false);

  const [selectedSofa, setSelectedSofa] = useState({
    name: "Sofa 2",
    price: 1200,
    model: "/assets/items/sofa/sofa2.webp",
  });

  const [selectedTable, setSelectedTable] = useState({
    name: "Table 1",
    price: 400,
    model: "/assets/items/tables/table1.webp",
  });

  const handleGenerateRealView = async () => {
    setRealViewLoading(true);
    setRealViewError("");

    try {
      const response = await fetch(`${API_BASE}/generate-realview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scene: {
            sofa: selectedSofa,
            table: selectedTable,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed");
      }

      setRealViewImageUrl(data.imageUrl);
      setPage("realview");
    } catch (err) {
      setRealViewError(err.message);
    } finally {
      setRealViewLoading(false);
    }
  };

  return (
    <div className="app-shell">
      {page === "workspace" && (
        <Workspace
          selectedSofa={selectedSofa}
          setSelectedSofa={setSelectedSofa}
          selectedTable={selectedTable}
          setSelectedTable={setSelectedTable}
          onGenerate={handleGenerateRealView}
        />
      )}

      {page === "realview" && (
        <RealViewScreen
          imageUrl={realViewImageUrl}
          loading={realViewLoading}
          error={realViewError}
          onBack={() => setPage("workspace")}
          onCompare={() => setCompareMode(true)}
          compareMode={compareMode}
          onCloseCompare={() => setCompareMode(false)}
          selectedSofa={selectedSofa}
          selectedTable={selectedTable}
        />
      )}
    </div>
  );
}
function Workspace({
  selectedSofa,
  setSelectedSofa,
  selectedTable,
  setSelectedTable,
  onGenerate,
}) {
  return (
    <div className="workspace-page">
      <div className="workspace-topbar">
        <div className="workspace-title">Smart Furnish</div>
        <button className="primary-button" onClick={onGenerate}>
          Generate Real View
        </button>
      </div>

      <div className="viewer-frame">
        <div className="fake-3d-room">
          <img
            src={selectedSofa.model}
            className="sofa-3d"
            alt=""
          />
          <img
            src={selectedTable.model}
            className="table-3d"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}
function RealViewScreen({
  imageUrl,
  loading,
  error,
  onBack,
  onCompare,
  compareMode,
  onCloseCompare,
  selectedSofa,
  selectedTable,
}) {
  return (
    <div className="realview-fullscreen">
      <div className="realview-header">
        <button onClick={onBack}>←</button>
        <div className="title">Real View</div>
        {imageUrl && !compareMode && (
          <button onClick={onCompare}>Compare</button>
        )}
      </div>

      {loading && <div className="loader">Generating...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && imageUrl && !compareMode && (
        <img src={imageUrl} className="realview-image-big" alt="" />
      )}

      {compareMode && (
        <CompareView
          imageUrl={imageUrl}
          selectedSofa={selectedSofa}
          selectedTable={selectedTable}
          onClose={onCloseCompare}
        />
      )}
    </div>
  );
}
function RealViewScreen({
  imageUrl,
  loading,
  error,
  onBack,
  onCompare,
  compareMode,
  onCloseCompare,
  selectedSofa,
  selectedTable,
}) {
  return (
    <div className="realview-fullscreen">
      <div className="realview-header">
        <button onClick={onBack}>←</button>
        <div className="title">Real View</div>
        {imageUrl && !compareMode && (
          <button onClick={onCompare}>Compare</button>
        )}
      </div>

      {loading && <div className="loader">Generating...</div>}
      {error && <div className="error">{error}</div>}

      {!loading && imageUrl && !compareMode && (
        <img src={imageUrl} className="realview-image-big" alt="" />
      )}

      {compareMode && (
        <CompareView
          imageUrl={imageUrl}
          selectedSofa={selectedSofa}
          selectedTable={selectedTable}
          onClose={onCloseCompare}
        />
      )}
    </div>
  );
}