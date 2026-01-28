'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2 } from 'lucide-react'

interface Member {
  id: string
  userId: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  user: {
    id: string
    name: string
    email: string
    avatarUrl?: string
  }
  joinedAt: string
  isActive: boolean
}

interface MembersListProps {
  workspaceId: string
}

export function MembersList({ workspaceId }: MembersListProps) {
  const [members, setMembers] = useState<Member[]>([
    // Mock data
    {
      id: '1',
      userId: '1',
      role: 'owner',
      user: {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
      },
      joinedAt: new Date().toISOString(),
      isActive: true,
    },
  ])

  const handleRemove = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return
    }

    // TODO: Call API to remove member
    console.log('Remove member:', memberId)
  }

  const getRoleBadge = (role: string) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      editor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    }

    return (
      <Badge className={colors[role as keyof typeof colors] || colors.viewer}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Team Members
        </h2>
        <Button size="sm">Invite Member</Button>
      </div>

      <div className="divide-y rounded-lg border dark:divide-gray-800 dark:border-gray-800">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={member.user.avatarUrl} />
                <AvatarFallback>
                  {member.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {member.user.name}
                </p>
                <p className="text-sm text-gray-500">{member.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {getRoleBadge(member.role)}

              {member.role !== 'owner' && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemove(member.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-md bg-blue-50 p-4 text-sm text-blue-800 dark:bg-blue-950 dark:text-blue-200">
        <h4 className="font-semibold">Permission Roles:</h4>
        <ul className="mt-2 space-y-1">
          <li>
            <strong>Owner:</strong> Full control, can manage members
          </li>
          <li>
            <strong>Admin:</strong> Can manage members and delete any content
          </li>
          <li>
            <strong>Editor:</strong> Can create and edit documents, but cannot
            delete others&apos; documents
          </li>
          <li>
            <strong>Viewer:</strong> Read-only access, but can add comments
          </li>
        </ul>
      </div>
    </div>
  )
}
