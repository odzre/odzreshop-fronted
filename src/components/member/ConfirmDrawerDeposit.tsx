"use client";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useCurrency } from "@/hooks/useCurrency";

interface ConfirmDrawerDepositProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  methodName: string;
  fee: number;
  feePercent: number;
  total: number;
  submitting: boolean;
  onConfirm: () => void;
}

export default function ConfirmDrawerDeposit({
  isOpen,
  onOpenChange,
  amount,
  methodName,
  fee,
  feePercent,
  total,
  submitting,
  onConfirm
}: ConfirmDrawerDepositProps) {
  const { format } = useCurrency();
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="w-full lg:max-w-lg mx-auto rounded-t-2xl border-t shadow-lg">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-semibold text-center">
            Konfirmasi Deposit
          </DrawerTitle>
          <DrawerDescription className="text-center text-sm text-muted-foreground">
            Pastikan data deposit kamu sudah benar sebelum melanjutkan
            pembayaran.
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 py-4 space-y-3 text-sm">
          <div className="flex justify-between">
            <span>Nominal Deposit</span>
            <span className="font-medium">
              {format(amount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Metode Pembayaran</span>
            <span className="font-medium">{methodName}</span>
          </div>
          <div className="flex justify-between">
            <span>Biaya Admin</span>
            <span className="font-medium">
              {format(fee)}
              {feePercent > 0 && ` + ${feePercent}%`}
            </span>
          </div>
          <div className="border-t my-2" />
          <div className="flex justify-between text-base font-semibold">
            <span>Total Pembayaran</span>
            <span className="text-primary">
              {format(total)}
            </span>
          </div>
        </div>

        <DrawerFooter className="px-6 pb-6">
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="w-full bg-my-color3 text-white hover:bg-my-color3/80"
          >
            {submitting ? (
              <>
                <LoadingSpinner size={16} /> &nbsp; Memproses...
              </>
            ) : (
              "Konfirmasi & Bayar"
            )}
          </Button>

          <DrawerClose asChild>
            <Button variant="outline" className="w-full">
              Batal
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
