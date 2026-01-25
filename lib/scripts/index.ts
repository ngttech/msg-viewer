import { messageFragment } from "../components/message";
import { errorFragment } from "../components/error";
import type { Message } from "./msg/types/message";
import { parse, parseDir } from "@molotochok/msg-viewer";
import { generateEml } from "./utils/eml/generate-eml";

// Theme Toggle
const $themeToggle = document.getElementById("theme-toggle")!;
const savedTheme = localStorage.getItem("theme") || "dark";
document.body.setAttribute("data-theme", savedTheme);

$themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.getAttribute("data-theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
});

// Multi-file state management
interface MessageItem {
  id: string;
  fileName: string;
  message: Message | null;
  preview: {
    sender: string;
    subject: string;
    snippet: string;
    date: Date | null;
  };
  error?: string;
}

let messages: MessageItem[] = [];
let selectedId: string | null = null;
let selectedIds = new Set<string>(); // for multi-select checkboxes

// File Upload
const $file = document.getElementById("file")!;

$file.addEventListener("change", async (event) => {
  const target = event.target as HTMLInputElement;
  if (target?.files?.length === 0) return;
  await addMessages(target.files!);
});

// To reset the file input
$file.addEventListener("click", (event) => (event.target as HTMLInputElement).value = "");

// Drag and Drop
const $msg = document.getElementById("msg")!;
let dropzone: HTMLElement | null = null;

// Create initial dropzone
function createDropzone() {
  const div = document.createElement("div");
  div.className = "dropzone";
  div.innerHTML = `
    <div class="dropzone-icon">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--accentOrange)">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    </div>
    <h2 class="dropzone-title">Drop your .msg files here</h2>
    <p class="dropzone-subtitle">Or click to browse</p>
    <p class="dropzone-note">All local, nothing is uploaded or shared.</p>
  `;
  div.addEventListener("click", () => $file.click());
  return div;
}

// Initialize dropzone if msg is empty
if ($msg.children.length === 0) {
  dropzone = createDropzone();
  $msg.appendChild(dropzone);
}

const target = document.documentElement;
target.addEventListener("dragover", (event) => {
  event.preventDefault();
  if (dropzone) {
    dropzone.classList.add("dragover");
  }
});

target.addEventListener("dragleave", (event) => {
  if (event.target === target && dropzone) {
    dropzone.classList.remove("dragover");
  }
});

target.addEventListener("drop", async (event) => {
  event.preventDefault();
  if (dropzone) {
    dropzone.classList.remove("dragover");
  }
  
  const files = event.dataTransfer!.files;
  if (files.length == 0) return;
  
  // Filter for .msg files only
  const msgFiles: File[] = [];
  for (let i = 0; i < files.length; i++) {
    if (files[i].name.endsWith(".msg")) {
      msgFiles.push(files[i]);
    }
  }
  
  if (msgFiles.length === 0) return;
  
  await addMessages(msgFiles);
});

// Add multiple messages to the list
async function addMessages(files: FileList | File[]) {
  const fileArray = Array.from(files);
  const newMessages: MessageItem[] = [];
  
  for (const file of fileArray) {
    if (!file.name.endsWith(".msg")) continue;
    
    const id = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const messageItem: MessageItem = {
      id,
      fileName: file.name,
      message: null,
      preview: {
        sender: "",
        subject: file.name,
        snippet: "Loading...",
        date: null
      }
    };
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const message = parse(new DataView(arrayBuffer));
      messageItem.message = message;
      messageItem.preview = extractPreview(message, file.name);
    } catch (e) {
      messageItem.error = `Failed to parse: ${e}`;
      messageItem.preview.snippet = `Error: ${e}`;
    }
    
    newMessages.push(messageItem);
  }
  
  // Append to messages array
  messages.push(...newMessages);
  
  // Render preview list
  renderPreviewList();
  
  // Auto-select first message if nothing is selected
  if (selectedId === null && newMessages.length > 0) {
    selectMessage(newMessages[0].id);
  }
}

