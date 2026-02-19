import { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const SOCIAL_ICONS = {
    Twitter: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
    Instagram: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
    LinkedIn: 'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
    Facebook: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
}

const INPUT_CLASS = 'w-full px-4 py-3 bg-white/[0.05] border border-white/[0.08] focus:border-orange-500/60 rounded-xl outline-none text-white placeholder-gray-600 font-medium transition-all'
const LABEL_CLASS = 'block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-widest'

function Contact() {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' })
    const [submitted, setSubmitted] = useState(false)

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = (e) => {
        e.preventDefault()
        console.log('Form submitted:', formData)
        setSubmitted(true)
        setTimeout(() => {
            setSubmitted(false)
            setFormData({ name: '', email: '', subject: '', message: '' })
        }, 3000)
    }

    return (
        <div className="min-h-screen bg-[#080808] font-sans text-white">
            <Navbar />

            {/* ── Hero ── */}
            <div className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?q=80&w=2070&auto=format&fit=crop"
                        alt="Contact Support"
                        className="w-full h-full object-cover opacity-15"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/50 via-[#080808]/70 to-[#080808]" />
                </div>
                <div className="absolute top-1/2 left-1/4 w-[400px] h-[300px] bg-orange-600/8 rounded-full blur-3xl pointer-events-none" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                    <span className="inline-flex items-center gap-2 bg-orange-600/15 border border-orange-500/30 backdrop-blur-md px-4 py-2 rounded-full mb-6">
                        <span className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                        <span className="text-orange-300 text-xs font-bold tracking-widest uppercase">Support</span>
                    </span>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-4">
                        We're Here <br />
                        <span className="bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400 bg-clip-text text-transparent">to Help.</span>
                    </h1>
                    <p className="text-gray-400 text-xl max-w-2xl font-light italic">
                        Have a question about your order, a suggestion, or just want to say hello? Drop us a line.
                    </p>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 pb-24">
                <div className="grid lg:grid-cols-2 gap-12">

                    {/* ── Contact info ── */}
                    <div>
                        <h2 className="text-3xl font-black text-white mb-8">Get in Touch</h2>

                        <div className="space-y-6 mb-10">
                            {/* Email */}
                            <div className="flex items-start gap-5 p-5 bg-[#111] border border-white/[0.07] rounded-2xl hover:border-orange-500/25 transition-all">
                                <div className="flex-shrink-0 w-12 h-12 bg-orange-500/15 border border-orange-500/20 rounded-xl flex items-center justify-center text-orange-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-0.5">Email Support</h3>
                                    <p className="text-gray-500 text-sm mb-1">Our friendly team is here to help.</p>
                                    <a href="mailto:support@campuseats.com" className="text-orange-400 font-semibold hover:text-orange-300 transition text-sm">support@campuseats.com</a>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-start gap-5 p-5 bg-[#111] border border-white/[0.07] rounded-2xl hover:border-orange-500/25 transition-all">
                                <div className="flex-shrink-0 w-12 h-12 bg-blue-500/15 border border-blue-500/20 rounded-xl flex items-center justify-center text-blue-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-0.5">Visit Us</h3>
                                    <p className="text-gray-500 text-sm mb-1">Come say hello at our campus HQ.</p>
                                    <p className="text-gray-300 font-medium text-sm">123 Campus Drive, University City, ST 12345</p>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="flex items-start gap-5 p-5 bg-[#111] border border-white/[0.07] rounded-2xl hover:border-orange-500/25 transition-all">
                                <div className="flex-shrink-0 w-12 h-12 bg-green-500/15 border border-green-500/20 rounded-xl flex items-center justify-center text-green-400">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-white mb-0.5">Call Us</h3>
                                    <p className="text-gray-500 text-sm mb-1">Mon–Fri from 8am to 5pm.</p>
                                    <a href="tel:+15551234567" className="text-gray-300 font-medium hover:text-orange-400 transition text-sm">+1 (555) 123-4567</a>
                                </div>
                            </div>
                        </div>

                        {/* Social */}
                        <div className="p-6 bg-[#111] border border-white/[0.07] rounded-2xl">
                            <h3 className="text-sm font-bold text-gray-400 mb-5 uppercase tracking-widest">Follow Our Socials</h3>
                            <div className="flex gap-3">
                                {Object.entries(SOCIAL_ICONS).map(([name, d]) => (
                                    <a
                                        key={name}
                                        href="#"
                                        className="w-11 h-11 bg-white/[0.05] border border-white/[0.08] rounded-xl flex items-center justify-center text-gray-500 hover:text-orange-400 hover:border-orange-500/30 hover:-translate-y-1 transition-all duration-200"
                                        aria-label={name}
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d={d} />
                                        </svg>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Contact form ── */}
                    <div className="bg-[#111] border border-white/[0.07] rounded-2xl p-8 md:p-10 shadow-xl">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-white">Send us a message</h2>
                            <p className="text-gray-500 text-sm mt-2">We'll get back to you within 24 hours.</p>
                        </div>

                        {submitted ? (
                            <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-6 py-10 rounded-2xl text-center">
                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-black text-white mb-2">Message Sent!</h3>
                                <p className="text-gray-400">Thank you for reaching out. We'll be in touch shortly.</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="grid md:grid-cols-2 gap-5">
                                    <div>
                                        <label htmlFor="name" className={LABEL_CLASS}>Name</label>
                                        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className={INPUT_CLASS} placeholder="John Doe" />
                                    </div>
                                    <div>
                                        <label htmlFor="email" className={LABEL_CLASS}>Email</label>
                                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={INPUT_CLASS} placeholder="john@example.com" />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="subject" className={LABEL_CLASS}>Subject</label>
                                    <input type="text" id="subject" name="subject" value={formData.subject} onChange={handleChange} required className={INPUT_CLASS} placeholder="How can we help?" />
                                </div>

                                <div>
                                    <label htmlFor="message" className={LABEL_CLASS}>Message</label>
                                    <textarea id="message" name="message" value={formData.message} onChange={handleChange} required rows="5" className={`${INPUT_CLASS} resize-none`} placeholder="Your message..." />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-xl shadow-lg hover:shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 transition-all duration-200 active:scale-95"
                                >
                                    Send Message →
                                </button>
                            </form>
                        )}
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    )
}

export default Contact
