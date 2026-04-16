import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  Stethoscope, 
  Ticket, 
  Printer, 
  LayoutDashboard, 
  Settings,
  Search,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Hospital,
  ChevronRight,
  X,
  QrCode,
  BarChart3,
  PieChart as PieChartIcon,
  TrendingUp,
  Activity,
  Check,
  AlertCircle,
  Download,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line,
  Legend
} from 'recharts';
import { format } from 'date-fns';
import { Patient, Doctor, Token, HospitalInfo, ServiceType, PaymentMethod, PrinterProfile } from './types';
import { cn } from './lib/utils';
import { exportToCSV } from './lib/exportUtils';

// --- Components ---

const Card = ({ children, className, onClick }: { children: React.ReactNode; className?: string; key?: any; onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden", 
      onClick && "cursor-pointer",
      className
    )}
  >
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  type = 'button',
  disabled = false
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  className?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}) => {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-rose-100',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100',
    outline: 'bg-transparent border border-slate-200 text-slate-600 hover:bg-slate-50'
  };

  return (
    <button 
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
};

const Input = ({ 
  label, 
  value, 
  onChange, 
  placeholder, 
  type = 'text',
  required = false,
  className
}: { 
  label: string; 
  value: string | number; 
  onChange: (val: any) => void; 
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label className="text-sm font-semibold text-slate-700">{label}{required && <span className="text-rose-500 ml-1">*</span>}</label>
    <input 
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900"
    />
  </div>
);

const Select = ({ 
  label, 
  value, 
  onChange, 
  options,
  required = false,
  className
}: { 
  label: string; 
  value: string; 
  onChange: (val: string) => void; 
  options: { label: string; value: string }[];
  required?: boolean;
  className?: string;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <label className="text-sm font-semibold text-slate-700">{label}{required && <span className="text-rose-500 ml-1">*</span>}</label>
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 bg-white"
    >
      <option value="">Select an option</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'registration' | 'patients' | 'doctors' | 'tokens' | 'queue' | 'settings' | 'analytics'>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [editingTokenId, setEditingTokenId] = useState<string | null>(null);
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('hospitally_patients');
    return saved ? JSON.parse(saved) : [];
  });
  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('hospitally_doctors');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Dr. Sarah Wilson', specialization: 'General Physician', department: 'General Medicine', roomNumber: '101' },
      { id: '2', name: 'Dr. James Miller', specialization: 'Cardiologist', department: 'Cardiology', roomNumber: '202' },
      { id: '3', name: 'Dr. Emily Chen', specialization: 'Pediatrician', department: 'Pediatrics', roomNumber: '105' }
    ];
  });
  const [tokens, setTokens] = useState<Token[]>(() => {
    const saved = localStorage.getItem('hospitally_tokens');
    return saved ? JSON.parse(saved) : [];
  });
  const [hospitalInfo, setHospitalInfo] = useState<HospitalInfo>(() => {
    const saved = localStorage.getItem('hospitally_info');
    return saved ? JSON.parse(saved) : {
      name: 'City Care Hospital',
      address: '123 Healthcare Ave, Medical District',
      phone: '+1 (555) 000-1111',
      email: 'contact@citycare.com'
    };
  });

  const [printingToken, setPrintingToken] = useState<Token | null>(null);
  const [printerProfiles, setPrinterProfiles] = useState<PrinterProfile[]>(() => {
    const saved = localStorage.getItem('hospitally_printers');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: 'Main Reception (A4)', paperSize: 'A4', isDefault: true, status: 'Online' },
      { id: '2', name: 'Pharmacy (Thermal)', paperSize: 'Thermal', isDefault: false, status: 'Online' }
    ];
  });
  const [selectedProfileId, setSelectedProfileId] = useState<string>(() => {
    const defaultProfile = printerProfiles.find(p => p.isDefault);
    return defaultProfile ? defaultProfile.id : printerProfiles[0]?.id || '';
  });
  const [isCheckingStatus, setIsCheckingStatus] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('hospitally_printers', JSON.stringify(printerProfiles));
  }, [printerProfiles]);

  useEffect(() => {
    localStorage.setItem('hospitally_info', JSON.stringify(hospitalInfo));
  }, [hospitalInfo]);

  const analyticsData = useMemo(() => {
    const today = new Date();
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (29 - i));
      return format(d, 'yyyy-MM-dd');
    });

    const revenueByDay = last30Days.map(day => {
      const dayTokens = tokens.filter(t => format(new Date(t.createdAt), 'yyyy-MM-dd') === day);
      return {
        date: format(new Date(day), 'dd MMM'),
        revenue: dayTokens.reduce((acc, t) => acc + t.fee, 0),
        tokens: dayTokens.length
      };
    });

    const genderDist = patients.reduce((acc: any, p) => {
      acc[p.gender] = (acc[p.gender] || 0) + 1;
      return acc;
    }, {});

    const ageGroups = [
      { label: '0-12', min: 0, max: 12 },
      { label: '13-19', min: 13, max: 19 },
      { label: '20-39', min: 20, max: 39 },
      { label: '40-59', min: 40, max: 59 },
      { label: '60+', min: 60, max: 200 }
    ];

    const ageDist = ageGroups.map(group => ({
      group: group.label,
      count: patients.filter(p => p.age >= group.min && p.age <= group.max).length
    }));

    const serviceDist = tokens.reduce((acc: any, t) => {
      acc[t.serviceType] = (acc[t.serviceType] || 0) + 1;
      return acc;
    }, {});

    const doctorPerf = doctors.map(doc => ({
      name: doc.name.split(' ').pop(),
      tokens: tokens.filter(t => t.doctorId === doc.id).length
    }));

    return {
      revenueByDay,
      genderDist: Object.entries(genderDist).map(([name, value]) => ({ name, value })),
      ageDist,
      serviceDist: Object.entries(serviceDist).map(([name, value]) => ({ name, value })),
      doctorPerf
    };
  }, [tokens, patients, doctors]);

  // Persistence
  useEffect(() => {
    localStorage.setItem('hospitally_patients', JSON.stringify(patients));
    localStorage.setItem('hospitally_doctors', JSON.stringify(doctors));
    localStorage.setItem('hospitally_tokens', JSON.stringify(tokens));
    localStorage.setItem('hospitally_info', JSON.stringify(hospitalInfo));
  }, [patients, doctors, tokens, hospitalInfo]);

  // Handlers
  const addPatient = (patient: Omit<Patient, 'id'>) => {
    const newPatient = { ...patient, id: Date.now().toString() };
    setPatients(prev => [...prev, newPatient]);
    return newPatient;
  };

  const createToken = (patientId: string, doctorId: string, registrationFee: number, serviceFee: number, serviceType: ServiceType, paymentMethod: PaymentMethod) => {
    const todayTokens = tokens.filter(t => 
      format(new Date(t.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    );
    const newToken: Token = {
      id: Date.now().toString(),
      tokenNumber: todayTokens.length + 1,
      patientId,
      doctorId,
      createdAt: new Date().toISOString(),
      status: 'Pending',
      registrationFee,
      serviceFee,
      fee: registrationFee + serviceFee,
      serviceType,
      paymentMethod
    };
    setTokens(prev => [...prev, newToken]);
    setPrintingToken(newToken);
    setActiveTab('tokens');
  };

  const updateTokenStatus = (tokenId: string, status: Token['status']) => {
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status } : t));
  };

  const updateTokenDetails = (tokenId: string, diagnosis: string, notes: string) => {
    setTokens(prev => prev.map(t => t.id === tokenId ? { ...t, diagnosis, notes } : t));
    setEditingTokenId(null);
  };

  const deleteToken = (tokenId: string) => {
    setTokens(prev => prev.filter(t => t.id !== tokenId));
  };

  // Stats
  const stats = useMemo(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayTokens = tokens.filter(t => format(new Date(t.createdAt), 'yyyy-MM-dd') === today);
    return {
      totalToday: todayTokens.length,
      pending: todayTokens.filter(t => t.status === 'Pending').length,
      completed: todayTokens.filter(t => t.status === 'Completed').length,
      revenue: todayTokens.reduce((acc, t) => acc + t.fee, 0)
    };
  }, [tokens]);

  const currentCalledTokens = useMemo(() => {
    // Get the latest 'Called' token for each doctor
    const called = tokens.filter(t => t.status === 'Called');
    const latestByDoctor: Record<string, Token> = {};
    called.forEach(t => {
      if (!latestByDoctor[t.doctorId] || new Date(t.createdAt) > new Date(latestByDoctor[t.doctorId].createdAt)) {
        latestByDoctor[t.doctorId] = t;
      }
    });
    return Object.values(latestByDoctor);
  }, [tokens]);

  // --- Views ---

  const DashboardView = () => {
    const statsItems = [
      { label: "Today's Tokens", value: stats.totalToday, icon: Ticket, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: "Pending", value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: "Completed", value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: "Today's Revenue", value: `Rs. ${stats.revenue}`, icon: LayoutDashboard, color: 'text-slate-600', bg: 'bg-slate-50' },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsItems.map((stat, i) => (
            <div key={i}>
              <Card className="p-4 flex items-center gap-4">
                <div className={cn("p-3 rounded-xl", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
          <div className="p-4 border-bottom border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              Recent Tokens
            </h3>
            <Button variant="ghost" onClick={() => setActiveTab('tokens')} className="text-sm">View All</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-4 py-3 font-semibold">Token</th>
                  <th className="px-4 py-3 font-semibold">Patient</th>
                  <th className="px-4 py-3 font-semibold">Doctor</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tokens.slice(-5).reverse().map(token => {
                  const patient = patients.find(p => p.id === token.patientId);
                  const doctor = doctors.find(d => d.id === token.doctorId);
                  return (
                    <tr key={token.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-indigo-600">#{token.tokenNumber}</td>
                      <td className="px-4 py-3 text-slate-700">{patient?.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-slate-700">{doctor?.name || 'Unknown'}</td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide",
                          token.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                          token.status === 'Called' ? 'bg-indigo-100 text-indigo-700' : 
                          'bg-emerald-100 text-emerald-700'
                        )}>
                          {token.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 text-sm">{format(new Date(token.createdAt), 'hh:mm a')}</td>
                    </tr>
                  );
                })}
                {tokens.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400 italic">No tokens generated today</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="p-4 border-bottom border-slate-100">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-600" />
              Available Doctors
            </h3>
          </div>
          <div className="p-4 space-y-4">
            {doctors.map(doctor => (
              <div key={doctor.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {doctor.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{doctor.name}</p>
                  <p className="text-xs text-slate-500 truncate">{doctor.specialization}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Room</p>
                  <p className="font-bold text-indigo-600">{doctor.roomNumber}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
  };

  const RegistrationView = () => {
    const [formData, setFormData] = useState({
      name: '',
      age: '',
      gender: 'Male' as Patient['gender'],
      phone: '',
      address: '',
      doctorId: '',
      registrationFee: '50',
      serviceFee: '0',
      caseType: 'Regular' as 'Regular' | 'Emergency',
      serviceType: 'OPD' as ServiceType,
      paymentMethod: 'Cash' as PaymentMethod
    });

    useEffect(() => {
      if (formData.caseType === 'Emergency') {
        setFormData(f => ({ 
          ...f, 
          registrationFee: '0', 
          serviceFee: '0', 
          serviceType: 'Emergency' 
        }));
      } else {
        let sFee = '0';
        if (formData.serviceType === 'Ultrasound' || formData.serviceType === 'ECG') {
          sFee = '300';
        }
        setFormData(f => ({ 
          ...f, 
          registrationFee: '50', 
          serviceFee: sFee 
        }));
      }
    }, [formData.caseType, formData.serviceType]);

    const suggestedDoctors = useMemo(() => {
      const age = parseInt(formData.age);
      if (isNaN(age)) return [];

      return doctors.filter(doc => {
        const spec = doc.specialization.toLowerCase();
        
        // Pediatrician for children
        if (age < 18 && spec.includes('pediatrician')) return true;
        
        // Gynecologist for females of certain age
        if (formData.gender === 'Female' && age >= 12 && spec.includes('gynecologist')) return true;
        
        // Cardiologist/Geriatrician for elderly
        if (age >= 60 && (spec.includes('cardiologist') || spec.includes('geriatrician'))) return true;
        
        // General Physician for everyone else if no specific match
        if (spec.includes('general physician')) return true;

        return false;
      });
    }, [formData.age, formData.gender, doctors]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const patient = addPatient({
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        phone: formData.phone,
        address: formData.address
      });
      createToken(
        patient.id, 
        formData.doctorId, 
        parseFloat(formData.registrationFee), 
        parseFloat(formData.serviceFee), 
        formData.serviceType, 
        formData.paymentMethod
      );
    };

    return (
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-900">Patient Registration</h2>
            <p className="text-slate-500">Register a new patient and assign a doctor token.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Full Name" 
                value={formData.name} 
                onChange={v => setFormData(f => ({ ...f, name: v }))} 
                required 
                placeholder="John Doe"
              />
              <Input 
                label="Age" 
                type="number"
                value={formData.age} 
                onChange={v => setFormData(f => ({ ...f, age: v }))} 
                required 
                placeholder="25"
              />
              <Select 
                label="Gender" 
                value={formData.gender} 
                onChange={v => setFormData(f => ({ ...f, gender: v as any }))} 
                options={[
                  { label: 'Male', value: 'Male' },
                  { label: 'Female', value: 'Female' },
                  { label: 'Other', value: 'Other' }
                ]}
                required 
              />
              <Input 
                label="Phone Number" 
                value={formData.phone} 
                onChange={v => setFormData(f => ({ ...f, phone: v }))} 
                required 
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <Input 
              label="Address" 
              value={formData.address} 
              onChange={v => setFormData(f => ({ ...f, address: v }))} 
              placeholder="123 Street, City"
            />
            
            <div className="pt-4 border-t border-slate-100 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select 
                  label="Case Type" 
                  value={formData.caseType} 
                  onChange={v => setFormData(f => ({ ...f, caseType: v as any }))} 
                  options={[
                    { label: 'Regular (Rs. 50 Registration)', value: 'Regular' },
                    { label: 'Emergency (Free Registration)', value: 'Emergency' }
                  ]}
                  required 
                />
                <div className="space-y-2">
                  <Select 
                    label="Assign Doctor" 
                    value={formData.doctorId} 
                    onChange={v => setFormData(f => ({ ...f, doctorId: v }))} 
                    options={doctors.map(d => ({ label: `${d.name} (${d.specialization})`, value: d.id }))}
                    required 
                  />
                  {suggestedDoctors.length > 0 && !formData.doctorId && (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Suggested:</span>
                      {suggestedDoctors.map(doc => (
                        <button
                          key={doc.id}
                          type="button"
                          onClick={() => setFormData(f => ({ ...f, doctorId: doc.id }))}
                          className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 transition-colors font-medium"
                        >
                          {doc.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.caseType === 'Regular' && (
                  <Select 
                    label="Service Type" 
                    value={formData.serviceType} 
                    onChange={v => setFormData(f => ({ ...f, serviceType: v as ServiceType }))} 
                    options={[
                      { label: 'OPD (Consultation Only)', value: 'OPD' },
                      { label: 'Ultrasound Scan (+Rs. 300)', value: 'Ultrasound' },
                      { label: 'ECG / EKG (+Rs. 300)', value: 'ECG' },
                      { label: 'Laboratory Test', value: 'Lab' },
                      { label: 'Pharmacy / Medicine', value: 'Pharmacy' }
                    ]}
                    required 
                  />
                )}
                <Select 
                  label="Payment Method" 
                  value={formData.paymentMethod} 
                  onChange={v => setFormData(f => ({ ...f, paymentMethod: v as PaymentMethod }))} 
                  options={[
                    { label: 'Cash', value: 'Cash' },
                    { label: 'Credit/Debit Card', value: 'Card' },
                    { label: 'Online Payment', value: 'Online' }
                  ]}
                  required 
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input 
                    label="Reg. Fee" 
                    type="number"
                    value={formData.registrationFee} 
                    onChange={() => {}} 
                    required 
                    className="opacity-75"
                  />
                  <Input 
                    label="Service Fee" 
                    type="number"
                    value={formData.serviceFee} 
                    onChange={() => {}} 
                    required 
                    className="opacity-75"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Button type="submit" className="w-full py-3 text-lg" disabled={!formData.doctorId}>
                <Ticket className="w-5 h-5" />
                Generate Token & Invoice
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  };

  const PatientsView = () => {
    const [search, setSearch] = useState('');
    const filteredPatients = patients.filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      p.phone.includes(search)
    );

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Patient Records</h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search patients..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <Card key={patient.id} className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg">
                  {patient.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{patient.name}</h4>
                  <p className="text-xs text-slate-500">{patient.age} years • {patient.gender}</p>
                </div>
                <Button variant="outline" onClick={() => setSelectedPatientId(patient.id)} className="text-xs py-1 px-2">
                  History
                </Button>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Clock className="w-3 h-3" /> 
                  Last visit: {
                    tokens.filter(t => t.patientId === patient.id).length > 0 
                      ? format(new Date(tokens.filter(t => t.patientId === patient.id).reverse()[0].createdAt), 'dd MMM yyyy')
                      : 'No visits'
                  }
                </p>
                <p className="flex items-center gap-2">
                  <Ticket className="w-3 h-3" /> 
                  Total visits: {tokens.filter(t => t.patientId === patient.id).length}
                </p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const TokensView = () => {
    const [search, setSearch] = useState('');
    const filteredTokens = tokens.filter(t => {
      const patient = patients.find(p => p.id === t.patientId);
      return patient?.name.toLowerCase().includes(search.toLowerCase()) || t.tokenNumber.toString() === search;
    }).reverse();

    return (
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Today's Tokens</h2>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or token..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredTokens.map(token => {
              const patient = patients.find(p => p.id === token.patientId);
              const doctor = doctors.find(d => d.id === token.doctorId);
              return (
                <motion.div
                  key={token.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="p-4 border-l-4 border-l-indigo-600">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Token No.</p>
                        <h4 className="text-3xl font-black text-indigo-600">#{token.tokenNumber}</h4>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" onClick={() => setPrintingToken(token)} className="p-2 h-auto">
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" onClick={() => deleteToken(token.id)} className="p-2 h-auto text-rose-500 hover:bg-rose-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="font-bold text-slate-800">{patient?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{doctor?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(token.createdAt), 'hh:mm a')}</span>
                        <span className="font-bold text-slate-900">Fee: Rs. {token.fee}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {(['Pending', 'Called', 'Completed'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => updateTokenStatus(token.id, status)}
                          className={cn(
                            "py-1.5 rounded-md text-[10px] font-bold transition-all",
                            token.status === status 
                              ? status === 'Pending' ? 'bg-amber-500 text-white' : 
                                status === 'Called' ? 'bg-indigo-600 text-white' : 
                                'bg-emerald-500 text-white'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          )}
                        >
                          {status}
                        </button>
                      ))}
                      <button
                        onClick={() => setEditingTokenId(token.id)}
                        className="py-1.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-500 hover:bg-slate-200"
                      >
                        Details
                      </button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );
  };

  const DoctorsView = () => {
    const [isAdding, setIsAdding] = useState(false);
    const [newDoc, setNewDoc] = useState({ name: '', specialization: '', department: '', roomNumber: '' });

    const handleAdd = (e: React.FormEvent) => {
      e.preventDefault();
      setDoctors(prev => [...prev, { ...newDoc, id: Date.now().toString() }]);
      setNewDoc({ name: '', specialization: '', department: '', roomNumber: '' });
      setIsAdding(false);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Doctor Directory</h2>
          <Button onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4" /> Add Doctor
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {doctors.map(doc => (
            <div key={doc.id}>
              <Card className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                  {doc.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{doc.name}</h4>
                  <p className="text-sm text-slate-500">{doc.specialization}</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase mt-1">{doc.department}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-600 uppercase">
                    Room {doc.roomNumber}
                  </div>
                </div>
                <Button variant="ghost" onClick={() => setDoctors(prev => prev.filter(d => d.id !== doc.id))} className="p-2 h-auto text-rose-500">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {isAdding && (
            <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="w-full max-w-md"
              >
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold">Add New Doctor</h3>
                    <Button variant="ghost" onClick={() => setIsAdding(false)} className="p-1 h-auto">
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                  <form onSubmit={handleAdd} className="space-y-4">
                    <Input label="Doctor Name" value={newDoc.name} onChange={v => setNewDoc(f => ({ ...f, name: v }))} required placeholder="Dr. John Smith" />
                    <Input label="Specialization" value={newDoc.specialization} onChange={v => setNewDoc(f => ({ ...f, specialization: v }))} required placeholder="Dermatologist" />
                    <Input label="Department" value={newDoc.department} onChange={v => setNewDoc(f => ({ ...f, department: v }))} required placeholder="Dermatology" />
                    <Input label="Room Number" value={newDoc.roomNumber} onChange={v => setNewDoc(f => ({ ...f, roomNumber: v }))} required placeholder="305" />
                    <Button type="submit" className="w-full">Save Doctor</Button>
                  </form>
                </Card>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const QueueView = () => {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map(doctor => {
            const currentToken = currentCalledTokens.find(t => t.doctorId === doctor.id);
            const pendingCount = tokens.filter(t => t.doctorId === doctor.id && t.status === 'Pending').length;
            
            return (
              <Card key={doctor.id} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600" />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{doctor.name}</h3>
                      <p className="text-sm text-slate-500">{doctor.specialization}</p>
                      <p className="text-xs font-bold text-indigo-600 mt-1 uppercase tracking-wider">Room {doctor.roomNumber}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="bg-slate-900 rounded-2xl p-6 text-center mb-6 shadow-xl shadow-slate-200">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Now Serving</p>
                    {currentToken ? (
                      <div>
                        <h4 className="text-5xl font-black text-white mb-1">#{currentToken.tokenNumber}</h4>
                        <p className="text-indigo-400 font-bold text-sm truncate">
                          {patients.find(p => p.id === currentToken.patientId)?.name}
                        </p>
                      </div>
                    ) : (
                      <p className="text-slate-500 font-bold py-4 italic">No patient called</p>
                    )}
                  </div>

                  {/* Waiting List */}
                  <div className="mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Next in Line</p>
                    <div className="space-y-2">
                      {tokens
                        .filter(t => t.doctorId === doctor.id && t.status === 'Pending')
                        .slice(0, 3)
                        .map((t, idx) => (
                          <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                                {idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                {patients.find(p => p.id === t.patientId)?.name}
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-indigo-600">#{t.tokenNumber}</span>
                          </div>
                        ))}
                      {pendingCount === 0 && (
                        <p className="text-[10px] text-slate-400 italic text-center py-2">Queue is empty</p>
                      )}
                      {pendingCount > 3 && (
                        <p className="text-[10px] text-slate-400 text-center pt-1">+{pendingCount - 3} more waiting</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="text-center flex-1 border-r border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Waiting</p>
                      <p className="text-xl font-black text-slate-900">{pendingCount}</p>
                    </div>
                    <div className="flex-1 pl-4">
                      <Button 
                        variant="primary" 
                        className="w-full text-xs py-2"
                        disabled={pendingCount === 0}
                        onClick={() => {
                          const nextToken = tokens.find(t => t.doctorId === doctor.id && t.status === 'Pending');
                          if (nextToken) updateTokenStatus(nextToken.id, 'Called');
                        }}
                      >
                        Call Next
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  const AnalyticsView = () => {
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    return (
      <div className="space-y-8">
        {/* Export Options */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-indigo-100 bg-indigo-50/30 flex items-center justify-between group hover:border-indigo-300 transition-all cursor-pointer" onClick={() => {
            const reportData = tokens.map(t => ({
              Date: format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm'),
              TokenNo: t.tokenNumber,
              Patient: patients.find(p => p.id === t.patientId)?.name || 'Unknown',
              Doctor: doctors.find(d => d.id === t.doctorId)?.name || 'Unknown',
              Service: t.serviceType,
              RegFee: t.registrationFee,
              ServiceFee: t.serviceFee,
              Total: t.fee,
              Payment: t.paymentMethod
            }));
            exportToCSV(reportData, `Financial_Report_${format(new Date(), 'yyyy-MM-dd')}`);
          }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Financial Report</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Export as CSV</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
          </Card>

          <Card className="p-4 border-emerald-100 bg-emerald-50/30 flex items-center justify-between group hover:border-emerald-300 transition-all cursor-pointer" onClick={() => {
            const patientData = patients.map(p => ({
              ID: p.id,
              Name: p.name,
              Age: p.age,
              Gender: p.gender,
              Phone: p.phone,
              LastVisit: p.lastVisit ? format(new Date(p.lastVisit), 'yyyy-MM-dd') : 'N/A'
            }));
            exportToCSV(patientData, `Patient_Directory_${format(new Date(), 'yyyy-MM-dd')}`);
          }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Patient Directory</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Export as CSV</p>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          </Card>

          <Card className="p-4 border-amber-100 bg-amber-50/30 flex items-center justify-between group hover:border-amber-300 transition-all cursor-pointer" onClick={() => window.print()}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Analytics Summary</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Print as PDF</p>
              </div>
            </div>
            <Printer className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
          </Card>
        </div>

        {/* Revenue Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Revenue & Token Trends (Last 30 Days)
              </h3>
              <p className="text-sm text-slate-500">Daily financial performance and patient volume</p>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  interval={4}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickFormatter={(val) => `Rs.${val}`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Revenue (PKR)"
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6 }}
                  name="Total Tokens"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Popularity */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Service Popularity
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.serviceDist} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    width={100}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Doctor Performance */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              Doctor Workload
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.doctorPerf}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="tokens" fill="#10b981" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Patient Demographics - Gender */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
              Gender Distribution
            </h3>
            <div className="h-[250px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData.genderDist}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analyticsData.genderDist.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Patient Demographics - Age */}
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Age Groups
            </h3>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData.ageDist}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="group" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  const SettingsView = () => {
    const [newPrinter, setNewPrinter] = useState({ name: '', paperSize: 'A4' as 'A4' | 'A5' | 'Thermal' });

    const addPrinter = () => {
      if (!newPrinter.name) return;
      const id = Date.now().toString();
      setPrinterProfiles(prev => [...prev, { 
        id, 
        name: newPrinter.name, 
        paperSize: newPrinter.paperSize, 
        isDefault: prev.length === 0,
        status: 'Unknown'
      }]);
      setNewPrinter({ name: '', paperSize: 'A4' });
    };

    const removePrinter = (id: string) => {
      setPrinterProfiles(prev => {
        const filtered = prev.filter(p => p.id !== id);
        if (filtered.length > 0 && prev.find(p => p.id === id)?.isDefault) {
          filtered[0].isDefault = true;
        }
        return filtered;
      });
    };

    const setDefault = (id: string) => {
      setPrinterProfiles(prev => prev.map(p => ({ ...p, isDefault: p.id === id })));
      setSelectedProfileId(id);
    };

    return (
      <div className="max-w-3xl mx-auto space-y-8">
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Hospital className="w-5 h-5 text-indigo-600" />
              Hospital Information
            </div>
            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
              <Check className="w-3 h-3" />
              Auto-saving
            </div>
          </h3>
          <div className="space-y-4">
            <Input label="Hospital Name" value={hospitalInfo.name} onChange={v => setHospitalInfo(f => ({ ...f, name: v }))} />
            <Input label="Address" value={hospitalInfo.address} onChange={v => setHospitalInfo(f => ({ ...f, address: v }))} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Phone" value={hospitalInfo.phone} onChange={v => setHospitalInfo(f => ({ ...f, phone: v }))} />
              <Input label="Email" value={hospitalInfo.email} onChange={v => setHospitalInfo(f => ({ ...f, email: v }))} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-indigo-600" />
              Printer Management
            </h3>
            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full font-bold uppercase tracking-wider border border-indigo-100">
              {printerProfiles.length} Profiles
            </span>
          </div>

          <div className="space-y-6">
            {/* Add Printer Form */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <Input 
                label="Printer Name" 
                value={newPrinter.name} 
                onChange={v => setNewPrinter(p => ({ ...p, name: v }))} 
                placeholder="e.g. Reception Desk"
              />
              <Select 
                label="Paper Size" 
                value={newPrinter.paperSize} 
                onChange={v => setNewPrinter(p => ({ ...p, paperSize: v as any }))}
                options={[
                  { label: 'A4 Standard', value: 'A4' },
                  { label: 'A5 Small', value: 'A5' },
                  { label: 'Thermal (80mm)', value: 'Thermal' }
                ]}
              />
              <Button onClick={addPrinter} disabled={!newPrinter.name} className="h-[42px]">
                <Plus className="w-4 h-4" /> Add Printer
              </Button>
            </div>

            {/* Printer List */}
            <div className="space-y-3">
              {printerProfiles.map(printer => (
                <div key={printer.id} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors bg-white group">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center",
                      printer.isDefault ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"
                    )}>
                      <Printer className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{printer.name}</span>
                        {printer.isDefault && (
                          <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Default</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 font-medium">{printer.paperSize} Format</span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            printer.status === 'Online' ? "bg-green-500" : printer.status === 'Offline' ? "bg-rose-500" : "bg-slate-300"
                          )} />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{printer.status}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!printer.isDefault && (
                      <Button variant="outline" className="text-xs py-1 px-3" onClick={() => setDefault(printer.id)}>Set Default</Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="text-rose-500 hover:bg-rose-50 p-2 h-auto" 
                      onClick={() => removePrinter(printer.id)}
                      disabled={printerProfiles.length <= 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600" />
            Data Management
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <p className="font-bold text-slate-900 mb-1">Export Patients</p>
              <p className="text-xs text-slate-500 mb-4">Download complete patient directory as CSV</p>
              <Button variant="outline" className="w-full" onClick={() => {
                const data = patients.map(p => ({
                  ID: p.id,
                  Name: p.name,
                  Age: p.age,
                  Gender: p.gender,
                  Phone: p.phone,
                  LastVisit: p.lastVisit ? format(new Date(p.lastVisit), 'yyyy-MM-dd') : 'N/A'
                }));
                exportToCSV(data, 'Patient_Export');
              }}>
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </Button>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <p className="font-bold text-slate-900 mb-1">Export Tokens</p>
              <p className="text-xs text-slate-500 mb-4">Download all token records as CSV</p>
              <Button variant="outline" className="w-full" onClick={() => {
                const data = tokens.map(t => ({
                  ID: t.id,
                  TokenNo: t.tokenNumber,
                  PatientID: t.patientId,
                  DoctorID: t.doctorId,
                  Status: t.status,
                  Fee: t.fee,
                  Service: t.serviceType,
                  Date: format(new Date(t.createdAt), 'yyyy-MM-dd HH:mm')
                }));
                exportToCSV(data, 'Token_Export');
              }}>
                <FileSpreadsheet className="w-4 h-4" /> Export CSV
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-rose-100 bg-rose-50/30">
          <h3 className="text-lg font-bold text-rose-900 mb-2">Danger Zone</h3>
          <p className="text-sm text-rose-600 mb-4">Deleting all data is permanent and cannot be undone.</p>
          <Button variant="danger" onClick={() => {
            if (confirm('Are you sure you want to clear all data?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}>Clear All Hospital Data</Button>
        </Card>
      </div>
    );
  };

  // --- Print Component ---
  const PrintToken = ({ token, onClose }: { token: Token; onClose: () => void }) => {
    const currentProfile = printerProfiles.find(p => p.id === selectedProfileId) || printerProfiles[0];
    const [paperSize, setPaperSize] = useState<'A4' | 'A5' | 'Thermal'>(currentProfile?.paperSize || 'A4');
    const patient = patients.find(p => p.id === token.patientId);
    const doctor = doctors.find(d => d.id === token.doctorId);

    const checkPrinterStatus = (id: string) => {
      setIsCheckingStatus(id);
      setTimeout(() => {
        setPrinterProfiles(prev => prev.map(p => 
          p.id === id ? { ...p, status: Math.random() > 0.1 ? 'Online' : 'Offline' } : p
        ));
        setIsCheckingStatus(null);
      }, 1500);
    };

    const getPaperStyles = () => {
      switch (paperSize) {
        case 'A4': return 'w-[210mm] min-h-[297mm] p-[20mm]';
        case 'A5': return 'w-[148mm] min-h-[210mm] p-[10mm]';
        case 'Thermal': return 'w-[80mm] p-[5mm] text-[10px]';
        default: return 'w-[600px] p-8';
      }
    };

    const getPageStyle = () => {
      switch (paperSize) {
        case 'A4': return '@page { size: A4; margin: 0; }';
        case 'A5': return '@page { size: A5; margin: 0; }';
        case 'Thermal': return '@page { size: 80mm auto; margin: 0; }';
        default: return '';
      }
    };

    return (
      <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex flex-col items-center p-8 print:p-0 print:static overflow-auto">
        <style>{getPageStyle()}</style>
        
        {/* Print Settings Toolbar */}
        <div className="mb-6 flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 print:hidden">
          <div className="flex items-center gap-2 border-r border-slate-100 pr-4">
            <Printer className="w-5 h-5 text-indigo-600" />
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-tight">Print Settings</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Invoice Preview</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
            <label className="text-xs font-bold text-slate-400 uppercase">Printer Profile</label>
            <select 
              value={selectedProfileId}
              onChange={(e) => {
                const profile = printerProfiles.find(p => p.id === e.target.value);
                if (profile) {
                  setSelectedProfileId(profile.id);
                  setPaperSize(profile.paperSize);
                }
              }}
              className="text-xs font-bold bg-slate-100 px-3 py-1.5 rounded-lg border-none focus:ring-2 focus:ring-indigo-500/20"
            >
              {printerProfiles.map(p => (
                <option key={p.id} value={p.id}>{p.name} {p.isDefault ? '(Default)' : ''}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 border-r border-slate-100 pr-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  currentProfile?.status === 'Online' ? "bg-green-500" : "bg-rose-500"
                )} />
                <span className="text-xs font-bold text-slate-700">{currentProfile?.status || 'Unknown'}</span>
              </div>
              <button 
                onClick={() => checkPrinterStatus(selectedProfileId)}
                disabled={isCheckingStatus === selectedProfileId}
                className="text-[10px] text-indigo-600 font-bold hover:underline disabled:opacity-50"
              >
                {isCheckingStatus === selectedProfileId ? 'Checking...' : 'Check Availability'}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-xs font-bold text-slate-400 uppercase">Override Size</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              {(['A4', 'A5', 'Thermal'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setPaperSize(size)}
                  className={cn(
                    "px-3 py-1 rounded-md text-xs font-bold transition-all",
                    paperSize === size ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <Button onClick={() => {
              const originalTitle = document.title;
              document.title = `Invoice_${token.id.slice(-8).toUpperCase()}_${patient?.name.replace(/\s+/g, '_')}`;
              window.print();
              document.title = originalTitle;
            }}>
              <Printer className="w-4 h-4" /> Print Now
            </Button>
            <Button variant="secondary" onClick={onClose}>Close Preview</Button>
          </div>
          
          <div className="flex flex-col gap-1 ml-4 border-l border-slate-100 pl-4">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Printer Selection</p>
            <p className="text-[10px] text-slate-400 max-w-[180px] leading-tight italic">
              Select any connected printer or "Save as PDF" in the system dialog that opens.
            </p>
          </div>
        </div>

        <div className={cn("bg-white print:border-none shadow-2xl print:shadow-none transition-all duration-300 mx-auto", getPaperStyles())}>
          {/* Header */}
          <div className={cn("flex justify-between items-start border-b-2 border-indigo-600 mb-6", paperSize === 'Thermal' ? 'pb-2 mb-2' : 'pb-6 mb-6')}>
            <div className="flex gap-4 items-center">
              <div className={cn("rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg", paperSize === 'Thermal' ? 'w-10 h-10' : 'w-16 h-16')}>
                <Hospital className={cn("text-white", paperSize === 'Thermal' ? 'w-6 h-6' : 'w-10 h-10')} />
              </div>
              <div>
                <h1 className={cn("font-black uppercase tracking-tighter text-slate-900", paperSize === 'Thermal' ? 'text-lg' : 'text-3xl')}>{hospitalInfo.name}</h1>
                <p className={cn("font-bold text-indigo-600 tracking-widest uppercase", paperSize === 'Thermal' ? 'text-[8px]' : 'text-xs')}>Medical Center & Specialist Clinic</p>
              </div>
            </div>
            {paperSize !== 'Thermal' && (
              <div className="text-right">
                <h2 className="text-2xl font-black text-slate-300 uppercase tracking-widest">Invoice</h2>
                <p className="text-xs font-bold text-slate-500">#{token.id.slice(-8).toUpperCase()}</p>
              </div>
            )}
          </div>

          {/* Hospital & Patient Details Info Grid */}
          <div className={cn("grid gap-8 mb-8", paperSize === 'Thermal' ? 'grid-cols-1 gap-2 mb-4' : 'grid-cols-2')}>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</p>
              <p className="text-sm font-bold text-slate-900">{hospitalInfo.name}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{hospitalInfo.address}</p>
              <p className="text-xs text-slate-600">Phone: {hospitalInfo.phone}</p>
            </div>
            <div className={cn("space-y-1", paperSize === 'Thermal' ? 'text-left' : 'text-right')}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Patient Details</p>
              <p className="text-sm font-bold text-slate-900">{patient?.name}</p>
              <p className="text-xs text-slate-600">Patient ID: {patient?.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-slate-600">Age: {patient?.age} | Gender: {patient?.gender}</p>
            </div>
          </div>

          {/* Token & Doctor Info */}
          <div className={cn("bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100 flex justify-between items-center", paperSize === 'Thermal' ? 'flex-col items-start p-3 mb-4 gap-3' : '')}>
            <div className={cn("flex gap-6 items-center", paperSize === 'Thermal' ? 'gap-3' : '')}>
              <div className="text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Token No</p>
                <div className={cn("rounded-full bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-200", paperSize === 'Thermal' ? 'w-10 h-10 text-xl' : 'w-16 h-16 text-3xl')}>
                  {token.tokenNumber}
                </div>
              </div>
              {paperSize !== 'Thermal' && <div className="h-12 w-px bg-slate-200" />}
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Consulting Doctor</p>
                <p className={cn("font-bold text-slate-900", paperSize === 'Thermal' ? 'text-sm' : 'text-lg')}>{doctor?.name}</p>
                <p className="text-xs text-indigo-600 font-medium">{doctor?.specialization}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Room {doctor?.roomNumber}</p>
              </div>
            </div>
            <div className={cn(paperSize === 'Thermal' ? 'text-left w-full border-t border-slate-200 pt-2' : 'text-right')}>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Service Type</p>
              <p className="text-sm font-black text-indigo-600 uppercase tracking-wider mb-2">{token.serviceType}</p>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date & Time</p>
              <p className="text-sm font-bold text-slate-900">{format(new Date(token.createdAt), 'dd MMM yyyy')}</p>
              <p className="text-xs text-slate-500">{format(new Date(token.createdAt), 'hh:mm a')}</p>
            </div>
          </div>

          {/* Billing Table */}
          <div className={cn("mb-8", paperSize === 'Thermal' ? 'mb-4' : '')}>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</th>
                  <th className="text-right py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {token.registrationFee > 0 && (
                  <tr>
                    <td className="py-4">
                      <p className="font-bold text-slate-800">Registration Fee</p>
                      <p className="text-xs text-slate-500">Standard non-emergency charge</p>
                    </td>
                    <td className="py-4 text-right font-bold text-slate-900">Rs. {token.registrationFee.toFixed(2)}</td>
                  </tr>
                )}
                {token.serviceFee > 0 && (
                  <tr>
                    <td className="py-4">
                      <p className="font-bold text-slate-800">{token.serviceType} Fee</p>
                      <p className="text-xs text-slate-500">Service specific charges</p>
                    </td>
                    <td className="py-4 text-right font-bold text-slate-900">Rs. {token.serviceFee.toFixed(2)}</td>
                  </tr>
                )}
                {token.fee === 0 && (
                  <tr>
                    <td className="py-4">
                      <p className="font-bold text-slate-800">Emergency Service</p>
                      <p className="text-xs text-slate-500">Complimentary emergency care</p>
                    </td>
                    <td className="py-4 text-right font-bold text-slate-900 text-green-600">FREE</td>
                  </tr>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-900">
                  <td className="py-4 text-right pr-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Amount</p>
                  </td>
                  <td className="py-4 text-right">
                    <p className={cn("font-black text-indigo-600", paperSize === 'Thermal' ? 'text-lg' : 'text-2xl')}>
                      {token.fee === 0 ? 'FREE' : `Rs. ${token.fee.toFixed(2)}`}
                    </p>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Footer Info */}
          <div className={cn("grid gap-8 items-end mb-8", paperSize === 'Thermal' ? 'grid-cols-1 gap-4 mb-4' : 'grid-cols-2')}>
            <div className="flex flex-col items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <QrCode className={cn("text-slate-900", paperSize === 'Thermal' ? 'w-16 h-16' : 'w-24 h-24')} />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Scan to Verify Invoice</p>
            </div>
            <div className={cn("space-y-4", paperSize === 'Thermal' ? 'text-center' : 'text-right')}>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payment Method</p>
                <p className="text-sm font-bold text-slate-900">{token.paymentMethod}</p>
              </div>
              <div className="pt-8 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-900">Authorized Signature</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Hospital Administrator</p>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-slate-100 pt-6">
            <p className="text-sm font-bold text-indigo-600 italic">"Your health is our priority. Get well soon!"</p>
            <p className="text-[10px] text-slate-400 mt-2">This is a computer generated invoice and does not require a physical stamp.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col sticky top-0 h-screen z-40 print:hidden">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            <Hospital className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-black text-slate-900 leading-tight">HOSPITALLY</h1>
            <p className="text-[10px] font-bold text-indigo-600 tracking-widest uppercase">Management</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'registration', label: 'Registration', icon: UserPlus },
            { id: 'queue', label: 'Live Queue', icon: Clock },
            { id: 'patients', label: 'Patients', icon: Users },
            { id: 'tokens', label: 'Tokens', icon: Ticket },
            { id: 'doctors', label: 'Doctors', icon: Stethoscope },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200",
                activeTab === item.id 
                  ? "bg-indigo-50 text-indigo-600" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className={cn("w-5 h-5", activeTab === item.id ? "text-indigo-600" : "text-slate-400")} />
              {item.label}
              {activeTab === item.id && <ChevronRight className="w-4 h-4 ml-auto" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white relative overflow-hidden group">
            <div className="relative z-10">
              <p className="text-xs font-medium text-slate-400">Current User</p>
              <p className="font-bold truncate">Administrator</p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full group-hover:scale-150 transition-transform duration-500" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 print:p-0">
        <header className="flex items-center justify-between mb-8 print:hidden">
          <div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            <p className="text-slate-500 font-medium">Manage your hospital operations efficiently.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-400 uppercase">{format(new Date(), 'EEEE')}</p>
              <p className="font-bold text-slate-900">{format(new Date(), 'dd MMM, yyyy')}</p>
            </div>
            <Button onClick={() => setActiveTab('registration')}>
              <Plus className="w-4 h-4" /> New Patient
            </Button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'analytics' && <AnalyticsView />}
            {activeTab === 'registration' && <RegistrationView />}
            {activeTab === 'queue' && <QueueView />}
            {activeTab === 'patients' && <PatientsView />}
            {activeTab === 'tokens' && <TokensView />}
            {activeTab === 'doctors' && <DoctorsView />}
            {activeTab === 'settings' && <SettingsView />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Print Overlay */}
      {printingToken && (
        <PrintToken token={printingToken} onClose={() => setPrintingToken(null)} />
      )}
      {/* Patient History Modal */}
      <AnimatePresence>
        {selectedPatientId && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              <Card className="flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Patient History</h3>
                    <p className="text-sm text-slate-500">
                      {patients.find(p => p.id === selectedPatientId)?.name} • {patients.find(p => p.id === selectedPatientId)?.age} yrs
                    </p>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedPatientId(null)} className="p-1 h-auto">
                    <X className="w-6 h-6" />
                  </Button>
                </div>
                <div className="p-6 overflow-y-auto bg-slate-50 flex-1">
                  <div className="space-y-4">
                    {tokens.filter(t => t.patientId === selectedPatientId).reverse().map(token => {
                      const doctor = doctors.find(d => d.id === token.doctorId);
                      return (
                        <div key={token.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                                {format(new Date(token.createdAt), 'dd MMM yyyy')}
                              </p>
                              <p className="font-bold text-slate-900">Dr. {doctor?.name}</p>
                            </div>
                            <span className={cn(
                              "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase",
                              token.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                            )}>
                              {token.status}
                            </span>
                          </div>
                          {token.diagnosis && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Diagnosis</p>
                              <p className="text-sm text-slate-700 font-medium">{token.diagnosis}</p>
                            </div>
                          )}
                          {token.notes && (
                            <div className="mt-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Notes</p>
                              <p className="text-xs text-slate-500 italic">{token.notes}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {tokens.filter(t => t.patientId === selectedPatientId).length === 0 && (
                      <div className="text-center py-12 text-slate-400 italic">No consultation history found.</div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Token Details Editor Modal */}
      <AnimatePresence>
        {editingTokenId && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-md"
            >
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Consultation Details</h3>
                  <Button variant="ghost" onClick={() => setEditingTokenId(null)} className="p-1 h-auto">
                    <X className="w-5 h-5" />
                  </Button>
                </div>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  updateTokenDetails(editingTokenId, target.diagnosis.value, target.notes.value);
                }} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Diagnosis</label>
                    <textarea 
                      name="diagnosis"
                      defaultValue={tokens.find(t => t.id === editingTokenId)?.diagnosis || ''}
                      placeholder="Enter diagnosis..."
                      className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none text-sm"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700">Clinical Notes</label>
                    <textarea 
                      name="notes"
                      defaultValue={tokens.find(t => t.id === editingTokenId)?.notes || ''}
                      placeholder="Enter additional notes..."
                      className="px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none text-sm"
                    />
                  </div>
                  <Button type="submit" className="w-full">Save Details</Button>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
