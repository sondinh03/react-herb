import { ExpertCorner } from "./components/ExpertCorner";
import { Header } from "./components/Header";
import { HerbList } from "./components/HerbList";
import { MedicinalHerbs } from "./components/MedicinalHerbs";
import { NewsSection } from "./components/NewsSection";

export const HomePage = () => {
    return (
        <>
            <Header />
            <MedicinalHerbs />
            <HerbList />
            <NewsSection />
            <ExpertCorner />
        </>
    );
}