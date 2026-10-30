"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  FileArchive,
  Upload,
  Trash2,
  Download,
  CheckCircle2,
  ChevronLeft,
  Sparkles,
  FileText,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

// Table CRC32 standard pour le format PKZIP
const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

async function compressDeflateRaw(data: Uint8Array): Promise<{
  compressed: Uint8Array;
  method: number;
}> {
  if (typeof CompressionStream !== "undefined") {
    try {
      const cs = new CompressionStream("deflate-raw");
      const writer = cs.writable.getWriter();
      writer.write(new Uint8Array(data));
      writer.close();
      const response = new Response(cs.readable);
      const buffer = await response.arrayBuffer();
      return { compressed: new Uint8Array(buffer), method: 8 };
    } catch {
      // Fallback to stored (method 0)
    }
  }
  return { compressed: data, method: 0 };
}

async function createZipBlob(files: File[]): Promise<Blob> {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  const now = new Date();
  const dosTime =
    ((now.getHours() & 0x1f) << 11) |
    ((now.getMinutes() & 0x3f) << 5) |
    ((now.getSeconds() >> 1) & 0x1f);
  const dosDate =
    (((now.getFullYear() - 1980) & 0x7f) << 9) |
    (((now.getMonth() + 1) & 0x0f) << 5) |
    (now.getDate() & 0x1f);

  for (const file of files) {
    const rawBuffer = await file.arrayBuffer();
    const rawBytes = new Uint8Array(rawBuffer);
    const fileCrc = crc32(rawBytes);
    const { compressed, method } = await compressDeflateRaw(rawBytes);
    const nameBytes = encoder.encode(file.name);

    // Local File Header (30 bytes + name)
    const localHeader = new Uint8Array(30 + nameBytes.length);
    const lv = new DataView(localHeader.buffer);
    lv.setUint32(0, 0x04034b50, true); // Signature PK\x03\x04
    lv.setUint16(4, 20, true); // Version needed (2.0)
    lv.setUint16(6, 0x0800, true); // Bit 11 = UTF-8 filename
    lv.setUint16(8, method, true); // Compression method (8 = deflate, 0 = store)
    lv.setUint16(10, dosTime, true);
    lv.setUint16(12, dosDate, true);
    lv.setUint32(14, fileCrc, true);
    lv.setUint32(18, compressed.length, true);
    lv.setUint32(22, rawBytes.length, true);
    lv.setUint16(26, nameBytes.length, true);
    lv.setUint16(28, 0, true); // Extra length
    localHeader.set(nameBytes, 30);

    // Central Directory Header (46 bytes + name)
    const centralHeader = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(centralHeader.buffer);
    cv.setUint32(0, 0x02014b50, true); // Signature PK\x01\x02
    cv.setUint16(4, 20, true); // Version made by
    cv.setUint16(6, 20, true); // Version needed
    cv.setUint16(8, 0x0800, true); // UTF-8 flag
    cv.setUint16(10, method, true);
    cv.setUint16(12, dosTime, true);
    cv.setUint16(14, dosDate, true);
    cv.setUint32(16, fileCrc, true);
    cv.setUint32(20, compressed.length, true);
    cv.setUint32(24, rawBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true);
    cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true);
    cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true); // Relative offset of local header
    centralHeader.set(nameBytes, 46);

    localParts.push(localHeader, compressed);
    centralParts.push(centralHeader);

    offset += localHeader.length + compressed.length;
  }

  const centralSize = centralParts.reduce((acc, p) => acc + p.length, 0);

  // End of Central Directory Record (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // Signature PK\x05\x06
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);
  ev.setUint16(20, 0, true);

  const blobParts: BlobPart[] = [
    ...localParts.map((u) => new Uint8Array(u)),
    ...centralParts.map((u) => new Uint8Array(u)),
    new Uint8Array(eocd),
  ];

  return new Blob(blobParts, { type: "application/zip" });
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} Mo`;
}

export default function DoctorialesZipToolPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [zipName, setZipName] = useState("HEC_Doctoriales_Fichiers");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    setSuccessMsg(false);
    const incoming = Array.from(newFiles);
    setFiles((prev) => {
      const existingNames = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const filtered = incoming.filter(
        (f) => !existingNames.has(`${f.name}-${f.size}`)
      );
      return [...prev, ...filtered];
    });
  };

  const removeFile = (index: number) => {
    setSuccessMsg(false);
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateZip = async () => {
    if (files.length === 0) return;
    setIsGenerating(true);
    setSuccessMsg(false);
    try {
      const zipBlob = await createZipBlob(files);
      const cleanName =
        (zipName.trim() || "Atelier_Management_Fichiers").replace(
          /\.zip$/i,
          ""
        ) + ".zip";

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = cleanName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSuccessMsg(true);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-x-hidden bg-[#070712] text-slate-100 py-10 sm:py-16 px-4 sm:px-6 selection:bg-purple-500 selection:text-white">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] pointer-events-none -z-10">
        <div className="absolute top-12 left-1/4 w-[400px] h-[400px] bg-purple-600/15 blur-[150px] rounded-full" />
        <div className="absolute top-24 right-1/4 w-[350px] h-[350px] bg-emerald-500/10 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/evenements/doctoriales"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 px-4 py-2 rounded-full transition-all backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Retour au formulaire HEC Doctoriales</span>
          </Link>

          <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white border-2 border-purple-400/50 shadow-md shrink-0">
            <Image
              src="/ecole-doctorale-logo.jpg"
              alt="École Doctorale IHEC Carthage"
              fill
              className="object-contain p-1"
            />
          </div>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-purple-500/30 bg-[#0c0c1b]/95 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6"
        >
          <div className="space-y-2 border-b border-slate-800 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
              <FileArchive className="w-3.5 h-3.5 text-emerald-400" />
              <span>Outil Officiel • HEC Doctoriales Series</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Créateur de dossier{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">
                .ZIP en ligne
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Si votre ordinateur ne dispose pas de l&apos;option permettant de
              compresser vos fichiers en <strong>.zip</strong>, sélectionnez
              simplement vos fichiers ci-dessous (ex : les{" "}
              <strong>2 fichiers</strong> à regrouper à la fin de l&apos;atelier)
              pour générer et télécharger instantanément votre archive{" "}
              <strong>.zip</strong>.
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              addFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center transition-all ${
              isDragging
                ? "border-emerald-400 bg-emerald-500/10"
                : "border-slate-700 hover:border-purple-500/60 bg-[#121226]/70 hover:bg-[#14142c]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={(e) => addFiles(e.target.files)}
              className="hidden"
            />
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mb-4 text-purple-300">
              <Upload className="w-7 h-7" />
            </div>
            <p className="text-sm sm:text-base font-semibold text-white">
              Cliquez ici ou glissez-déposez vos fichiers
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Vous pouvez sélectionner vos 2 fichiers (ou plus) en même temps
            </p>
          </div>

          {/* Selected Files List */}
          <AnimatePresence>
            {files.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 overflow-hidden"
              >
                <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span>
                    Fichiers sélectionnés ({files.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setFiles([])}
                    className="text-rose-400 hover:text-rose-300 transition-colors"
                  >
                    Tout effacer
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {files.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#14142b] border border-slate-800 text-xs sm:text-sm"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-white font-medium truncate">
                          {file.name}
                        </span>
                        <span className="text-slate-400 text-xs shrink-0">
                          ({formatBytes(file.size)})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                        title="Retirer ce fichier"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {files.length === 1 && (
                  <div className="flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      Astuce : Pour l&apos;atelier Management, pensez à ajouter
                      vos <strong>2 fichiers</strong> avant de générer le
                      dossier ZIP.
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ZIP File Name Input */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-semibold text-slate-200 block">
              Nom du dossier .ZIP à générer
            </label>
            <div className="flex items-center bg-[#121226] border border-slate-700/80 focus-within:border-purple-500 rounded-xl overflow-hidden">
              <input
                type="text"
                value={zipName}
                onChange={(e) => setZipName(e.target.value)}
                placeholder="Nom_Prenom_Atelier_Management"
                className="w-full bg-transparent px-4 py-3 text-white text-sm outline-none"
              />
              <span className="px-4 py-3 bg-slate-900 border-l border-slate-800 text-slate-400 text-xs font-mono">
                .zip
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            disabled={files.length === 0 || isGenerating}
            onClick={handleGenerateZip}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-600/25 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span>
              {isGenerating
                ? "Création de l'archive .ZIP..."
                : `Télécharger mes fichiers en .ZIP (${files.length})`}
            </span>
          </button>

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-200 text-xs sm:text-sm flex items-center gap-2.5"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Votre dossier <strong>.zip</strong> a été généré et téléchargé
                avec succès sur votre ordinateur !
              </span>
            </motion.div>
          )}

          <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[11px] sm:text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              100% confidentiel et local : vos fichiers sont compressés
              directement dans votre navigateur Google Chrome sans aucun envoi
              sur un serveur externe.
            </span>
          </div>
        </motion.div>
      </div>
    </main>
  );
}

