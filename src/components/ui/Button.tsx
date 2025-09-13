interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  isLoading?: boolean;
}

export function Button({ children, className = "", isLoading = false, ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center px-6 py-3 text-sm font-semibold rounded-lg border border-black transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        </div>
      ) : (
        children
      )}
    </button>
  );
}
