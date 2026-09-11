import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import Hero from "./components/Hero";
import WhatIsSynfolix from "./components/WhatIsSynfolix";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <Hero />
        <WhatIsSynfolix />
      </main>
      <Footer />
    </div>
  );
}
