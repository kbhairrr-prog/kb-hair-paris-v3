'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface RichEditorProps {
  value: string
  onChange: (val: string) => void
  placeholder?: string
  rows?: number
}

export default function RichEditor({ value, onChange, placeholder, rows = 10 }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Link.configure({ openOnClick: false }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value])

  if (!editor) return null

  const btnCls = (active: boolean) =>
    'px-2 py-1 font-sans text-[11px] border cursor-pointer transition-colors ' +
    (active ? 'bg-black text-white border-black' : 'bg-white text-black border-[#e0e0e0] hover:border-black')

  return (
    <div className="border border-[#e0e0e0] focus-within:border-black">
      {/* Barre d outils */}
      <div className="flex flex-wrap gap-1 px-2 py-2 border-b border-[#e0e0e0] bg-[#fafafa]">
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={btnCls(editor.isActive('bold'))}>
          <strong>G</strong>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnCls(editor.isActive('italic'))}>
          <em>I</em>
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnCls(editor.isActive('underline'))}>
          <u>S</u>
        </button>
        <div className="w-px bg-[#e0e0e0] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnCls(editor.isActive('heading', { level: 2 }))}>
          H2
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnCls(editor.isActive('heading', { level: 3 }))}>
          H3
        </button>
        <div className="w-px bg-[#e0e0e0] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnCls(editor.isActive('bulletList'))}>
          • Liste
        </button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnCls(editor.isActive('orderedList'))}>
          1. Liste
        </button>
        <div className="w-px bg-[#e0e0e0] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnCls(editor.isActive({ textAlign: 'left' }))}>
          ←
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnCls(editor.isActive({ textAlign: 'center' }))}>
          ↔
        </button>
        <button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnCls(editor.isActive({ textAlign: 'right' }))}>
          →
        </button>
        <div className="w-px bg-[#e0e0e0] mx-1" />
        <button type="button" onClick={() => editor.chain().focus().undo().run()} className={btnCls(false)}>
          ↩
        </button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()} className={btnCls(false)}>
          ↪
        </button>
      </div>

      {/* Zone de saisie */}
      <EditorContent
        editor={editor}
        className="px-3 py-3 font-sans text-[13px] text-[#444] leading-relaxed outline-none"
        style={{ minHeight: rows * 24 + 'px' }}
      />
    </div>
  )
}
