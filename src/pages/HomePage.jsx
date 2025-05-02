import './HomePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/Main_page/HeroSection';
import ChoseMode from '../components/Main_page/ChoseMode';
import { useAuth } from '../contexts/AuthContext';
import SiteFeatures from '../components/Main_page/SiteFeatures';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <Header />
      {!user && <HeroSection />}
      <ChoseMode />
      <SiteFeatures />
      <Footer />
    </div>
  );
}