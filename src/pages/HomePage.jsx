import './HomePage.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import HeroSection from '../components/Main_page/HeroSection';
import ChoseMode from '../components/Main_page/ChoseMode';
import { useAuth } from '../contexts/AuthContext';
import SiteFeatures from '../components/Main_page/SiteFeatures';
import { useLocation } from 'react-router-dom';
import NewNotification from '../components/Notification/NewNotification';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { user } = useAuth();
  const location = useLocation();
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    console.log('Location state:', location.state);
    if (location.state?.fromLogin) {
      setNotification({
        message: 'Авторизация прошла успешно!',
        type: 'success'
      });
      // Clear the redirection state after the notification is shown
      setTimeout(() => {
        location.state = null;
      }, 3000); // 3000ms - duration of the notification
    }
  }, [location.state]);

  return (
    <div className="home-page">
      <Header />
      {!user && <HeroSection />}
      <ChoseMode />
      <SiteFeatures />
      <Footer />

      {notification && (
        <NewNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}
