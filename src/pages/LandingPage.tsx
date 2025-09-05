import Hero from '../components/Hero';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navigation />
            <Hero />
            <Footer />
        </div>
    );
};

export default LandingPage;