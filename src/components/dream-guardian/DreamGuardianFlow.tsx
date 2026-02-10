import React, { useState } from "react";

type Step = "entry" | "terrain" | "space" | "light" | "presence" | "movement" | "done";

type Terrain = "watching" | "moving" | "waiting" | "returning" | "unsure";
type SpaceFeel = "enclosed" | "open" | "vertical" | "transitional" | "unsure";
type Light = "diffuse" | "sharp" | "dim" | "absent" | "unsure";
type Presence = "figure" | "animal" | "shape" | "voice" | "sensation" | "absence" | "unsure";
type Movement = "follow" | "wait" | "block" | "drift" | "still" | "unsure";

export default function DreamGuardianFlow() {
  const [step, setStep] = useState<Step>("entry");

  const [terrain, setTerrain] = useState<Terrain | undefined>(undefined);
  const [spaceFeel, setSpaceFeel] = useState<SpaceFeel | undefined>(undefined);
  const [light, setLight] = useState<Light | undefined>(undefined);
  const [presence, setPresence] = useState<Presence | undefined>(undefined);
  const [movement, setMovement] = useState<Movement | undefined>(undefined);

  function closePage() {
    window.history.length > 1 ? window.history.back() : (window.location.href = "/");
  }

  function back() {
    if (step === "terrain") setStep("entry");
    else if (step === "space") setStep("terrain");
    else if (step === "light") setStep("space");
    else if (step === "presence") setStep("light");
    else if (step === "movement") setStep("presence");
    else if (step === "done") setStep("movement");
  }

  function TopBar() {
    return (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0 14px" }}>
        <button onClick={back} style={{ background: "transparent", border: "none", color: "#b8bcc6", padding: 8 }}>
          Back
        </button>
        <button onClick={closePage} style={{ background: "transparent", border: "none", color: "#b8bcc6", padding: 8 }}>
          Close
        </button>
      </div>
    );
  }

  function BottomBar({
    primaryLabel,
    onPrimary,
    primaryDisabled,
    tertiaryLabel,
    onTertiary,
  }: {
    primaryLabel: string;
    onPrimary: () => void;
    primaryDisabled?: boolean;
    tertiaryLabel?: string;
    onTertiary?: () => void;
  }) {
    return (
      <div style={{ position: "sticky", bottom: 0, padding: "12px 0 6px", background: "linear-gradient(transparent, #07080a 30%)" }}>
        <button
          onClick={onPrimary}
          disabled={primaryDisabled}
          style={{
            width: "100%",
            height: 48,
            borderRadius: 14,
            border: "1px solid #2a2c31",
            background: primaryDisabled ? "#14161a" : "#0f1216",
            color: primaryDisabled ? "#7f8592" : "#e8e8ea",
            fontSize: 16,
          }}
        >
          {primaryLabel}
        </button>

        {tertiaryLabel && onTertiary && (
          <button
            onClick={onTertiary}
            style={{
              width: "100%",
              height: 44,
              marginTop: 8,
              borderRadius: 14,
              border: "1px solid #2a2c31",
              background: "transparent",
              color: "#b8bcc6",
              fontSize: 16,
            }}
          >
            {tertiaryLabel}
          </button>
        )}
      </div>
    );
  }

  function OptionButton<T extends string>({
    label,
    value,
    selected,
    onSelect,
  }: {
    label: string;
    value: T;
    selected: boolean;
    onSelect: (v: T) => void;
  }) {
    return (
      <button
        onClick={() => onSelect(value)}
        style={{
          textAlign: "left",
          padding: "14px 14px",
          borderRadius: 14,
          border: selected ? "1px solid #6b7280" : "1px solid #2a2c31",
          background: selected ? "#101318" : "#0b0d10",
          color: "#e8e8ea",
          fontSize: 16,
          minHeight: 48,
          width: "100%",
        }}
      >
        {label}
      </button>
    );
  }

  if (step === "entry") {
    return (
      <div style={{ padding: "12px 4px 0" }}>
        <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: "12px 0 10px" }}>Some things already walk with you.</h1>
        <p style={{ color: "#b8bcc6", margin: "0 0 22px" }}>This page helps you notice, not define.</p>

        <button
          onClick={() => setStep("terrain")}
          style={{ width: "100%", height: 48, borderRadius: 14, border: "1px solid #2a2c31", background: "#0f1216", color: "#e8e8ea", fontSize: 16 }}
        >
          Begin
        </button>

        <button
          onClick={closePage}
          style={{ width: "100%", height: 48, marginTop: 10, borderRadius: 14, border: "1px solid #2a2c31", background: "transparent", color: "#b8bcc6", fontSize: 16 }}
        >
          Not now
        </button>

        <p style={{ color: "#7f8592", fontSize: 12, marginTop: 14 }}>Observational only. No interpretation.</p>
      </div>
    );
  }

  if (step === "terrain") {
    return (
      <div style={{ padding: "8px 0 0" }}>
        <TopBar />
        <h2 style={{ margin: "0 0 10px" }}>Dream terrain</h2>
        <p style={{ color: "#b8bcc6", marginTop: 0 }}>When you dream, you are usually:</p>

        <div style={{ display: "grid", gap: 10 }}>
          <OptionButton label="Watching" value="watching" selected={terrain === "watching"} onSelect={setTerrain} />
          <OptionButton label="Moving" value="moving" selected={terrain === "moving"} onSelect={setTerrain} />
          <OptionButton label="Waiting" value="waiting" selected={terrain === "waiting"} onSelect={setTerrain} />
          <OptionButton label="Returning" value="returning" selected={terrain === "returning"} onSelect={setTerrain} />
          <OptionButton label="Unsure" value="unsure" selected={terrain === "unsure"} onSelect={setTerrain} />
        </div>

        <BottomBar
          primaryLabel="Continue"
          onPrimary={() => setStep("space")}
          primaryDisabled={!terrain}
          tertiaryLabel="Skip"
          onTertiary={() => {
            setTerrain(undefined);
            setStep("space");
          }}
        />

        <p style={{ color: "#7f8592", fontSize: 12, marginTop: 10 }}>Skip anything. Silence counts.</p>
      </div>
    );
  }

  if (step === "space") {
    return (
      <div style={{ padding: "8px 0 0" }}>
        <TopBar />
        <h2 style={{ margin: "0 0 10px" }}>Space feel</h2>
        <p style={{ color: "#b8bcc6", marginTop: 0 }}>The space feels more often:</p>

        <div style={{ display: "grid", gap: 10 }}>
          <OptionButton label="Enclosed" value="enclosed" selected={spaceFeel === "enclosed"} onSelect={setSpaceFeel} />
          <OptionButton label="Open" value="open" selected={spaceFeel === "open"} onSelect={setSpaceFeel} />
          <OptionButton label="Vertical" value="vertical" selected={spaceFeel === "vertical"} onSelect={setSpaceFeel} />
          <OptionButton label="Transitional (doors, bridges, edges)" value="transitional" selected={spaceFeel === "transitional"} onSelect={setSpaceFeel} />
          <OptionButton label="Unsure" value="unsure" selected={spaceFeel === "unsure"} onSelect={setSpaceFeel} />
        </div>

        <BottomBar
          primaryLabel="Continue"
          onPrimary={() => setStep("light")}
          primaryDisabled={!spaceFeel}
          tertiaryLabel="Skip"
          onTertiary={() => {
            setSpaceFeel(undefined);
            setStep("light");
          }}
        />
      </div>
    );
  }

  if (step === "light") {
    return (
      <div style={{ padding: "8px 0 0" }}>
        <TopBar />
        <h2 style={{ margin: "0 0 10px" }}>Light</h2>
        <p style={{ color: "#b8bcc6", marginTop: 0 }}>Light in dreams tends to be:</p>

        <div style={{ display: "grid", gap: 10 }}>
          <OptionButton label="Diffuse" value="diffuse" selected={light === "diffuse"} onSelect={setLight} />
          <OptionButton label="Sharp" value="sharp" selected={light === "sharp"} onSelect={setLight} />
          <OptionButton label="Dim but present" value="dim" selected={light === "dim"} onSelect={setLight} />
          <OptionButton label="Absent" value="absent" selected={light === "absent"} onSelect={setLight} />
          <OptionButton label="Unsure" value="unsure" selected={light === "unsure"} onSelect={setLight} />
        </div>

        <BottomBar
          primaryLabel="Continue"
          onPrimary={() => setStep("presence")}
          primaryDisabled={!light}
          tertiaryLabel="Skip"
          onTertiary={() => {
            setLight(undefined);
            setStep("presence");
          }}
        />
      </div>
    );
  }

  if (step === "presence") {
    return (
      <div style={{ padding: "8px 0 0" }}>
        <TopBar />
        <h2 style={{ margin: "0 0 10px" }}>Presence</h2>
        <p style={{ color: "#b8bcc6", marginTop: 0 }}>Is there a recurring presence?</p>

        <div style={{ display: "grid", gap: 10 }}>
          <OptionButton label="A figure" value="figure" selected={presence === "figure"} onSelect={setPresence} />
          <OptionButton label="An animal" value="animal" selected={presence === "animal"} onSelect={setPresence} />
          <OptionButton label="A shape" value="shape" selected={presence === "shape"} onSelect={setPresence} />
          <OptionButton label="A voice" value="voice" selected={presence === "voice"} onSelect={setPresence} />
          <OptionButton label="A sensation" value="sensation" selected={presence === "sensation"} onSelect={setPresence} />
          <OptionButton label="Nothing / absence" value="absence" selected={presence === "absence"} onSelect={setPresence} />
          <OptionButton label="Unsure" value="unsure" selected={presence === "unsure"} onSelect={setPresence} />
        </div>

        <BottomBar
          primaryLabel="Continue"
          onPrimary={() => setStep("movement")}
          primaryDisabled={!presence}
          tertiaryLabel="Skip"
          onTertiary={() => {
            setPresence(undefined);
            setStep("movement");
          }}
        />
      </div>
    );
  }

  if (step === "movement") {
    return (
      <div style={{ padding: "8px 0 0" }}>
        <TopBar />
        <h2 style={{ margin: "0 0 10px" }}>Movement</h2>
        <p style={{ color: "#b8bcc6", marginTop: 0 }}>It tends to:</p>

        <div style={{ display: "grid", gap: 10 }}>
          <OptionButton label="Follow" value="follow" selected={movement === "follow"} onSelect={setMovement} />
          <OptionButton label="Wait" value="wait" selected={movement === "wait"} onSelect={setMovement} />
          <OptionButton label="Block" value="block" selected={movement === "block"} onSelect={setMovement} />
          <OptionButton label="Drift" value="drift" selected={movement === "drift"} onSelect={setMovement} />
          <OptionButton label="Stay still" value="still" selected={movement === "still"} onSelect={setMovement} />
          <OptionButton label="Unsure" value="unsure" selected={movement === "unsure"} onSelect={setMovement} />
        </div>

        <BottomBar
          primaryLabel="Continue"
          onPrimary={() => setStep("done")}
          primaryDisabled={!movement}
          tertiaryLabel="Skip"
          onTertiary={() => {
            setMovement(undefined);
            setStep("done");
          }}
        />
      </div>
    );
  }

  return (
    <div style={{ padding: "8px 0 0" }}>
      <TopBar />
      <h2 style={{ margin: "0 0 10px" }}>Snapshot</h2>
      <p style={{ color: "#b8bcc6", marginTop: 0 }}>Saved (observational only):</p>

      <div style={{ border: "1px solid #2a2c31", borderRadius: 14, padding: 12, background: "#0b0d10" }}>
        <Row label="Terrain" value={terrain ?? "none"} />
        <Row label="Space" value={spaceFeel ?? "none"} />
        <Row label="Light" value={light ?? "none"} />
        <Row label="Presence" value={presence ?? "none"} />
        <Row label="Movement" value={movement ?? "none"} />
      </div>

      <button
        onClick={() => {}}
        style={{ width: "100%", height: 48, marginTop: 12, borderRadius: 14, border: "1px solid #2a2c31", background: "#0f1216", color: "#e8e8ea", fontSize: 16 }}
      >
        Next: Reveal sigil
      </button>

      <button
        onClick={closePage}
        style={{ width: "100%", height: 48, marginTop: 10, borderRadius: 14, border: "1px solid #2a2c31", background: "transparent", color: "#b8bcc6", fontSize: 16 }}
      >
        Close
      </button>

      <p style={{ color: "#7f8592", fontSize: 12, marginTop: 12 }}>No interpretation. Skip anything.</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "8px 0", borderBottom: "1px solid #16181c" }}>
      <div style={{ color: "#7f8592", fontSize: 12 }}>{label}</div>
      <div style={{ color: "#e8e8ea", fontSize: 12 }}>{value}</div>
    </div>
  );
}
