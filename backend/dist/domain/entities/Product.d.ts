export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface ProductResponse {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    categoryName?: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
}
export interface CreateProductDTO {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    imageUrl: string;
}
export interface UpdateProductDTO {
    name?: string;
    description?: string;
    price?: number;
    stock?: number;
    categoryId?: string;
    imageUrl?: string;
    isActive?: boolean;
}
export interface ProductFilter {
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    isActive?: boolean;
    search?: string;
}
//# sourceMappingURL=Product.d.ts.map