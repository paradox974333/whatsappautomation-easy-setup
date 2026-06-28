import Nav from './components/Nav';
import Hero from './components/Hero';
import Features from './components/Features';
import Showcase from './components/Showcase';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Features />
        <Showcase />
        <HowItWorks />
        <Footer />
      </main>
    </>
  );
}
