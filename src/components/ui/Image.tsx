"use client";

import { useState } from "react";
import NextImage, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";

interface Props extends ImageProps { }

export default function Image({
    src,
    alt,
    className,
    unoptimized,
    ...rest
}: Props) {

    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const isGif =
        typeof src === "string" &&
        src.toLowerCase().endsWith(".gif");

    // jika error tampilkan placeholder svg
    if (hasError) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center bg-gray-200 dark:bg-gray-700",
                    className
                )}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-1/3 h-1/3 text-gray-400"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z"
                    />
                </svg>
            </div>
        );
    }

    return (
        <NextImage
            src={src}
            alt={alt}
            {...rest}

            // GIF tidak dioptimasi agar animasi tetap jalan
            unoptimized={isGif || !!unoptimized}

            onLoad={() => setIsLoaded(true)}

            onError={() => setHasError(true)}

            className={cn(
                "object-cover object-center transition-all duration-300 ease-out",
                isLoaded
                    ? "blur-0 scale-100 opacity-100"
                    : "blur-sm scale-100 opacity-70",
                className
            )}
        />
    );
}