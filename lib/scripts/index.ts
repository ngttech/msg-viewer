import { messageFragment } from "../components/message";
import { errorFragment } from "../components/error";
import type { Message } from "./msg/types/message";
import { parse, parseDir } from "@molotochok/msg-viewer";

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

// File Upload
const $file = document.getElementById("file")!;

$file.addEventListener("change", async (event) => {
  const target = event.target as HTMLInputElement;
  if (target?.files?.length === 0) return;
  updateMessage(target.files!);
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
    <h2 class="dropzone-title">Drop your .msg file here</h2>
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

target.addEventListener("drop", (event) => {
  event.preventDefault();
  if (dropzone) {
    dropzone.classList.remove("dragover");
  }
  
  const files = event.dataTransfer!.files;
  if (files.length == 0) return;
  if (!files[0].name.endsWith(".msg")) return;
  
  const $file = document.getElementById("file")! as HTMLInputElement;
  $file.files = files;
  updateMessage(files);
});

async function updateMessage(files: FileList) {
  const arrayBuffer = await files[0].arrayBuffer();
  const $msg = document.getElementById("msg")!;
  
  // Show loading state
  $msg.innerHTML = `
    <div class="dropzone">
      <div class="dropzone-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="var(--accentOrange)">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      </div>
      <h2 class="dropzone-title">Loading message...</h2>
    </div>
  `;
  
  renderMessage($msg, 
    () => parse(new DataView(arrayBuffer)), 
    (fragment) => {
      $msg.replaceChildren(fragment);
      dropzone = null;
    }
  );
}

function renderMessage($msg: HTMLElement, getMessage: () => Message, updateDom: (fragment: DocumentFragment) => void) {
  let fragment: DocumentFragment;
  try {    
    const message = getMessage();
    fragment = messageFragment(message, dir => {
      renderMessage($msg,
        () => parseDir(message.file, dir), 
        (fragment) => {
          for (let i = 0; i < $msg.children.length; i++) {
            const child = $msg.children[i] as HTMLElement;
            child.classList.add("hidden");
          };
          $msg.appendChild(fragment)
        }
      );
    });
  } catch (e) {
    window.gtag('event', 'exception', { 'description': e, 'fatal': true });
    fragment = errorFragment(`An error occured during the parsing of the .msg file. Error: ${e}`);
  }

  updateDom(fragment);
}