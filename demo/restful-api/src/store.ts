export type ProductStatus = "draft" | "active" | "archived";

export interface Product {
  id: string;
  name: string;
  status: ProductStatus;
  price: number;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Page<T> {
  data: T[];
  pagination: {
    limit: number;
    next_cursor: string | null;
    has_more: boolean;
  };
}

const now = (): string => new Date().toISOString();

const seed = (i: number, name: string, status: ProductStatus, price: number, tags: string[]): Product => ({
  id: `prd_seed${String(i).padStart(3, "0")}`,
  name,
  status,
  price,
  tags,
  created_at: new Date(Date.now() - i * 86_400_000).toISOString(),
  updated_at: now(),
});

const products: Product[] = [
  seed(1, "Áo cưới cổ điển", "active", 1_500_000, ["ao-cuoi", "classic"]),
  seed(2, "Váy dạ hội đỏ", "active", 2_200_000, ["vay", "party"]),
  seed(3, "Bó hoa cầm tay", "draft", 350_000, ["hoa"]),
  seed(4, "Giày cao gót trắng", "active", 890_000, ["giay", "sale"]),
  seed(5, "Trang sức ngọc trai", "archived", 1_200_000, ["trang-suc"]),
  seed(6, "Khăn voan lụa", "active", 250_000, ["khan"]),
  seed(7, "Vest chú rể xanh navy", "active", 4_800_000, ["vest", "nam"]),
  seed(8, "Tráp sính lễ", "draft", 600_000, ["le-hoi"]),
  seed(9, "Nến thơm sáp ong", "active", 180_000, ["nến", "trang-tri"]),
  seed(10, "Album ảnh cưới 30 trang", "active", 950_000, ["anh-cuoi"]),
  seed(11, "Nhẫn cưới vàng 18K", "active", 12_500_000, ["nhans", "vàng"]),
  seed(12, "Phong bì mời in ép kim", "draft", 45_000, ["thiep"]),
];

export const store = {
  all(): Product[] {
    return products;
  },
  get(id: string): Product | undefined {
    return products.find((p) => p.id === id);
  },
  insert(product: Product): Product {
    products.push(product);
    return product;
  },
  replace(id: string, next: Product): Product {
    const idx = products.findIndex((p) => p.id === id);
    products[idx] = next;
    return next;
  },
  remove(id: string): boolean {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    products.splice(idx, 1);
    return true;
  },
  touch(p: Product): Product {
    p.updated_at = now();
    return p;
  },
};
