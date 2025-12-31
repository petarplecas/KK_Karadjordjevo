export type EventType = 'osnivanje' | 'turnir' | 'priznanje' | 'infrastruktura' | 'utakmica' | 'achievement';

export type EventCategory = 'muški' | 'ženski' | 'opšte';

export interface TimelineEvent {
  id: string;
  year: number;
  month?: string;
  monthNumber?: number;
  title: string;
  description: string;
  type: EventType;
  category: EventCategory;
  isHighlight?: boolean;
}

export interface TimelinePeriod {
  id: string;
  title: string;
  subtitle: string;
  years: string;
  description: string;
  accentColor: 'amber' | 'blue';
  events: TimelineEvent[];
}
