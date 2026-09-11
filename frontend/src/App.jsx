import NavBar from "./components/NavBar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-24 text-center text-slate-400">
          Homepage sections coming in the next tasks.
        </div>
      </main>
      <Footer />
    </div>
  );
}
