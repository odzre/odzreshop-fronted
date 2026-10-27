"use client";

export function LoadingScreen() {
    return (
        <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-my-color3/50 text-white">
            {/* TOP WAVE */}
            <svg
                width="1024"
                height="244"
                viewBox="0 0 1024 244"
                fill="none"
                className="absolute right-0 top-0 text-primary animate-pulse"
            >
                <path
                    d="M61.5 65C33.1 55.4 8.66667 17.6667 0 0H1024V244C970.833 196.667 847.1 97 777.5 77C690.5 52 97 77 61.5 65Z"
                    fill="currentColor"
                ></path>
            </svg>

            {/* BOTTOM WAVE */}
            <svg
                width="1024"
                height="244"
                viewBox="0 0 1024 244"
                fill="none"
                className="absolute bottom-0 left-0 text-primary animate-pulse"
            >
                <path
                    d="M962.5 179C990.9 188.6 1015.33 226.333 1024 244H0V0C53.1667 47.3333 176.9 147 246.5 167C333.5 192 927 167 962.5 179Z"
                    fill="currentColor"
                ></path>
            </svg>

            {/* LOADING CONTENT */}
            <div className="relative z-20 flex flex-col items-center justify-center gap-4 px-4 text-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-foreground border-t-transparent"></div>

                <h1 className="text-xl font-bold md:text-3xl animate-pulse">
                    Processing...
                </h1>
                <p className="opacity-70 text-sm md:text-base animate-pulse">
                    Please wait a moment
                </p>
            </div>
        </div>
    );
}
