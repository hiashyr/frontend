import TopicSelection from '../../components/tests/TopicSelection';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './TopicsPage.css';

export default function TopicsPage() {
  return (
    <div className="page-container">
      <Header />
      <main className="main-content">
        <TopicSelection />
      </main>
      <Footer />
    </div>
  );
}