'use client'

import { useEffect, useState, Suspense } from 'react'
import './wiki.css'
import ReactMarkdown from 'react-markdown'
import { useSearchParams } from 'next/navigation'

interface WikiPage {
  id: string
  title: string
  content: string
}

interface Wiki {
  pages: WikiPage[]
}

function WikiContent() {
  const [wiki, setWiki] = useState<Wiki | null>(null)
  const searchParams = useSearchParams()
  const currentPageId = searchParams.get('page') || 'home'

  useEffect(() => {
    fetch('/api/wiki')
      .then(res => res.json())
      .then(setWiki)
  }, [])

  if (!wiki) return <div>Loading...</div>

  const currentPage = wiki.pages.find(p => p.id === currentPageId) || wiki.pages[0]

  return (
    <div>
      <div className="topnav">
        <a href="/" className="topnav-back">← Back to Site</a>
        <div className="topnav-divider"></div>
        <a href="/" className="topnav-logo">SHADOW <span>CONST.</span></a>
        <span className="topnav-label">WIKI</span>
        <div className="topnav-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search docs..." />
        </div>
      </div>

      <div className="wiki-layout">
        <aside className="sidebar">
          <div className="sidebar-section">
            <div className="sidebar-heading">Overview</div>
            {wiki.pages.map((page) => (
              <a key={page.id} className={`sidebar-link ${page.id === currentPageId ? 'active' : ''}`} href={`?page=${page.id}`}>
                <span className="link-icon">
                  {page.id === 'home' ? '🏠' :
                   page.id === 'schedule' ? '📅' :
                   page.id === 'radio' ? '📻' :
                   page.id === 'ranks' ? '⭐' :
                   page.id === 'uniforms' ? '🦺' : '📄'}
                </span>
                {page.title}
              </a>
            ))}
          </div>
        </aside>

        <main className="wiki-main">
          <div className="wiki-hero">
            <div className="wiki-hero-content">
              <div className="wiki-breadcrumb"><a href="/">Shadow Construction</a> / Wiki / {currentPage.title}</div>
              <h1>{currentPage.title}</h1>
            </div>
          </div>

          <div className="wiki-content">
            <ReactMarkdown>{currentPage.content}</ReactMarkdown>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function WikiClient() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WikiContent />
    </Suspense>
  )
}