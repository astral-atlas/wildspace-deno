import { WhiteboardChannel } from "../channel.ts";
import { WhiteboardState } from "../state.ts";
import { act, hash } from "../deps.ts";
import { Note, WhiteboardCursor, WhiteboardStroke } from "../models.ts";
const { h, useState, useEffect, useRef } = act;

export const useWhiteboardState = (
  channel: WhiteboardChannel
): WhiteboardState => {
  const [strokes, setStrokes] = useState<WhiteboardStroke[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [cursors, setCursors] = useState<WhiteboardCursor[]>([]);

  useEffect(() => {
    const subscription = channel.recieve.subscribe((event) => {
      switch (event.type) {
        case 'initialize':
          return setCursors([...event.cursors]);
        case "pointer-spawn":
          return setCursors((cs) => [...cs, event.cursor]);
        case "pointer-move":
          return setCursors((cs) =>
            cs.map((c) =>
              c.id === event.cursorId ? { ...c, position: event.position } : c
            )
          );
        case 'stroke-create':
          return setStrokes(ss => [...ss, event.stroke])
        case 'stroke-update':
          return setStrokes(ss => ss.map(s => s.id === event.stroke.id ? event.stroke : s))
        case "pointer-despawn":
          return setCursors((cs) =>
            cs.filter((c) => c.id !== event.cursorId)
          );
        case 'note-create':
          return setNotes(ns => [...ns, event.note])
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return {
    cursors: [...new Map(cursors.map(c => [c.id, c])).values()],
    strokes,
    notes
  };
}