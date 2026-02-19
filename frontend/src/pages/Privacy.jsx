import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const SECTIONS = [
    {
        title: '1. Information We Collect',
        content: [
            'Account information you provide when registering (name, email, password).',
            'Order history and preferences when you use our platform.',
            'Device and usage data such as IP address, browser type, and pages visited.',
            'Payment information — processed securely via Stripe. We never store your full card details.',
        ],
    },
    {
        title: '2. How We Use Your Information',
        content: [
            'To process and fulfil your food orders at campus canteens.',
            'To send order confirmation, status updates, and receipts.',
            'To improve and personalise your experience on CampusEats.',
            'To communicate important updates, security alerts, and support responses.',
            'To detect and prevent fraudulent or unauthorised activity.',
        ],
    },
    {
        title: '3. Sharing of Information',
        content: [
            'We share order details with the relevant canteen to fulfil your order.',
            'We use trusted third-party services (Stripe for payments) under strict data-handling agreements.',
            'We do not sell, rent, or trade your personal information to third parties.',
            'We may disclose information if required by law or to protect the rights and safety of our users.',
        ],
    },
    {
        title: '4. Data Security',
        content: [
            'All data in transit is encrypted using industry-standard TLS/HTTPS.',
            'Passwords are hashed and never stored in plain text.',
            'Access to personal data is restricted to authorised personnel only.',
            'We perform regular security audits and vulnerability assessments.',
        ],
    },
    {
        title: '5. Cookies',
        content: [
            'We use essential cookies to keep you logged in and maintain your session.',
            'Analytics cookies help us understand how users interact with the platform.',
            'You may disable cookies in your browser settings, though some features may be affected.',
        ],
    },
    {
        title: '6. Your Rights',
        content: [
            'You may request access to the personal data we hold about you.',
            'You may request correction or deletion of your account data at any time.',
            'You may opt out of non-essential communications via your account settings.',
            'For any privacy-related requests, contact us at privacy@campuseats.com.',
        ],
    },
    {
        title: '7. Changes to This Policy',
        content: [
            'We may update this Privacy Policy periodically. The "Last Updated" date at the top will reflect any changes.',
            'Continued use of CampusEats after a policy update constitutes acceptance of the revised terms.',
        ],
    },
]

function Privacy() {
    return (
        <div className="min-h-screen bg-[#080808] font-sans text-white">
            <Navbar />

            {/* ── Hero ── */}
            <div className="relative pt-20 pb-28 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/60 via-[#080808]/80 to-[#080808]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-orange-600/6 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center pt-8">
                    <span className="inline-flex items-center gap-2 bg-orange-600/15 border border-orange-500/30 px-4 py-2 rounded-full mb-6">
                        <span className="text-orange-300 text-xs font-bold tracking-widest uppercase">Legal</span>
                    </span>
                    <h1 className="text-5xl sm:text-6xl font-black tracking-tighter uppercase mb-4">
                        Privacy <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Policy</span>
                    </h1>
                    <p className="text-gray-500 text-base max-w-xl mx-auto">
                        Last updated: <span className="text-gray-300 font-semibold">February 20, 2026</span>
                    </p>
                    <p className="text-gray-500 text-base max-w-2xl mx-auto mt-3">
                        At CampusEats, your privacy is important to us. This policy explains what data we collect, how we use it, and your rights over it.
                    </p>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-24 relative z-10">
                <div className="space-y-6">
                    {SECTIONS.map((section) => (
                        <div
                            key={section.title}
                            className="bg-[#111] border border-white/[0.07] rounded-2xl p-8 hover:border-orange-500/20 transition-colors"
                        >
                            <h2 className="text-lg font-black text-white mb-5 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full flex-shrink-0" />
                                {section.title}
                            </h2>
                            <ul className="space-y-3">
                                {section.content.map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-400 text-sm leading-relaxed">
                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500/60 flex-shrink-0 mt-2" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-10 bg-gradient-to-r from-orange-600/15 to-red-600/15 border border-orange-500/20 rounded-2xl p-8 text-center">
                    <h3 className="text-white font-black text-xl mb-2">Questions about this policy?</h3>
                    <p className="text-gray-500 text-sm mb-5">Our team is happy to help clarify anything.</p>
                    <a
                        href="/contact"
                        className="inline-block px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-xl shadow-lg hover:shadow-[0_0_25px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Contact Us →
                    </a>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Privacy
