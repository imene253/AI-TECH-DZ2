import React from 'react';
import Navigation from '../components/Navigation';
import CoursesSection from '../components/CoursesSection';
import Footer from '../components/Footer';

const Courses = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <CoursesSection />
      <Footer />
    </div>
  );
};

export default Courses;


