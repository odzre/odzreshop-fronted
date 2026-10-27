"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

interface SliderProps {
    slides: { id: number; images: string; title: string }[];
}

/* ✅ component image wrapper */
function SlideImage({
    src,
    alt,
    priority,
}: {
    src: string;
    alt: string;
    priority?: boolean;
}) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className="relative w-full h-full">

            {/* placeholder */}
            {!loaded && (
                <ImagePlaceholder className="absolute inset-0 rounded-2xl" />
            )}

            {/* real image */}
            <Image
                src={src}
                alt={alt}
                width={1280}
                height={500}
                sizes="(max-width:768px) 100vw, 1280px"
                priority={priority}
                loading={priority ? "eager" : "lazy"}
                onLoadingComplete={() => setLoaded(true)}
                className={`w-full h-auto object-cover rounded-2xl transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"
                    }`}
            />

        </div>
    );
}

export function Slider({ slides }: SliderProps) {

    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: slides.length > 1,
        align: "start",
    });

    /* autoplay */
    useEffect(() => {
        if (!emblaApi) return;

        const interval = setInterval(() => {
            emblaApi.scrollNext();
        }, 6000);

        return () => clearInterval(interval);
    }, [emblaApi]);

    const scrollNext = () => emblaApi?.scrollNext();
    const scrollPrev = () => emblaApi?.scrollPrev();

    return (
        <div className="embla relative">

            <div className="embla__viewport" ref={emblaRef}>
                <div className="embla__container">

                    {slides.map((slide, index) => (

                        <div key={slide.id} className="embla__slide">

                            <SlideImage
                                src={slide.images}
                                alt={slide.title}
                                priority={index === 0}
                            />

                        </div>

                    ))}

                </div>
            </div>

            {/* BUTTON */}
            <div className="absolute inset-0 items-center justify-between px-4 pointer-events-none hidden md:flex">

                <button
                    onClick={scrollPrev}
                    className="pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>

                <button
                    onClick={scrollNext}
                    className="pointer-events-auto bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30 text-white"
                >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>

            </div>

        </div>
    );
}