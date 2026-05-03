import Link from "next/link";
import SiteHeader from "../components/SiteHeader";
import SignupPrompt from "./SignupPrompt";

export default function LoginPage() {
 return (
 <main className="h-screen w-full bg-[#f3f4f6] flex items-stretch justify-center px-4 sm:px-6 py-4 sm:py-6 transition-colors">
 <div className="relative w-full max-w-[1600px] bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 <SiteHeader />

 <section className="relative z-10 flex-1 flex items-center justify-center px-4 pb-10">
 <div className="w-full max-w-[820px]">
 <div className="relative grid grid-cols-1 md:grid-cols-2 overflow-hidden rounded-2xl bg-white">
 {/* Welcome panel */}
 <div className="relative z-10 rounded-t-2xl md:rounded-t-none md:rounded-l-2xl bg-white px-4 py-6 md:py-2 flex flex-col items-center justify-center text-center welcome-split">
 <h2 className="welcome-sweep text-[52px] leading-[1.0] font-extrabold tracking-[-0.025em]">
 Welcome
 <br />
 Aboard
 </h2>
 </div>

 {/* Form area */}
 <div className="relative z-0 flex flex-col bg-white form-reveal">
 <div className="px-9 pt-10 pb-6">
 <h1 className="text-[18px] font-semibold text-neutral-900">
 Sign in
 </h1>
 <p className="mt-1 text-[12.5px] text-neutral-500">
 Enter your credentials to continue.
 </p>

 <form className="mt-7 space-y-6" action="">
 <Field label="Email" type="email" name="email" autoComplete="email" />
 <Field
 label="Password"
 type="password"
 name="password"
 autoComplete="current-password"
 />

 <div className="flex items-center justify-between text-[12px] pt-1">
 <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
 <input
 type="checkbox"
 className="h-3.5 w-3.5 accent-[#15803d]"
 />
 Remember me
 </label>
 <span className="cursor-pointer text-[#15803d] hover:underline">
 Forgot password?
 </span>
 </div>
 </form>
 </div>

 <div className="px-9 pb-4 flex justify-center">
 <Link
 href="/portal"
 className="rounded-full bg-[#15803d] px-12 py-3 text-[14px] font-semibold text-white shadow-[0_10px_25px_-10px_rgba(21,128,61,0.7)] hover:bg-[#126a33] transition-colors"
 >
 Log In
 </Link>
 </div>
 </div>
 </div>

 <p className="mt-3 px-4 text-center text-[12.5px] sm:text-[13px] leading-relaxed text-neutral-500 sm:whitespace-nowrap fade-late">
 Sign in to track your applications, manage contracts, and pick up
 where you left off — wherever you are at sea.
 </p>

 <SignupPrompt />
 </div>
 </section>
 </div>
 </main>
 );
}

function Field({
 label,
 type,
 name,
 autoComplete,
}: {
 label: string;
 type: string;
 name: string;
 autoComplete?: string;
}) {
 return (
 <div className="relative w-3/4">
 <input
 id={name}
 name={name}
 type={type}
 autoComplete={autoComplete}
 placeholder=" "
 className="peer w-full border-b border-neutral-300 bg-transparent pt-3 pb-1.5 text-[14px] text-neutral-900 placeholder-transparent outline-none transition-colors focus:border-neutral-700 caret-neutral-700 selection:bg-neutral-200 selection:text-neutral-900 [accent-color:#525252]"
 />
 <label
 htmlFor={name}
 className="pointer-events-none absolute left-0 top-3 text-[14px] text-neutral-400 transition-all peer-focus:-translate-y-3 peer-focus:text-[11px] peer-focus:text-neutral-600 peer-[&:not(:placeholder-shown)]:-translate-y-3 peer-[&:not(:placeholder-shown)]:text-[11px]"
 >
 {label}
 </label>
 </div>
 );
}
