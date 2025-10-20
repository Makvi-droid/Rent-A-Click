import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Camera,
  Phone,
  Mail,
  MessageCircle,
  Clock,
  Users,
  Shield,
  CreditCard,
  Package,
  FileText,
  Search,
  Star,
  ArrowLeft,
} from "lucide-react";
import Navbar from "../components/Navbar";

const HelpSupportPage = ({ onNavigateBack, NavbarComponent }) => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  const handleBackClick = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      window.location.href = "/profilePage";
    }
  };

  const categories = [
    { id: "all", name: "All Topics", icon: FileText },
    { id: "rental", name: "Rental Process", icon: Camera },
    { id: "payment", name: "Payment & Billing", icon: CreditCard },
    { id: "equipment", name: "Equipment", icon: Package },
    { id: "account", name: "Account & Profile", icon: Users },
    { id: "policies", name: "Policies", icon: Shield },
  ];

  const faqs = [
    {
      category: "rental",
      question: "How do I rent camera equipment?",
      answer:
        "Simply browse our catalog, select your desired equipment, choose rental dates, add to cart, and proceed to checkout. You can pick up equipment at our location or request delivery.",
    },
    {
      category: "rental",
      question: "What if I need to extend my rental period?",
      answer:
        "Contact us before your return date to extend your rental. Additional charges will apply based on our daily rates. Extensions are subject to equipment availability.",
    },
    {
      category: "rental",
      question: "Can I cancel my rental booking?",
      answer:
        "Yes, you can cancel up to 24 hours before your rental start date for a full refund. Cancellations within 24 hours incur a 25% charge.",
    },
    {
      category: "payment",
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. A security deposit is required for all rentals.",
    },
    {
      category: "payment",
      question: "When is the security deposit refunded?",
      answer:
        "Security deposits are typically refunded within 3-5 business days after equipment is returned in good condition and inspected by our team.",
    },
    {
      category: "payment",
      question: "Do you offer rental insurance?",
      answer:
        "Yes, we offer comprehensive protection plans starting at 10% of the rental value. This covers accidental damage, theft, and equipment malfunction.",
    },
    {
      category: "equipment",
      question: "What happens if equipment gets damaged?",
      answer:
        "Minor wear is expected, but significant damage will be charged from your security deposit. We recommend purchasing our protection plan for peace of mind.",
    },
    {
      category: "equipment",
      question: "Do you provide equipment tutorials?",
      answer:
        "Yes! We offer free tutorials for complex equipment. Our staff can provide basic instruction during pickup, or schedule a detailed session.",
    },
    {
      category: "equipment",
      question: "What if the equipment malfunctions during my rental?",
      answer:
        "Contact us immediately. We offer free replacements for equipment that malfunctions due to manufacturing defects, not user error.",
    },
    {
      category: "account",
      question: "How do I create an account?",
      answer:
        'Click "Sign Up" on our homepage, fill in your details, verify your email, and upload a valid ID. Account approval usually takes 24 hours.',
    },
    {
      category: "account",
      question: "Can I modify my rental after booking?",
      answer:
        "Yes, you can modify rental dates, add equipment, or change pickup/delivery options up to 24 hours before your rental start date.",
    },
    {
      category: "policies",
      question: "What is your cancellation policy?",
      answer:
        "Free cancellation up to 24 hours before rental start. Cancellations within 24 hours incur a 25% charge. No-shows forfeit the full rental fee.",
    },
    {
      category: "policies",
      question: "Do you offer delivery and pickup services?",
      answer:
        "Yes, we offer delivery and pickup services within a 50-mile radius. Delivery fees vary based on distance and equipment value.",
    },
  ];

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "+1 (555) 123-RENT",
      availability: "Mon-Sat 9AM-7PM",
      action: "Call Now",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "support@rent-a-click.com",
      availability: "Response within 2 hours",
      action: "Send Email",
    },
    {
      icon: MessageCircle,
      title: "Live Chat",
      description: "Instant messaging support",
      availability: "Available 24/7",
      action: "Start Chat",
    },
  ];

  const supportFeatures = [
    {
      icon: Clock,
      title: "Quick Response",
      description: "Average response time under 30 minutes",
    },
    {
      icon: Users,
      title: "Expert Team",
      description: "Photography professionals ready to help",
    },
    {
      icon: Star,
      title: "5-Star Service",
      description: "Rated excellent by 1000+ customers",
    },
  ];

  const filteredFAQs = faqs.filter((faq) => {
    const matchesCategory =
      selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      {/* Navbar Slot */}
      <Navbar />

      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative px-6 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center mb-8">
              <button
                onClick={handleBackClick}
                className="mr-4 p-2 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white hover:bg-white/20 transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <div className="flex items-center space-x-3">
                <Camera className="h-8 w-8 text-white" />
                <h1 className="text-2xl font-bold text-white">RENT-A-CLICK</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20"></div>
        <div className="relative px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <MessageCircle className="w-16 h-16 text-white/90" />
              </div>
              <h1 className="text-5xl font-bold text-white mb-4">
                Help &
                <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent block">
                  Support
                </span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Get expert assistance for all your camera rental needs. We're
                here to help you capture the perfect shot.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help articles, FAQs, or topics..."
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-400 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Support Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {supportFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 text-center hover:bg-white/15 transition-all duration-300"
              >
                <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Contact Methods */}
          <div className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Get in Touch
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Choose the best way to reach our support team. We're here to
                help!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 group"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-500/30 transition-colors">
                      <method.icon className="h-8 w-8 text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {method.title}
                    </h3>
                    <p className="text-purple-300 font-medium mb-2">
                      {method.description}
                    </p>
                    <p className="text-sm text-white/50 mb-6">
                      {method.availability}
                    </p>
                    <button className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 font-medium shadow-lg hover:shadow-xl">
                      {method.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto">
                Find quick answers to common questions about our camera rental
                service
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg"
                      : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white border border-white/20"
                  }`}
                >
                  <category.icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              ))}
            </div>

            {/* FAQ Items */}
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl overflow-hidden hover:bg-white/15 transition-all duration-300"
                >
                  <button
                    className="w-full px-6 py-4 text-left flex justify-between items-center"
                    onClick={() => toggleFAQ(index)}
                  >
                    <span className="font-medium text-white pr-4">
                      {faq.question}
                    </span>
                    {openFAQ === index ? (
                      <ChevronUp className="h-5 w-5 text-white/70 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-white/70 flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-4 border-t border-white/10">
                      <p className="text-white/80 leading-relaxed mt-4">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-white/70 mb-2">
                  No FAQs Found
                </h3>
                <p className="text-white/50">
                  Try adjusting your search or category filter
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
