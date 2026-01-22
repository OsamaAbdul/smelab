import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Banknote, Building2, Smartphone, ShieldCheck, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    onSuccess: () => void;
    businessName: string;
}

const PaymentModal = ({ isOpen, onClose, amount, onSuccess, businessName }: PaymentModalProps) => {
    const [loading, setLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

    const handlePayment = async () => {
        if (!selectedMethod) {
            toast.error("Please select a payment method");
            return;
        }

        setLoading(true);
        // Simulate payment processing
        setTimeout(() => {
            setLoading(false);
            onSuccess();
            onClose();
            toast.success(`Payment of ₦${amount.toLocaleString()} successful via ${selectedMethod}!`);
        }, 2000);
    };

    const paymentMethods = [
        { id: "paystack", name: "Paystack", icon: <CreditCard className="h-6 w-6" />, color: "text-blue-400" },
        { id: "opay", name: "Opay", icon: <Smartphone className="h-6 w-6" />, color: "text-green-400" },
        { id: "moniepoint", name: "Moniepoint", icon: <Building2 className="h-6 w-6" />, color: "text-blue-500" },
        { id: "transfer", name: "Bank Transfer", icon: <Banknote className="h-6 w-6" />, color: "text-purple-400" },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-white border-0 text-zinc-950 shadow-2xl p-0 overflow-hidden sm:rounded-3xl">

                <DialogHeader className="p-8 pb-4 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                            <ShieldCheck className="h-6 w-6 text-sme-orange" />
                        </div>
                        <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-zinc-900 to-zinc-600">
                            Secure Checkout
                        </DialogTitle>
                        <DialogDescription className="text-zinc-500 mt-2">
                            Complete payment for <span className="font-semibold text-zinc-900">{businessName}</span>
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <div className="px-8 py-2">
                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-6 flex flex-col items-center justify-center mb-8">
                        <span className="text-zinc-500 text-sm font-medium uppercase tracking-wider mb-1">Total Amount</span>
                        <span className="text-4xl font-bold text-zinc-900">₦{amount.toLocaleString()}</span>
                    </div>

                    <div className="space-y-3 mb-8">
                        <p className="text-sm font-medium text-zinc-900">Select Payment Method</p>
                        <div className="grid grid-cols-2 gap-3">
                            {paymentMethods.map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={cn(
                                        "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-300 group bg-white",
                                        selectedMethod === method.id
                                            ? "border-sme-orange bg-orange-50/50 shadow-sm"
                                            : "border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50"
                                    )}
                                >
                                    <div className={cn("mb-2 transition-transform group-hover:scale-110", method.color.replace('text-', 'text-'))}>
                                        {/* Color adjustment logic might be needed depending on the icon color prop usage, sticking to class */}
                                        <div className={cn(selectedMethod === method.id ? "text-sme-orange" : "text-zinc-400 group-hover:text-zinc-600")}>
                                            {method.icon}
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "text-xs font-bold",
                                        selectedMethod === method.id ? "text-sme-orange" : "text-zinc-500 group-hover:text-zinc-700"
                                    )}>
                                        {method.name}
                                    </span>
                                    {selectedMethod === method.id && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sme-orange" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-400 uppercase tracking-widest font-medium mb-6">
                        <Lock className="w-3 h-3" />
                        <span>Secured by 256-bit SSL Encryption</span>
                    </div>
                </div>

                <div className="p-8 pt-0 flex gap-4">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 py-6 border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 rounded-xl font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        className="flex-[2] py-6 bg-[#09090b] hover:bg-zinc-800 text-white font-bold shadow-xl shadow-black/5 rounded-xl"
                        onClick={handlePayment}
                        disabled={loading || !selectedMethod}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                            </>
                        ) : (
                            <span className="flex items-center gap-2">
                                Pay Now <ShieldCheck className="w-4 h-4 text-zinc-400" />
                            </span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentModal;
