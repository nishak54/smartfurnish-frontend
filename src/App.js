function CameraController({ viewMode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (viewMode === "front") {
      camera.position.set(0, 3.6, 8.8);
      camera.fov = 34;
    } else {
      camera.position.set(6.4, 4.3, 8.2);
      camera.fov = 38;
    }

    camera.lookAt(0, 1.15, 0);
    camera.updateProjectionMatrix();
  }, [camera, viewMode]);

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
  viewMode,
}) {
  const orbitRef = useRef(null);

  return (
    <Canvas
      camera={{ position: [0, 3.6, 8.8], fov: 34 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMissed={() => setSelectedId(null)}
    >
      <CameraController viewMode={viewMode} />

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
        minDistance={4.8}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.04}
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

function OptionSection({ title, items, activeId, label, onUse }) {
  const [open, setOpen] = useState(title === "Sofas");

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
  const [viewMode, setViewMode] = useState("front");

  const totalCost = selectedSofa.price + selectedTable.price;
  const withinBudget = totalCost <= budget;

  const handleRegenerate = () => {
    const nextSofa =
      SOFA_OPTIONS[Math.floor(Math.random() * SOFA_OPTIONS.length)];
    const nextTable =
      TABLE_OPTIONS[Math.floor(Math.random() * TABLE_OPTIONS.length)];

    setSelectedSofa(nextSofa);
    setSelectedTable(nextTable);
    setSelectedId(null);
    setTransformMode("translate");
    setViewMode("front");

    const layout = getDefaultLayout();
    setSofaState(layout.sofa);
    setTableState(layout.table);
  };

  return (
    <div className="workspace-page">
      <div className="workspace-topbar">
        <div>
          <div className="workspace-title">Living Room Concept</div>
          <div className="workspace-subtitle">
            Better lighting, better floor, and cleaner camera presets for a
            more natural room feel.
          </div>
        </div>

        <div className="budget-pill">
          <span>Budget</span>
          <strong className={withinBudget ? "budget-good" : "budget-bad"}>
            ${totalCost}
          </strong>
          <span>/ ${budget}</span>
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
            <button
              className={viewMode === "front" ? "tool-active" : ""}
              onClick={() => setViewMode("front")}
            >
              Front View
            </button>
            <button
              className={viewMode === "angled" ? "tool-active" : ""}
              onClick={() => setViewMode("angled")}
            >
              Angled View
            </button>
            <button onClick={handleRegenerate}>Regenerate View</button>
            <button onClick={onBack}>Back</button>
          </div>

          <div className="viewer-frame">
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
              viewMode={viewMode}
            />
          </div>
        </div>

        <div className="workspace-right professional-panel">
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
        </div>
      </div>
    </div>
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
function CameraController({ viewMode }) {
  const { camera } = useThree();

  useEffect(() => {
    if (viewMode === "front") {
      camera.position.set(0, 3.6, 8.8);
      camera.fov = 34;
    } else {
      camera.position.set(6.4, 4.3, 8.2);
      camera.fov = 38;
    }

    camera.lookAt(0, 1.15, 0);
    camera.updateProjectionMatrix();
  }, [camera, viewMode]);

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
  viewMode,
}) {
  const orbitRef = useRef(null);

  return (
    <Canvas
      camera={{ position: [0, 3.6, 8.8], fov: 34 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      onPointerMissed={() => setSelectedId(null)}
    >
      <CameraController viewMode={viewMode} />

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
        minDistance={4.8}
        maxDistance={18}
        maxPolarAngle={Math.PI / 2.04}
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

function OptionSection({ title, items, activeId, label, onUse }) {
  const [open, setOpen] = useState(title === "Sofas");

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

function RealViewPanel({ image, loading, error }) {
  return (
    <div className="real-view-panel">
      <div className="real-view-header">
        <div className="real-view-title">Real View</div>
        <div className="real-view-subtitle">
          Photorealistic preview generated from your selected furniture.
        </div>
      </div>

      {loading && (
        <div className="real-view-placeholder">
          Generating photorealistic room...
        </div>
      )}

      {!loading && error && (
        <div className="real-view-error">{error}</div>
      )}

      {!loading && !error && !image && (
        <div className="real-view-placeholder">
          Click <strong>Generate Real View</strong> to see a realistic room preview.
        </div>
      )}

      {!loading && image && (
        <div className="real-view-image-wrap">
          <img
            src={`data:image/png;base64,${image}`}
            alt="Photorealistic living room"
            className="real-view-image"
          />
        </div>
      )}
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
  const [viewMode, setViewMode] = useState("front");
  const [realViewImage, setRealViewImage] = useState(null);
  const [realViewLoading, setRealViewLoading] = useState(false);
  const [realViewError, setRealViewError] = useState("");

  const totalCost = selectedSofa.price + selectedTable.price;
  const withinBudget = totalCost <= budget;

  const handleRegenerate = () => {
    const nextSofa =
      SOFA_OPTIONS[Math.floor(Math.random() * SOFA_OPTIONS.length)];
    const nextTable =
      TABLE_OPTIONS[Math.floor(Math.random() * TABLE_OPTIONS.length)];

    setSelectedSofa(nextSofa);
    setSelectedTable(nextTable);
    setSelectedId(null);
    setTransformMode("translate");
    setViewMode("front");
    setRealViewImage(null);
    setRealViewError("");

    const layout = getDefaultLayout();
    setSofaState(layout.sofa);
    setTableState(layout.table);
  };

  const handleGenerateRealView = async () => {
    try {
      setRealViewLoading(true);
      setRealViewError("");

      const response = await fetch("/api/generate-real-view", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roomType: "living room",
          budget: Number(budget) || 0,
          sofa: {
            name: selectedSofa.name,
            imagePath: selectedSofa.imagePath,
            price: selectedSofa.price,
            details: selectedSofa.details,
          },
          table: {
            name: selectedTable.name,
            imagePath: selectedTable.imagePath,
            price: selectedTable.price,
            details: selectedTable.details,
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate real view");
      }

      const data = await response.json();

      if (!data.imageBase64) {
        throw new Error("No real view image returned");
      }

      setRealViewImage(data.imageBase64);
    } catch (error) {
      setRealViewError(error.message || "Something went wrong");
    } finally {
      setRealViewLoading(false);
    }
  };

  return (
    <div className="workspace-page">
      <div className="workspace-topbar">
        <div>
          <div className="workspace-title">Living Room Concept</div>
          <div className="workspace-subtitle">
            Interactive planning above, photorealistic preview below.
          </div>
        </div>

        <div className="budget-pill">
          <span>Budget</span>
          <strong className={withinBudget ? "budget-good" : "budget-bad"}>
            ${totalCost}
          </strong>
          <span>/ ${budget}</span>
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
            <button
              className={viewMode === "front" ? "tool-active" : ""}
              onClick={() => setViewMode("front")}
            >
              Front View
            </button>
            <button
              className={viewMode === "angled" ? "tool-active" : ""}
              onClick={() => setViewMode("angled")}
            >
              Angled View
            </button>
            <button onClick={handleRegenerate}>Regenerate View</button>
            <button onClick={handleGenerateRealView}>
              Generate Real View
            </button>
            {realViewImage && (
              <button onClick={handleGenerateRealView}>
                Regenerate Real View
              </button>
            )}
            <button onClick={onBack}>Back</button>
          </div>

          <div className="viewer-frame">
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
              viewMode={viewMode}
            />
          </div>

          <RealViewPanel
            image={realViewImage}
            loading={realViewLoading}
            error={realViewError}
          />
        </div>

        <div className="workspace-right professional-panel">
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
              setRealViewImage(null);
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
              setRealViewImage(null);
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
        </div>
      </div>
    </div>
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