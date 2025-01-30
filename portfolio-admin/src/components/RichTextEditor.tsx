import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import TextAlign from '@tiptap/extension-text-align';

const MenuBar = ({ editor }: any) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-[#3A3A3A] p-2 mb-4 flex flex-wrap gap-2">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('bold')
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        Gras
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('italic')
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        Italique
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('underline')
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        Souligné
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('heading', { level: 2 })
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        Titre
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('bulletList')
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        Liste à puces
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`px-2 py-1 rounded ${
          editor.isActive('orderedList')
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        Liste numérotée
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`px-2 py-1 rounded ${
          editor.isActive({ textAlign: 'left' })
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        ←
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`px-2 py-1 rounded ${
          editor.isActive({ textAlign: 'center' })
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        ↔
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`px-2 py-1 rounded ${
          editor.isActive({ textAlign: 'right' })
            ? 'bg-blue-500 text-white'
            : 'bg-[#2A2A2A] text-gray-300 hover:bg-[#3A3A3A]'
        }`}
      >
        →
      </button>
      <input
        type="color"
        onInput={(e: React.FormEvent<HTMLInputElement>) => 
          editor.chain().focus().setColor((e.target as HTMLInputElement).value).run()
        }
        value={editor.getAttributes('textStyle').color || '#ffffff'}
        className="w-8 h-8 p-0 bg-transparent border-none cursor-pointer"
        title="Choisir la couleur"
      />
    </div>
  );
};

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ content, onChange }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
        alignments: ['left', 'center', 'right'],
        defaultAlignment: 'left',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none prose-invert min-h-[200px] text-white p-4',
      },
    },
  });

  return (
    <div className="bg-[#2A2A2A] rounded-lg border border-[#3A3A3A] overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
