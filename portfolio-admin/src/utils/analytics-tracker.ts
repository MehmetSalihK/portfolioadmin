import { v4 as uuidv4 } from 'uuid';

interface AnalyticsData {
  page: string;
  userAgent: string;
  referrer: string;
  sessionId: string;
  entryTime: Date;
  timeSpent?: number;
  exitTime?: Date;
}

class AnalyticsTracker {
  private sessionId: string;
  private startTime: number;
  private currentPage: string;
  private isTracking: boolean = false;

  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.startTime = Date.now();
    this.currentPage = '';
    
    if (typeof window !== 'undefined') {
      this.initializeTracking();
    }
  }

  private getOrCreateSessionId(): string {
    if (typeof window === 'undefined') return '';
    
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = uuidv4();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  private initializeTracking() {
    // Démarrer le tracking de la page actuelle
    this.trackPageView(window.location.pathname);

    // Écouter les changements de page (pour les SPAs)
    window.addEventListener('beforeunload', () => {
      this.trackPageExit();
    });

    // Écouter les changements de visibilité de la page
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackPageExit();
      } else {
        this.trackPageView(window.location.pathname);
      }
    });

    // Pour Next.js - écouter les changements de route
    if (typeof window !== 'undefined' && (window as any).next) {
      const originalPushState = history.pushState;
      const originalReplaceState = history.replaceState;

      history.pushState = (...args) => {
        this.trackPageExit();
        originalPushState.apply(history, args);
        setTimeout(() => this.trackPageView(window.location.pathname), 100);
      };

      history.replaceState = (...args) => {
        this.trackPageExit();
        originalReplaceState.apply(history, args);
        setTimeout(() => this.trackPageView(window.location.pathname), 100);
      };
    }
  }

  public trackPageView(page: string) {
    if (this.isTracking && this.currentPage === page) return;
    
    // Terminer le tracking de la page précédente
    if (this.isTracking) {
      this.trackPageExit();
    }

    this.currentPage = page;
    this.startTime = Date.now();
    this.isTracking = true;

    const analyticsData: AnalyticsData = {
      page,
      userAgent: navigator.userAgent,
      referrer: document.referrer,
      sessionId: this.sessionId,
      entryTime: new Date()
    };

    this.sendAnalytics(analyticsData);
  }

  public trackPageExit() {
    if (!this.isTracking) return;

    const timeSpent = Date.now() - this.startTime;
    const analyticsData = {
      page: this.currentPage,
      sessionId: this.sessionId,
      timeSpent: Math.round(timeSpent / 1000), // en secondes
      exitTime: new Date()
    };

    this.updateAnalytics(analyticsData);
    this.isTracking = false;
  }

  public trackEvent(eventName: string, eventData?: any) {
    const analyticsData = {
      page: this.currentPage,
      sessionId: this.sessionId,
      event: eventName,
      eventData,
      timestamp: new Date()
    };

    this.sendAnalytics(analyticsData, '/api/analytics/events');
  }

  private async sendAnalytics(data: any, endpoint: string = '/api/analytics/track') {
    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi des analytics:', error);
    }
  }

  private async updateAnalytics(data: any) {
    try {
      await fetch('/api/analytics/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des analytics:', error);
    }
  }

  public getDeviceType(): string {
    const userAgent = navigator.userAgent;
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet';
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile';
    }
    return 'desktop';
  }

  public async getLocationData() {
    try {
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city,
        ip: data.ip
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de la localisation:', error);
      return null;
    }
  }
}

// Instance globale du tracker
let tracker: AnalyticsTracker | null = null;

export const getAnalyticsTracker = (): AnalyticsTracker => {
  if (!tracker && typeof window !== 'undefined') {
    tracker = new AnalyticsTracker();
  }
  return tracker!;
};

export default AnalyticsTracker;