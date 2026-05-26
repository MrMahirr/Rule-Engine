import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '../../shared/components';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
          height: '100vh', backgroundColor: 'var(--color-space-900)', color: 'var(--color-text-primary)',
          textAlign: 'center', padding: '2rem'
        }}>
          <div style={{ color: 'var(--color-neon-purple)', fontSize: '4rem', marginBottom: '1rem' }}>⚠️</div>
          <h1 style={{ marginBottom: '1rem' }}>Sistem Hatası!</h1>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', maxWidth: '500px' }}>
            Kural motorunda beklenmeyen bir hata meydana geldi. Veri kaybını önlemek için sistem durduruldu.
            <br/><br/>
            <code style={{ fontSize: '0.8rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '4px', borderRadius: '4px' }}>
              {this.state.error?.message}
            </code>
          </p>
          <Button onClick={() => window.location.reload()} variant="primary">Uygulamayı Yeniden Başlat</Button>
        </div>
      );
    }

    return this.props.children;
  }
}
