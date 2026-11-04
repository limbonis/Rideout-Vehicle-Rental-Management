import React, { useState } from 'react';
import { Motorbike, Reservation } from '../../types';
import { generateLtoRegistrationDocs } from '../../utils/ltoRegistrationDocs';
import { ZAMBALES_RECOMMENDED_DESTINATIONS } from '../../utils/recommendedDestinations';
import { 
  FileText, 
  MapPin, 
  X, 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Navigation,
  Compass,
  Printer
} from 'lucide-react';

interface RegistrationAndGuidesModalProps {
  reservation: Reservation;
  bike?: Motorbike;
  initialTab?: 'or_cr' | 'destinations';
  onClose: () => void;
}

export const RegistrationAndGuidesModal: React.FC<RegistrationAndGuidesModalProps> = ({
  reservation,
  bike,
  initialTab = 'or_cr',
  onClose,
}) => {
  const [tab, setTab] = useState<'or_cr' | 'destinations'>(initialTab);
  const [docType, setDocType] = useState<'cr' | 'or'>('cr');

  const docs = generateLtoRegistrationDocs(
    bike?.plateNumber || 'ZB-9481',
    bike?.name || 'Honda ADV 160 ABS',
    reservation.customerName
  );

  const handleDownloadDoc = () => {
    const svgData = docType === 'cr' ? docs.crSvg : docs.orSvg;
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `LTO_${docType.toUpperCase()}_${bike?.plateNumber || 'ZB-9481'}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              {tab === 'or_cr' ? <FileText className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100">
                {tab === 'or_cr' ? 'Official Motorbike LTO Registration (OR / CR)' : 'RideOut Zambales Curated Travel Destinations'}
              </h2>
              <p className="text-xs text-stone-400">
                Booking: <span className="text-amber-400 font-mono font-semibold">{reservation.bookingRef}</span> · Motorbike: <span className="text-stone-200">{reservation.bikeName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switchers */}
            <div className="flex bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs font-semibold">
              <button
                onClick={() => setTab('or_cr')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  tab === 'or_cr' ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">LTO OR/CR</span>
              </button>
              <button
                onClick={() => setTab('destinations')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  tab === 'destinations' ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google Maps Guide</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {tab === 'or_cr' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-950 border border-stone-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-stone-400">Select Document:</span>
                  <div className="flex gap-1.5 bg-stone-900 p-1 rounded-lg border border-stone-800 text-xs font-bold font-mono">
                    <button
                      onClick={() => setDocType('cr')}
                      className={`px-3 py-1 rounded transition-colors ${
                        docType === 'cr' ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      Certificate of Registration (CR)
                    </button>
                    <button
                      onClick={() => setDocType('or')}
                      className={`px-3 py-1 rounded transition-colors ${
                        docType === 'or' ? 'bg-amber-400 text-stone-950' : 'text-stone-300 hover:text-white'
                      }`}
                    >
                      Official Receipt (OR)
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={handleDownloadDoc}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>Download Image</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              {/* Document Preview Rendering */}
              <div className="rounded-xl border border-stone-800 bg-stone-950 p-2 sm:p-4 flex items-center justify-center overflow-x-auto">
                <div
                  className="w-full max-w-2xl shadow-xl rounded-lg overflow-hidden border border-stone-700/50"
                  dangerouslySetInnerHTML={{
                    __html: docType === 'cr' ? docs.crSvg : docs.orSvg,
                  }}
                />
              </div>

              {/* LTO Verification Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-stone-500 text-[10px] block">Plate Number</span>
                  <strong className="text-amber-400 text-sm font-bold">{docs.plateNumber}</strong>
                </div>
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-stone-500 text-[10px] block">Engine Number</span>
                  <strong className="text-stone-200 text-xs">{docs.engineNumber}</strong>
                </div>
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-stone-500 text-[10px] block">Chassis Number</span>
                  <strong className="text-stone-200 text-xs">{docs.chassisNumber}</strong>
                </div>
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800">
                  <span className="text-stone-500 text-[10px] block">Registration Status</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1 text-xs">
                    <ShieldCheck className="w-3 h-3" />
                    Valid thru {docs.expiryDate}
                  </span>
                </div>
              </div>
            </div>
          )}

          {tab === 'destinations' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-start gap-3">
                <Compass className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <h4 className="font-bold text-amber-400">RideOut Google Account Zambales Motorbike Circuit</h4>
                  <p className="text-stone-300 mt-0.5">
                    Curated list of must-visit coastal spots, surf beaches, and scenic mountain loops in San Felipe, San Narciso, San Antonio, and Cabangan. Click to open turn-by-turn directions directly in Google Maps.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ZAMBALES_RECOMMENDED_DESTINATIONS.map((dest) => (
                  <div
                    key={dest.id}
                    className="rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-3 hover:border-amber-400/40 transition-colors flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-stone-100 text-sm flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>{dest.name}</span>
                          </div>
                          <span className="text-[11px] text-stone-400">{dest.location}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-stone-800 text-amber-300 border border-stone-700">
                          {dest.category}
                        </span>
                      </div>

                      <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                        {dest.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-800 flex items-center justify-between text-xs">
                      <span className="text-stone-400 text-[11px]">
                        Best: <strong className="text-stone-200">{dest.bestTimeToVisit}</strong>
                      </span>
                      <a
                        href={dest.googleMapsPlaceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Google Maps</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950/60 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Digital verification issued by RideOut Zambales depot operations</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
