import React from 'react';
import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { RiFacebookFill } from 'react-icons/ri';
import SetupWizard from "./components/SetupWizard";





export default function SetupWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    configurationType: '',
    responsibilities: [],
    businessName: '',
    businessCategory: '',
    conversationTone: '',
    outOfScope: '',
    ctaEncouragement: '',
    automatedSales: '',
    informationSource: [],
    products: '',
    testingNotes: ''
  });

  const steps = [
    {
      title: 'Configuration Type',
      description: 'How would you like to configure your AI shopping assistant?',
      content: (
        <div className="space-y-4">
          {['Basic Setup', 'Advanced Customization', 'White Label'].map((option) => (
            <label key={option} className="flex items-center p-4 border-2 border-transparent rounded-xl cursor-pointer hover:border-[#58CC02] transition-all"
              style={{ backgroundColor: 'rgba(137, 226, 25, 0.05)' }}>
              <input
                type="radio"
                name="configurationType"
                value={option}
                checked={formData.configurationType === option}
                onChange={(e) => setFormData({ ...formData, configurationType: e.target.value })}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium" style={{ color: '#4B4B4B' }}>{option}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: 'Responsibilities',
      description: 'Select the key responsibilities of your AI assistant:',
      content: (
        <div className="space-y-3">
          {['Product Recommendations', 'Answer FAQs', 'Handle Orders', 'Customer Support'].map((responsibility) => (
            <label key={responsibility} className="flex items-center p-4 rounded-xl cursor-pointer transition-all"
              style={{ backgroundColor: 'rgba(88, 204, 2, 0.08)', borderLeft: formData.responsibilities.includes(responsibility) ? '4px solid #58CC02' : '4px solid transparent' }}>
              <input
                type="checkbox"
                checked={formData.responsibilities.includes(responsibility)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, responsibilities: [...formData.responsibilities, responsibility] });
                  } else {
                    setFormData({ ...formData, responsibilities: formData.responsibilities.filter(r => r !== responsibility) });
                  }
                }}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium" style={{ color: '#4B4B4B' }}>{responsibility}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: 'Business Information',
      description: 'Tell us about your business:',
      content: (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Business Name"
            value={formData.businessName}
            onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#89E219] focus:outline-none focus:border-[#58CC02] transition-colors"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          />
          <input
            type="text"
            placeholder="Business Category (e.g., Fashion, Electronics)"
            value={formData.businessCategory}
            onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border-2 border-[#89E219] focus:outline-none focus:border-[#58CC02] transition-colors"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          />
        </div>
      )
    },
    {
      title: 'Conversation Tone',
      description: 'What tone should your AI assistant use?',
      content: (
        <div className="space-y-4">
          {['Professional', 'Friendly & Casual', 'Luxury & Premium', 'Playful & Fun'].map((tone) => (
            <label key={tone} className="flex items-center p-4 border-2 border-transparent rounded-xl cursor-pointer hover:border-[#58CC02] transition-all"
              style={{ backgroundColor: 'rgba(137, 226, 25, 0.05)' }}>
              <input
                type="radio"
                name="conversationTone"
                value={tone}
                checked={formData.conversationTone === tone}
                onChange={(e) => setFormData({ ...formData, conversationTone: e.target.value })}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium" style={{ color: '#4B4B4B' }}>{tone}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: 'Out-of-Scope Matters',
      description: 'What topics should the assistant avoid?',
      content: (
        <textarea
          placeholder="e.g., We don't discuss politics, personal data concerns, or technical support outside our domain..."
          value={formData.outOfScope}
          onChange={(e) => setFormData({ ...formData, outOfScope: e.target.value })}
          className="w-full h-32 px-4 py-3 rounded-xl border-2 border-[#89E219] focus:outline-none focus:border-[#58CC02] transition-colors resize-none"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        />
      )
    },
    {
      title: 'Call-to-Action Encouragement',
      description: 'How should your assistant encourage purchases?',
      content: (
        <div className="space-y-4">
          {['Subtle & Non-Intrusive', 'Moderately Proactive', 'Highly Encouraging'].map((cta) => (
            <label key={cta} className="flex items-center p-4 border-2 border-transparent rounded-xl cursor-pointer hover:border-[#58CC02] transition-all"
              style={{ backgroundColor: 'rgba(137, 226, 25, 0.05)' }}>
              <input
                type="radio"
                name="ctaEncouragement"
                value={cta}
                checked={formData.ctaEncouragement === cta}
                onChange={(e) => setFormData({ ...formData, ctaEncouragement: e.target.value })}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium" style={{ color: '#4B4B4B' }}>{cta}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: 'Automated Sales',
      description: 'Should the assistant offer discounts and promotions automatically?',
      content: (
        <div className="space-y-4">
          {['Yes, Always', 'Only for Loyal Customers', 'Upon Request Only', 'No Automated Promotions'].map((sales) => (
            <label key={sales} className="flex items-center p-4 border-2 border-transparent rounded-xl cursor-pointer hover:border-[#58CC02] transition-all"
              style={{ backgroundColor: 'rgba(137, 226, 25, 0.05)' }}>
              <input
                type="radio"
                name="automatedSales"
                value={sales}
                checked={formData.automatedSales === sales}
                onChange={(e) => setFormData({ ...formData, automatedSales: e.target.value })}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium" style={{ color: '#4B4B4B' }}>{sales}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: 'Information Source',
      description: 'Where should the assistant pull product information from?',
      content: (
        <div className="space-y-3">
          {['Product Database', 'Website Content', 'Knowledge Articles', 'Customer Reviews'].map((source) => (
            <label key={source} className="flex items-center p-4 rounded-xl cursor-pointer transition-all"
              style={{ backgroundColor: 'rgba(88, 204, 2, 0.08)', borderLeft: formData.informationSource.includes(source) ? '4px solid #58CC02' : '4px solid transparent' }}>
              <input
                type="checkbox"
                checked={formData.informationSource.includes(source)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setFormData({ ...formData, informationSource: [...formData.informationSource, source] });
                  } else {
                    setFormData({ ...formData, informationSource: formData.informationSource.filter(s => s !== source) });
                  }
                }}
                className="w-4 h-4"
              />
              <span className="ml-3 font-medium" style={{ color: '#4B4B4B' }}>{source}</span>
            </label>
          ))}
        </div>
      )
    },
    {
      title: 'Products',
      description: 'Describe your primary product categories:',
      content: (
        <textarea
          placeholder="e.g., We sell clothing, shoes, and accessories for men, women, and children. Our price range is $20-$150..."
          value={formData.products}
          onChange={(e) => setFormData({ ...formData, products: e.target.value })}
          className="w-full h-32 px-4 py-3 rounded-xl border-2 border-[#89E219] focus:outline-none focus:border-[#58CC02] transition-colors resize-none"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        />
      )
    },
    {
      title: 'Testing & Launch',
      description: 'Any final notes or testing preferences?',
      content: (
        <textarea
          placeholder="e.g., We'd like to test with our team before going live. Our peak hours are 6-9 PM EST..."
          value={formData.testingNotes}
          onChange={(e) => setFormData({ ...formData, testingNotes: e.target.value })}
          className="w-full h-32 px-4 py-3 rounded-xl border-2 border-[#89E219] focus:outline-none focus:border-[#58CC02] transition-colors resize-none"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        />
      )
    }
  ];

  const goNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1);
  };

  const goPrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    console.log('Setup Complete:', formData);
    alert('Setup Complete! Your AI Shopping Assistant is ready to be configured.');
  };

  const step = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="min-h-screen p-4 sm:p-8" style={{ background: 'linear-gradient(135deg, #FFFFFF 0%, rgba(137, 226, 25, 0.1) 100%)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ color: '#4B4B4B' }}>
            AI Shopping Assistant
          </h1>
          <p className="text-sm sm:text-base" style={{ color: '#89E219' }}>
            Step {currentStep + 1} of {steps.length}: {step.title}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 sm:mb-12">
          <div className="w-full h-2 bg-[#89E219] rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(137, 226, 25, 0.3)' }}>
            <div
              className="h-full transition-all duration-500"
              style={{ width: `${progressPercent}%`, backgroundColor: '#58CC02' }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs" style={{ color: '#89E219' }}>
            {Array.from({ length: steps.length }).map((_, i) => (
              <div key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i <= currentStep ? 'text-white' : 'text-[#4B4B4B]'
              }`} style={{ backgroundColor: i <= currentStep ? '#58CC02' : 'rgba(137, 226, 25, 0.3)' }}>
                {i < currentStep ? <Check size={14} /> : i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-6 sm:p-8 shadow-lg backdrop-blur-md" style={{
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          border: '2px solid rgba(137, 226, 25, 0.3)',
          boxShadow: '0 20px 60px rgba(88, 204, 2, 0.15)'
        }}>
          {/* Title & Description */}
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3" style={{ color: '#58CC02' }}>
              {step.title}
            </h2>
            <p className="text-sm sm:text-base" style={{ color: '#4B4B4B' }}>
              {step.description}
            </p>
          </div>

          {/* Content */}
          <div className="mb-8">
            {step.content}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 pt-6 border-t" style={{ borderColor: 'rgba(137, 226, 25, 0.3)' }}>
            <button
              onClick={goPrev}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
              style={{
                backgroundColor: currentStep === 0 ? 'rgba(75, 75, 75, 0.1)' : 'rgba(137, 226, 25, 0.2)',
                color: '#4B4B4B'
              }}
            >
              <ChevronLeft size={18} />
              <span>Previous</span>
            </button>

            <div className="flex-1" />

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all hover:shadow-lg"
                style={{
                  backgroundColor: '#58CC02',
                  color: '#FFFFFF'
                }}
              >
                <Check size={18} />
                <span>Complete Setup</span>
              </button>
            ) : (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all hover:shadow-lg"
                style={{
                  backgroundColor: '#58CC02',
                  color: '#FFFFFF'
                }}
              >
                <span>Next</span>
                <ChevronRight size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8" style={{ color: '#89E219' }}>
          <p className="text-xs sm:text-sm">You can save your progress and return later</p>
        </div>
      </div>
    </div>
  );
}