// Extract preview data from parsed message
function extractPreview(message: Message, fileName: string): MessageItem["preview"] {
  const content = message.content;
  
  // Sender
  let sender = content.senderName ?? "";
  if (content.senderEmail) {
    sender += sender ? ` <${content.senderEmail}>` : content.senderEmail;
  }
  if (!sender) sender = "Unknown Sender";
  
  // Subject
  const subject = content.subject || fileName;
  
  // Snippet - strip HTML and take first 120-160 chars
  let snippet = "";
  if (content.body) {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content.body;
    snippet = tempDiv.textContent || tempDiv.innerText || "";
    snippet = snippet.replace(/\s+/g, " ").trim();
    snippet = snippet.substring(0, 160);
    if (snippet.length === 160) snippet += "...";
  }
  if (!snippet) snippet = "No preview available";
  
  // Date
  const date = content.date || null;
  
  return { sender, subject, snippet, date };
}

// Render the preview list in the middle panel
function renderPreviewList() {
  const $previewList = document.getElementById("preview-list")!;
  
  if (messages.length === 0) {
    $previewList.innerHTML = `
      <div class="preview-empty">
        <p>Upload .msg files to see message previews</p>
      </div>
    `;
    updateBatchDownloadButton();
    return;
  }
  
  $previewList.innerHTML = "";
  
  messages.forEach(msg => {
    const item = document.createElement("div");
    item.className = "preview-item";
    if (msg.id === selectedId) {
      item.classList.add("selected");
    }
    item.dataset.id = msg.id;
    
    const dateStr = formatDate(msg.preview.date);
    
    // Create checkbox
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "preview-checkbox";
    checkbox.dataset.id = msg.id;
    checkbox.checked = selectedIds.has(msg.id);
    
    // Prevent checkbox click from selecting message
    checkbox.addEventListener("click", (e) => {
      e.stopPropagation();
      if (checkbox.checked) {
        selectedIds.add(msg.id);
      } else {
        selectedIds.delete(msg.id);
      }
      updateBatchDownloadButton();
    });
    
    // Create content wrapper
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "preview-item-content";
    contentWrapper.innerHTML = `
      <div class="preview-header-row">
        <div class="preview-sender">${escapeHtml(msg.preview.sender)}</div>
        <div class="preview-date">${dateStr}</div>
      </div>
      <div class="preview-subject">${escapeHtml(msg.preview.subject)}</div>
      <div class="preview-snippet">${escapeHtml(msg.preview.snippet)}</div>
      ${msg.error ? `<div class="preview-error">⚠ ${escapeHtml(msg.error)}</div>` : ""}
    `;
    
    // Add click handler to content wrapper only
    contentWrapper.addEventListener("click", () => selectMessage(msg.id));
    
    // Assemble the item
    item.appendChild(checkbox);
    item.appendChild(contentWrapper);
    
    $previewList.appendChild(item);
  });
  
  updateBatchDownloadButton();
}

// Format date like Outlook (time for today, date for others)
function formatDate(date: Date | null): string {
  if (!date) return "";
  
  const now = new Date();
  const isToday = date.getDate() === now.getDate() &&
                  date.getMonth() === now.getMonth() &&
                  date.getFullYear() === now.getFullYear();
  
  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined
    });
  }
}

// Select and render a message
function selectMessage(id: string) {
  selectedId = id;
  
  // Update preview list selection
  const $previewList = document.getElementById("preview-list")!;
  $previewList.querySelectorAll(".preview-item").forEach(item => {
    if ((item as HTMLElement).dataset.id === id) {
      item.classList.add("selected");
    } else {
      item.classList.remove("selected");
    }
  });
  
  // Find the message
  const messageItem = messages.find(m => m.id === id);
  if (!messageItem) return;
  
  // Clear reading pane
  const $msg = document.getElementById("msg")!;
  
  // If error, show error
  if (messageItem.error || !messageItem.message) {
    const fragment = errorFragment(messageItem.error || "Failed to load message");
    $msg.replaceChildren(fragment);
    return;
  }
  
  // Render message
  renderMessage($msg, messageItem.message);
  dropzone = null;
}

// Render message in reading pane
function renderMessage($msg: HTMLElement, message: Message) {
  let fragment: DocumentFragment;
  try {
    fragment = messageFragment(message, dir => {
      renderMessage($msg, parseDir(message.file, dir));
    });
  } catch (e) {
    window.gtag("event", "exception", { description: e, fatal: true });
    fragment = errorFragment(`An error occured during the parsing of the .msg file. Error: ${e}`);
  }
  
  $msg.replaceChildren(fragment);
}

