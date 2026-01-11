export interface Category {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface CategoryResponse {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    createdAt: Date;
}
export interface CreateCategoryDTO {
    name: string;
    description: string;
    imageUrl: string;
}
export interface UpdateCategoryDTO {
    name?: string;
    description?: string;
    imageUrl?: string;
    isActive?: boolean;
}
//# sourceMappingURL=Category.d.ts.map