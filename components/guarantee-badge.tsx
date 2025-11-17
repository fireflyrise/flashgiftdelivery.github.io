export function GuaranteeBadge() {
  return (
    <div className="inline-flex items-center gap-3 bg-yellow-200 text-black px-6 py-3 rounded-full shadow-xl border-4 border-yellow-400">
      <svg
        className="w-7 h-7 drop-shadow-md"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
      <span className="font-black text-lg drop-shadow-md">100% Money-Back Guarantee</span>
    </div>
  );
}