// Escape HTML for safe rendering
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Update batch download button visibility and state
function updateBatchDownloadButton() {
  const $batchDownloadBtn = document.getElementById("batch-download-btn") as HTMLButtonElement;
  const $batchDeleteBtn = document.getElementById("batch-delete-btn") as HTMLButtonElement;
  
  if ($batchDownloadBtn) {
    if (selectedIds.size >= 2) {
      $batchDownloadBtn.disabled = false;
      $batchDownloadBtn.textContent = `Download Selected (${selectedIds.size})`;
      
      // Re-add icon
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("width", "16");
      icon.setAttribute("height", "16");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("fill", "currentColor");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z");
      icon.appendChild(path);
      $batchDownloadBtn.insertBefore(icon, $batchDownloadBtn.firstChild);
    } else {
      $batchDownloadBtn.disabled = true;
    }
  }
  
  if ($batchDeleteBtn) {
    if (selectedIds.size >= 2) {
      $batchDeleteBtn.disabled = false;
      $batchDeleteBtn.textContent = `Delete Selected (${selectedIds.size})`;
      
      // Re-add icon
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      icon.setAttribute("width", "16");
      icon.setAttribute("height", "16");
      icon.setAttribute("viewBox", "0 0 24 24");
      icon.setAttribute("fill", "currentColor");
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z");
      icon.appendChild(path);
      $batchDeleteBtn.insertBefore(icon, $batchDeleteBtn.firstChild);
    } else {
      $batchDeleteBtn.disabled = true;
    }
  }
}

// Download selected messages as EML files
async function downloadSelectedAsEml() {
  const selectedMessages = Array.from(selectedIds)
    .map(id => messages.find(m => m.id === id))
    .filter(m => m && m.message) as MessageItem[];
  
  for (let i = 0; i < selectedMessages.length; i++) {
    const messageItem = selectedMessages[i];
    try {
      const emlContent = generateEml(messageItem.message!);
      const blob = new Blob([emlContent], { type: "message/rfc822" });
      const url = URL.createObjectURL(blob);
      
      // Sanitize filename
      const sanitizeFilename = (name: string) => {
        return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").substring(0, 200);
      };
      
      const subject = messageItem.message!.content.subject || "message";
      const filename = `${sanitizeFilename(subject)}.eml`;
      
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Add delay between downloads to prevent browser blocking
      if (i < selectedMessages.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (e) {
      console.error(`Failed to download EML for message ${messageItem.id}:`, e);
    }
  }
}

// Select all messages
function selectAllMessages() {
  messages.forEach(msg => {
    if (msg.message && !msg.error) {
      selectedIds.add(msg.id);
    }
  });
  renderPreviewList();
}

// Unselect all messages
function unselectAllMessages() {
  selectedIds.clear();
  renderPreviewList();
}

// Delete selected messages
function deleteSelectedMessages() {
  if (selectedIds.size < 2) return;
  
  // Get IDs to delete
  const idsToDelete = Array.from(selectedIds);
  
  // Remove messages from the array
  messages = messages.filter(msg => !idsToDelete.includes(msg.id));
  
  // Clear selections
  selectedIds.clear();
  
  // If the currently selected message was deleted, clear the reading pane
  if (selectedId && idsToDelete.includes(selectedId)) {
    selectedId = null;
    const $msg = document.getElementById("msg")!;
    
    // Show dropzone or empty state
    if (messages.length === 0) {
      if (!dropzone) {
        dropzone = createDropzone();
        $msg.replaceChildren(dropzone);
      }
    } else {
      // Select the first available message
      selectMessage(messages[0].id);
    }
  }
  
  // Re-render the preview list
  renderPreviewList();
}

// Initialize batch download button and select/unselect all buttons
document.addEventListener("DOMContentLoaded", () => {
  const $batchDownloadBtn = document.getElementById("batch-download-btn");
  if ($batchDownloadBtn) {
    $batchDownloadBtn.addEventListener("click", downloadSelectedAsEml);
  }
  
  const $batchDeleteBtn = document.getElementById("batch-delete-btn");
  if ($batchDeleteBtn) {
    $batchDeleteBtn.addEventListener("click", deleteSelectedMessages);
  }
  
  const $selectAllBtn = document.getElementById("select-all-btn");
  if ($selectAllBtn) {
    $selectAllBtn.addEventListener("click", selectAllMessages);
  }
  
  const $unselectAllBtn = document.getElementById("unselect-all-btn");
  if ($unselectAllBtn) {
    $unselectAllBtn.addEventListener("click", unselectAllMessages);
  }
});