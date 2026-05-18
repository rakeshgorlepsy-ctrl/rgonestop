"use client";

import React from 'react';
import { Star, Quote } from 'lucide-react';
import './HMReviews.css';

const reviews = [
  { id: 1, name: 'Sreya Reddy', text: 'The photo chocolate box was the highlight of the birthday party! Such a unique and sweet gift idea.', rating: 5, date: '2 days ago' },
  { id: 2, name: 'Vikram Singh', text: 'Perfectly crafted acrylic frames. The quality of the print and the frame is outstanding.', rating: 5, date: '1 week ago' },
  { id: 3, name: 'Anjali Karan', text: 'Amazing polaroids! They really brought back so many memories. Highly recommend for any occasion.', rating: 4, date: '3 days ago' },
];

const HMReviews = () => {
  return (
    <section className="hm-reviews-section hm-section-padding">
      <div className="hm-container">
        <div className="hm-section-header">
          <h2>What Our Happy Customers Say</h2>
          <p>Read real stories from our community of memory creators</p>
        </div>
        <div className="hm-reviews-grid">
          {reviews.map(review => (
            <div key={review.id} className="hm-review-card">
              <div className="hm-quote-icon">
                <Quote size={20} fill="#E91E63" stroke="none" />
              </div>
              <div className="hm-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={16} fill={i < review.rating ? "#D4AF37" : "none"} stroke={i < review.rating ? "#D4AF37" : "#DDD"} />
                ))}
              </div>
              <p className="hm-review-text">"{review.text}"</p>
              <div className="hm-review-author">
                <div className="hm-author-info">
                  <span className="hm-author-name">{review.name}</span>
                  <span className="hm-review-date">{review.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HMReviews;
