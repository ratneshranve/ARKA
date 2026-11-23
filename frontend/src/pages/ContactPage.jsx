import ContactInfoCards from '@/components/common/ContactInfoCards';
import PageHero from '@/components/common/PageHero';
import Seo from '@/components/common/Seo';
import ContactForm from '@/components/forms/ContactForm';
import { useSettings } from '@/hooks/useSettings';

export default function ContactPage() {
  const { contact, company } = useSettings();

  return (
    <>
      <Seo title="Contact Us" description={`Contact ${company.name} for solar products, installation quotes and support.`} />
      <PageHero
        title="Contact Us"
        subtitle="Have a question or need a quote? Send us a message and our team will get back to you shortly."
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <section className="section">
        <div className="container-page grid gap-10 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-border bg-white p-5 shadow-card sm:p-8">
              <h2 className="text-2xl font-bold">Send us a message</h2>
              <p className="mt-1 text-ink-muted">Fields marked * are required.</p>
              <div className="mt-6">
                <ContactForm />
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <ContactInfoCards />
          </div>
        </div>

        {contact.mapEmbedUrl?.startsWith('https://www.google.com/maps/embed') && (
          <div className="container-page mt-12">
            <div className="aspect-video overflow-hidden rounded-2xl border border-border shadow-card">
              <iframe
                src={contact.mapEmbedUrl}
                title={`${company.name} location on Google Maps`}
                className="h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </div>
        )}
      </section>
    </>
  );
}
