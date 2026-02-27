import { getAllCards } from "@/lib/cards";
import { WalletClient } from "@/components/wallet/wallet-client";

export const dynamic = "force-dynamic";

export default function WalletPage() {
    const cardCatalog = getAllCards();

    return <WalletClient cardCatalog={cardCatalog} />;
}
