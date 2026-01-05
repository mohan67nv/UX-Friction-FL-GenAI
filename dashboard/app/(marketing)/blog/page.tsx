import { getT } from '../../i18n/server';
import Link from 'next/link';

const blogPosts = [
  {
    id: 'why-cookie-banners-kill-analytics',
    title: 'Why Cookie Banners Are Killing Your Analytics (And What To Do About It)',
    excerpt: 'In 2025, the average cookie rejection rate in Germany hit 73%. Here\'s how privacy-first analytics solves this.',
    date: '2026-01-01',
    author: 'Dr. Anna Weber',
    category: 'Privacy',
    readTime: '8 min',
    image: '📊'
  },
  {
    id: 'federated-learning-explained',
    title: 'Federated Learning for UX Analytics: A Technical Deep Dive',
    excerpt: 'How we built AI-powered UX insights without ever seeing your users\' data. Technical architecture explained.',
    date: '2025-12-28',
    author: 'Marcus Schmidt',
    category: 'Technology',
    readTime: '12 min',
    image: '🤖'
  },
  {
    id: 'gdpr-analytics-guide-2026',
    title: 'The 2026 Guide to GDPR-Compliant Analytics in Germany',
    excerpt: 'Updated for TDDDG amendments: What changed, what stayed the same, and how to stay compliant.',
    date: '2025-12-20',
    author: 'Dr. Lisa Müller',
    category: 'Legal',
    readTime: '10 min',
    image: '⚖️'
  },
  {
    id: 'rage-clicks-revenue-loss',
    title: 'Case Study: How 234 Rage-Clicks Cost €12.4K Monthly',
    excerpt: 'Real customer story: A Safari CSS bug that went unnoticed for months. Here\'s how we found it in 3 minutes.',
    date: '2025-12-15',
    author: 'Product Team',
    category: 'Case Study',
    readTime: '6 min',
    image: '🔍'
  },
  {
    id: 'privacy-by-design-architecture',
    title: 'Building Privacy by Design: Our Technical Architecture',
    excerpt: 'RAM-only processing, differential privacy, and zero PII. How we engineered privacy into every layer.',
    date: '2025-12-10',
    author: 'Engineering Team',
    category: 'Technology',
    readTime: '15 min',
    image: '🔒'
  },
  {
    id: 'ai-ux-recommendations',
    title: 'How AI Recommends UX Fixes Without Seeing Your Users',
    excerpt: 'Federated learning + gradient descent + pattern matching = actionable insights with zero privacy compromise.',
    date: '2025-12-05',
    author: 'AI Research Team',
    category: 'AI',
    readTime: '11 min',
    image: '🧠'
  }
];

export default async function BlogPage() {
  const t = await getT();
  return (
    <main>
      {/* Hero */}
      <section className="m_hero" style={{ paddingTop: 80, paddingBottom: 60 }}>
        <div className="m_container">
          <h1 className="m_h1">Privacy-First Analytics Blog</h1>
          <div className="m_sub" style={{ fontSize: 19, maxWidth: 700, margin: '20px auto 0' }}>
            Insights on GDPR compliance, federated learning, UX optimization, and privacy-by-design architecture.
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="m_section" style={{ paddingTop: 0 }}>
        <div className="m_container">
          <div className="m_card" style={{ padding: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 40, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 80, textAlign: 'center' }}>{blogPosts[0].image}</div>
              </div>
              <div>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className="m_pill" style={{ background: 'var(--m-primary)', color: 'white' }}>Featured</span>
                  <span className="m_pill">{blogPosts[0].category}</span>
                  <span className="m_pill">{blogPosts[0].readTime}</span>
                </div>
                <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)' }}>
                  {blogPosts[0].title}
                </h2>
                <div className="m_sub" style={{ marginBottom: 16, fontSize: 16 }}>
                  {blogPosts[0].excerpt}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
                  <div style={{ color: 'var(--m-muted)', fontSize: 14 }}>
                    By {blogPosts[0].author} • {blogPosts[0].date}
                  </div>
                  <Link href={`/blog/${blogPosts[0].id}`} className="m_btn m_btnPrimary">
                    Read Article →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* All Posts */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <h2 className="m_h2" style={{ marginBottom: 40 }}>Latest Articles</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 30 }}>
            {blogPosts.slice(1).map((post) => (
              <div key={post.id} className="m_card hover-grow">
                <div style={{ fontSize: 60, marginBottom: 16 }}>{post.image}</div>
                
                <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                  <span className="m_pill">{post.category}</span>
                  <span className="m_pill">{post.readTime}</span>
                </div>
                
                <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: 'var(--m-text)', lineHeight: 1.3 }}>
                  {post.title}
                </h3>
                
                <div className="m_sub" style={{ marginBottom: 16, fontSize: 15, lineHeight: 1.6 }}>
                  {post.excerpt}
                </div>
                
                <div style={{ borderTop: '1px solid var(--m-border)', paddingTop: 16, marginTop: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ color: 'var(--m-muted)', fontSize: 13 }}>
                      {post.author}<br />
                      {post.date}
                    </div>
                    <Link href={`/blog/${post.id}`} className="m_btn" style={{ padding: '8px 16px' }}>
                      Read →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="m_section">
        <div className="m_container">
          <h2 className="m_h2" style={{ textAlign: 'center', marginBottom: 40 }}>Browse by Topic</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {['Privacy', 'Technology', 'Legal', 'Case Study', 'AI', 'GDPR'].map((category) => (
              <div key={category} className="m_card" style={{ textAlign: 'center', padding: 30, cursor: 'pointer' }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--m-text)' }}>{category}</div>
                <div className="m_sub" style={{ marginTop: 8, fontSize: 14 }}>
                  {blogPosts.filter(p => p.category === category).length} articles
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="m_sectionAlt">
        <div className="m_container">
          <div className="m_card" style={{ textAlign: 'center', padding: 60, maxWidth: 700, margin: '0 auto' }}>
            <h2 className="m_h2" style={{ marginBottom: 16 }}>Stay Updated</h2>
            <div className="m_sub" style={{ fontSize: 17, marginBottom: 30 }}>
              Get privacy-first analytics insights delivered to your inbox. No spam, unsubscribe anytime.
            </div>
            <div style={{ display: 'flex', gap: 12, maxWidth: 500, margin: '0 auto', flexWrap: 'wrap' }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  minWidth: 250,
                  padding: '12px 20px',
                  borderRadius: 10,
                  border: '1px solid var(--m-border)',
                  background: 'var(--m-surface)',
                  color: 'var(--m-text)',
                  fontSize: 15
                }}
              />
              <button className="m_btn m_btnPrimary" style={{ padding: '12px 28px' }}>
                Subscribe
              </button>
            </div>
            <div style={{ marginTop: 16, fontSize: 13, color: 'var(--m-muted)' }}>
              🔒 Your email stays private. Managed via self-hosted newsletter tool.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
