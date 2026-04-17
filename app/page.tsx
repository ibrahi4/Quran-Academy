export default function HomePage() {
  return (
    <div className="pt-20">
      {/* Temporary Hero */}
      <section className="min-h-screen flex items-center justify-center bg-hero-gradient text-white">
        <div className="text-center max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Learn Quran, Arabic & Islamic Studies
          </h1>
          <p className="text-xl text-white/80 mb-8">
            with a Trusted Teacher — From Anywhere in the World
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/book-trial"
              className="px-8 py-4 bg-accent text-gray-900 font-bold rounded-xl hover:bg-accent/90 transition-all"
            >
              Book Your Free Trial
            </a>
            <a
              href="/services"
              className="px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all"
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* Temporary Content Placeholder */}
      <section className="section-padding bg-sand-50">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ✅ Layout System Working!
          </h2>
          <p className="text-gray-600 text-lg">
            Navbar, Footer, WhatsApp Button, and Scroll to Top are ready.
            <br />
            Next step: Build the full Homepage sections.
          </p>
        </div>
      </section>
    </div>
  );
}