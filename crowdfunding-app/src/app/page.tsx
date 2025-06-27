
'use client'

import React, { useState } from 'react';
import { Zap, Users, Shield, Target, TrendingUp, Coins, Heart } from 'lucide-react';

export default function CrowdfundingApp() {
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [amount, setAmount] = useState<string>('');

  const tiers = [
    {
      id: 'supporter',
      name: 'Supporter',
      amount: 25,
      description: 'Help us get started',
      benefits: ['Early access updates', 'Digital thank you card']
    },
    {
      id: 'advocate',
      name: 'Advocate',
      amount: 100,
      description: 'Believe in our mission',
      benefits: ['All Supporter benefits', 'Beta app access', 'Exclusive webinar invite']
    },
    {
      id: 'champion',
      name: 'Champion',
      amount: 500,
      description: 'Champion ethical delivery',
      benefits: ['All Advocate benefits', 'FBT tokens when we launch', 'Direct feedback channel']
    },
    {
      id: 'pioneer',
      name: 'Pioneer',
      amount: 1000,
      description: 'Pioneer the future',
      benefits: ['All Champion benefits', 'Lifetime FastBite Prime', 'Advisory board consideration']
    }
  ];

  const stats = {
    raised: 247850,
    goal: 500000,
    backers: 1247,
    daysLeft: 28
  };

  const progressPercentage = (stats.raised / stats.goal) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-8 w-8 text-yellow-500" />
              <span className="text-xl font-bold text-gray-900">FastBite Pro</span>
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Crowdfunding</span>
            </div>
            <div className="text-sm text-gray-600">
              {stats.daysLeft} days left
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Hero Section */}
            <div className="mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Revolutionary Food Delivery with Blockchain Transparency
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Join us in building the first ethical, driver-first food delivery platform powered by AI and Web3 technology.
              </p>

              {/* Progress Bar */}
              <div className="bg-white rounded-lg p-6 shadow-sm border mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-3xl font-bold text-gray-900">
                      ${stats.raised.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      raised of ${stats.goal.toLocaleString()} goal
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.backers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">backers</div>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
                
                <div className="text-sm text-gray-600">
                  {progressPercentage.toFixed(1)}% funded
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <Shield className="h-8 w-8 text-green-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Blockchain Verified</h3>
                  <p className="text-gray-600">Every transaction recorded on-chain for complete transparency and trust.</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <Users className="h-8 w-8 text-blue-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Driver-First Ethics</h3>
                  <p className="text-gray-600">Guaranteed living wages and comprehensive benefits for all drivers.</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <Zap className="h-8 w-8 text-yellow-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">AI-Optimized</h3>
                  <p className="text-gray-600">Orion AI maximizes efficiency while prioritizing driver earnings.</p>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border">
                  <Coins className="h-8 w-8 text-purple-500 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Instant Payouts</h3>
                  <p className="text-gray-600">Drivers receive earnings instantly in USDC cryptocurrency.</p>
                </div>
              </div>

              {/* The Vision */}
              <div className="bg-white rounded-lg p-8 shadow-sm border">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-gray-600 mb-6">
                  FastBite Pro isn't just another food delivery app. We're building the future of ethical logistics, 
                  where technology serves humanity, not the other way around. Our platform combines cutting-edge 
                  AI, blockchain transparency, and a driver-first business model to create something truly revolutionary.
                </p>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">$18.50</div>
                    <div className="text-sm text-gray-600">Guaranteed hourly wage</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">98%</div>
                    <div className="text-sm text-gray-600">Ethical score target</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">$0</div>
                    <div className="text-sm text-gray-600">Delivery fees</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              {/* Support Tiers */}
              <div className="bg-white rounded-lg p-6 shadow-sm border mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Support Our Mission</h3>
                
                <div className="space-y-4 mb-6">
                  {tiers.map((tier) => (
                    <div
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedTier === tier.id
                          ? 'border-yellow-500 bg-yellow-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-gray-900">{tier.name}</div>
                        <div className="font-bold text-yellow-600">${tier.amount}</div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{tier.description}</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {tier.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mr-2"></div>
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or enter custom amount
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="block w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="50"
                    />
                  </div>
                </div>

                {/* Support Button */}
                <button className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-yellow-500 hover:to-orange-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Support FastBite Pro</span>
                </button>
                
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Secure payments powered by blockchain technology
                </p>
              </div>

              {/* Recent Supporters */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Supporters</h4>
                <div className="space-y-3">
                  {[
                    { name: 'Sarah M.', amount: 100, time: '2 hours ago' },
                    { name: 'Driver Alex', amount: 50, time: '5 hours ago' },
                    { name: 'Restaurant Owner', amount: 500, time: '1 day ago' },
                    { name: 'Tech Enthusiast', amount: 25, time: '1 day ago' },
                  ].map((supporter, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <div>
                        <div className="font-medium text-gray-900">{supporter.name}</div>
                        <div className="text-gray-500">{supporter.time}</div>
                      </div>
                      <div className="font-semibold text-green-600">
                        ${supporter.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
