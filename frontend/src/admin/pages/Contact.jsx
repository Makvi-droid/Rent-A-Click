// ========================================
// Contact.jsx - Main Admin Contact Component
// ========================================
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";
import { firestore } from "../../firebase";
import ContactHeader from "../ContactManagement/ContactHeader";
import ContactStats from "../ContactManagement/ContactStats";
import ContactFilters from "../ContactManagement/ContactFilters";
import ContactList from "../ContactManagement/ContactList";
import ContactDetails from "../ContactManagement/ContactDetails";
import SendMessageModal from "../ContactManagement/SendMessageModal";

const Contact = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);

  // Fetch contacts from Firebase in real-time
  useEffect(() => {
    const contactsRef = collection(firestore, "contacts");
    const q = query(contactsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const contactsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setContacts(contactsData);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching contacts:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Filter contacts based on status and search query
  useEffect(() => {
    let filtered = contacts;

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((contact) => contact.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.customerName?.toLowerCase().includes(query) ||
          contact.customerEmail?.toLowerCase().includes(query) ||
          contact.subject?.toLowerCase().includes(query)
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, statusFilter, searchQuery]);

  // Update contact status
  const handleStatusUpdate = async (contactId, newStatus) => {
    try {
      const contactRef = doc(firestore, "contacts", contactId);
      await updateDoc(contactRef, {
        status: newStatus,
        updatedAt: new Date(),
      });

      // Update local state
      if (selectedContact?.id === contactId) {
        setSelectedContact({ ...selectedContact, status: newStatus });
      }
    } catch (error) {
      console.error("Error updating contact status:", error);
      throw error;
    }
  };

  // Calculate stats
  const stats = {
    total: contacts.length,
    pending: contacts.filter((c) => c.status === "pending").length,
    inProgress: contacts.filter((c) => c.status === "in-progress").length,
    resolved: contacts.filter((c) => c.status === "resolved").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <ContactHeader onSendMessage={() => setShowSendMessageModal(true)} />

        <ContactStats stats={stats} />

        <ContactFilters
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact List */}
          <div className="lg:col-span-1">
            <ContactList
              contacts={filteredContacts}
              selectedContact={selectedContact}
              onSelectContact={setSelectedContact}
              loading={loading}
            />
          </div>

          {/* Contact Details */}
          <div className="lg:col-span-2">
            <ContactDetails
              contact={selectedContact}
              onStatusUpdate={handleStatusUpdate}
              onClose={() => setSelectedContact(null)}
            />
          </div>
        </div>
      </div>

      {/* Send Message Modal */}
      {showSendMessageModal && (
        <SendMessageModal onClose={() => setShowSendMessageModal(false)} />
      )}
    </div>
  );
};

export default Contact;
