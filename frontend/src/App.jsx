import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import ChatPanel from './components/ChatPanel'
import DocumentPanel from './components/DocumentPanel'
import Scratchpad from './components/Scratchpad'
import LoginScreen from './components/LoginScreen'
import './App.css'

// Import Zustand stores
import { useChatStore, useProjectStore, useThemeStore, useWorkspaceStore, useAuthStore, useLayoutStore } from './store'

function App() {
  // Zustand stores - replaces useState for global state
  const theme = useThemeStore((state) => state.theme)
  const user = useAuthStore((state) => state.user)
  const layoutMode = useLayoutStore((state) => state.layoutMode)
  const sidebarVisible = useLayoutStore((state) => state.sidebarVisible)
  const [isHydrated, setIsHydrated] = useState(false)

  // Check if Zustand store is hydrated from localStorage
  useEffect(() => {
    setIsHydrated(true)
    // Connect to backend session
    useChatStore.getState().connectToSession()
  }, [])

  // Use Zustand store for artifacts (scratchpad tabs)
  const scratchpadTabs = useWorkspaceStore((state) => state.artifacts)
  const currentScratchpadTabId = useWorkspaceStore((state) => state.currentArtifactId)
  const addArtifact = useWorkspaceStore((state) => state.addArtifact)
  const updateArtifactContent = useWorkspaceStore((state) => state.updateArtifactContent)
  const setCurrentArtifactId = useWorkspaceStore((state) => state.setCurrentArtifactId)

  // Set default artifact if none exists
  const initialized = useRef(false)
  useEffect(() => {
      if (!initialized.current && scratchpadTabs.length === 0) {
          initialized.current = true
          addArtifact({
              id: 1,
              title: 'Welcome to Screenlit',
              content: '# Welcome\n\nThis is your scratchpad. AI-generated artifacts will appear here.',
              type: 'markdown'
          })
      }
  }, [scratchpadTabs.length, addArtifact])
  const [documents, setDocuments] = useState([
    {
      id: 1,
      name: 'Email Marketing Best Practices.md',
      type: 'document',
      content: `# Email Marketing Best Practices

## Campaign Design

### Subject Line
- **Optimal Length**: 30-50 characters
- **High Open Rate Patterns**: Numbers, questions, personalization
- **Testing**: Always conduct 50/50 A/B tests

### Optimal Send Times
- Tuesday through Thursday perform best
- Peak windows: 10 AM and 2 PM
- Apply timezone adjustments per segment

### Content Structure
1. **Preheader**: 40-50 characters with key message
2. **Header**: Logo + navigation
3. **Main Content**: Image-to-text ratio 40:60
4. **Call-to-Action**: Limit to 1-3 CTAs with clear instructions
5. **Footer**: Unsubscribe link (required)

## Segmentation Strategy

### Core Segments
- **New Customers**: Welcome sequence (5-day nurture)
- **Active**: 1-2 sends per week
- **Dormant**: Win-back campaigns
- **VIP**: Exclusive content + early access

## Metrics

### Key Performance Indicators
- **Open Rate**: Industry avg 20-25%, Target 28%+
- **Click Rate**: Industry avg 2-3%, Target 4%+
- **Conversion Rate**: Industry avg 1-2%, Target 2.5%+
- **Unsubscribe Rate**: Acceptable maximum 0.5%

### Calculation Formulas
- **Open Rate** = (Opens / Sends) × 100
- **CTR** = (Clicks / Opens) × 100
- **Conversion Rate** = (Conversions / Sends) × 100`,
      filePath: '/knowledge_base/email-marketing.md',
      tags: { category: 'marketing', channel: 'email', expertise: 'high' },
    },
    {
      id: 2,
      name: 'Customer Segmentation Guide.md',
      type: 'document',
      content: `# Customer Segmentation Strategy Guide

## Segment Definition

### Classification Based on Lifetime Value (LTV)

#### Segment 1: VIP (LTV $300,000+)
- **Characteristics**: High-frequency purchases, high average order value
- **Market Share**: 2-5%
- **Revenue Contribution**: 40-60% of total sales
- **Strategy**: Personalization + dedicated support
- **Tactics**: Exclusive events, early product access

#### Segment 2: Growth Tier (LTV $100,000-$300,000)
- **Characteristics**: Increasing spending, promotion potential
- **Market Share**: 10-15%
- **Revenue Contribution**: 25-35% of total sales
- **Strategy**: Enhanced engagement
- **Tactics**: Personalized emails, loyalty rewards

#### Segment 3: Standard Tier (LTV $50,000-$100,000)
- **Characteristics**: Stable purchasing, baseline engagement
- **Market Share**: 35-50%
- **Revenue Contribution**: 15-25% of total sales
- **Strategy**: Efficient retention
- **Tactics**: Automated workflows, newsletters

#### Segment 4: Dormant (LTV $10,000-$50,000)
- **Characteristics**: Purchase discontinuation, churn risk
- **Market Share**: 30-40%
- **Revenue Contribution**: 5-10% of total sales
- **Strategy**: Win-back campaigns
- **Tactics**: Retargeting, discount offers

## Implementation Roadmap

**Phase 1** (1 month): Segment build-out
**Phase 2** (2-3 months): Personalization implementation
**Phase 3** (4-6 months): Automated workflow development`,
      filePath: '/knowledge_base/segmentation.md',
      tags: { category: 'strategy', focus: 'segmentation', level: 'advanced' },
    },
    {
      id: 3,
      name: '2024 Q2 Marketing Calendar.md',
      type: 'document',
      content: `# 2024 Q2 Marketing Calendar

## Campaign Schedule

### April - Spring Campaign Launch Month
**Theme**: New product introduction + existing customer engagement

- **4/1-7**: Spring Preview Campaign (VIP segment)
- **4/8-14**: Early access launch (Growth tier)
- **4/15-30**: Full-customer spring sale

**Revenue Target**: $4.5M

### May - Golden Week Special Campaign
**Theme**: Family-focused / relaxation offerings

- **4/25-5/2**: Limited GW products pre-sale
- **5/3-6**: Free shipping promotion
- **5/7-31**: Continued promotions + summer collection preview

**Revenue Target**: $5.2M

### June - Summer Collection Launch
**Theme**: Summer season / new collection launch

- **6/1-15**: Summer Preview Week
- **6/16-30**: Full-scale sale + exclusive items

**Revenue Target**: $5.5M

---

**Q2 Revenue Target**: $15.2M
**Expected Achievement Rate**: 105%`,
      filePath: '/knowledge_base/marketing-calendar.md',
      tags: { category: 'planning', timeframe: 'q2-2024' },
    },
  ])
  const [libraries, setLibraries] = useState([
    {
      id: 1,
      name: 'Q2_campaign_data.csv',
      type: 'library',
      content:
        'Channel,Impressions,Clicks,CTR,Conversions,CVR,Spend,Revenue,ROI\nEmail,450000,21600,4.8%,540,2.5%,2400,10080,420%\nSocial Media,1200000,25200,2.1%,302,1.2%,8500,12758,150%\nDisplay Ads,850000,33200,3.9%,598,1.8%,8700,10370,120%',
      filePath: '/uploads/Q2_campaign_data.csv',
      tags: {
        source: 'chat',
        uploadedAt: new Date(Date.now() - 700000).toISOString(),
        fileType: 'text/csv',
        campaign: 'Q2-2024',
      },
    },
    {
      id: 2,
      name: 'customer_segmentation_analysis.xlsx',
      type: 'library',
      content: '',
      file: null,
      filePath: '/uploads/customer_segmentation_analysis.xlsx',
      tags: {
        source: 'chat',
        uploadedAt: new Date(Date.now() - 650000).toISOString(),
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        focus: 'VIP-Standard-Dormant',
      },
    },
    {
      id: 3,
      name: 'Email_Template_Q2.html',
      type: 'library',
      content:
        '<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial, sans-serif; }\n    .container { max-width: 600px; margin: 0 auto; }\n    .header { background-color: #6C6CFF; padding: 20px; color: white; }\n    .content { padding: 20px; background-color: #f9f9f9; }\n    .cta-button { background-color: #6C6CFF; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }\n  </style>\n</head>\n<body>\n  <div class="container">\n    <div class="header">\n      <h1>Q2 Special Offer</h1>\n    </div>\n    <div class="content">\n      <p>Dear Valued Customer,</p>\n      <p>We have an exclusive offer for you this quarter...</p>\n      <a href="#" class="cta-button">Shop Now</a>\n    </div>\n  </div>\n</body>\n</html>',
      filePath: '/uploads/Email_Template_Q2.html',
      tags: {
        source: 'chat',
        uploadedAt: new Date(Date.now() - 600000).toISOString(),
        fileType: 'text/html',
        purpose: 'email-template',
      },
    },
    {
      id: 4,
      name: 'Q2_Marketing_Strategy.pptx',
      type: 'library',
      content: '',
      file: null,
      filePath: '/uploads/Q2_Marketing_Strategy.pptx',
      tags: {
        source: 'chat',
        uploadedAt: new Date(Date.now() - 550000).toISOString(),
        fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        slides: '24',
      },
    },
    {
      id: 5,
      name: 'brand_guidelines_2024.pdf',
      type: 'library',
      content: '',
      file: null,
      filePath: '/uploads/brand_guidelines_2024.pdf',
      tags: {
        source: 'chat',
        uploadedAt: new Date(Date.now() - 500000).toISOString(),
        fileType: 'application/pdf',
        version: '2.1',
      },
    },
    {
      id: 6,
      name: 'social_media_content_calendar.xlsx',
      type: 'library',
      content: '',
      file: null,
      filePath: '/uploads/social_media_content_calendar.xlsx',
      tags: {
        source: 'chat',
        uploadedAt: new Date(Date.now() - 450000).toISOString(),
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        platform: 'Instagram-Twitter-Facebook',
      },
    },
  ])

  // If not hydrated yet or user is not logged in, show login screen
  if (!isHydrated || !user) {
    return <LoginScreen />
  }

  // === OLD HANDLERS REMOVED - Now in Zustand stores ===
  // handleSendMessage, handleNewChat, handleSelectChat, handleDeleteChat
  // handleCreateProject, handleDeleteProject, handleRenameProject
  // handleAddChatToProject, handleRemoveChatFromProject
  // toggleTheme, attachedWorkspaces handlers

  // Scratchpad handlers (delegated to store or specialized local handling)
  // For undo/redo, we might need to move that logic to the store or keep using the store actions.
  // The current store implementation supports basic update.
  // Undo/redo would require store support, but for MVP we focus on content update.

  const handleScratchpadUpdate = (newContent) => {
      updateArtifactContent(currentScratchpadTabId, newContent);
  }

  // Placeholder handlers for features not yet fully migrated to store or less critical for MVP
  const handleScratchpadUndo = () => { console.log("Undo not implemented yet in store"); }
  const handleScratchpadRedo = () => { console.log("Redo not implemented yet in store"); }

  const handleNewScratchpadTab = () => {
    addArtifact({
        id: Date.now(),
        title: `Untitled ${scratchpadTabs.length + 1}`,
        content: '',
        type: 'markdown'
    });
  }

  const handleSelectScratchpadTab = (tabId) => {
    setCurrentArtifactId(tabId);
  }

  const handleCloseScratchpadTab = (tabId) => {
      // Not implemented in store yet
      console.log("Close tab not implemented");
  }

  const handleRenameScratchpadTab = (tabId, newTitle) => {
      // Not implemented in store yet
      console.log("Rename tab not implemented");
  }

  const handleUploadLibrary = (file) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const newLibrary = {
        id: Date.now(),
        name: file.name,
        type: 'library',
        content: e.target.result,
        file: file,
      }
      setLibraries([...libraries, newLibrary])
    }

    // Read as text for most files, but handle binary files differently
    const fileType = file.name.split('.').pop().toLowerCase()
    if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileType)) {
      // For binary files, store the file object directly
      const newLibrary = {
        id: Date.now(),
        name: file.name,
        type: 'library',
        content: '',
        file: file,
      }
      setLibraries([...libraries, newLibrary])
    } else {
      reader.readAsText(file)
    }
  }

  const handleDeleteLibrary = (libraryId) => {
    setLibraries(libraries.filter((lib) => lib.id !== libraryId))
  }

  const handleDeleteDocument = (documentId) => {
    setDocuments(documents.filter((doc) => doc.id !== documentId))
  }

  const handleAddToScratchpad = (documentData) => {
      addArtifact({
          id: Date.now(),
          title: documentData.title,
          content: documentData.content,
          type: 'markdown', // Assuming markdown for now
          fileName: documentData.fileName,
          filePath: documentData.filePath,
      });
  }

  const handleAttachToChat = (workspaceData) => {
    // Use Zustand store to attach workspace
    useWorkspaceStore.getState().attachWorkspace(workspaceData)
  }

  const currentScratchpadTab = scratchpadTabs.find((tab) => tab.id === currentScratchpadTabId)

  return (
    <div className={`h-screen relative overflow-hidden ${theme === 'dark' ? 'dark dark-theme' : 'light-theme'}`}>
      {/* Background gradients */}
      <div
        className={`absolute inset-0 pointer-events-none z-0 animate-[theme-fade-in_0.6s_ease-out] ${
          theme === 'dark'
            ? 'bg-gradient-to-l from-[#B87069] to-[#114357]'
            : 'bg-gradient-to-r from-[#d9a8a5] to-[#ddd6f3]'
        }`}
      />

      {/* Content with z-index above background */}
      <div className="relative z-10 h-full overflow-hidden">
        <PanelGroup direction="horizontal">
          {layoutMode !== 'chat_only' && (
             // If NOT chat_only, we likely have two or three panels.
             // Standard: Chat | Scratchpad | Docs
             // Split: Chat | Scratchpad
             // Artifact Right: Chat | Scratchpad (Same as split effectively for now, or maybe sidebar hidden?)
             // Let's implement logic:
             // ChatPanel is always on left unless hidden (no hidden mode yet, except maybe artifact focus?)
             // Wait, 'chat_only' implies ONLY chat.
             // 'artifact_right' implies artifact is on right. Chat is on left?
             // If layoutMode is 'chat_only', we want ONE panel with ChatPanel.
             // If layoutMode is NOT 'chat_only', we want ChatPanel on left + Scratchpad on right.
             // Docs are only in 'standard'.

             null
          )}

          {/* Logic Refined:
              Standard: [Chat] [Scratchpad] [Docs]
              Chat Only: [Chat]
              Artifact Right: [Chat] [Scratchpad]
              Split: [Chat] [Scratchpad]
          */}

          {/* Left Panel (Chat) - Always present, but width varies or is single panel */}
           <Panel defaultSize={layoutMode === 'chat_only' ? 100 : 35} minSize={15} maxSize={layoutMode === 'chat_only' ? 100 : 50}>
            <ChatPanel
              documents={documents}
              libraries={libraries}
              scratchpadTabs={scratchpadTabs}
            />
          </Panel>

          {/* Middle/Right Panel (Scratchpad) - Hidden in chat_only */}
          {layoutMode !== 'chat_only' && (
            <>
                <PanelResizeHandle className="resize-handle" />
                <Panel defaultSize={40} minSize={25}>
                    <Scratchpad
                      tabs={scratchpadTabs}
                      currentTabId={currentScratchpadTabId}
                      currentTab={currentScratchpadTab}
                      onUpdate={handleScratchpadUpdate}
                      onUndo={handleScratchpadUndo}
                      onRedo={handleScratchpadRedo}
                      onNewTab={handleNewScratchpadTab}
                      onSelectTab={handleSelectScratchpadTab}
                      onCloseTab={handleCloseScratchpadTab}
                      onRenameTab={handleRenameScratchpadTab}
                      onAddDocument={handleAddToScratchpad}
                      onAttachToChat={handleAttachToChat}
                      documents={documents}
                      libraries={libraries}
                    />
                </Panel>
            </>
          )}

          {/* Rightmost Panel (Docs) - Only in standard */}
          {layoutMode === 'standard' && (
            <>
              <PanelResizeHandle className="resize-handle" />
              <Panel defaultSize={25} minSize={15} maxSize={40}>
                <DocumentPanel
                  documents={documents}
                  libraries={libraries}
                  onUploadLibrary={handleUploadLibrary}
                  onDeleteLibrary={handleDeleteLibrary}
                  onDeleteDocument={handleDeleteDocument}
                  onAddToScratchpad={handleAddToScratchpad}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </div>
  )
}

export default App
