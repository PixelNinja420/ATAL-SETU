import React, { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { Camera, MapPin, Upload, Sparkles, Loader2, AlertTriangle, ShieldCheck, ShieldAlert, ShieldX, Info } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import MapView from '../components/MapView';
import { detectImageAuthenticity, checkDuplicate, checkRecurring } from '../utils/aiEngine';

const CATEGORIES = {
  illegal_dumping: { label: 'Illegal Dumping', icon: 'Trash2' },
  overflowing_bin: { label: 'Overflowing Garbage Bin', icon: 'Archive' },
  uncollected_waste: { label: 'Uncollected Waste', icon: 'Package' },
  plastic_waste: { label: 'Plastic Waste', icon: 'Wine' },
  construction_waste: { label: 'Construction Waste', icon: 'HardHat' },
  street_litter: { label: 'Street Litter', icon: 'Wind' },
  blocked_drain: { label: 'Blocked Drain', icon: 'Droplets' },
  sewage_overflow: { label: 'Sewage Overflow', icon: 'AlertTriangle' },
  public_cleanliness: { label: 'Public Cleanliness', icon: 'Sparkles' },
  other: { label: 'Other', icon: 'HelpCircle' },
};

export default function CreateReport() {
  const { createReport, regions, selectedRegion, reports } = useApp();
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [authenticityResult, setAuthenticityResult] = useState(null);
  const [duplicateResult, setDuplicateResult] = useState(null);
  const [recurringResult, setRecurringResult] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    severity: 'medium',
    location: {
      address: regions?.find(r => r.id === selectedRegion)?.name || '',
      lat: 15.2637,
      lng: 74.1077,
      regionId: selectedRegion
    }
  });

  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        simulateAiAnalysis();
      };
      reader.readAsDataURL(file);
    }
  };

  const simulateAiAnalysis = () => {
    setIsAnalyzing(true);
    setAuthenticityResult(null);
    setDuplicateResult(null);
    setRecurringResult(null);

    const getAiDescription = (cat) => {
      switch(cat) {
        case 'illegal_dumping': return 'Large quantity of mixed waste has accumulated along the roadside. Several plastic bags and loose garbage are visible near the drainage area. This appears to be an unauthorized dumping site requiring immediate attention.';
        case 'overflowing_bin': return 'Municipal waste bin has exceeded capacity with garbage spilling onto the surrounding area. Decomposing organic waste is visible, creating potential health hazards. Regular collection schedule may need to be increased for this location.';
        case 'blocked_drain': return 'Storm drain appears to be blocked with accumulated debris and waste materials. Standing water is visible around the drain inlet. This blockage could cause flooding during rain events.';
        case 'sewage_overflow': return 'Sewage is overflowing from a municipal connection point onto the public area. The overflow poses immediate public health risks. Emergency response is recommended.';
        case 'plastic_waste': return 'Significant accumulation of plastic waste including bottles, bags, and packaging materials. The waste is spread across a public area and poses environmental hazards.';
        case 'construction_waste': return 'Construction debris including concrete, bricks, and building materials has been dumped in a public area. The waste is obstructing pedestrian movement and may contain hazardous materials.';
        default: return `This appears to be a case of ${CATEGORIES[cat]?.label.toLowerCase() || 'waste'} requiring municipal attention. The visible elements suggest a standard cleanup response is needed.`;
      }
    };

    Promise.all([
      detectImageAuthenticity(null),
      new Promise((resolve) => {
        setTimeout(() => {
          const categories = Object.keys(CATEGORIES);
          const randomCat = categories[Math.floor(Math.random() * (categories.length - 1))];
          resolve({
            category: randomCat,
            title: `Found ${CATEGORIES[randomCat].label.toLowerCase()}`,
            description: getAiDescription(randomCat),
            severity: 'medium',
            confidence: 85
          });
        }, 1500);
      })
    ]).then(([authResult, suggestion]) => {
      setAuthenticityResult(authResult);
      setAiSuggestions(suggestion);
      setFormData(prev => ({
        ...prev,
        category: suggestion.category,
        title: suggestion.title,
        description: suggestion.description,
        severity: suggestion.severity
      }));

      // Check for duplicates
      const newReportTemp = {
        location: formData.location,
        category: suggestion.category
      };
      const dupRes = checkDuplicate(newReportTemp, reports);
      if (dupRes.isDuplicate) setDuplicateResult(dupRes);

      // Check for recurring
      const recRes = checkRecurring(formData.location, reports);
      if (recRes.isRecurring) setRecurringResult(recRes);

      setIsAnalyzing(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || !formData.title || !formData.description) return;
    
    const newReport = await createReport({
      ...formData,
      images: photoPreview ? [photoPreview] : []
    });
    
    navigate(`/report/${newReport.id}`);
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Report an Issue</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        
        {/* Step 1: Photo */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
            Upload Photo
          </h2>
          
          <div 
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 relative overflow-hidden h-64"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" className="hidden" ref={fileInputRef} accept="image/*" onChange={handlePhotoUpload} />
            
            {photoPreview ? (
              <img src={photoPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <>
                <Camera className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 font-medium">Tap to upload a photo</p>
                <p className="text-sm text-gray-400 mt-1">Clear photos help us resolve issues faster</p>
              </>
            )}
          </div>

          {isAnalyzing && (
            <div className="flex items-center gap-3 text-teal-600 bg-teal-50 p-4 rounded-lg">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="font-medium">AI is analyzing your image...</span>
            </div>
          )}

          {!isAnalyzing && authenticityResult && (
            <div className={`p-4 rounded-lg border ${
              authenticityResult.verdict === 'authentic' ? 'bg-green-50 border-green-200' :
              authenticityResult.verdict === 'likely_authentic' ? 'bg-amber-50 border-amber-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className={`flex items-center gap-2 font-medium mb-2 ${
                authenticityResult.verdict === 'authentic' ? 'text-green-800' :
                authenticityResult.verdict === 'likely_authentic' ? 'text-amber-800' :
                'text-red-800'
              }`}>
                {authenticityResult.verdict === 'authentic' && <ShieldCheck className="w-5 h-5" />}
                {authenticityResult.verdict === 'likely_authentic' && <ShieldAlert className="w-5 h-5" />}
                {authenticityResult.verdict === 'suspicious' && <ShieldX className="w-5 h-5" />}
                
                {authenticityResult.verdict === 'authentic' ? `✓ Image Authenticity Verified — Confidence: ${authenticityResult.confidence}%` :
                 authenticityResult.verdict === 'likely_authentic' ? `⚠ Image Authenticity Notice — Confidence: ${authenticityResult.confidence}%` :
                 `⚠ Image Authenticity Warning — Confidence: ${authenticityResult.confidence}%`}
              </div>
              <ul className={`text-sm list-disc pl-5 ${
                authenticityResult.verdict === 'authentic' ? 'text-green-900 opacity-80' :
                authenticityResult.verdict === 'likely_authentic' ? 'text-amber-900 opacity-80' :
                'text-red-900 opacity-80'
              }`}>
                {authenticityResult.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
              {authenticityResult.verdict === 'suspicious' && (
                <p className="text-sm font-semibold text-red-800 mt-2">This report will be flagged for manual review.</p>
              )}
            </div>
          )}

          {aiSuggestions && !isAnalyzing && (
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-lg">
              <div className="flex items-center gap-2 text-indigo-800 font-medium mb-2">
                <Sparkles className="w-4 h-4" />
                AI Suggestion Applied
              </div>
              <p className="text-sm text-indigo-900 opacity-80">
                We've automatically categorized this as <strong>{CATEGORIES[aiSuggestions.category]?.label}</strong> and generated a description based on your photo. Feel free to adjust below.
              </p>
            </div>
          )}

          {!isAnalyzing && duplicateResult && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Possible Duplicate</h4>
                <p className="text-sm text-amber-900 opacity-80 mt-1">
                  This issue appears similar to an existing report at this location. Similarity: {duplicateResult.similarity}%
                </p>
                <div className="flex gap-3 mt-3">
                  <Link to={`/report/${duplicateResult.existingReportId}`} className="text-sm font-medium text-amber-700 hover:text-amber-800 underline">
                    View Existing Report
                  </Link>
                  <button type="button" onClick={() => setDuplicateResult(null)} className="text-sm font-medium text-amber-700 hover:text-amber-800 underline">
                    Continue Anyway
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isAnalyzing && recurringResult && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Recurring Issue Location</h4>
                <p className="text-sm text-blue-900 opacity-80 mt-1">
                  This location has received {recurringResult.count} waste-related reports. 
                  {recurringResult.lastReported && ` Last reported: ${Math.floor((new Date() - new Date(recurringResult.lastReported))/(1000*60*60*24))} days ago.`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Location */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
            Location
          </h2>
          <div className="flex relative">
            <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input 
              type="text" 
              value={formData.location.address}
              onChange={(e) => setFormData({...formData, location: {...formData.location, address: e.target.value}})}
              placeholder="Enter exact address or landmark"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
              required
            />
          </div>
          <div className="h-48 rounded-lg overflow-hidden border border-gray-300 relative">
             {/* Mock map drag via click for prototype */}
            <MapView 
              reports={[]} 
              center={[formData.location.lat, formData.location.lng]} 
              height="100%"
              className="z-0"
            />
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
              <MapPin className="w-8 h-8 text-red-500 -mt-8 drop-shadow-md" />
            </div>
          </div>
        </div>

        {/* Step 3: Category */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">3</span>
            Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(CATEGORIES).map(([key, info]) => {
              const Icon = LucideIcons[info.icon] || LucideIcons.HelpCircle;
              const isSelected = formData.category === key;
              return (
                <button
                  type="button"
                  key={key}
                  onClick={() => setFormData({...formData, category: key})}
                  className={`flex items-center gap-2 p-3 border rounded-lg text-sm font-medium transition-colors ${
                    isSelected ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-teal-600' : 'text-gray-500'}`} />
                  {info.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 4: Details */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-teal-100 text-teal-800 w-6 h-6 rounded-full flex items-center justify-center text-xs">4</span>
            Details
          </h2>
          <input 
            type="text" 
            placeholder="Give it a short title"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none"
            required
          />
          <textarea 
            placeholder="Describe the issue in detail..."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none resize-none"
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={!formData.category || !formData.title || !formData.description}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3.5 rounded-lg font-bold text-lg disabled:opacity-50 transition-colors"
        >
          Submit Report
        </button>
      </form>
    </div>
  );
}

