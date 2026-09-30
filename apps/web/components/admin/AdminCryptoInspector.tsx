import React from "react";
import { Lock, X } from "lucide-react";
import { AdminUser } from "@/lib/api";

interface AdminCryptoInspectorProps {
  user: AdminUser | null;
  onClose: () => void;
  parsePayload: (payload: string | null) => {
    iv: string | null;
    authTag: string | null;
    ciphertext: string | null;
  };
}

export const AdminCryptoInspector: React.FC<AdminCryptoInspectorProps> = ({
  user,
  onClose,
  parsePayload,
}) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-6">
      <div className="bg-white border border-neutral-200 max-w-2xl w-full p-8 shadow-2xl animate-in fade-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
          <div>
            <h3 className="font-serif uppercase tracking-tight text-neutral-900 text-lg">
              Cryptographic Payload Inspector
            </h3>
            <p className="text-xs uppercase tracking-widest text-neutral-500 font-mono mt-0.5">
              User ID #{user.id} • {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-black transition-colors"
            aria-label="Close inspector"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 text-xs font-mono">
          {/* Phone Breakdown */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between text-neutral-900 font-sans uppercase font-medium tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-600" /> Phone Cryptographic Structure
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">AES-256-GCM</span>
            </div>

            {user.encrypted_phone ? (
              (() => {
                const { iv, authTag, ciphertext } = parsePayload(user.encrypted_phone);
                return (
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                        Initialization Vector (16 bytes / IV):
                      </span>
                      <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                        {iv}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                        GCM Authentication Tag (16 bytes):
                      </span>
                      <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                        {authTag}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                        AES-256 Ciphertext:
                      </span>
                      <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                        {ciphertext}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-200">
                      <span className="text-neutral-900 uppercase tracking-wider text-[10px] font-semibold">
                        Decrypted Plaintext Output:
                      </span>
                      <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 text-emerald-900 font-semibold text-xs mt-1">
                        {user.phone || user.decrypted_phone || "—"}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-neutral-400 italic">No phone encrypted for this record.</p>
            )}
          </div>

          {/* Address Breakdown */}
          <div className="p-4 bg-neutral-50 border border-neutral-200 space-y-3">
            <div className="flex items-center justify-between text-neutral-900 font-sans uppercase font-medium tracking-wider text-[11px]">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-neutral-600" /> Address Cryptographic Structure
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">AES-256-GCM</span>
            </div>

            {user.encrypted_address ? (
              (() => {
                const { iv, authTag, ciphertext } = parsePayload(user.encrypted_address);
                return (
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                        Initialization Vector (16 bytes / IV):
                      </span>
                      <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                        {iv}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                        GCM Authentication Tag (16 bytes):
                      </span>
                      <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                        {authTag}
                      </div>
                    </div>
                    <div>
                      <span className="text-neutral-500 uppercase tracking-wider text-[10px]">
                        AES-256 Ciphertext:
                      </span>
                      <div className="p-2 bg-white border border-neutral-200 text-neutral-700 mt-1 break-all">
                        {ciphertext}
                      </div>
                    </div>
                    <div className="pt-2 border-t border-neutral-200">
                      <span className="text-neutral-900 uppercase tracking-wider text-[10px] font-semibold">
                        Decrypted Plaintext Output:
                      </span>
                      <div className="p-2.5 bg-emerald-50/60 border border-emerald-200 text-emerald-900 font-semibold text-xs mt-1">
                        {user.address || user.decrypted_address || "—"}
                      </div>
                    </div>
                  </div>
                );
              })()
            ) : (
              <p className="text-neutral-400 italic">No address encrypted for this record.</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="py-2.5 px-6 bg-black text-white text-xs uppercase tracking-widest font-medium hover:bg-neutral-800 transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCryptoInspector;
