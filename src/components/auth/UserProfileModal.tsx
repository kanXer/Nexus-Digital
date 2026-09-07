"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Mail, Phone, Building2, MapPin, CheckCircle, Save, CreditCard, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function UserProfileModal() {
  const { isProfileModalOpen, closeProfileModal, userProfile, updateProfile } = useAuth();
  const [formData, setFormData] = useState(userProfile);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormData(userProfile);
  }, [userProfile]);

  if (!isProfileModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    toast.success("Profile & Billing details saved successfully!", {
      duration: 3000,
      icon: '✨',
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      closeProfileModal();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="auth-backdrop fixed inset-0 backdrop-blur-md"
          onClick={closeProfileModal}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-10 w-full max-w-xl glass-card rounded-3xl p-6 sm:p-8 border border-white/12 auth-modal-card max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={closeProfileModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6">
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              <User className="w-6 h-6 text-brand-blue-light" />
              Billing & Account Profile
            </h3>
            <p className="text-white/60 text-xs sm:text-sm mt-1">
              Your details automatically pre-fill on every checkout and enquiry form across Nexus Digital.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Full Name *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Sahil Srivastava"
                  className="input-field-with-icon text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@company.com"
                    className="input-field-with-icon text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Phone Number *</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 96962 62007"
                    className="input-field-with-icon text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Company / Business Name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Brand or Company Name"
                    className="input-field-with-icon text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">GSTIN / Tax ID (Optional)</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    value={formData.gstin || ""}
                    onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                    placeholder="09AAAAA0000A1Z5"
                    className="input-field-with-icon text-sm uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Billing Address Section */}
            <div className="pt-2 border-t border-white/10">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-blue-light" /> Billing Address
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-white/70 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Office / Business Street Address"
                    className="input-field text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">City</label>
                    <input
                      type="text"
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="Gorakhpur"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">State</label>
                    <input
                      type="text"
                      value={formData.state || ""}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      placeholder="Uttar Pradesh"
                      className="input-field text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/70 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode || ""}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      placeholder="273001"
                      className="input-field text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full btn-primary py-3.5 rounded-xl justify-center font-bold text-sm"
              >
                {saved ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-400 mr-1" />
                    Profile & Billing Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1" />
                    Save & Auto-Fill Forms
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-center gap-1 text-[11px] text-white/40 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              100% Encrypted & Synced with Firebase Firestore
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
