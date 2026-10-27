import InputFields from "@/components/order/InputFields";
import { Info } from "lucide-react";
import { useTranslation } from "react-i18next";

interface InputSelectionProps {
    gameConfig: any;
    inputs: Record<string, string>;
    handleInputChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => void;
    idRef: React.RefObject<HTMLDivElement>;
    serverRef: React.RefObject<HTMLDivElement>;
    openGuideDrawer: () => void;
}

export default function InputSelection({
    gameConfig,
    inputs,
    handleInputChange,
    idRef,
    serverRef,
    openGuideDrawer
}: InputSelectionProps) {
    const { t } = useTranslation();
    return (
        <section
            className="relative scroll-mt-20 rounded-xl bg-card/50 shadow-sm md:scroll-mt-[7.5rem]"
            id="2"
        >
            <div className="flex items-center rounded-t-xl bg-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-tl-xl bg-primary font-semibold text-primary-foreground">
                    1
                </div>
                <h2 className="ml-3 text-sm font-semibold text-card-foreground">
                    {t("order.Masukkan Data Akun")}
                </h2>
                {(gameConfig?.guide_text || gameConfig?.guide_image) && (
                    <div
                        onClick={openGuideDrawer}
                        className="ml-2 flex items-center gap-2 cursor-pointer w-fit rounded-md px-2 py-2 text-xs text-card-foreground transition"
                    >
                        <Info className="h-4 w-4" />
                    </div>
                )}
            </div>

            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <InputFields
                        gameConfig={gameConfig}
                        inputs={inputs}
                        handleInputChange={handleInputChange}
                        idRef={idRef}
                        serverRef={serverRef}
                    />
                </div>
            </div>
        </section>
    );
}
