import React, { useState } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  convertToRaw,
  convertFromRaw,
  Modifier,
} from 'draft-js';
import 'draft-js/dist/Draft.css';

const TextEditor = () => {
  const HEADING_TYPE = 'header-one';
  const BOLD_TYPE = 'BOLD';
  const RED_LINE = 'RED_LINE';
  const UNDERLINE = 'UNDERLINE';

  const [editorState, setEditorState] = useState(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      const content = convertFromRaw(JSON.parse(savedContent));
      return EditorState.createWithContent(content);
    }
    return EditorState.createEmpty();
  });
  const removeSpecialChar = (editorState, count) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const updatedContent = Modifier.replaceText(
      content,
      selection.merge({
        anchorOffset: 0,
        focusOffset: count,
      }),
      ''
    );

    return EditorState.push(editorState, updatedContent, 'remove-range');
  };

  const handleBeforeInput = (char, editorState) => {
    if (char === ' ') {
      const selection = editorState.getSelection();
      const block = editorState.getCurrentContent().getBlockForKey(selection.getStartKey());
      const blockText = block.getText();

      if (blockText === '#') {
        const newEditorState = removeSpecialChar(editorState, 1);
        const withHeaderStyle = RichUtils.toggleBlockType(newEditorState, HEADING_TYPE);
        setEditorState(withHeaderStyle);
        return 'handled';
      } else if (blockText.startsWith('*') && blockText[1] !== '*') {
        const newEditorState = removeSpecialChar(editorState, 1);
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, BOLD_TYPE));
        return 'handled';
      } else if (blockText.startsWith('**') && blockText[2] !== '*') {
        const newEditorState = removeSpecialChar(editorState, 2);
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, RED_LINE));
        return 'handled';
      } else if (blockText.startsWith('***')) {
        const newEditorState = removeSpecialChar(editorState, 3);
        setEditorState(RichUtils.toggleInlineStyle(newEditorState, UNDERLINE));
        return 'handled';
      }
    }
    return 'not-handled';
  };
  const styleMap = {
    [RED_LINE]: { color: 'red'  },
    [UNDERLINE]: { textDecoration: 'underline' },
  };
  const saveContent = () => {
    const content = editorState.getCurrentContent();
    const rawContent = convertToRaw(content);
    localStorage.setItem('editorContent', JSON.stringify(rawContent));
  };

  const blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === HEADING_TYPE) {
      return 'header-one';
    }
  };
  const handleReturn = (e, editorState) => {
    const selection = editorState.getSelection();
    const content = editorState.getCurrentContent();
    const newContent = Modifier.splitBlock(content, selection);
    const newEditorState = EditorState.push(editorState, newContent, 'split-block');
    const blockKey = newContent.getKeyAfter(selection.getStartKey());
    const updatedContent = Modifier.setBlockType(
      newContent,
      newEditorState.getSelection().merge({
        focusKey: blockKey,
        focusOffset: 0,
        anchorKey: blockKey,
        anchorOffset: 0,
      }),
      'unstyled' 
    );
    const updatedEditorState = EditorState.push(newEditorState, updatedContent, 'change-block-type');
    setEditorState(updatedEditorState);
    return 'handled';
  };

  return (
    <div className="p-5 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-center">Draft Editor By Jeevabarathi</h1>
        <button
          onClick={saveContent}
          className="bg-blue-500 text-white border-none py-2 px-4 rounded cursor-pointer hover:bg-blue-600"
        >
          Save
        </button>
      </div>

      <div className="mt-5 border border-gray-300 rounded p-3 min-h-[300px] bg-gray-50">
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleBeforeInput={(char) => handleBeforeInput(char, editorState)}
          handleReturn={(e) => handleReturn(e, editorState)}
          customStyleMap={styleMap}
          blockStyleFn={blockStyleFn}
        />

      </div>
      <style jsx>{`
        .header-one {
          font-size: 2em;
          font-weight: bold;
          margin-bottom: 0.5em;
        }
      `}</style>
    </div>
  );
};

export default TextEditor;

