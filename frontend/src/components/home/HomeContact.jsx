import ContactInfoCards from '@/components/common/ContactInfoCards';
import ContactForm from '@/components/forms/ContactForm';
import SocialLinks from '@/components/layout/SocialLinks';
import SectionHeading from '@/components/ui/SectionHeading';

/**
 * Home "Contact Us" section (the SOP's home contact/enquiry option).
 * Two equal-height columns from lg up: contact details panel + enquiry form. Stacked on mobile.
 */
export default function HomeContact() {
  return (
    <section id="contact" className="section bg-muted">
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Contact Us"
          title="Planning a solar installation? Talk to us."
          description="Send us your requirement and our team will get back to you with a free consultation and quote."
        />

        <div className="grid items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Contact details */}
          <aside className="relative flex flex-col overflow-hidden rounded-2xl bg-primary p-6 shadow-card sm:p-8 lg:col-span-5">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sun-gradient opacity-25 blur-2xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-brand opacity-25 blur-3xl" aria-hidden="true" />

            <div className="relative">
              <h3 className="text-xl font-bold text-white">Get in touch</h3>
              <p className="mt-1 text-primary-100">Reach us directly using the details below.</p>
            </div>

            <div className="relative mt-8 flex-1">
              <ContactInfoCards variant="panel" />
            </div>

            <SocialLinks
              className="relative mt-8 border-t border-white/10 pt-6"
              itemClassName="bg-white/10 text-white hover:bg-accent hover:text-primary"
            />
          </aside>

          {/* Enquiry form */}
          <div className="rounded-2xl border border-border bg-white p-6 shadow-card sm:p-8 lg:col-span-7">
            <h3 className="text-xl font-bold">Send us a message</h3>
            <p className="mt-1 text-ink-muted">Fields marked * are required.</p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
