import Hero from '../components/Hero';
import CTAPage from './CTAPage';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navigation />
            <Hero />
            <CTAPage />
            <Footer />
        </div>
    );
};

export default LandingPage;