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

  // 👇 Bigger size so it looks correct in room
  const width = 4.2;
  const height = 2.2;

  // 👇 Push sofa down so it sits on floor
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
        {/* 🔥 ONLY ONE CLEAN IMAGE — NO SHADOWS */}
        <mesh position={[0, visualLift, 0]}>
          <planeGeometry args={[width, height]} />
          <meshBasicMaterial
            map={texture}
            transparent
            alphaTest={0.05}
          />
        </mesh>
      </group>

      {selected && groupRef.current && (
        <TransformControls
          object={groupRef.current}
          mode={transformMode}
          size={1.0}
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