interface TagFilterProp {
  categories: string[];
  selectedCategory: string | undefined;
  onChange: (category: string | undefined) => void;
}

export default function TagFilter({
  categories,
  selectedCategory,
  onChange,
}: TagFilterProp) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const isSelected = selectedCategory === category;

        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(isSelected ? undefined : category)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              isSelected
                ? 'bg-cyan-500 text-white shadow-md'
                : 'border border-gray-300 bg-white text-gray-700 hover:border-cyan-500'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
