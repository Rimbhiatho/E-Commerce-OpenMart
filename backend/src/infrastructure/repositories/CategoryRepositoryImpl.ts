import { Category, CreateCategoryDTO, UpdateCategoryDTO, CategoryResponse } from '../../domain/entities/Category';
import { CategoryRepository } from '../../domain/repositories/CategoryRepository';
import { getDatabase } from '../database/database';
import { v4 as uuidv4 } from 'uuid';

export class CategoryRepositoryImpl implements CategoryRepository {
  async findById(id: string): Promise<Category | null> {
    const db = await getDatabase();
    const row = await db.get('SELECT * FROM categories WHERE id = ?', [id]);
    return row ? this.mapRowToCategory(row) : null;
  }

  async findAll(): Promise<Category[]> {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM categories ORDER BY name ASC');
    return rows.map((row: any) => this.mapRowToCategory(row));
  }

  async findActive(): Promise<Category[]> {
    const db = await getDatabase();
    const rows = await db.all('SELECT * FROM categories WHERE isActive = 1 ORDER BY name ASC');
    return rows.map((row: any) => this.mapRowToCategory(row));
  }

  async create(dto: CreateCategoryDTO): Promise<Category> {
    const db = await getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();
    
    await db.run(
      `INSERT INTO categories (id, name, description, imageUrl, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, dto.name, dto.description, dto.imageUrl, 1, now, now]
    );

    return {
      id,
      name: dto.name,
      description: dto.description,
      imageUrl: dto.imageUrl,
      isActive: true,
      createdAt: new Date(now),
      updatedAt: new Date(now)
    };
  }

  async update(id: string, data: UpdateCategoryDTO): Promise<Category> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      values.push(data.description);
    }
    if (data.imageUrl !== undefined) {
      updates.push('imageUrl = ?');
      values.push(data.imageUrl);
    }
    if (data.isActive !== undefined) {
      updates.push('isActive = ?');
      values.push(data.isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return (await this.findById(id)) as Category;
    }

    updates.push('updatedAt = ?');
    values.push(now);
    values.push(id);

    await db.run(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    return (await this.findById(id)) as Category;
  }

  async delete(id: string): Promise<boolean> {
    const db = await getDatabase();
    await db.run('DELETE FROM categories WHERE id = ?', [id]);
    return true;
  }

  toResponse(category: Category): CategoryResponse {
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl,
      isActive: category.isActive,
      createdAt: category.createdAt
    };
  }

  private mapRowToCategory(row: any): Category {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      imageUrl: row.imageUrl || '',
      isActive: row.isActive === 1,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    };
  }
}

export const categoryRepository = new CategoryRepositoryImpl();

