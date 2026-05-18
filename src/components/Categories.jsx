"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import './Categories.css';

const Categories = () => {
  const { categories } = useAuth();

  return (
    <section className="categories-circle-section container">
      <div className="section-header-compact">
        <h2>Shop By Category</h2>
        <div className="title-underline"></div>
      </div>

      <div className="categories-duo-row">
        {categories && categories.length > 0 ? (
          categories.map((cat) => (
            <Link href={cat.path || '/'} key={cat.id} className="category-circle-item" style={{ textDecoration: 'none' }}>
              <img 
                src={cat.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=200&auto=format&fit=crop'} 
                alt={cat.name} 
                className="category-img" 
              />
              <span className="category-circle-name">{cat.name}</span>
            </Link>
          ))
        ) : (
          <p style={{ color: '#94a3b8', fontStyle: 'italic', textAlign: 'center', width: '100%', padding: '2rem' }}>
            No categories available. Customize via Admin Panel.
          </p>
        )}
      </div>
    </section>
  );
};

export default Categories;
