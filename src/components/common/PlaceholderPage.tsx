import { useEffect } from 'react';
import { Card } from '@/components/ui/Card';

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  useEffect(() => {
    document.title = `${title} | Zellen Commerce`;
  }, [title]);

  return (
    <Card>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h1>
      <p className="mt-3 max-w-prose text-muted-foreground">{description}</p>
    </Card>
  );
}
