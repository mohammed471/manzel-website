// Area & quantities calculator — pure computation. Factors (pieces per box,
// adhesive/grout/paint consumption, waste, door/window sizes, tiling heights)
// come from the internal app via /api/public/calculator-pricing → `area`.
import { DEFAULT_PRICING, type AreaFactors, type TileSize } from "@/lib/calculator";

export type RoomType = "room" | "bathroom" | "kitchen";

export interface Room {
  id: string;
  type: RoomType;
  length: number; // m
  width: number; // m
  doors: number;
  windows: number;
}

export interface AreaInputs {
  rooms: Room[];
  wallHeight: number; // m
  floorTile: TileSize;
  wallTile: TileSize;
  includePaint: boolean;
}

export interface TileResult {
  area: number; // m² before waste
  areaWithWaste: number;
  pieces: number;
  boxes: number;
}

export interface AreaResult {
  floorArea: number;
  wetRooms: number;
  floorTiles: TileResult;
  wallTiles: TileResult; // bathroom + kitchen walls
  adhesiveBags: number;
  groutBags: number;
  siliconeTubes: number;
  paintArea: number; // walls + ceilings
  paintGallons: number;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/** "60x120" → piece area in m² (0.72). */
export function tileArea(size: TileSize): number {
  const [a, b] = size.split("x").map(Number);
  return (a * b) / 10_000;
}

// A zero/negative factor would divide by zero — fall back to the default.
function factors(f: AreaFactors): AreaFactors {
  const d = DEFAULT_PRICING.area;
  const pos = (v: number, def: number) => (v > 0 ? v : def);
  return {
    ...f,
    adhesive_bag_kg: pos(f.adhesive_bag_kg, d.adhesive_bag_kg),
    grout_bag_kg: pos(f.grout_bag_kg, d.grout_bag_kg),
    paint_m2_per_gallon: pos(f.paint_m2_per_gallon, d.paint_m2_per_gallon),
    paint_coats: pos(f.paint_coats, d.paint_coats),
    tile_pieces_per_box: Object.fromEntries(
      Object.entries(f.tile_pieces_per_box).map(([k, v]) => [k, pos(v, d.tile_pieces_per_box[k as TileSize])]),
    ) as AreaFactors["tile_pieces_per_box"],
  };
}

function tiles(area: number, size: TileSize, f: AreaFactors): TileResult {
  if (area <= 0) return { area: 0, areaWithWaste: 0, pieces: 0, boxes: 0 };
  const areaWithWaste = area * (1 + f.waste_pct / 100);
  const pieces = Math.ceil(areaWithWaste / tileArea(size));
  return {
    area: round2(area),
    areaWithWaste: round2(areaWithWaste),
    pieces,
    boxes: Math.ceil(pieces / f.tile_pieces_per_box[size]),
  };
}

export function computeArea(i: AreaInputs, raw: AreaFactors): AreaResult {
  const f = factors(raw);
  const h = Math.max(0, i.wallHeight);
  let floorArea = 0;
  let wallTileArea = 0;
  let paintArea = 0;
  let wetRooms = 0;

  for (const r of i.rooms) {
    const floor = Math.max(0, r.length) * Math.max(0, r.width);
    if (floor <= 0) continue;
    const perimeter = 2 * (r.length + r.width);
    const openings = r.doors * f.door_m2 + r.windows * f.window_m2;
    floorArea += floor;
    paintArea += floor; // ceiling

    if (r.type === "room") {
      paintArea += Math.max(0, perimeter * h - openings);
      continue;
    }
    wetRooms += 1;
    const tileH = Math.min(h, r.type === "bathroom" ? f.bathroom_tile_height : f.kitchen_tile_height);
    // Bathroom doors/windows sit inside the tiled band; a kitchen's tiled band
    // is the backsplash, so its openings come off the painted part instead.
    if (r.type === "bathroom") {
      wallTileArea += Math.max(0, perimeter * tileH - openings);
      paintArea += Math.max(0, perimeter * (h - tileH));
    } else {
      wallTileArea += perimeter * tileH;
      paintArea += Math.max(0, perimeter * (h - tileH) - openings);
    }
  }

  const floorTiles = tiles(floorArea, i.floorTile, f);
  const wallTiles = tiles(wallTileArea, i.wallTile, f);
  const tiled = floorTiles.area + wallTiles.area;

  return {
    floorArea: round2(floorArea),
    wetRooms,
    floorTiles,
    wallTiles,
    adhesiveBags: tiled > 0 ? Math.ceil((tiled * f.adhesive_kg_per_m2) / f.adhesive_bag_kg) : 0,
    groutBags: tiled > 0 ? Math.ceil((tiled * f.grout_kg_per_m2) / f.grout_bag_kg) : 0,
    siliconeTubes: Math.ceil(wetRooms * f.silicone_tubes_per_wet_room),
    paintArea: i.includePaint ? round2(paintArea) : 0,
    paintGallons: i.includePaint && paintArea > 0 ? Math.ceil((paintArea * f.paint_coats) / f.paint_m2_per_gallon) : 0,
  };
}
