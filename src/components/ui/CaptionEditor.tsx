'use client';

import { useEditor, EditorContent, ReactRenderer, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import { searchEmojis } from '@/lib/emojis';

interface CaptionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

interface EmojiItem {
  emoji: string;
  keywords: string[];
}

interface SuggestionProps {
  items: EmojiItem[];
  command: (item: { id: string }) => void;
}

interface EmojiListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const EmojiList = forwardRef<EmojiListRef, SuggestionProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.emoji });
    }
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((prev) => (prev + props.items.length - 1) % props.items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((prev) => (prev + 1) % props.items.length);
        return true;
      }
      if (event.key === 'Enter') {
        selectItem(selectedIndex);
        return true;
      }
      return false;
    },
  }));

  if (props.items.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden max-h-60 overflow-y-auto">
      {props.items.map((item, index) => (
        <button
          key={item.emoji}
          className={`w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-gray-100 ${
            index === selectedIndex ? 'bg-blue-50' : ''
          }`}
          onClick={() => selectItem(index)}
        >
          <span className="text-xl">{item.emoji}</span>
          <span className="text-sm text-gray-600">:{item.keywords[0]}:</span>
        </button>
      ))}
    </div>
  );
});

EmojiList.displayName = 'EmojiList';

// Create the suggestion configuration outside the component to avoid circular reference
const suggestionConfig = {
  char: ':',
  items: ({ query }: { query: string }) => {
    return searchEmojis(query);
  },
  render: () => {
    let component: ReactRenderer<EmojiListRef> | null = null;
    let popup: TippyInstance | null = null;

    return {
      onStart: (props: { editor: Editor; clientRect?: (() => DOMRect | null) | null }) => {
        component = new ReactRenderer(EmojiList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) return;

        const clientRectFn = props.clientRect;

        popup = tippy(document.body, {
          getReferenceClientRect: () => clientRectFn() || new DOMRect(),
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: { clientRect?: (() => DOMRect | null) | null }) {
        component?.updateProps(props);

        if (popup && props.clientRect) {
          const clientRectFn = props.clientRect;
          popup.setProps({
            getReferenceClientRect: () => clientRectFn() || new DOMRect(),
          });
        }
      },

      onKeyDown(props: { event: KeyboardEvent }) {
        if (props.event.key === 'Escape') {
          popup?.hide();
          return true;
        }
        return component?.ref?.onKeyDown(props) ?? false;
      },

      onExit() {
        popup?.destroy();
        component?.destroy();
      },
    };
  },
};

export function CaptionEditor({ value, onChange, placeholder = 'Write your caption...' }: CaptionEditorProps) {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        bulletList: false,
        orderedList: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'emoji-mention',
        },
        suggestion: suggestionConfig,
        renderText({ node }) {
          return node.attrs.id;
        },
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getText());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[80px] px-3 py-2',
      },
    },
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getText()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    if (editor) {
      editor.chain().focus().insertContent(emojiData.emoji).run();
    }
    setShowEmojiPicker(false);
  }, [editor]);

  return (
    <div className="relative">
      <div className="border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
        <EditorContent editor={editor} />
        <div className="flex items-center justify-between px-2 py-1 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
              title="Add emoji"
            >
              <span className="text-lg">😊</span>
            </button>
            <span className="text-xs text-gray-400">
              Type <code className="bg-gray-200 px-1 rounded">:keyword</code> for emoji
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {editor?.getText().length || 0} characters
          </span>
        </div>
      </div>

      {showEmojiPicker && (
        <div className="absolute z-50 mt-1">
          <div
            className="fixed inset-0"
            onClick={() => setShowEmojiPicker(false)}
          />
          <div className="relative">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={320}
              height={400}
            />
          </div>
        </div>
      )}
    </div>
  );
}
