export default function SectionHeading({ children, className = '' }) {
  return (
    <h3
      className={`relative my-6 text-center font-semibold text-slate-700 before:absolute before:left-0 before:top-1/2 before:h-px before:w-1/3 before:bg-slate-300 after:absolute after:right-0 after:top-1/2 after:h-px after:w-1/3 after:bg-slate-300 ${className}`}
    >
      <span className="px-2 bg-white relative z-10">{children}</span>
    </h3>
  )
}
