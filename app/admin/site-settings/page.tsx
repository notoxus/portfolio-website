'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CustomHomeItem, HomeSection, SiteSettings } from 'lib/site-settings'
import { FONT_SIZE_MAX, FONT_SIZE_MIN, type FontSize, type FontSizeSettings } from 'lib/font-sizes'
import {
  PROJECT_ACCENTS,
  PROJECT_ACCENT_LABELS,
  PROJECT_ACCENT_STYLES,
  type ProjectAccent,
} from 'lib/project-accents'

type EditableSettings = SiteSettings

const SOCIAL_ICON_CHOICES = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'github', label: 'GitHub' },
  { value: 'tryhackme', label: 'TryHackMe' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'website', label: 'Text / website' },
] as const

const TYPOGRAPHY_GROUPS: Array<{
  title: string
  items: Array<{ key: keyof FontSizeSettings; label: string }>
}> = [
  {
    title: 'Homepage hero',
    items: [
      { key: 'homeEyebrow', label: 'Eyebrow' },
      { key: 'homeHeadline', label: 'Headline' },
      { key: 'homeIntro', label: 'Intro' },
      { key: 'homeCta', label: 'CTA buttons' },
    ],
  },
  {
    title: 'Homepage side card',
    items: [
      { key: 'skillGroupLabel', label: 'Skill group labels' },
      { key: 'skillTag', label: 'Skill tags' },
      { key: 'contactLabel', label: 'Contact label' },
      { key: 'contactDescription', label: 'Contact description' },
      { key: 'socialLabel', label: 'Social names' },
    ],
  },
  {
    title: 'Footer',
    items: [
      { key: 'footerTitle', label: 'Footer title' },
      { key: 'footerDescription', label: 'Footer description' },
    ],
  },
]

