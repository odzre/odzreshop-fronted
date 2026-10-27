import { Transaction } from "@/types";
import { useCurrency } from "@/hooks/useCurrency";

interface InvoicePaymentDetailsProps {
  order: Transaction;
}

export function InvoicePaymentDetails({ order }: InvoicePaymentDetailsProps) {
  const { format } = useCurrency();
  const hasDiscount = (order?.discount_price ?? 0) > 0;
  const finalPrice = hasDiscount
    ? (order.price ?? 0) - (order.discount_price ?? 0)
    : order.price ?? 0;

  return (
    <div className="rounded-xl border border-border bg-muted/50 p-4 space-y-4 text-sm">
      <div className="space-y-3">
        {/* Harga Produk */}
        <div className="flex justify-between items-end">
          <span className="text-foreground font-medium">Harga</span>
          <div className="text-right">
            {hasDiscount ? (
              <>
                <del className="block text-muted-foreground text-xs">
                  {format(order.price ?? 0)}
                </del>
                <span className="text-green-600 font-semibold">
                  {format(finalPrice)}
                </span>
              </>
            ) : (
              <span className="text-muted-foreground">
                {format(order.price ?? 0)}
              </span>
            )}
          </div>
        </div>

        {/* Jumlah */}
        <div className="flex justify-between">
          <span className="text-foreground font-medium">Jumlah</span>
          <span className="text-muted-foreground">{order.quantity ?? 1}x</span>
        </div>

        {/* Payment Fee */}
        <div className="flex justify-between">
          <span className="text-foreground font-medium">Payment Fee</span>
          <span className="text-muted-foreground">
            {format(order.fee ?? 0)}
          </span>
        </div>

        {/* Diskon Voucher */}
        {(order.discount_voucher ?? 0) > 0 && (
          <div className="flex justify-between">
            <span className="text-foreground font-medium">
              Voucher {order.code_voucher ? `(${order.code_voucher})` : ""}
            </span>
            <span className="text-green-600 font-medium">
              - {format(order.discount_voucher ?? 0)}
            </span>
          </div>
        )}
      </div>

      {/* Total Final */}
      <div className="border-t border-border pt-3 flex justify-between items-center">
        <span className="text-foreground font-semibold">Total Pembayaran</span>
        <span className="text-primary font-bold text-base">
          {format(order.total_price ?? 0)}
        </span>
      </div>
    </div>
  );
}
