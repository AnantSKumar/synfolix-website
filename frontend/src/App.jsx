import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import WhatIsSynfolix from "./components/WhatIsSynfolix";
import OurProducts from "./components/OurProducts";
import BuildWithSynfolix from "./components/BuildWithSynfolix";
import Industries from "./components/Industries";
import WhySynfolix from "./components/WhySynfolix";
import Process from "./components/Process";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <WhatIsSynfolix />
        <OurProducts />
        <BuildWithSynfolix />
        <Industries />
        <WhySynfolix />
        <Process />
      </main>
      <Footer />
    </div>
  );
}
