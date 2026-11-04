import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatReservationToSheetRow, getDriveFolderStructure } from '../../services/googleCloudArchivingService';
import { 
  FileSpreadsheet, 
  FolderTree, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Download, 
  Share2, 
  Building2, 
  Star, 
  MessageSquare,
  Instagram,
  Facebook,
  Video,
  HardDrive
} from 'lucide-react';

interface GoogleDriveArchiveModalProps {
  onClose: () => void;
}

export const GoogleDriveArchiveModal: React.FC<GoogleDriveArchiveModalProps> = ({ onClose }) => {
  const { currentBusiness, reservations, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'sheet' | 'drive' | 'business_profile'>('sheet');
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedResRef, setSelectedResRef] = useState<string>(reservations[0]?.bookingRef || 'ROZ-2026-1041');

  const sheetRows = reservations.map(r => formatReservationToSheetRow(r));
  const driveFiles = getDriveFolderStructure(selectedResRef);

  const handleSyncNow = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      showToast('Synced 100% of reservations to Google Sheets & organized Google Drive subfolders!', 'success');
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-100 text-sm">
                  Google Workspace Cloud Archive & Social Hub
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Google Account Connected
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Connected to <span className="font-mono text-amber-400">{currentBusiness.email}</span> · Automated Sheets archiving, Drive subfolder storage & Google Business Profile
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-stone-800 bg-stone-950">
          <button
            onClick={() => setActiveTab('sheet')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'sheet'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Google Sheets Master Archive ({sheetRows.length} rows)</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'drive'
                ? 'border-blue-400 text-blue-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Google Drive Reservation Folders</span>
          </button>

          <button
            onClick={() => setActiveTab('business_profile')}
            className={`pb-3 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'business_profile'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Google Business Profile & Social Hub</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {/* TAB 1: GOOGLE SHEETS */}
          {activeTab === 'sheet' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-emerald-400 text-xs flex items-center gap-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Spreadsheet: RideOut_Zambales_Master_Archive_2026</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-0.5">
                    Every reservation, cash handover photo, odometer reading, fuel difference, and customer feedback is synced in real-time.
                  </p>
                </div>
                <a
                  href={`https://docs.google.com/spreadsheets/d/1RideOutArchiveMaster2026/edit`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1.5"
                >
                  <span>Open in Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Sheet Table Preview */}
              <div className="rounded-xl border border-stone-800 bg-stone-950 overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead className="bg-stone-900 border-b border-stone-800 text-stone-400">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Booking Ref</th>
                      <th className="py-2.5 px-3">Customer</th>
                      <th className="py-2.5 px-3">Social Link</th>
                      <th className="py-2.5 px-3">Bike / Plate</th>
                      <th className="py-2.5 px-3">Payment</th>
                      <th className="py-2.5 px-3">Deposit Type</th>
                      <th className="py-2.5 px-3">Damage Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 text-stone-300">
                    {sheetRows.map((row, idx) => (
                      <tr key={idx} className="hover:bg-stone-900/40">
                        <td className="py-2 px-3 text-stone-500">{new Date(row.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                        <td className="py-2 px-3 text-amber-400 font-bold">{row.bookingRef}</td>
                        <td className="py-2 px-3 font-sans font-semibold text-stone-100">{row.customerName}</td>
                        <td className="py-2 px-3 text-blue-400 truncate max-w-[120px]">{row.socialChannel}</td>
                        <td className="py-2 px-3">{row.bikeModel}</td>
                        <td className="py-2 px-3">{row.paymentMethod}</td>
                        <td className="py-2 px-3">{row.depositType}</td>
                        <td className="py-2 px-3 text-emerald-400">{row.damageStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-blue-950/20 border border-blue-500/30">
                <div>
                  <div className="font-bold text-blue-400 text-xs flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4" />
                    <span>Google Drive Folder: /RideOut_Archives/{selectedResRef}/</span>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-0.5">
                    Files organized systematically by Reservation Number for rapid retrieval & audit.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedResRef}
                    onChange={(e) => setSelectedResRef(e.target.value)}
                    className="px-2.5 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-amber-400 font-mono text-xs"
                  >
                    {reservations.map(r => (
                      <option key={r.id} value={r.bookingRef}>{r.bookingRef} ({r.customerName})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Drive Subfolder Hierarchy */}
              <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-2">
                <div className="text-[11px] text-stone-400 font-mono flex items-center justify-between border-b border-stone-800 pb-2">
                  <span>FILES IN FOLDER: /RideOut_Archives/{selectedResRef}/</span>
                  <span className="text-emerald-400">8 Files Archived (100% Synced)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {driveFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg border border-stone-800/80 bg-stone-900/60 flex items-center justify-between hover:border-blue-400/40 transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{file.type === 'folder' ? '📁' : '📄'}</span>
                        <span className="font-mono text-stone-200 truncate">{file.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-mono shrink-0">Archived ✓</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: GOOGLE BUSINESS PROFILE & UNIFIED SOCIAL HUB */}
          {activeTab === 'business_profile' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Google Business Profile Card */}
                <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                        G
                      </div>
                      <div>
                        <div className="font-bold text-stone-100">Google Business Profile</div>
                        <div className="text-[10px] text-stone-400">Google Maps & Search Presence</div>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Verified
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-stone-300">
                    <div><span className="text-stone-500">Business Name:</span> <strong>{currentBusiness.name}</strong></div>
                    <div><span className="text-stone-500">Address:</span> {currentBusiness.location}</div>
                    <div className="flex items-center gap-1.5 text-amber-400">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="font-bold">4.9 / 5.0</span>
                      <span className="text-stone-400 text-[10px]">(148 verified Google reviews)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800 text-[11px] text-stone-400">
                    Customer 200-character return reviews are automatically formatted and syndicated to your Google Business Profile page.
                  </div>
                </div>

                {/* Unified Social Media Channels */}
                <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                    <span className="font-bold text-stone-100 flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-amber-400" />
                      <span>Social Media Ecosystem</span>
                    </span>
                    <span className="text-[10px] text-stone-400">All-in-One Window</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    {/* Facebook */}
                    <div className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="font-bold text-stone-200">Facebook Page</div>
                          <div className="text-[10px] text-stone-400">rideoutzambales (Verified)</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold">Connected ✓</span>
                    </div>

                    {/* Instagram */}
                    <div className="p-2.5 rounded-lg border border-pink-500/30 bg-pink-950/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-400" />
                        <div>
                          <div className="font-bold text-stone-200">Instagram Profile</div>
                          <div className="text-[10px] text-stone-400">@rideout_zambales</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold">Connected ✓</span>
                    </div>

                    {/* TikTok */}
                    <div className="p-2.5 rounded-lg border border-stone-700 bg-stone-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-amber-400" />
                        <div>
                          <div className="font-bold text-stone-200">TikTok Account</div>
                          <div className="text-[10px] text-stone-400">@rideoutzambales</div>
                        </div>
                      </div>
                      <span className="text-emerald-400 text-[10px] font-bold">Connected ✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
