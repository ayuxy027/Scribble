import React from 'react';
import Hero from '../components/Hero';
import CTA from '../components/CTA';
import Footer from '../components/Footer';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-slate-900">
            <Hero />
            <CTA />
            <Footer />
        </div>
    );
};

export default LandingPage;
