'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FileText, FileCheck, FileCode, Calendar, Target, BookOpen, Bug } from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  content: string
}

const templates: Template[] = [
  {
    id: 'blank',
    name: 'Blank Document',
    description: 'Start from scratch',
    icon: <FileText className="h-6 w-6" />,
    content: '<h1>Untitled Document</h1><p>Start writing...</p>',
  },
  {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Record meeting discussions',
    icon: <Calendar className="h-6 w-6" />,
    content: `<h1>Meeting Notes</h1>
<h2>📅 Date</h2>
<p>[Date]</p>
<h2>👥 Participants</h2>
<ul>
  <li>Person 1</li>
  <li>Person 2</li>
</ul>
<h2>📋 Agenda</h2>
<ol>
  <li>Topic 1</li>
  <li>Topic 2</li>
</ol>
<h2>📝 Discussion</h2>
<p>Meeting notes...</p>
<h2>✅ Action Items</h2>
<ul>
  <li>Task 1 - @assignee</li>
  <li>Task 2 - @assignee</li>
</ul>
<h2>📌 Next Steps</h2>
<p>Follow-up actions...</p>`,
  },
  {
    id: 'prd',
    name: 'PRD (Product Requirements)',
    description: 'Product requirements document',
    icon: <FileCheck className="h-6 w-6" />,
    content: `<h1>Product Requirements Document</h1>
<h2>🎯 Overview</h2>
<p>Brief description of the feature/product...</p>
<h2>🎯 Goals</h2>
<ul>
  <li>Goal 1</li>
  <li>Goal 2</li>
</ul>
<h2>👥 Target Users</h2>
<p>Who will use this feature...</p>
<h2>📝 Requirements</h2>
<h3>Functional Requirements</h3>
<ul>
  <li>Requirement 1</li>
  <li>Requirement 2</li>
</ul>
<h3>Non-Functional Requirements</h3>
<ul>
  <li>Performance</li>
  <li>Security</li>
</ul>
<h2>🚫 Out of Scope</h2>
<p>What is NOT included...</p>
<h2>📅 Timeline</h2>
<p>Estimated schedule...</p>`,
  },
  {
    id: 'technical',
    name: 'Technical Design',
    description: 'System architecture and design',
    icon: <FileCode className="h-6 w-6" />,
    content: `<h1>Technical Design Document</h1>
<h2>🎯 Problem Statement</h2>
<p>What problem are we solving...</p>
<h2>🏗️ Architecture</h2>
<p>High-level system design...</p>
<h2>📊 Data Model</h2>
<p>Database schema and relationships...</p>
<h2>🔌 API Design</h2>
<h3>Endpoints</h3>
<pre><code>GET /api/resource
POST /api/resource
PUT /api/resource/:id
DELETE /api/resource/:id</code></pre>
<h2>🔒 Security</h2>
<p>Authentication, authorization, data protection...</p>
<h2>📈 Performance</h2>
<p>Caching, optimization strategies...</p>
<h2>✅ Testing Strategy</h2>
<p>Unit tests, integration tests...</p>`,
  },
  {
    id: 'weekly',
    name: 'Weekly Report',
    description: 'Team progress updates',
    icon: <Target className="h-6 w-6" />,
    content: `<h1>Weekly Report</h1>
<h2>📅 Week of [Date]</h2>
<h2>✅ Completed</h2>
<ul>
  <li>Task 1</li>
  <li>Task 2</li>
</ul>
<h2>🚧 In Progress</h2>
<ul>
  <li>Task 3 (80%)</li>
  <li>Task 4 (50%)</li>
</ul>
<h2>📌 Next Week</h2>
<ul>
  <li>Priority 1</li>
  <li>Priority 2</li>
</ul>
<h2>⚠️ Blockers</h2>
<p>Issues needing resolution...</p>`,
  },
  {
    id: 'onboarding',
    name: 'Onboarding Guide',
    description: 'Team member onboarding',
    icon: <BookOpen className="h-6 w-6" />,
    content: `<h1>Onboarding Guide</h1>
<h2>👋 Welcome</h2>
<p>Welcome to the team!</p>
<h2>🛠️ Setup</h2>
<h3>Day 1</h3>
<ul>
  <li>Access accounts</li>
  <li>Install tools</li>
  <li>Meet the team</li>
</ul>
<h3>Week 1</h3>
<ul>
  <li>Complete training</li>
  <li>Review documentation</li>
  <li>Shadow team members</li>
</ul>
<h2>📚 Resources</h2>
<ul>
  <li>Team wiki</li>
  <li>Code repository</li>
  <li>Contact list</li>
</ul>`,
  },
  {
    id: 'bug',
    name: 'Bug Report',
    description: 'Issue tracking template',
    icon: <Bug className="h-6 w-6" />,
    content: `<h1>Bug Report</h1>
<h2>🐛 Summary</h2>
<p>Brief description of the bug...</p>
<h2>📋 Steps to Reproduce</h2>
<ol>
  <li>Step 1</li>
  <li>Step 2</li>
  <li>Step 3</li>
</ol>
<h2>✅ Expected Behavior</h2>
<p>What should happen...</p>
<h2>❌ Actual Behavior</h2>
<p>What actually happens...</p>
<h2>🖥️ Environment</h2>
<ul>
  <li>Browser: Chrome 120</li>
  <li>OS: macOS 14</li>
  <li>Version: 1.0.0</li>
</ul>
<h2>📸 Screenshots</h2>
<p>[Add screenshots here]</p>
<h2>🔧 Possible Fix</h2>
<p>Suggestions for resolution...</p>`,
  },
]

interface TemplateSelectorProps {
  onSelect: (template: Template) => void
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [open, setOpen] = useState(false)

  const handleSelect = (template: Template) => {
    onSelect(template)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 outline-none h-9 px-4 py-2 border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground">
          Choose Template
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Choose a Template</DialogTitle>
          <DialogDescription>
            Start with a pre-built template or create a blank document
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelect(template)}
              className="flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
            >
              <div className="text-blue-600 dark:text-blue-400">
                {template.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {template.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
