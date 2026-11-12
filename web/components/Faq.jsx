'use client';

import { useState } from 'react';

export default function Faq({ items }) {
  const [aberto, setAberto] = useState(items[0]?.id || null);

  return (
    <div className="pro-siga__faq-list">
      {items.map((item) => {
        const isOpen = aberto === item.id;
        return (
          <div className="pro-siga__faq-item" key={item.id}>
            <button
              type="button"
              className="pro-siga__faq-question"
              aria-expanded={isOpen}
              aria-controls={`faq-panel-${item.id}`}
              onClick={() => setAberto(isOpen ? null : item.id)}
            >
              {item.question}
              <span className="pro-siga__faq-icon" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <p
              className="pro-siga__faq-answer"
              id={`faq-panel-${item.id}`}
              hidden={!isOpen}
              dangerouslySetInnerHTML={{ __html: item.answer }}
            />
          </div>
        );
      })}
    </div>
  );
}
