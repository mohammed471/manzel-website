const API = process.env.NEXT_PUBLIC_API_URL;

// The Flask API on Render free tier can cold-start for 30-60s — never let a
// page render block that long. Reads fail fast to fallback UI; form POSTs get
// longer since losing a submission is worse than a slow spinner.
const READ_TIMEOUT_MS = 5000;
const WRITE_TIMEOUT_MS = 30000;

export interface Product {
  id: number;
  name: string;
  category: string;
  subcategory: string | null;
  details: string;
  image: string | null;
}

export interface Category {
  id: number;
  name: string;
  product_count: number;
  subcategories: { id: number; name: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapProduct(raw: any): Product {
  return {
    id: raw.id,
    name: raw.name ?? "",
    category: raw.cat_name ?? raw.category ?? "",
    subcategory: raw.subcat_name ?? raw.subcategory ?? null,
    details: raw.details ?? "",
    image: raw.image_path ?? raw.image ?? null,
  };
}

export async function getProducts(params?: {
  category_id?: number;
  subcategory_id?: number;
  search?: string;
}): Promise<Product[]> {
  try {
    const searchParams = new URLSearchParams();
    if (params?.category_id) searchParams.set("category_id", String(params.category_id));
    if (params?.subcategory_id) searchParams.set("subcategory_id", String(params.subcategory_id));
    if (params?.search) searchParams.set("search", params.search);
    const res = await fetch(`${API}/api/public/products?${searchParams}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = data.products ?? data;
    if (!Array.isArray(products)) return [];
    return products.map(mapProduct);
  } catch {
    return [];
  }
}

export async function searchProductsClient(query: string): Promise<Product[]> {
  if (!query.trim()) return [];
  try {
    const searchParams = new URLSearchParams();
    searchParams.set("search", query);
    const res = await fetch(`${API}/api/public/products?${searchParams}`, {
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = data.products ?? data;
    if (!Array.isArray(products)) return [];
    return products.map(mapProduct);
  } catch {
    return [];
  }
}

export async function getProduct(id: number): Promise<Product | null> {
  try {
    const res = await fetch(`${API}/api/public/products/${id}`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const raw = data.product ?? data;
    return mapProduct(raw);
  } catch {
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API}/api/public/categories`, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(READ_TIMEOUT_MS),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const categories = data.categories ?? data;
    if (!Array.isArray(categories)) return [];
    return categories;
  } catch {
    return [];
  }
}

export async function submitContact(data: {
  name: string;
  phone: string;
  email: string;
  message: string;
}): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API}/api/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(WRITE_TIMEOUT_MS),
    });
    if (!res.ok) return { success: false };
    return res.json();
  } catch {
    return { success: false };
  }
}

export function getProductImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  return `${API}/api/public/products/images/${imagePath}`;
}

export interface BookingData {
  name: string;
  phone: string;
  email: string;
  projectType: string;
  location: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

export async function submitBooking(data: BookingData): Promise<{ success: boolean }> {
  try {
    const res = await fetch(`${API}/api/public/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        phone: data.phone,
        email: data.email,
        message: `[Booking Request]\nProject: ${data.projectType}\nLocation: ${data.location}\nDate: ${data.preferredDate}\nTime: ${data.preferredTime}\nNotes: ${data.notes}`,
        type: "booking",
      }),
      signal: AbortSignal.timeout(WRITE_TIMEOUT_MS),
    });
    if (!res.ok) return { success: false };
    return res.json();
  } catch {
    return { success: false };
  }
}

