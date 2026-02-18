import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { useAvatarStore } from "../../../store/avatarStore";
import { fetchManifest, getItemById } from "../logic";
import type { AvatarManifest } from "../logic";
import {
  drawPixelBody,
  drawPixelOutfit,
  drawPixelHair,
  drawPixelAccessory,
} from "../drawAvatar";

const SPRITE_SIZE = 32;
const DISPLAY_SCALE = 6;
const CANVAS_SIZE = SPRITE_SIZE * DISPLAY_SCALE;

export interface AvatarRendererHandle {
  getCanvas: () => HTMLCanvasElement | null;
  getDataURL: () => string;
}

const AvatarRenderer = forwardRef<AvatarRendererHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const manifestRef = useRef<AvatarManifest | null>(null);
  const { body, outfit, hair, accessory } = useAvatarStore();

  useImperativeHandle(ref, () => ({
    getCanvas: () => canvasRef.current,
    getDataURL: () => canvasRef.current?.toDataURL("image/png") ?? "",
  }));

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!manifestRef.current) {
        manifestRef.current = await fetchManifest();
      }
      if (cancelled) return;

      const manifest = manifestRef.current;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      const s = DISPLAY_SCALE;

      // Layer 0: Body
      const bodyItem = getItemById(manifest, "body", body);
      if (bodyItem) drawPixelBody(ctx, bodyItem.color, s);

      // Layer 1: Outfit
      const outfitItem = getItemById(manifest, "outfit", outfit);
      if (outfitItem) drawPixelOutfit(ctx, outfitItem.color, outfitItem.type ?? "tshirt", s);

      // Layer 2: Hair
      const hairItem = getItemById(manifest, "hair", hair);
      if (hairItem) drawPixelHair(ctx, hairItem.color, hairItem.type ?? "short", s);

      // Layer 3: Accessories
      const accItem = getItemById(manifest, "accessory", accessory);
      if (accItem) drawPixelAccessory(ctx, accItem.color, accItem.type ?? "none", s);
    }

    render();
    return () => { cancelled = true; };
  }, [body, outfit, hair, accessory]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_SIZE}
      height={CANVAS_SIZE}
      className="border-2 border-gray-600 rounded-lg bg-gray-800"
      style={{ imageRendering: "pixelated" }}
    />
  );
});

AvatarRenderer.displayName = "AvatarRenderer";
export default AvatarRenderer;
