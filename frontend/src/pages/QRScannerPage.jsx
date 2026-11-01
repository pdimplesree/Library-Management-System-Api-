import React, { useState, useEffect, useRef } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { extractStudentId } from '../utils/studentId';
import { 
  QrCode, 
  Camera, 
  CameraOff, 
  UserCheck, 
  ArrowRightLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Users, 
  Sparkles,
  RefreshCw,
  CreditCard
} from 'lucide-react';

export default function QRScannerPage() {
  const { user, refreshUser } = useAuth();
  const [studentIdInput, setStudentIdInput] = useState(user?.role === 'STUDENT' ? user.studentId : '');
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState('');
  const [recentVisits, setRecentVisits] = useState([]);
  const videoRef = useRef(null);
  const scannerControlsRef = useRef(null);

  const fetchRecentVisits = async () => {
    try {
      const res = await api.getVisits();
      if (res.success) setRecentVisits(res.data.slice(0, 8));
    } catch (e) {
      // may require admin login or returns user visits
    }
  };

  useEffect(() => {
    if (user) fetchRecentVisits();
    return () => scannerControlsRef.current?.stop();
  }, [user]);

  const handleCameraToggle = async () => {
    if (cameraActive) {
      scannerControlsRef.current?.stop();
      scannerControlsRef.current = null;
      setCameraActive(false);
    } else {
      try {
        const reader = new BrowserMultiFormatReader();
        scannerControlsRef.current = await reader.decodeFromVideoDevice(
          undefined,
          videoRef.current,
          (result, _error, controls) => {
            if (result) {
              const scannedId = extractStudentId(result.getText());
              setStudentIdInput(scannedId);
              scannerControlsRef.current = controls;
              controls.stop();
              setCameraActive(false);
              executeScan(scannedId, 'QR_SCAN');
            }
          }
        );
        setCameraActive(true);
      } catch (err) {
        setScanError(`Could not start barcode scanner: ${err.message}. Check camera permission or enter the ID manually.`);
        setCameraActive(false);
      }
    }
  };

  const executeScan = async (idToScan, method = 'MANUAL_VERIFICATION') => {
    if (!user || !['STUDENT', 'LIBRARIAN'].includes(user.role)) {
      setScanError('Sign in as a student or librarian before scanning student IDs.');
      return;
    }
    const studentId = extractStudentId(idToScan);
    if (!studentId) {
      setScanError('Enter or scan a student ID first.');
      return;
    }

    setLoading(true);
    setScanResult(null);
    setScanError('');

    try {
      const res = user?.role === 'LIBRARIAN'
        ? await api.verifyStudentEntry(studentId, method)
        : await api.scanQR(studentId, method);
      if (res.success && res.data) {
        setScanResult(res.data);
        await refreshUser();
        fetchRecentVisits();
      } else {
        setScanError(res.message || 'Scan verification failed.');
      }
    } catch (err) {
      setScanError(err.message || 'Scan error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">QR Turnstile Entry & Exit Scanner</h1>
            <span className="px-2 py-0.5 rounded text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              FEATURE B
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Validates scanned Aditya student IDs against registered records, records timestamps, and auto-updates occupancy.
          </p>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Camera Viewfinder & Manual Input (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Turnstile Scanner Mode</span>
              <button
                type="button"
                onClick={handleCameraToggle}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  cameraActive 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : 'bg-aditya-50 text-aditya-700 border border-aditya-200'
                }`}
              >
                {cameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
                {cameraActive ? 'Stop Webcam' : 'Start Webcam Scanner'}
              </button>
            </div>

            {/* Video Viewfinder */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-800">
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                autoPlay
                muted
                playsInline
              />
              
              {!cameraActive ? (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                    <QrCode className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Turnstile Camera Standby</h4>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Start the webcam scanner or enter the student ID to verify a gate event.
                    </p>
                  </div>
                </div>
              ) : (
                /* Scanner Overlay Reticle */
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-56 h-56 border-2 border-aditya-400/80 rounded-2xl relative animate-pulse shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-white" />
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-white" />
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-white" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-white" />
                    <div className="w-full h-0.5 bg-aditya-400 absolute top-1/2 -translate-y-1/2 animate-bounce" />
                  </div>
                </div>
              )}
            </div>

            {/* Manual ID Input & Scan Button */}
            <form
              onSubmit={(event) => {
                event.preventDefault();
                executeScan(studentIdInput, cameraActive ? 'QR_SCAN' : 'MANUAL_VERIFICATION');
              }}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3"
            >
              <label className="block text-xs font-bold text-slate-700 uppercase">
                {user?.role === 'STUDENT' ? 'Your student ID' : 'Student ID to verify'}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(user?.role === 'STUDENT' ? user.studentId : extractStudentId(e.target.value))}
                  placeholder="Enter Student Roll No (e.g. 22A91A0501)"
                  autoComplete="off"
                  readOnly={user?.role === 'STUDENT'}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-aditya-500 uppercase"
                />
                <button
                  type="submit"
                  disabled={loading || !studentIdInput.trim()}
                  className="px-6 py-2.5 bg-aditya-700 hover:bg-aditya-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                  {loading ? 'Processing...' : 'Scan Gate Event'}
                </button>
              </div>
            </form>

          </div>
        </div>

        {/* Right Column: Scan Result & Live Status (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Scan Result Feedback Card */}
          {scanResult ? (
            <div className={`p-6 rounded-3xl border shadow-md space-y-4 transition-all ${
              scanResult.action === 'ENTRY'
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-blue-50/70 border-blue-300 text-blue-950'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  scanResult.action === 'ENTRY' ? 'bg-emerald-600 text-white' : 'bg-aditya-700 text-white'
                }`}>
                  <UserCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className={`text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    scanResult.action === 'ENTRY' ? 'bg-emerald-200 text-emerald-900' : 'bg-blue-200 text-blue-900'
                  }`}>
                    {scanResult.action} RECORDED
                  </span>
                  <h3 className="text-lg font-black mt-0.5">{scanResult.studentName}</h3>
                </div>
              </div>

              <p className="text-xs font-medium leading-relaxed">
                {scanResult.message}
              </p>

              <div className="p-3.5 bg-white/80 rounded-2xl border border-black/5 text-xs space-y-1.5 backdrop-blur-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student Roll No:</span>
                  <strong className="font-mono text-slate-800">{scanResult.studentId}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Hall Status:</span>
                  <strong className={scanResult.isInside ? 'text-emerald-700' : 'text-slate-700'}>
                    {scanResult.isInside ? 'PHYSICALLY INSIDE' : 'OUTSIDE LIBRARY'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-700">{new Date(scanResult.timestamp).toLocaleTimeString()}</span>
                </div>
                {scanResult.occupancy && (
                  <div className="flex justify-between pt-1 border-t border-slate-100">
                    <span className="text-slate-500">Updated Hall Occupancy:</span>
                    <strong className="text-aditya-700">
                      {scanResult.occupancy.studentsInside} / {scanResult.occupancy.totalCapacity} Students
                    </strong>
                  </div>
                )}
              </div>
            </div>
          ) : scanError ? (
            <div className="p-6 rounded-3xl border border-rose-300 bg-rose-50 text-rose-950 shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-200 text-rose-900">
                    SCAN REJECTED
                  </span>
                  <h3 className="text-base font-black mt-0.5">Verification Error</h3>
                </div>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">{scanError}</p>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-3xl border border-slate-200 text-center space-y-3 shadow-sm">
              <ArrowRightLeft className="w-10 h-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">Gate Turnstile Awaiting Scan</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {user?.role === 'STUDENT' ? 'Scan your own student ID to record entry or exit.' : 'Scan a student ID to verify entry or checkout.'} The backend automatically occupies assigned seats on entry and releases them on exit.
              </p>
            </div>
          )}

          {user?.role === 'STUDENT' && <div className="bg-gradient-to-br from-aditya-900 via-aditya-800 to-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-4 border border-aditya-700">
            <div className="flex justify-between items-start border-b border-white/10 pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">Aditya University</span>
                <span className="text-xs font-bold text-white">Student Identification Card</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-aditya-200">VALID 2026</span>
            </div>

            <div className="flex items-center gap-4">
              {/* QR Code Graphic Box */}
              <div className="w-24 h-24 bg-white p-2 rounded-2xl flex flex-col items-center justify-center shrink-0 shadow-md">
                <QRCodeSVG value={user.studentId} size={64} />
              </div>

              <div className="text-xs space-y-1">
                <div className="font-black text-sm text-white">{user.name}</div>
                <div className="text-aditya-200 font-mono text-xs">{user.studentId}</div>
                <div className="text-slate-300 text-[11px]">{user.department || 'Student'}</div>
                <div className="text-[10px] text-amber-300 font-semibold">Aditya Engineering College</div>
              </div>
            </div>

            <div className="text-[10px] text-aditya-200/80 pt-2 border-t border-white/10 text-center">
              Present this QR to the library gate scanner.
            </div>
          </div>}
        </div>
      </div>
    </div>
  );
}
