import { Card, CardContent } from '@/components/ui/card';
import { TESTIMONIALS } from '@/lib/constants';

export function Testimonials() {
  return (
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          What Our Customers Say
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Real stories from men who saved the day with Flash Gift Delivery
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TESTIMONIALS.map((testimonial, index) => (
            <Card key={index} className="border-2">
              <CardContent className="pt-6">
                <div className="flex gap-1 mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-secondary text-xl">★</span>
                  ))}
                </div>
                <p className="text-sm italic mb-4 leading-relaxed">{testimonial.text}</p>
                <div className="border-t pt-3">
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.location}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
