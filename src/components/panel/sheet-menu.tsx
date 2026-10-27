import Link from "next/link";
import { MenuIcon, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu } from "@/components/panel/menu";
import {
    Sheet,
    SheetHeader,
    SheetContent,
    SheetTrigger,
    SheetClose,
    SheetTitle
} from "@/components/ui/sheet";
import Image from "next/image";
import { useSettings } from "@/context/settings-context";

export function SheetMenu() {
    interface Settings {
        data: {
            ["general.logo"]?: string;
        };
    }

    const settings = useSettings() as unknown as Settings | null;
    const logoUrl = settings?.data?.["general.logo"] ?? "/default-logo.png";

    return (
        <Sheet>
            <SheetTrigger className="lg:hidden md:hidden" asChild>
                <Button className="h-9" variant="outline" size="icon">
                    <MenuIcon size={20} />
                </Button>
            </SheetTrigger>

            <SheetContent
                side="left"
                hideClose
                className="sm:w-72 p-0 h-full flex flex-col"
            >

                {/* HEADER */}
                <SheetHeader className="border-b border-dashed p-4">

                    {/* title hidden (accessibility) */}
                    <SheetTitle className="sr-only">Menu</SheetTitle>

                    <div className="flex flex-row-reverse items-center justify-between">

                        {/* CLOSE */}
                        <SheetClose asChild>
                            <button className="-m-2 p-2 text-gray-400 hover:text-black">
                                <span className="sr-only">Close menu</span>
                                <X className="h-6 w-6" />
                            </button>
                        </SheetClose>

                        {/* LOGO */}
                        <Link href="/" className="flex items-center">
                            <Image
                                src={logoUrl}
                                alt="Logo"
                                width={120}
                                height={40}
                                className="h-10 w-auto object-contain"
                            />
                        </Link>

                    </div>
                </SheetHeader>

                {/* MENU */}
                <div className="px-3 py-2">
                    <Menu isOpen />
                </div>

            </SheetContent>
        </Sheet>
    );
}