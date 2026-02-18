import React from 'react'

const CTASection = () => {
  return (
    <section className="py-20 bg-base-200/30">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <div className="p-10 rounded-[2rem] bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 backdrop-blur-xl">
                        <h2 className="text-3xl font-bold mb-4">Still have questions?</h2>
                        <p className="text-base-content/60 mb-8 max-w-lg mx-auto">
                            Our team is here to help you supercharge your career journey. Get in touch with us anytime.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <button className="btn-primary px-8 py-3 rounded-xl font-bold">
                                Contact Support
                            </button>
                            <button className="btn-outline px-8 py-3 rounded-xl font-bold">
                                Visit Community
                            </button>
                        </div>
                    </div>
                </div>
            </section>
  )
}

export default CTASection
