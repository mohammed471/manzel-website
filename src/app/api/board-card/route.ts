import { readFile } from "fs/promises";
import path from "path";
import { getProductImageUrl, getProducts } from "@/lib/api";
import { parseBoard, resolveBoard, type BoardItem } from "@/lib/board";
import { CARD_MAX_PHOTOS, renderBoardCard } from "@/lib/boardCard";
import { coverImage } from "@/lib/catalog";
import { r2ThumbUrl } from "@/lib/imageLoader";
import { getProjectImageUrl, getProjects } from "@/lib/portfolio";

// og:image of a «لوحتي» link (/board?i=…): the first saved photos beside the
// Manzel logo — what WhatsApp and Facebook show under a shared board.
// ponytail: drawn on every request, no cache — previews are fetched once per
// share. Add an LRU keyed by `i` if this route ever shows up in the load.

const PUBLIC_DIR = path.join(process.cwd(), "public");
const PHOTO_TIMEOUT_MS = 4000;
// Enough entries to find five with a photo (most of the catalogue has none yet)
const ENTRIES_SCANNED = 20;

function photoUrl(item: BoardItem): string | null {
  if (item.kind === "product") {
    const image = coverImage(item.product);
    return image ? getProductImageUrl(image) : null;
  }
  const first = item.project.images[0];
  return first ? getProjectImageUrl(item.project.category, item.project.id, first) : null;
}

// The addresses come from our own catalogue and portfolio, never from the request
async function loadPhoto(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith("/")) {
      // A file of this site (the original projects' images in public/portfolio)
      const file = path.join(PUBLIC_DIR, url);
      return file.startsWith(PUBLIC_DIR + path.sep) ? await readFile(file) : null;
    }
    // R2 images have a 640px thumb beside them — plenty for a card tile
    const res = await fetch(r2ThumbUrl(url), { signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS) });
    return res.ok ? Buffer.from(await res.arrayBuffer()) : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const entries = parseBoard(new URL(request.url).searchParams.get("i")).slice(0, ENTRIES_SCANNED);
  const [products, projects] = await Promise.all([
    entries.some((entry) => entry.startsWith("p")) ? getProducts() : [],
    entries.some((entry) => entry.startsWith("j")) ? getProjects() : [],
  ]);

  const wanted = resolveBoard(entries, products, projects)
    .flatMap((item) => {
      const url = photoUrl(item);
      // Product shots are fitted whole on white; project photos fill their tile
      return url ? [{ url, contain: item.kind === "product" }] : [];
    })
    .slice(0, CARD_MAX_PHOTOS);
  const photos = (
    await Promise.all(
      wanted.map(async ({ url, contain }) => {
        const data = await loadPhoto(url);
        return data ? [{ data, contain }] : [];
      }),
    )
  ).flat();

  const logo = await readFile(path.join(PUBLIC_DIR, "images/logo-light.png"));
  // A photo that breaks the drawing must not cost the preview: fall back to the logo card
  const card = await renderBoardCard(photos, logo).catch(() => renderBoardCard([], logo));

  return new Response(new Uint8Array(card), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
