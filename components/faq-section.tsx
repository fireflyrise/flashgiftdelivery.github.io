import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FAQ_ITEMS } from '@/lib/constants';

export function FAQSection() {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
          Frequently Asked Questions
        </h2>
        <p className="text-center text-muted-foreground mb-12">
          Everything you need to know about our premium 2-hour flower delivery service
        </p>

        <Accordion type="single" collapsible className="w-full">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
