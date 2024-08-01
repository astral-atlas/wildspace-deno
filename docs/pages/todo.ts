import { markdownToSheet } from "../../modules/ComponentDoc/markdown";
import todoText from './documents/todo.md?raw';

export const todoDoc = markdownToSheet('Todo', todoText);
