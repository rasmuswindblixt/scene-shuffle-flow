import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "What video formats are supported?",
      answer: "Video Splitter supports all major video formats including MP4, MOV, AVI, MKV, and more. Our AI works with any resolution from 480p to 4K."
    },
    {
      question: "How accurate is the AI scene detection?",
      answer: "Our AI scene detection is over 95% accurate. It uses advanced computer vision to identify cuts, transitions, and scene changes with precision that rivals manual editing."
    },
    {
      question: "What's the maximum video length I can upload?",
      answer: "You can upload videos up to 2 hours long. For longer videos, we recommend splitting them into smaller segments for optimal processing speed."
    },
    {
      question: "Can I customize the scene duration filters?",
      answer: "Yes! You can set custom duration filters from 1-60 seconds. Our default 1-6 second range is optimized for social media content, but you have full control."
    },
    {
      question: "How does the intelligent shuffling work?",
      answer: "Our algorithm randomizes scenes while preserving temporal segments and preventing sequential duplicates. This creates natural-looking content that maintains viewer engagement."
    },
    {
      question: "Is there a limit on exports?",
      answer: "With your subscription, you get unlimited exports. Process as many videos as you need without restrictions."
    },
    {
      question: "Can I preview before exporting?",
      answer: "Absolutely! Our real-time preview lets you see exactly how your shuffled video will look. You can toggle audio, adjust timing, and make changes before final export."
    },
    {
      question: "What export quality options are available?",
      answer: "You can export in multiple qualities: 720p, 1080p, and 4K. All exports maintain the original video quality and include professional encoding."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee. If you're not satisfied with Video Splitter, contact our support team for a full refund."
    },
    {
      question: "Is my video content secure?",
      answer: "Absolutely. All uploads are encrypted and automatically deleted after 24 hours. We never store your content permanently and have enterprise-grade security measures in place."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time. You'll continue to have access until the end of your current billing period."
    },
    {
      question: "Do you offer support?",
      answer: "We provide 24/7 priority email support for all subscribers. Our team typically responds within 2 hours during business days."
    },
    // New English FAQs (translated from Swedish)
    {
      question: "Why does my original 30-minute video become only 12 minutes?",
      answer: "Some videos have very long scenes. If you set your max scene length to, for example, 6 seconds, there won't be many scenes left after filtering. For best results, use a high-quality video with lots of short scenes. Review your video before splitting to ensure it's suitable."
    },
    {
      question: "I get an error message when uploading my video. Why?",
      answer: "This can be due to how your browser handles video files, especially in Chrome on Mac. Try another browser (like Safari or Firefox) or convert your video to MP4 (H.264). If the problem persists, please contact support."
    },
    {
      question: "Why is the quality of my exported video so low?",
      answer: "The exported video can never be higher quality than the original you upload. For best results, use a high-quality source video. You can also try enhancing your video with tools like CapCut's video enhancer before uploading."
    },
    {
      question: "Why should I use this app when I can split scenes for free in CapCut?",
      answer: "CapCut is great for splitting scenes, but with ClipMixPRO you can also mix and automatically filter your clips, saving hours of manual work and getting a ready-to-publish, engaging result in minutes. Perfect for YouTube Automation creators who want to save time and money!"
    }
  ];

  return (
    <section id="faq" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            ❓ FAQ
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">
            Frequently Asked
            <span className="bg-gradient-primary bg-clip-text text-transparent"> Questions</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to know about Video Splitter. Can't find what you're looking for? 
            Contact our support team.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="border border-border rounded-lg px-6 bg-card/50 backdrop-blur-sm"
              >
                <AccordionTrigger className="text-left font-semibold py-6 hover:no-underline hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <p className="text-foreground">
            Contact our support team at{" "}
            <a href="mailto:support@ClipMixPRO.com" className="text-primary hover:underline">
              support@clipmixpro.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default FAQ;