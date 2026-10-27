"use client";

import React, { useEffect, useRef } from "react";

interface UnderlineNavProps {
    activeSelector: string;
    children: (props: { handleHover: (e: React.MouseEvent<HTMLElement>) => void }) => React.ReactNode;
}

export const UnderlineNav: React.FC<UnderlineNavProps> = ({ activeSelector, children }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const underlineRef = useRef<HTMLDivElement>(null);

    const moveUnderline = (el: HTMLElement | null) => {
        if (!el || !underlineRef.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();

        underlineRef.current.style.width = `${elRect.width}px`;
        underlineRef.current.style.transform = `translateX(${elRect.left - containerRect.left}px)`;
        underlineRef.current.style.opacity = "1";
    };

    const handleHover = (e: React.MouseEvent<HTMLElement>) => {
        moveUnderline(e.currentTarget as HTMLElement);
    };

    const handleLeave = () => {
        const activeLink = containerRef.current?.querySelector<HTMLElement>(activeSelector);
        moveUnderline(activeLink ?? null);
    };

    useEffect(() => {
        const activeLink = containerRef.current?.querySelector<HTMLElement>(activeSelector);
        moveUnderline(activeLink ?? null);
    }, [activeSelector]);

    return (
        <div
            ref={containerRef}
            onMouseLeave={handleLeave}
            className="relative"
        >
            {children({ handleHover })}

            <div
                ref={underlineRef}
                className="absolute bottom-0 h-[2px] bg-primary transition-all duration-500 ease-in-out opacity-0"
            />
        </div>
    );
};
