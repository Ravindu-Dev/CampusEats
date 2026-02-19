import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const SECTIONS = [
    {
        title: '1. Acceptance of Terms',
        content: [
            'By accessing or using CampusEats, you agree to be bound by these Terms of Service.',
            'If you do not agree to any part of these terms, you may not use the platform.',
            'We reserve the right to update these terms at any time. Continued use after updates constitutes acceptance.',
        ],
    },
    {
        title: '2. Eligibility',
        content: [
            'CampusEats is intended for students, staff, and authorised personnel of partner campuses.',
            'You must be at least 13 years old to create an account.',
            'You are responsible for providing accurate and up-to-date registration information.',
        ],
    },
    {
        title: '3. User Accounts',
        content: [
            'You are responsible for maintaining the confidentiality of your account credentials.',
            'You must notify us immediately of any unauthorised use of your account.',
            'We reserve the right to suspend or terminate accounts that violate these terms.',
            'One person may hold only one account unless explicitly authorised otherwise.',
        ],
    },
    {
        title: '4. Ordering and Payments',
        content: [
            'All orders placed through CampusEats are subject to confirmation and availability from the respective canteen.',
            'Prices displayed are in Sri Lankan Rupees (LKR) and are set by individual canteens.',
            'Payments are processed securely via Stripe. By placing an order, you authorise us to charge your payment method.',
            'Refunds are subject to the individual canteen\'s refund policy and must be raised through our support team.',
        ],
    },
    {
        title: '5. Canteen Partners',
        content: [
            'Canteens listed on CampusEats are independent operators who have agreed to our Partner Terms.',
            'CampusEats does not take responsibility for food quality, allergen information, or canteen-side delays.',
            'Disputes with a canteen should first be raised through our in-app support channel.',
        ],
    },
    {
        title: '6. Prohibited Conduct',
        content: [
            'You may not use CampusEats for any unlawful or fraudulent purposes.',
            'You may not attempt to disrupt, hack, or reverse-engineer any part of the platform.',
            'You may not submit false orders, fraudulent reviews, or misleading information.',
            'Harassment of canteen staff, support agents, or other users will result in immediate account suspension.',
        ],
    },
    {
        title: '7. Intellectual Property',
        content: [
            'All content, branding, and software on CampusEats are the property of CampusEats or its licensors.',
            'You may not reproduce, distribute, or create derivative works without our written permission.',
            'User-submitted content (e.g. reviews) remains your property, but you grant us a licence to display it on the platform.',
        ],
    },
    {
        title: '8. Limitation of Liability',
        content: [
            'CampusEats is provided on an "as-is" basis without warranties of any kind.',
            'We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform.',
            'Our total liability for any claim shall not exceed the amount you paid for the order in question.',
        ],
    },
    {
        title: '9. Governing Law',
        content: [
            'These terms are governed by the laws of Sri Lanka.',
            'Any disputes arising from these terms shall be resolved through binding arbitration or competent courts in Sri Lanka.',
        ],
    },
]

function Terms() {
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
                        Terms of <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Service</span>
                    </h1>
                    <p className="text-gray-500 text-base max-w-xl mx-auto">
                        Last updated: <span className="text-gray-300 font-semibold">February 20, 2026</span>
                    </p>
                    <p className="text-gray-500 text-base max-w-2xl mx-auto mt-3">
                        Please read these terms carefully before using CampusEats. They govern your access to and use of our platform.
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
                    <h3 className="text-white font-black text-xl mb-2">Have questions about our terms?</h3>
                    <p className="text-gray-500 text-sm mb-5">We're always happy to explain anything in plain language.</p>
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

export default Terms
