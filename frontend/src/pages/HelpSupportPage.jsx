import React, { useState, useEffect } from "react";
import {
  Camera,
  Phone,
  Mail,
  Clock,
  Users,
  Shield,
  CreditCard,
  Package,
  FileText,
  Star,
} from "lucide-react";
import { auth, firestore } from "../firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

// Import all components
import { PageHeader } from "../components/Help&Support/PageHeader";
import { HeroSection } from "../components/Help&Support/HeroSection";
import { SupportFeaturesGrid } from "../components/Help&Support/SupportFeaturesGrid";
import { ContactForm } from "../components/Help&Support/ContactForm";
import { FAQSection } from "../components/Help&Support/FAQSection";
import Navbar from "../components/Navbar";

const HelpSupportPage = ({ onNavigateBack, NavbarComponent }) => {
  const [openFAQ, setOpenFAQ] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [contactForm, setContactForm] = useState({
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const customersRef = collection(firestore, "customers");
          const q = query(customersRef, where("firebaseUid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const customerDoc = querySnapshot.docs[0];
            setCustomerData({ id: customerDoc.id, ...customerDoc.data() });
          }
        } catch (error) {
          console.error("Error fetching customer data:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleBackClick = () => {
    if (onNavigateBack) {
      onNavigateBack();
    } else {
      window.location.href = "/profilePage";
    }
  };

  const handleContactFormChange = (field, value) => {
    setContactForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleContactSubmit = async () => {
    if (!currentUser) {
      setSubmitStatus({
        type: "error",
        message: "Please sign in to submit a contact request",
      });
      return;
    }

    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      setSubmitStatus({ type: "error", message: "Please fill in all fields" });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const contactData = {
        customerId: customerData?.id || null,
        customerName:
          customerData?.fullName || currentUser.displayName || "Unknown",
        customerEmail: currentUser.email,
        firebaseUid: currentUser.uid,
        subject: contactForm.subject.trim(),
        message: contactForm.message.trim(),
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await addDoc(collection(firestore, "contacts"), contactData);

      setSubmitStatus({
        type: "success",
        message:
          "Your message has been sent successfully! We'll get back to you soon.",
      });

      setContactForm({ subject: "", message: "" });
      setTimeout(() => setSubmitStatus(null), 5000);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      setSubmitStatus({
        type: "error",
        message: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
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

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Navbar />

      <PageHeader onBackClick={handleBackClick} />

      <HeroSection searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="px-6 pb-12">
        <div className="max-w-7xl mx-auto">
          <SupportFeaturesGrid features={supportFeatures} />

          <ContactForm
            currentUser={currentUser}
            customerData={customerData}
            formData={contactForm}
            onFormChange={handleContactFormChange}
            onSubmit={handleContactSubmit}
            isSubmitting={isSubmitting}
            submitStatus={submitStatus}
          />

          <FAQSection
            faqs={filteredFAQs}
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            openFAQ={openFAQ}
            onToggleFAQ={toggleFAQ}
          />
        </div>
      </div>
    </div>
  );
};

export default HelpSupportPage;
