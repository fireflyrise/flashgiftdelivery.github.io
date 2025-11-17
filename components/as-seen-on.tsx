import { MEDIA_LOGOS } from '@/lib/constants';

export function AsSeenOn() {
  return (
    <div className="py-8 bg-muted/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm text-muted-foreground mb-4 uppercase tracking-wide">
          As Seen On
        </p>
        <div className="flex flex-wrap justify-center items-center gap-8">
          {MEDIA_LOGOS.map((logo, index) => (
            <div
              key={index}
              className="text-muted-foreground font-semibold text-lg opacity-60 hover:opacity-100 transition-opacity"
            >
              {logo}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
