'use client'
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', background: '#080810',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'monospace'
        }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#FF2D78', fontSize: '14px', letterSpacing: '2px', marginBottom: '8px' }}>
              // something went wrong
            </p>
            <p style={{ color: 'rgba(240,238,255,0.3)', fontSize: '12px', marginBottom: '24px' }}>
              an unexpected error occurred.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: 'none', border: '1px solid rgba(0,245,255,0.3)',
                color: '#00F5FF', padding: '10px 24px',
                fontFamily: 'monospace', fontSize: '12px',
                cursor: 'pointer', letterSpacing: '2px'
              }}
            >
              reload →
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
