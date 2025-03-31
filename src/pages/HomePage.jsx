import './HomePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer'
import HeroSection from '../components/Main_page/HeroSection';
import ChoseMode from '../components/Main_page/ChoseMode'


export default function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <HeroSection />
      <ChoseMode />
      <Footer />
    </div>
  );
}