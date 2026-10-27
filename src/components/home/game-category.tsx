import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSettings } from "@/context/settings-context";

interface Category {
    id: string;
    title: string;
    sort: number;
    status?: boolean; // ✅ tambahkan properti status
}

interface GameCategoriesProps {
    dataCategories?: { data: Category[] };
    selectedCategory: string | null;
    setSelectedCategory: (categoryId: string) => void;
    scrollCategories: (direction: "left" | "right") => void;
    categoryRef: React.RefObject<HTMLDivElement>;
}

export function GameCategories({
    dataCategories,
    selectedCategory,
    setSelectedCategory,
    scrollCategories,
    categoryRef
}: GameCategoriesProps) {
    const categoryContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const categoryItemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.9 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } }
    };

    const settings = useSettings() as { data?: Record<string, string> } | null;

    const settingsLoaded = settings?.data !== undefined;

    const showAllButton =
        settingsLoaded && settings.data?.["general.show_category_all"] === "1";

    // ✅ Urutkan kategori berdasarkan sort (0 dianggap paling akhir)
    // dan sembunyikan yang status-nya false
    const sortedCategories =
        dataCategories?.data
            ?.filter((c) => c.status !== false) // ⬅️ hanya tampilkan aktif
            ?.sort((a, b) => {
                const sortA = Number(a.sort ?? 0);
                const sortB = Number(b.sort ?? 0);

                if (sortA === 0 && sortB !== 0) return 1;
                if (sortA !== 0 && sortB === 0) return -1;
                if (sortA !== sortB) return sortA - sortB;
                return (a.title || '').localeCompare(b.title || '');
            }) ?? [];

    return (
        <>
            {dataCategories ? (
                <motion.div
                    className="relative flex items-center"
                    initial="hidden"
                    animate="visible"
                    variants={categoryContainerVariants}
                >
                    {/* Tombol Scroll Kiri */}
                    <motion.button
                        className="absolute left-0 flex md:hidden bg-primary p-2 rounded-lg text-white shadow-md"
                        onClick={() => scrollCategories("left")}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronLeft size={18} />
                    </motion.button>

                    {/* Daftar Kategori */}
                    <motion.div
                        ref={categoryRef}
                        className="hide-scrollbar mx-11 md:mx-0 py-2 flex transform items-center gap-2 overflow-auto duration-300 ease-in-out md:gap-3"
                        variants={categoryContainerVariants}
                        initial="hidden"
                        animate="visible"
                    >

                        {settingsLoaded && showAllButton && (
                            <motion.button
                                key="all"
                                onClick={() => setSelectedCategory("all")}
                                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold outline-none duration-300 ${selectedCategory === "all"
                                    ? "bg-primary text-white"
                                    : "border bg-muted"
                                    }`}
                                variants={categoryItemVariants}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                Semua
                            </motion.button>
                        )}
                        {sortedCategories.map((category) => (
                            <motion.button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold outline-none duration-300 ${selectedCategory === category.id
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-foreground "
                                    }`}
                                variants={categoryItemVariants}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {category.title}
                            </motion.button>
                        ))}
                    </motion.div>

                    {/* Tombol Scroll Kanan */}
                    <motion.button
                        className="absolute right-0 flex md:hidden bg-primary p-2 rounded-lg text-white shadow-md"
                        onClick={() => scrollCategories("right")}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <ChevronRight size={18} />
                    </motion.button>
                </motion.div>
            ) : (
                // Skeleton Loading
                <motion.div className="relative flex items-center">
                    <motion.div
                        className="absolute left-0 z-10 rounded-lg shadow-md bg-muted"
                        style={{ width: 35, height: 35 }}
                    />
                    <div className="hide-scrollbar mx-11 flex transform items-center gap-2 overflow-auto duration-300 ease-in-out md:gap-3">
                        {[...Array(3)].map((_, index) => (
                            <Skeleton
                                key={index}
                                className="whitespace-nowrap rounded-lg px-14 py-3 h-8 w-24"
                            />
                        ))}
                    </div>
                    <motion.div
                        className="absolute right-0 z-10 rounded-lg shadow-md bg-muted"
                        style={{ width: 35, height: 35 }}
                    />
                </motion.div>
            )}
        </>
    );
}
