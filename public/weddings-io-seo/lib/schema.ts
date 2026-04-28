// lib/schema.ts
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Weddings.io",
  "url": "https://weddings.io",
  "logo": "https://weddings.io/logo.png",
  "description": "Find verified South Asian wedding planners across 499 cities worldwide. Expert vendors for Hindu, Sikh, Muslim & multi-faith ceremonies.",
  "foundingDate": "2015",
  "founders": [
    {
      "@type": "Person",
      "name": "Weddings.io Team"
    }
  ],
  "sameAs": [
    "https://twitter.com/weddingsio",
    "https://instagram.com/weddingsio",
    "https://linkedin.com/company/weddings-io"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "url": "https://weddings.io/contact",
    "email": "support@weddings.io"
  }
};

export const localBusinessSchema = (city: string, state: string, vendors: number) => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": `Wedding Planners in ${city}, ${state}`,
  "description": `Find verified South Asian wedding planners in ${city}, ${state}. ${vendors}+ vendors specializing in Hindu, Sikh, Muslim & interfaith ceremonies.`,
  "url": `https://weddings.io/planners/${city.toLowerCase().replace(/\s/g, '-')}-${state.toLowerCase()}`,
  "areaServed": {
    "@type": "City",
    "name": city,
    "containedInPlace": {
      "@type": "State",
      "name": state,
      "containedInPlace": {
        "@type": "Country",
        "name": "United States"
      }
    }
  },
  "priceRange": "$$$",
  "serviceType": ["Wedding Planning", "Wedding Coordination", "Vendor Curation"]
});

export const faqSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const articleSchema = (title: string, description: string, publishDate: string, authorName: string = "Weddings.io") => ({
  "@context": "https://schema.org",
  "@type": "NewsArticle",
  "headline": title,
  "description": description,
  "image": "https://weddings.io/og-image.png",
  "datePublished": publishDate,
  "author": {
    "@type": "Organization",
    "name": authorName,
    "url": "https://weddings.io"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Weddings.io",
    "url": "https://weddings.io"
  }
});

export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
