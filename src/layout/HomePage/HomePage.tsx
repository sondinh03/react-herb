import { ExpertCorner } from "./components/ExpertCorner";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { HerbList } from "./components/HerbList";
import { HeroSection } from "./components/HeroSection";
import { MedicinalHerbs } from "./components/MedicinalHerbs";
import { NewsSection } from "./components/NewsSection";

export const HomePage = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <HeroSection />
            <MedicinalHerbs />
            <HerbList />
            <NewsSection />
            <ExpertCorner />
            <Footer />
        </div>
    );
}