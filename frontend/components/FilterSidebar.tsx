import { ReactNode, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const CATEGORIES = ["Clothing", "Shoes", "Accessories", "Bags", "Jewelry", "Watches"] as const;
const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
const BRANDS = ["Maison Noir", "Artisan & Co", "Everlane", "Cuyana", "Mejuri", "Nordgreen", "Le Specs"] as const;
const RATINGS = [4, 3, 2, 1] as const;

const COLORS = [
    { name: "Black", hex: "#1a1a1a" },
    { name: "White", hex: "#f5f5f5" },
    { name: "Navy", hex: "#1e3a5f" },
    { name: "Beige", hex: "#d4c5a9" },
    { name: "Brown", hex: "#7b5b3a" },
    { name: "Grey", hex: "#8e8e8e" },
    { name: "Red", hex: "#c0392b" },
    { name: "Green", hex: "#27ae60" },
    { name: "Blue", hex: "#2980b9" },
    { name: "Pink", hex: "#e91e90" },
] as const;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type Category = typeof CATEGORIES[number];
type Size = typeof SIZES[number];
type Brand = typeof BRANDS[number];
type Rating = typeof RATINGS[number];
type ColorName = typeof COLORS[number]["name"];

export interface Filters {
    categories: Category[];
    colors: ColorName[];
    sizes: Size[];
    brands: Brand[];
    priceRange: [number, number];
    minRating: Rating | null;
    inStockOnly: boolean;
}

interface FilterSectionProps {
    title: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

interface FilterSidebarProps {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
    activeFilterCount: number;
}

/* -------------------------------------------------------------------------- */
/* Components                                                                 */
/* -------------------------------------------------------------------------- */

function FilterSection({
    title,
    children,
    defaultOpen = true,
}: FilterSectionProps) {
    const [open, setOpen] = useState<boolean>(defaultOpen);

    return (
        <div className="border-b border-stone-100 pb-5 mb-5 last:border-0">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center justify-between w-full group"
                type="button"
            >
                <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-stone-900">
                    {title}
                </span>
                {open ? (
                    <ChevronUp className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                ) : (
                    <ChevronDown className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                )}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function FilterSidebar({
    filters,
    onFilterChange,
    activeFilterCount,
}: FilterSidebarProps) {
    const handleToggle = <K extends keyof Filters>(
        key: K,
        value: Filters[K] extends (infer U)[] ? U : never
    ) => {
        const current = (filters[key] as unknown as unknown[]) ?? [];
        const updated = current.includes(value)
            ? current.filter((v) => v !== value)
            : [...current, value];

        onFilterChange({
            ...filters,
            [key]: updated,
        });
    };

    const handlePriceChange = (value: [number, number]) => {
        onFilterChange({ ...filters, priceRange: value });
    };

    const handleRatingChange = (value: Rating) => {
        onFilterChange({
            ...filters,
            minRating: filters.minRating === value ? null : value,
        });
    };

    const handleStockToggle = (checked: boolean) => {
        onFilterChange({ ...filters, inStockOnly: checked });
    };

    const clearAll = () => {
        onFilterChange({
            categories: [],
            colors: [],
            sizes: [],
            brands: [],
            priceRange: [0, 1200],
            minRating: null,
            inStockOnly: false,
        });
    };

    return (
        <aside className="h-full w-100 border">
            {/* Header */}
            <div className="flex items-center justify-between mb-7">
                <h2 className="text-lg font-semibold text-stone-900 tracking-tight">
                    Filters
                </h2>

                {activeFilterCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="text-xs text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5"
                        type="button"
                    >
                        Clear all
                        <Badge
                            variant="secondary"
                            className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px] bg-stone-900 text-white"
                        >
                            {activeFilterCount}
                        </Badge>
                    </button>
                )}
            </div>

            {/* Category */}
            <FilterSection title="Category">
                <div className="space-y-2.5">
                    {CATEGORIES.map((cat) => (
                        <label key={cat} className="flex items-center gap-3 cursor-pointer">
                            <Checkbox
                                checked={filters.categories.includes(cat)}
                                onCheckedChange={() => handleToggle("categories", cat)}
                            />
                            <span className="text-sm text-stone-600">{cat}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            

            {/* Price */}
            {/* <FilterSection title="Price">
                <Slider
                    value={filters.priceRange}
                    onValueChange={handlePriceChange}
                    max={1200}
                    min={0}
                    step={10}
                />
            </FilterSection> */}
            <FilterSection title="Price">
                <div>
                    <input type="text" /><input type="text" />
                </div>
            </FilterSection>
            {/* Rating */}
            <FilterSection title="Rating" defaultOpen={false}>
                {RATINGS.map((rating) => (
                    <button
                        key={rating}
                        type="button"
                        onClick={() => handleRatingChange(rating)}
                        className={cn(
                            "flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm",
                            filters.minRating === rating
                                ? "bg-stone-900 text-white"
                                : "hover:bg-stone-50 text-stone-600"
                        )}
                    >
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                                key={i}
                                className={cn(
                                    "h-3.5 w-3.5",
                                    i < rating ? "fill-amber-400 text-amber-400" : "text-stone-200"
                                )}
                            />
                        ))}
                        <span>& up</span>
                    </button>
                ))}
            </FilterSection>

            {/* In Stock */}
            <FilterSection title="Availability">
                <label className="flex items-center justify-between">
                    <span className="text-sm text-stone-600">In stock only</span>
                    <Switch
                        checked={filters.inStockOnly}
                        onCheckedChange={handleStockToggle}
                    />
                </label>
            </FilterSection>
        </aside>
    );
}
