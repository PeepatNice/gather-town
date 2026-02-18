export interface LimbOffsets {
  leftArmY: number;
  rightArmY: number;
  leftLegY: number;
  rightLegY: number;
  leftLegX: number;
  rightLegX: number;
}

export const NO_OFFSETS: LimbOffsets = {
  leftArmY: 0,
  rightArmY: 0,
  leftLegY: 0,
  rightLegY: 0,
  leftLegX: 0,
  rightLegX: 0,
};

export function drawPixelBody(
  ctx: CanvasRenderingContext2D,
  color: string,
  s: number,
  offsets: LimbOffsets = NO_OFFSETS
) {
  ctx.fillStyle = color;
  // Head (10x10 centered)
  ctx.fillRect(11 * s, 4 * s, 10 * s, 10 * s);
  // Neck
  ctx.fillRect(14 * s, 14 * s, 4 * s, 2 * s);
  // Torso
  ctx.fillRect(10 * s, 16 * s, 12 * s, 10 * s);
  // Left arm
  ctx.fillRect(7 * s, (16 + offsets.leftArmY) * s, 3 * s, 8 * s);
  // Right arm
  ctx.fillRect(22 * s, (16 + offsets.rightArmY) * s, 3 * s, 8 * s);
  // Left leg
  ctx.fillRect((11 + offsets.leftLegX) * s, (26 + offsets.leftLegY) * s, 4 * s, 6 * s);
  // Right leg
  ctx.fillRect((17 + offsets.rightLegX) * s, (26 + offsets.rightLegY) * s, 4 * s, 6 * s);

  // Eyes
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(13 * s, 8 * s, 2 * s, 2 * s);
  ctx.fillRect(17 * s, 8 * s, 2 * s, 2 * s);
  // Mouth
  ctx.fillRect(14 * s, 11 * s, 4 * s, 1 * s);
}

export function drawPixelOutfit(
  ctx: CanvasRenderingContext2D,
  color: string,
  type: string,
  s: number,
  offsets: LimbOffsets = NO_OFFSETS
) {
  if (color === "transparent") return;
  ctx.fillStyle = color;

  // Torso covering
  ctx.fillRect(10 * s, 16 * s, 12 * s, 10 * s);
  // Sleeves
  ctx.fillRect(7 * s, (16 + offsets.leftArmY) * s, 3 * s, 6 * s);
  ctx.fillRect(22 * s, (16 + offsets.rightArmY) * s, 3 * s, 6 * s);

  if (type === "hoodie") {
    // Hood outline on neck
    ctx.fillRect(12 * s, 14 * s, 8 * s, 2 * s);
    // Pocket
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(13 * s, 22 * s, 6 * s, 3 * s);
  } else if (type === "suit") {
    // Collar
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(14 * s, 16 * s, 4 * s, 2 * s);
    // Tie
    ctx.fillStyle = "#C0392B";
    ctx.fillRect(15 * s, 18 * s, 2 * s, 4 * s);
  }
}

export function drawPixelHair(
  ctx: CanvasRenderingContext2D,
  color: string,
  type: string,
  s: number
) {
  if (color === "transparent" || type === "none") return;
  ctx.fillStyle = color;

  // Top hair
  ctx.fillRect(10 * s, 2 * s, 12 * s, 4 * s);

  if (type === "short") {
    ctx.fillRect(10 * s, 4 * s, 2 * s, 4 * s);
    ctx.fillRect(20 * s, 4 * s, 2 * s, 4 * s);
  } else if (type === "long") {
    ctx.fillRect(9 * s, 4 * s, 2 * s, 12 * s);
    ctx.fillRect(21 * s, 4 * s, 2 * s, 12 * s);
    ctx.fillRect(10 * s, 2 * s, 12 * s, 3 * s);
  } else if (type === "spiky") {
    ctx.fillRect(10 * s, 1 * s, 3 * s, 3 * s);
    ctx.fillRect(14 * s, 0 * s, 3 * s, 4 * s);
    ctx.fillRect(19 * s, 1 * s, 3 * s, 3 * s);
  }
}

export function drawPixelAccessory(
  ctx: CanvasRenderingContext2D,
  color: string,
  type: string,
  s: number
) {
  if (color === "transparent" || type === "none") return;
  ctx.fillStyle = color;

  if (type === "glasses") {
    ctx.fillRect(12 * s, 7 * s, 3 * s, 3 * s);
    ctx.fillRect(17 * s, 7 * s, 3 * s, 3 * s);
    ctx.fillRect(15 * s, 8 * s, 2 * s, 1 * s);
    // Clear inner lens
    ctx.fillStyle = "#E8F4FD";
    ctx.fillRect(13 * s, 8 * s, 1 * s, 1 * s);
    ctx.fillRect(18 * s, 8 * s, 1 * s, 1 * s);
  } else if (type === "sunglasses") {
    ctx.fillRect(11 * s, 7 * s, 4 * s, 3 * s);
    ctx.fillRect(17 * s, 7 * s, 4 * s, 3 * s);
    ctx.fillRect(15 * s, 8 * s, 2 * s, 1 * s);
  } else if (type === "hat") {
    ctx.fillRect(9 * s, 2 * s, 14 * s, 3 * s);
    ctx.fillRect(11 * s, 0 * s, 10 * s, 2 * s);
  }
}

export function shadeColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + percent));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + percent));
  const b = Math.min(255, Math.max(0, (num & 0x0000ff) + percent));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
}
