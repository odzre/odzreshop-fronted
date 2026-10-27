import { Transaction } from "@/types";

interface PaymentInstruction {
  title: string;
  steps: string[];
}

interface InvoicePaymentInstructionsProps {
  order: Transaction;
}

export function InvoicePaymentInstructions({ order }: InvoicePaymentInstructionsProps) {
  const instructions = order.payment_instructions;

  const isArray = Array.isArray(instructions);
  const isHtmlString = typeof instructions === "string";

  return (
    <div className="col-span-12">
      <div className="flex flex-col gap-2">
        <div>
          <div className="mt-2 rounded-lg border border-border/25 bg-secondary/50 p-4 text-sm">
            <h2 className="pb-5 text-sm font-bold">Instruksi Pembayaran</h2>

            {isArray &&
              instructions.map((instruction: PaymentInstruction, index: number) => (
                <div key={index} className="mb-4">
                  <h3 className="font-semibold">{instruction.title}</h3>
                  <ol className="list-decimal pl-5">
                    {instruction.steps.map((step: string, i: number) => (
                      <li key={i} className="mt-1">{step}</li>
                    ))}
                  </ol>
                </div>
              ))}

            {isHtmlString && (
              <div
                className="text-sm prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: instructions }}
              />
            )}

            {!isArray && !isHtmlString && (
              <p className="text-muted-foreground">Instruksi pembayaran tidak tersedia.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
