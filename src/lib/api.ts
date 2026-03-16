const API = process.env.NEXT_PUBLIC_API_URL;

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
    });
    if (!res.ok) return { success: false };
    return res.json();
  } catch {
    return { success: false };
  }
}

export function getProductImageUrl(imagePath: string): string {
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
    });
    if (!res.ok) return { success: false };
    return res.json();
  } catch {
    return { success: false };
  }
}

