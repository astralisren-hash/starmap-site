export type PresenceType = "figure" | "animal" | "shape" | "voice" | "sensation" | "absence" | "unsure";
export type MovementType = "follow" | "wait" | "block" | "drift" | "still" | "unsure";
export type PositionType = "ahead" | "beside" | "behind" | "enclosing" | "distant" | "unsure";
export type LightType = "diffuse" | "sharp" | "dim" | "absent" | "unsure";
export type FeltEffect = "steadier" | "more_alert" | "slower" | "unchanged" | "unsure";

export type SigilInputs = {
  terrain?: "watching" | "moving" | "waiting" | "returning" | "unsure";
  spaceFeel?: "enclosed" | "open" | "vertical" | "transitional" | "unsure";
  light?: LightType;
  presence?: PresenceType;
  movement?: MovementType;
  position?: PositionType;
  felt?: FeltEffect[]; // multi-select
};

export type SigilSpec = {
  seed: number;
  anchor: { cx: number; cy: number; r: number };
  dots: Array<{ cx: number; cy: number; r: number; opacity: number }>;
  segments: Array<{ x1: number; y1: number; x2: number; y2: number; strokeWidth: number; opacity: number }>;
  arc?: { x1: number; y1: number; rx: number; ry: number; x2: number; y2: number; opacity: number };
  barrier?: { x1: number; y1: number; x2: number; y2: number; strokeWidth: number; opacity: number };
  halo?: { cx: number; cy: number; r: number; opacity: number };
};
