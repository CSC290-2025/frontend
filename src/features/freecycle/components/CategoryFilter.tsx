import type { Category } from '@/types/postItem';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategories: number[];
  onToggleCategory: (categoryId: number) => void;
}

export default function CategoryFilter({
  categories,
  selectedCategories,
  onToggleCategory,
}: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.id);
        return (
          <button
            key={category.id}
            onClick={() => onToggleCategory(category.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isSelected
                ? 'bg-cyan-500 text-white shadow-md'
                : 'border border-gray-300 bg-white text-gray-700 hover:border-cyan-500'
            }`}
          >
            {category.category_name}
          </button>
        );
      })}
    </div>
  );
}
