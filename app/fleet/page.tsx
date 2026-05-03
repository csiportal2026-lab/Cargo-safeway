import SiteHeader from "../components/SiteHeader";
import FleetExplorer from "./FleetExplorer";

export default function FleetPage() {
 return (
 <main className="min-h-screen w-full bg-[#f3f4f6] flex items-center justify-center overflow-x-auto px-4 sm:px-6 py-4 sm:py-6">
 <div className="relative card-canvas w-[1123px] h-[632px] shrink-0 bg-white rounded-3xl shadow-[0_2px_30px_-10px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col transition-colors">
 <SiteHeader />
 <section className="relative z-10 flex-1 px-6 sm:px-12 pb-16 pt-6">
 <FleetExplorer />
 </section>
 </div>
 </main>
 );
}
