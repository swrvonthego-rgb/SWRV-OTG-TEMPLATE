import React, { useState } from 'react';
import { X, BookOpen, Music, DollarSign, Users, TrendingUp, Mic } from 'lucide-react';

interface ArtistDevelopmentProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'fundamentals' | 'production' | 'rights' | 'business' | 'growth' | 'performance';

const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: 'fundamentals', label: 'Creative Fundamentals', icon: <BookOpen size={18} /> },
  { id: 'production', label: 'Production & Recording', icon: <Music size={18} /> },
  { id: 'rights', label: 'Rights & Licensing', icon: <DollarSign size={18} /> },
  { id: 'business', label: 'Business Fundamentals', icon: <Users size={18} /> },
  { id: 'growth', label: 'Growth Strategies', icon: <TrendingUp size={18} /> },
  { id: 'performance', label: 'Performance Skills', icon: <Mic size={18} /> }
];

const tabContent: Record<TabType, { title: string; sections: Array<{ heading: string; content: React.ReactNode }> }> = {
  fundamentals: {
    title: 'Creative Industry Fundamentals',
    sections: [
      {
        heading: 'Understanding Genre & Market Position',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Genre Landscape:</strong> Study your core genre's history, key influencers, and current trends. Know the difference between sub-genres and how they position you in the market.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Artist Positioning:</strong> Define your unique lane—are you a purist, a fusion artist, a trendsetter, or a tradition-keeper? Your position shapes everything from collaboration to pricing.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Trend Analysis:</strong> Follow industry publications (Pitchfork, Stereogum, Billboard), streaming data, and social signals. Balance trends with your authentic vision.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Cultural Relevance:</strong> Understand what conversations your music enters. Are you speaking to a moment? Building a movement? Preserving tradition?</span></li>
          </ul>
        )
      },
      {
        heading: 'Defining Your Sound & Brand',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Sound Identity:</strong> Document the sonic qualities that define you—instrumentation, production style, vocal approach, lyrical themes. Consistency builds recognition.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Artistic Statement:</strong> Know what you stand for. Is your work about storytelling, technical mastery, emotional vulnerability, social commentary, or spiritual truth?</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Visual Language:</strong> Your brand extends beyond sound—album art, fashion, performance aesthetic. Create a coherent visual identity that reinforces your message.</span></li>
          </ul>
        )
      }
    ]
  },
  production: {
    title: 'Production & Recording',
    sections: [
      {
        heading: 'Studio Standards & Best Practices',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Production Setup:</strong> Whether recording at home or in a professional studio, understand mic placement, room acoustics, preamp quality, and mic selection.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Audio Quality Standards:</strong> Industry standard is 24-bit/44.1kHz minimum. Understand bit depth, sample rate, and how they affect your final product.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Vocal Recording Technique:</strong> Proper mic technique, gain staging, and monitoring are essential. Warm up properly, take care of your instrument.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Session Management:</strong> Organization matters. Label tracks clearly, keep stems organized, and maintain version control as you iterate.</span></li>
          </ul>
        )
      },
      {
        heading: 'Working with Producers & Engineers',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Communication:</strong> Be specific about your vision. Share reference tracks, mood boards, and detailed descriptions. Good collaboration starts with clarity.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Producer Relationships:</strong> A great producer elevates your work. Find producers who understand your genre and align with your artistic vision.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Mixing & Mastering:</strong> Understand that mixing (balancing individual tracks) and mastering (final optimization) are different services. Invest in professional mastering to compete sonically.</span></li>
          </ul>
        )
      }
    ]
  },
  rights: {
    title: 'Rights & Licensing Education',
    sections: [
      {
        heading: 'PROs & Publishing Rights',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Performing Rights Organizations (PROs):</strong> ASCAP, BMI, and SESAC collect royalties when your music is performed publicly (radio, streaming, venues, etc.). Register early and keep your catalog current.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Publishing Rights:</strong> As a writer, you own publishing rights to your compositions. These are separate from master rights and generate income via mechanical royalties, broadcasts, and synchronization.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Registration:</strong> Register your works with the U.S. Copyright Office and your chosen PRO. Proper registration ensures you capture all royalties owed to you.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Mechanical Licensing:</strong> When someone covers your song or licenses it for use, mechanical royalties are generated. Services like Harry Fox Agency and Easy Song help manage this.</span></li>
          </ul>
        )
      },
      {
        heading: 'Sync Licensing & Placement',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Synchronization Rights:</strong> "Sync" means your music is synced to visual media (film, TV, ads, games, streaming platforms). This can be huge revenue—understand what you're licensing and for how long.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Placement Strategy:</strong> Curate your catalog for different placement opportunities. Know which tracks fit film scores, commercials, documentaries, or social media content.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Licensing Terms:</strong> Territory, exclusivity, duration, and media type all affect licensing value. Never grant blanket rights without understanding what you're giving away.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Sync Metadata:</strong> Tag your music properly in your distribution platform so it can be discovered by sync libraries and placement services.</span></li>
          </ul>
        )
      },
      {
        heading: 'Copyright & Contracts',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Copyright Basics:</strong> You own copyright to your original work automatically—no registration required, though it's recommended for legal protection. Copyright lasts your lifetime plus 70 years.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Master Rights vs. Publishing:</strong> Master rights are the recording itself; publishing rights are the composition. You can own both or license them separately.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Contract Red Flags:</strong> Don't sign away perpetual worldwide rights without compensation. Avoid "all rights" clauses. Retain reversion rights if possible.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Work-for-Hire Agreements:</strong> Understand if a producer, engineer, or collaborator is creating "work-for-hire" (they own it) or if you retain ownership. Get everything in writing.</span></li>
          </ul>
        )
      }
    ]
  },
  business: {
    title: 'Business Fundamentals',
    sections: [
      {
        heading: 'Legal Structure & Entity Formation',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Sole Proprietorship vs. LLC:</strong> Start as a sole proprietor (simple but no liability protection) or form an LLC (protects personal assets, more professional). An LLC costs $50-$500 and takes ~1-2 weeks.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>EIN & Taxes:</strong> Get an Employer Identification Number (EIN) from the IRS—it's free and establishes your business identity. Track all income and expenses for tax purposes.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Accounting:</strong> Use accounting software (FreshBooks, QuickBooks) to track income, expenses, and tax obligations. Keep receipts for everything.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Insurance:</strong> Consider liability insurance and equipment insurance as your business grows. Protects you and looks professional to collaborators.</span></li>
          </ul>
        )
      },
      {
        heading: 'Pricing Your Services',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Rate Strategy:</strong> Price based on your experience, market demand, and perceived value. Don't undervalue your work—you're building for sustainable income, not exposure.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Tiered Services:</strong> Offer packages at different price points. A "starter" package at $500 converts more clients than "enterprise only."</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Payment Terms:</strong> Require deposits upfront (typically 50%) to secure booking. Final payment due before delivery. Use tools like Stripe for invoicing.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Raise Prices Strategically:</strong> Increase rates annually. Your demand and skill improve over time—your pricing should reflect that.</span></li>
          </ul>
        )
      },
      {
        heading: 'Collaborations & Partnerships',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Feature Splits & Credit Rights:</strong> Among collaborators, agree on splits upfront (e.g., "80/20 for artist/producer"). Document who gets songwriting credit and publishing splits.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Label & Artist Agreements:</strong> If offered a partnership, understand whether it's 360 (label takes percentage of all income) or traditional (label earns from music sales only).</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Distribution Partnerships:</strong> Services like DistroKid and TuneCore get your music to all platforms. Typically take 15-30% of revenue, but are worth it for reach.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Joint Ventures:</strong> With other artists, producers, or entrepreneurs—always specify revenue shares, decision-making authority, and exit clauses in writing.</span></li>
          </ul>
        )
      }
    ]
  },
  growth: {
    title: 'Growth & Audience Building',
    sections: [
      {
        heading: 'Social Media Strategy',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Platform Selection:</strong> Choose 2-3 platforms where your audience lives. TikTok/Instagram Reels for broad reach, YouTube for long-form, Twitter for community, LinkedIn if offering services.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Content Pillars:</strong> Plan content across themes—behind-the-scenes, production process, personal stories, collaborations, live performances, tips & education. Consistency beats perfection.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Engagement Over Vanity Metrics:</strong> Focus on meaningful interaction (comments, DMs, community building) rather than follower count. 1,000 engaged fans &gt; 10,000 ghost followers.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Cross-Promotion:</strong> Link all platforms to your website. Funnel people to email list and Discord community where you control the relationship.</span></li>
          </ul>
        )
      },
      {
        heading: 'Playlists & Streaming Strategy',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Playlist Pitching:</strong> Spotify has curator programs and independent playlists. Pitch your tracks 2-4 weeks before release. A single playlist placement can generate thousands of streams.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Create Your Own Playlists:</strong> Build playlists on Spotify/Apple Music featuring your songs + complementary artists. Share with your audience—it's content and marketing combined.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Release Strategy:</strong> Consider releasing singles + album cycles. Build anticipation with teasers. Pre-save campaigns help push new releases into algorithmic playlists.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Analytics Deep Dive:</strong> Use Spotify for Artists to track listener demographics, discovery sources, and playlist placement impact. Doubles help—get your song promoted by secondary artists with larger audiences.</span></li>
          </ul>
        )
      },
      {
        heading: 'PR & Press Coverage',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Press Kit Essentials:</strong> Create a simple one-pager with your story, music summary, high-res photos, and links to streaming. Update as you grow. Press Kit sites—Presskit.to, Bandzoogle—make this easy.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Media Database & Outreach:</strong> Build a list of music journalists, bloggers, and tastemakers in your genre. Personalize pitches—don't blast copy-paste emails.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Newsworthy Angles:</strong> Tie releases to cultural moments, personal stories, or collaborations. "New album from emerging artist" is boring; "Artist partners with [known figure] to explore [timely topic]" gets coverage.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>PR Agencies & Publicists:</strong> Hiring a PR person ($500-$5K per campaign) can accelerate coverage, but learn basics first and pitch yourself when starting.</span></li>
          </ul>
        )
      },
      {
        heading: 'Community & Fan Relationship',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Email List Building:</strong> Your email list is your most valuable asset. Offer something to join (free download, exclusive video, early access). Email fans monthly—don't wait for release day.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Discord or Community Platform:</strong> Create a space where fans and collaborators gather. Share demos, behind-the-scenes, ideas. Discord costs $0—it's perfect for artists building community.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Patron/Membership Model:</strong> Platforms like Patreon let fans support you directly in exchange for exclusive content, early releases, or personal perks.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Live Connection:</strong> Respond to comments, do live Q&As, share personal updates. Humans connect with humans, not algorithms. Show up authentically.</span></li>
          </ul>
        )
      }
    ]
  },
  performance: {
    title: 'Performance & Technical Skills',
    sections: [
      {
        heading: 'Vocal Technique & Mastery',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Foundation:</strong> Proper breathing technique is everything. Your diaphragm, not your throat, powers your voice. Learn how to breathe from your core.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Resonance & Tone:</strong> Your unique tone is your fingerprint. Understand your genre's expectations—is bright tone or dark tone valued? Develop both, own one.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Range & Flexibility:</strong> Work on expanding your range both up and down. Learn to navigate passagio (the break between registers) smoothly.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Vocal Runs & Ornamentation:</strong> Runs add expressiveness but must serve the song. Master mic control, timing, and intention before adding technical complexity.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Vocal Health:</strong> Warm up before singing, stay hydrated, avoid straining. Your voice is an instrument—protect it like a violinist protects their bow.</span></li>
          </ul>
        )
      },
      {
        heading: 'Stage Presence & Performance',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Command & Connection:</strong> Own the stage by connecting with your audience. Make eye contact, move with intention. Every gesture should support your message.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Performance Preparation:</strong> Rehearse enough that muscle memory kicks in. When technique is automatic, you can focus on emotional delivery and engaging the room.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Setlist Strategy:</strong> Build a setlist that tells a story—energy peaks and valleys, emotional arcs. Mix hits with new material. Know your flow.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Mic Technique:</strong> Learn how to use a microphone—distance, angle, touch. A great performance can be ruined by poor mic technique.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Collaboration on Stage:</strong> If performing with a band or featuring other artists, rehearse thoroughly and communicate during the set. Tightness builds audience confidence.</span></li>
          </ul>
        )
      },
      {
        heading: 'Equipment & Technical Know-How',
        content: (
          <ul className="space-y-3 text-gray-700 text-sm leading-relaxed">
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Home Studio Basics:</strong> Even a modest setup matters—quality USB microphone ($100-$300), headphones, and acoustic treatment. Recording bad demos kills your shot.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>DAW Literacy:</strong> Know at least one DAW (Ableton, Logic, Pro Tools) at a basic level. You don't need to be a producer, but understanding your tools helps communication.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Performance Gear:</strong> Invest in reliable wireless mic systems, monitors, and backup batteries for live performance. Technical failure kills credibility.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Soundcheck Routine:</strong> Develop a soundcheck ritual to test mic levels, monitor mix, and audio cues. Never wing it—preparation prevents problems.</span></li>
            <li className="flex gap-3"><span className="text-lion-orange font-bold">•</span> <span><strong>Troubleshooting:</strong> Know how to troubleshoot basic issues—feedback, low levels, monitor mix problems. Having solutions ready keeps shows running.</span></li>
          </ul>
        )
      }
    ]
  }
};

export const ArtistDevelopment: React.FC<ArtistDevelopmentProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('fundamentals');

  if (!isOpen) return null;

  const content = tabContent[activeTab];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl my-8">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 flex justify-between items-start rounded-t-lg">
          <div>
            <h2 className="text-3xl font-bold mb-2">Artist Development Hub</h2>
            <p className="text-gray-300">Comprehensive resources for independent creators and label-empowered artists</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-lion-orange transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 overflow-x-auto sticky top-0">
          <div className="flex gap-1 px-6 py-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-lion-orange border-b-2 border-lion-orange'
                    : 'text-gray-600 hover:text-gray-900 bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-8 max-h-96 overflow-y-auto">
          <h3 className="text-2xl font-bold text-black mb-6">{content.title}</h3>
          <div className="space-y-8">
            {content.sections.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-lion-orange rounded"></div>
                  {section.heading}
                </h4>
                <div className="ml-4">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 p-6 rounded-b-lg flex items-center justify-between">
          <p className="text-sm text-gray-600">
            These resources are designed to empower you—whether you're independent or label-backed, you own your creative journey.
          </p>
          <button
            onClick={onClose}
            className="bg-lion-orange hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