function SocialLinksEditor({
  links,
  onChange,
}: {
  links: SiteSettings['socialLinks']
  onChange: (links: SiteSettings['socialLinks']) => void
}) {
  const updateLink = (
    index: number,
    key: keyof SiteSettings['socialLinks'][number],
    value: string,
  ) => {
    onChange(links.map((link, i) => (i === index ? { ...link, [key]: value } : link)))
  }

  const addLink = () => {
    onChange([
      ...links,
      {
        id: `social-${Date.now()}`,
        name: 'Website',
        href: 'https://',
        icon: 'website',
        shortLabel: 'WEB',
      },
    ])
  }

  return (
    <div className="space-y-3">
      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
          Social links
        </span>
        <p className="mt-1 text-xs text-neutral-400">
          Add or remove the links shown in the homepage card and footer.
        </p>
      </div>

      {links.map((link, index) => (
        <div
          key={link.id}
          className="grid gap-3 rounded-lg border border-neutral-200 p-3 dark:border-neutral-700 sm:grid-cols-2"
        >
          <label>
            <span className="text-xs text-neutral-500">Name</span>
            <input
              value={link.name}
              onChange={(event) => updateLink(index, 'name', event.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          <label>
            <span className="text-xs text-neutral-500">Icon</span>
            <select
              value={link.icon}
              onChange={(event) => updateLink(index, 'icon', event.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
            >
              {SOCIAL_ICON_CHOICES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="sm:col-span-2">
            <span className="text-xs text-neutral-500">URL</span>
            <input
              value={link.href}
              onChange={(event) => updateLink(index, 'href', event.target.value)}
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
          </label>
          {link.icon === 'website' && (
            <label>
              <span className="text-xs text-neutral-500">Short label</span>
              <input
                value={link.shortLabel ?? ''}
                maxLength={6}
                onChange={(event) => updateLink(index, 'shortLabel', event.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
              />
            </label>
          )}
          <div className="flex items-end sm:justify-end">
            <button
              type="button"
              onClick={() => onChange(links.filter((_, i) => i !== index))}
              className="rounded-md px-2 py-1.5 text-xs font-medium text-red-500 transition hover:bg-red-500/10"
            >
              Remove link
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addLink}
        className="rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700"
      >
        + Add social link
      </button>
    </div>
  )
}

function TypographyEditor({
  sizes,
  onChange,
}: {
  sizes: FontSizeSettings
  onChange: (key: keyof FontSizeSettings, value: FontSize) => void
}) {
  return (
    <div className="space-y-5">
      {TYPOGRAPHY_GROUPS.map((group) => (
        <div key={group.title}>
          <h4 className="mb-2 text-sm font-semibold">{group.title}</h4>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => (
              <label key={item.key} className="block">
                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                  {item.label}
                </span>
                <input
                  type="number"
                  min={FONT_SIZE_MIN}
                  max={FONT_SIZE_MAX}
                  value={sizes[item.key]}
                  onChange={(event) => onChange(item.key, Number(event.target.value))}
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
                />
                <span className="ml-1 text-xs text-neutral-400">px</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SizeSelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: FontSize
  onChange: (value: FontSize) => void
}) {
  return (
    <label className="block">
      <span className="text-xs text-neutral-500 dark:text-neutral-400">{label}</span>
      <input
        type="number"
        min={FONT_SIZE_MIN}
        max={FONT_SIZE_MAX}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
      />
      <span className="ml-1 text-xs text-neutral-400">px</span>
    </label>
  )
}

function HomeSectionsEditor({
  sections,
  onChange,
}: {
  sections: HomeSection[]
  onChange: (sections: HomeSection[]) => void
}) {
  const updateSection = <K extends keyof HomeSection>(
    index: number,
    key: K,
    value: HomeSection[K],
  ) => {
    onChange(sections.map((section, i) => (i === index ? { ...section, [key]: value } : section)))
  }

  const moveSection = (index: number, offset: number) => {
    const target = index + offset
    if (target < 0 || target >= sections.length) return
    const next = [...sections]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const addSection = (type: HomeSection['type']) => {
    const labels = {
      projects: ['Projects', 'Selected work from my portfolio.'],
      blog: ['Writing', 'Recent notes and articles.'],
      custom: ['New section', ''],
    } as const

    onChange([
      ...sections,
      {
        id: `section-${Date.now()}`,
        type,
        title: labels[type][0],
        description: labels[type][1],
        titleSize: 24,
        descriptionSize: 14,
        limit: 3,
        featuredOnly: type === 'projects',
        items: [],
      },
    ])
  }

  const updateCustomItem = <K extends keyof CustomHomeItem>(
    sectionIndex: number,
    itemIndex: number,
    key: K,
    value: CustomHomeItem[K],
  ) => {
    const section = sections[sectionIndex]
    const items = section.items.map((item, i) =>
      i === itemIndex ? { ...item, [key]: value } : item,
    )
    updateSection(sectionIndex, 'items', items)
  }

  const addCustomItem = (sectionIndex: number) => {
    const section = sections[sectionIndex]
    updateSection(sectionIndex, 'items', [
      ...section.items,
      {
        id: `custom-${Date.now()}`,
        title: 'New item',
        label: '',
        description: '',
        meta: '',
        href: '',
        accent: 'blue',
        titleSize: 20,
        labelSize: 12,
        descriptionSize: 14,
        metaSize: 12,
      },
    ])
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Homepage sections</h3>
        <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
          Add, remove, and reorder complete sections. Custom sections contain manually managed cards.
        </p>
      </div>

      {sections.map((section, sectionIndex) => (
        <div
          key={section.id}
          className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-700"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="index-pill">{String(sectionIndex + 1).padStart(2, '0')}</span>
              <strong className="text-sm">{section.title || 'Untitled section'}</strong>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={sectionIndex === 0}
                onClick={() => moveSection(sectionIndex, -1)}
                className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
              >
                ↑ Up
              </button>
              <button
                type="button"
                disabled={sectionIndex === sections.length - 1}
                onClick={() => moveSection(sectionIndex, 1)}
                className="rounded-md px-2 py-1 text-xs text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 dark:hover:bg-neutral-800"
              >
                ↓ Down
              </button>
              <button
                type="button"
                onClick={() => onChange(sections.filter((_, i) => i !== sectionIndex))}
                className="rounded-md px-2 py-1 text-xs text-red-500 hover:bg-red-500/10"
              >
                Remove
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label>
              <span className="text-xs text-neutral-500">Section type</span>
              <select
                value={section.type}
                onChange={(event) =>
                  updateSection(sectionIndex, 'type', event.target.value as HomeSection['type'])
                }
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
              >
                <option value="projects">Projects</option>
                <option value="blog">Blog posts</option>
                <option value="custom">Custom cards</option>
              </select>
            </label>
            <label>
              <span className="text-xs text-neutral-500">Title</span>
              <input
                value={section.title}
                onChange={(event) => updateSection(sectionIndex, 'title', event.target.value)}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
              />
            </label>
            <SizeSelect
              label="Title size"
              value={section.titleSize}
              onChange={(value) => updateSection(sectionIndex, 'titleSize', value)}
            />
            <SizeSelect
              label="Description size"
              value={section.descriptionSize}
              onChange={(value) => updateSection(sectionIndex, 'descriptionSize', value)}
            />
            <label className="sm:col-span-2">
              <span className="text-xs text-neutral-500">Description</span>
              <textarea
                value={section.description}
                onChange={(event) => updateSection(sectionIndex, 'description', event.target.value)}
                rows={2}
                className="mt-1 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
              />
            </label>
          </div>

          {section.type !== 'custom' && (
            <div className="mt-3 flex flex-wrap items-end gap-4">
              <label>
                <span className="text-xs text-neutral-500">Items shown</span>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={section.limit}
                  onChange={(event) =>
                    updateSection(sectionIndex, 'limit', Number(event.target.value) || 1)
                  }
                  className="mt-1 block w-24 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
                />
              </label>
              {section.type === 'projects' && (
                <label className="flex items-center gap-2 pb-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <input
                    type="checkbox"
                    checked={section.featuredOnly}
                    onChange={(event) =>
                      updateSection(sectionIndex, 'featuredOnly', event.target.checked)
                    }
                  />
                  Featured projects only
                </label>
              )}
            </div>
          )}

          {section.type === 'custom' && (
            <div className="mt-5 space-y-3 border-t border-neutral-200 pt-4 dark:border-neutral-800">
              {section.items.map((item, itemIndex) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-neutral-50 p-3 dark:bg-neutral-950/60"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <strong className="text-xs">Custom item {itemIndex + 1}</strong>
                    <button
                      type="button"
                      onClick={() =>
                        updateSection(
                          sectionIndex,
                          'items',
                          section.items.filter((_, i) => i !== itemIndex),
                        )
                      }
                      className="text-xs text-red-500"
                    >
                      Remove item
                    </button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="text-xs text-neutral-500">Title</span>
                      <input
                        value={item.title}
                        onChange={(event) =>
                          updateCustomItem(sectionIndex, itemIndex, 'title', event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </label>
                    <label>
                      <span className="text-xs text-neutral-500">Label</span>
                      <input
                        value={item.label}
                        onChange={(event) =>
                          updateCustomItem(sectionIndex, itemIndex, 'label', event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </label>
                    <label>
                      <span className="text-xs text-neutral-500">Label color</span>
                      <select
                        value={item.accent}
                        onChange={(event) =>
                          updateCustomItem(
                            sectionIndex,
                            itemIndex,
                            'accent',
                            event.target.value as ProjectAccent,
                          )
                        }
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                      >
                        {PROJECT_ACCENTS.map((accent) => (
                          <option key={accent} value={accent}>
                            {PROJECT_ACCENT_LABELS[accent]}
                          </option>
                        ))}
                      </select>
                      {item.label && (
                        <span
                          className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${PROJECT_ACCENT_STYLES[item.accent]}`}
                        >
                          {item.label}
                        </span>
                      )}
                    </label>
                    <label>
                      <span className="text-xs text-neutral-500">Metadata</span>
                      <input
                        value={item.meta}
                        placeholder="Date / tools / location"
                        onChange={(event) =>
                          updateCustomItem(sectionIndex, itemIndex, 'meta', event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="text-xs text-neutral-500">Description</span>
                      <textarea
                        value={item.description}
                        onChange={(event) =>
                          updateCustomItem(
                            sectionIndex,
                            itemIndex,
                            'description',
                            event.target.value,
                          )
                        }
                        rows={2}
                        className="mt-1 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </label>
                    <label className="sm:col-span-2">
                      <span className="text-xs text-neutral-500">Link (optional)</span>
                      <input
                        value={item.href}
                        onChange={(event) =>
                          updateCustomItem(sectionIndex, itemIndex, 'href', event.target.value)
                        }
                        className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                      />
                    </label>
                    <SizeSelect
                      label="Title size"
                      value={item.titleSize}
                      onChange={(value) =>
                        updateCustomItem(sectionIndex, itemIndex, 'titleSize', value)
                      }
                    />
                    <SizeSelect
                      label="Label size"
                      value={item.labelSize}
                      onChange={(value) =>
                        updateCustomItem(sectionIndex, itemIndex, 'labelSize', value)
                      }
                    />
                    <SizeSelect
                      label="Description size"
                      value={item.descriptionSize}
                      onChange={(value) =>
                        updateCustomItem(sectionIndex, itemIndex, 'descriptionSize', value)
                      }
                    />
                    <SizeSelect
                      label="Metadata size"
                      value={item.metaSize}
                      onChange={(value) =>
                        updateCustomItem(sectionIndex, itemIndex, 'metaSize', value)
                      }
                    />
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => addCustomItem(sectionIndex)}
                className="rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700"
              >
                + Add custom item
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addSection('projects')}
          className="rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700"
        >
          + Projects section
        </button>
        <button
          type="button"
          onClick={() => addSection('blog')}
          className="rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700"
        >
          + Blog section
        </button>
        <button
          type="button"
          onClick={() => addSection('custom')}
          className="rounded-lg border border-dashed border-blue-400 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-500/10 dark:border-blue-700 dark:text-blue-400"
        >
          + Custom section
        </button>
      </div>
    </div>
  )
}

function SkillGroupsEditor({
  groups,
  onChange,
}: {
  groups: SiteSettings['home']['skillGroups']
  onChange: (groups: SiteSettings['home']['skillGroups']) => void
}) {
  const updateGroupLabel = (index: number, label: string) => {
    onChange(groups.map((group, i) => (i === index ? { ...group, label } : group)))
  }

  const addGroup = () => {
    onChange([...groups, { label: 'New group', items: [] }])
  }

  const removeGroup = (index: number) => {
    onChange(groups.filter((_, i) => i !== index))
  }

  const addTag = (index: number, tag: string) => {
    const trimmed = tag.trim()
    if (!trimmed) return
    onChange(
      groups.map((group, i) =>
        i === index ? { ...group, items: [...group.items, trimmed] } : group,
      ),
    )
  }

  const removeTag = (groupIndex: number, itemIndex: number) => {
    onChange(
      groups.map((group, i) =>
        i === groupIndex
          ? { ...group, items: group.items.filter((_, j) => j !== itemIndex) }
          : group,
      ),
    )
  }

  return (
    <div className="space-y-4">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        Skill groups
      </span>
      {groups.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className="rounded-lg border border-neutral-200 p-3 dark:border-neutral-700"
        >
          <div className="flex items-center gap-2">
            <input
              value={group.label}
              onChange={(event) => updateGroupLabel(groupIndex, event.target.value)}
              placeholder="Group label"
              className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
            />
            <button
              type="button"
              onClick={() => removeGroup(groupIndex)}
              className="shrink-0 rounded-md px-2 py-1 text-xs text-neutral-400 transition-colors hover:text-red-500"
            >
              Remove group
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {group.items.map((item, itemIndex) => (
              <span
                key={itemIndex}
                className="flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeTag(groupIndex, itemIndex)}
                  aria-label={`Remove ${item}`}
                  className="text-neutral-400 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
            <TagInput onAdd={(tag) => addTag(groupIndex, tag)} />
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addGroup}
        className="rounded-lg border border-dashed border-neutral-300 px-3 py-1.5 text-sm font-medium text-neutral-500 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700"
      >
        + Add group
      </button>
    </div>
  )
}

function TagInput({ onAdd }: { onAdd: (tag: string) => void }) {
  const [value, setValue] = useState('')

  const submit = () => {
    if (!value.trim()) return
    onAdd(value)
    setValue('')
  }

  return (
    <span className="flex items-center gap-1">
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            submit()
          }
        }}
        placeholder="New tag"
        className="w-24 rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
      />
      <button
        type="button"
        onClick={submit}
        aria-label="Add tag"
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-dashed border-neutral-300 text-neutral-500 transition-colors hover:border-blue-500 hover:text-blue-600 dark:border-neutral-700"
      >
        +
      </button>
    </span>
  )
}

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  multiline?: boolean
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
        {label}
      </span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          rows={3}
          className="mt-1 w-full resize-y rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
      )}
    </label>
  )
}

async function readJsonResponse(res: Response) {
  const text = await res.text()
  if (!text) return {}

  try {
    return JSON.parse(text)
  } catch {
    return { error: text }
  }
}

export default function SiteSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<EditableSettings | null>(null)
  const [intro, setIntro] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/site-settings').then((res) => res.json()),
      fetch('/api/intro').then((res) => res.json()),
    ])
      .then(([settingsData, introData]) => {
        setSettings(settingsData.settings)
        setIntro(introData.content ?? '')
      })
      .catch(() => setError('Failed to load site settings'))
  }, [])

  const updateHome = <K extends keyof EditableSettings['home']>(
    key: K,
    value: EditableSettings['home'][K],
  ) => {
    setSettings((current) =>
      current ? { ...current, home: { ...current.home, [key]: value } } : current,
    )
  }

  const updateFontSize = (key: keyof FontSizeSettings, value: FontSize) => {
    setSettings((current) =>
      current
        ? { ...current, fontSizes: { ...current.fontSizes, [key]: value } }
        : current,
    )
  }

  const updateSection = <K extends 'projectsPage' | 'blogPage' | 'footer'>(
    section: K,
    key: keyof EditableSettings[K],
    value: string,
  ) => {
    setSettings((current) =>
      current ? { ...current, [section]: { ...current[section], [key]: value } } : current,
    )
  }

  const save = async () => {
    if (!settings) return
    setSaving(true)
    setError('')

    try {
      const settingsRes = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const settingsData = await readJsonResponse(settingsRes)
      if (!settingsRes.ok) throw new Error(settingsData.error ?? 'Settings save failed')

      const introRes = await fetch('/api/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: intro }),
      })
      const introData = await readJsonResponse(introRes)
      if (!introRes.ok) throw new Error(introData.error ?? 'Intro save failed')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    }

    setSaving(false)
  }

  if (!settings && !error) {
    return <p className="text-sm text-neutral-400">Loading...</p>
  }

  if (!settings) {
    return <p className="text-sm text-red-500">{error}</p>
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-semibold">Homepage editor</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-sm text-neutral-400 transition-colors hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            Cancel
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="rounded-md bg-neutral-900 px-5 py-1.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-40 dark:bg-neutral-100 dark:text-black"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/40">
          {error}
        </p>
      )}

      <div className="space-y-8">
        <section className="surface-panel rounded-2xl p-5">
          <h3 className="mb-4 font-semibold">Home</h3>
          <div className="grid gap-4">
            <Field label="Eyebrow" value={settings.home.eyebrow} onChange={(v) => updateHome('eyebrow', v)} />
            <Field label="Headline" value={settings.home.headline} onChange={(v) => updateHome('headline', v)} multiline />
            <Field label="Introduction" value={intro} onChange={setIntro} multiline />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Primary CTA label" value={settings.home.primaryCtaLabel} onChange={(v) => updateHome('primaryCtaLabel', v)} />
              <Field label="Primary CTA link" value={settings.home.primaryCtaHref} onChange={(v) => updateHome('primaryCtaHref', v)} />
              <Field label="Secondary CTA label" value={settings.home.secondaryCtaLabel} onChange={(v) => updateHome('secondaryCtaLabel', v)} />
              <Field label="Secondary CTA link" value={settings.home.secondaryCtaHref} onChange={(v) => updateHome('secondaryCtaHref', v)} />
            </div>
            <SkillGroupsEditor
              groups={settings.home.skillGroups}
              onChange={(groups) => updateHome('skillGroups', groups)}
            />
            <SocialLinksEditor
              links={settings.socialLinks}
              onChange={(socialLinks) =>
                setSettings((current) => (current ? { ...current, socialLinks } : current))
              }
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact label" value={settings.home.contactLabel} onChange={(v) => updateHome('contactLabel', v)} />
            </div>
            <Field label="Contact description" value={settings.home.contactDescription} onChange={(v) => updateHome('contactDescription', v)} multiline />
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-semibold">Hero side card layout</h3>
            <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              These controls apply on desktop. Mobile keeps a safe full-width stacked layout.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label>
              <span className="text-xs text-neutral-500">Card side</span>
              <select
                value={settings.home.panelLayout.side}
                onChange={(event) => updateHome('panelLayout', { ...settings.home.panelLayout, side: event.target.value as 'left' | 'right' })}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              >
                <option value="right">Right</option>
                <option value="left">Left</option>
              </select>
            </label>
            <label>
              <span className="text-xs text-neutral-500">Vertical alignment</span>
              <select
                value={settings.home.panelLayout.verticalAlign}
                onChange={(event) => updateHome('panelLayout', { ...settings.home.panelLayout, verticalAlign: event.target.value as 'start' | 'center' | 'end' })}
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-950"
              >
                <option value="start">Top</option>
                <option value="center">Center</option>
                <option value="end">Bottom</option>
              </select>
            </label>
            {([
              ['widthPercent', 'Width', '%', 24, 55],
              ['minHeightPx', 'Minimum height', 'px', 0, 900],
              ['offsetXPx', 'Horizontal offset', 'px', -160, 160],
              ['offsetYPx', 'Vertical offset', 'px', -160, 160],
            ] as const).map(([key, label, unit, min, max]) => (
              <label key={key}>
                <span className="text-xs text-neutral-500">{label}</span>
                <div className="mt-1 flex items-center gap-3">
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={settings.home.panelLayout[key]}
                    onChange={(event) => updateHome('panelLayout', { ...settings.home.panelLayout, [key]: Number(event.target.value) })}
                    className="min-w-0 flex-1 accent-blue-600"
                  />
                  <div className="relative w-24 shrink-0">
                    <input
                      type="number"
                      min={min}
                      max={max}
                      value={settings.home.panelLayout[key]}
                      onChange={(event) => updateHome('panelLayout', { ...settings.home.panelLayout, [key]: Number(event.target.value) })}
                      className="w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 pr-9 text-sm dark:border-neutral-700 dark:bg-neutral-950"
                    />
                    <span className="pointer-events-none absolute right-3 top-2.5 text-xs text-neutral-400">{unit}</span>
                  </div>
                </div>
              </label>
            ))}
            <div className="sm:col-span-2 lg:col-span-3">
              <span className="text-xs text-neutral-500">Layout preview</span>
              <div className="relative mt-1 h-44 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100/70 dark:border-neutral-700 dark:bg-neutral-950">
                <div className="absolute inset-y-5 left-4 right-4 rounded-lg border border-dashed border-neutral-300 dark:border-neutral-700" />
                <div
                  className="absolute rounded-lg border border-blue-500/60 bg-blue-500/15 p-3 text-xs font-semibold text-blue-600 shadow-sm dark:text-blue-300"
                  style={{
                    width: `${settings.home.panelLayout.widthPercent}%`,
                    minHeight: `${Math.max(44, settings.home.panelLayout.minHeightPx / 5)}px`,
                    [settings.home.panelLayout.side]: '1rem',
                    top:
                      settings.home.panelLayout.verticalAlign === 'start'
                        ? '1.25rem'
                        : settings.home.panelLayout.verticalAlign === 'end'
                          ? undefined
                          : '50%',
                    bottom: settings.home.panelLayout.verticalAlign === 'end' ? '1.25rem' : undefined,
                    transform: `translate(${settings.home.panelLayout.offsetXPx / 5}px, ${
                      settings.home.panelLayout.offsetYPx / 5
                    }px)${settings.home.panelLayout.verticalAlign === 'center' ? ' translateY(-50%)' : ''}`,
                  }}
                >
                  Hero side card
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="surface-panel rounded-2xl p-5">
          <HomeSectionsEditor
            sections={settings.home.sections}
            onChange={(sections) => updateHome('sections', sections)}
          />
        </section>

        <section className="surface-panel rounded-2xl p-5">
          <div className="mb-5">
            <h3 className="font-semibold">Typography</h3>
            <p className="mt-1 text-xs leading-5 text-neutral-500 dark:text-neutral-400">
              Enter exact pixel sizes. Large headings remain fluid on smaller screens.
            </p>
          </div>
          <TypographyEditor sizes={settings.fontSizes} onChange={updateFontSize} />
        </section>

        <section className="surface-panel rounded-2xl p-5">
          <h3 className="mb-4 font-semibold">Footer</h3>
          <div className="grid gap-4">
            <Field label="Title" value={settings.footer.title} onChange={(v) => updateSection('footer', 'title', v)} />
            <Field label="Description" value={settings.footer.description} onChange={(v) => updateSection('footer', 'description', v)} multiline />
          </div>
        </section>
      </div>
    </div>
  )
}
