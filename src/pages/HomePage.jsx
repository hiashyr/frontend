import './HomePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/Main_page/HeroSection';
import ChoseMode from '../components/Main_page/ChoseMode';
import { useAuth } from '../contexts/AuthContext'; // Импортируем хук аутентификации

export default function HomePage() {
  const { user } = useAuth(); // Получаем информацию о пользователе

  return (
    <div className="home-page">
      <Header />
      {!user && <HeroSection />} {/* Показываем только для неавторизованных */}
      <ChoseMode />
      <Footer />
    </div>
  );
}