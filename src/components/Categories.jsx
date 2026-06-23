"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import './Categories.css';

const Categories = () => {
  const { categories, isLoading } = useAuth();

  return (
    <section className="categories-circle-section container">
      <div className="section-header-compact">
        <h2>RG Service Categories</h2>
        <div className="title-underline"></div>
      </div>

      <div className="categories-duo-row">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="category-circle-item cat-skeleton">
              <div className="cat-skeleton-circle"></div>
              <div className="cat-skeleton-text"></div>
            </div>
          ))
        ) : categories && categories.length > 0 ? (
          categories.map((cat) => {
            const finalPath = cat.name === "Master Xerox" ? "/master-xerox" : (cat.path || "/");
            return (
              <Link href={finalPath} key={cat.id} className="category-circle-item" style={{ textDecoration: 'none' }}>
                <div className="category-circle-wrapper">
                  <img
                    src={cat.image || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=200&auto=format&fit=crop'}
                    alt={cat.name}
                    className="category-img"
                  />
                </div>
                <span className="category-circle-name">{cat.name}</span>
              </Link>
            );
          })
        ) : null}
      </div>
    </section>
  );
};

export default Categories;

