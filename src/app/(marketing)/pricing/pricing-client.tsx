"use client";

export function CheckoutButton({
    priceId,
    label,
}: {
    priceId: string;
    label: string;
}) {
    const handleClick = async () => {
        const res = await fetch("/api/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ priceId }),
        });
        const { url } = await res.json();
        if (url) window.location.href = url;
    };

    return (
        <button
            onClick={handleClick}
            className="rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-black hover:bg-cyan-300 transition-colors w-full"
        >
            {label}
        </button>
    );
}