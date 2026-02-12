import type { Message } from "../../msg/types/message";
import { bytesWithUnits } from "../file-size-util";

interface PrintOptions {
  includeAttachments: boolean;
}

export function askPrintAttachmentPreference(): PrintOptions | null {
  const includeAttachments = window.confirm(
    "Include attachment details in the printout?\n\nSelect OK to include attachment names/sizes.\nSelect Cancel to print email content only."
  );

  return { includeAttachments };
}

export function printMessages(messages: Message[], options: PrintOptions): void {
  if (messages.length === 0) return;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.setAttribute("aria-hidden", "true");

  document.body.appendChild(iframe);
  const printDocument = iframe.contentDocument;
  const printWindow = iframe.contentWindow;

  if (!printDocument || !printWindow) {
    iframe.remove();
    throw new Error("Print window is unavailable.");
  }

  const content = buildPrintableHtml(messages, options);
  printDocument.open();
  printDocument.write(content);
  printDocument.close();

  const cleanup = () => {
    setTimeout(() => iframe.remove(), 500);
  };

  printWindow.onafterprint = cleanup;

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    cleanup();
  }, 50);
}

function buildPrintableHtml(messages: Message[], options: PrintOptions): string {
  const renderedMessages = messages
    .map((message, index) => renderMessageSection(message, index, options))
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Printed Email Messages</title>
    <style>
      :root { color-scheme: light; }
      body {
        margin: 0;
        padding: 24px;
        font-family: Arial, Helvetica, sans-serif;
        color: #111;
      }
      .print-message {
        border: 1px solid #d7d7d7;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 16px;
      }
      .print-message:last-child {
        margin-bottom: 0;
      }
      .print-message h2 {
        margin: 0 0 12px;
        font-size: 20px;
      }
      .meta-row {
        margin: 4px 0;
        font-size: 13px;
      }
      .meta-label {
        font-weight: 700;
      }
      .body-label {
        margin: 16px 0 8px;
        font-weight: 700;
      }
      .message-body {
        margin: 0;
        border: 1px solid #e8e8e8;
        border-radius: 6px;
        padding: 12px;
        background: #fafafa;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: "Courier New", Courier, monospace;
        font-size: 12px;
        line-height: 1.5;
      }
      .attachments-list {
        margin: 8px 0 0;
        padding-left: 18px;
      }
      .attachments-list li {
        margin-bottom: 4px;
        font-size: 13px;
      }
      .message-separator {
        page-break-after: always;
      }
      .message-separator:last-child {
        page-break-after: auto;
      }
    </style>
  </head>
  <body>
    ${renderedMessages}
  </body>
</html>`;
}

function renderMessageSection(message: Message, index: number, options: PrintOptions): string {
  const content = message.content;
  const sender = formatSender(content.senderName, content.senderEmail);
  const date = content.date ? new Date(content.date).toLocaleString() : "";

  const recipients = [
    formatRecipientField("To", content.toRecipients),
    formatRecipientField("Cc", content.ccRecipients),
  ].join("");

  const attachmentsSection = options.includeAttachments ? renderAttachments(message) : "";
  const subject = escapeHtml(content.subject || "Untitled message");
  const body = escapeHtml(content.body || "(No message body)");

  return `<section class="print-message message-separator">
    <h2>${subject}</h2>
    <div class="meta-row"><span class="meta-label">From:</span> ${escapeHtml(sender || "Unknown Sender")}</div>
    <div class="meta-row"><span class="meta-label">Date:</span> ${escapeHtml(date || "Unknown Date")}</div>
    ${recipients}
    <div class="body-label">Body</div>
    <pre class="message-body">${body}</pre>
    ${attachmentsSection}
    <div class="meta-row"><span class="meta-label">Message #:</span> ${index + 1}</div>
  </section>`;
}

function renderAttachments(message: Message): string {
  const attachments = message.attachments.filter((attachment) => attachment.content);
  if (attachments.length === 0) {
    return `<div class="body-label">Attachments</div><div class="meta-row">No attachments</div>`;
  }

  const items = attachments
    .map((attachment) => {
      const name = attachment.displayName || attachment.fileName || "Unnamed attachment";
      const size = bytesWithUnits(attachment.content.byteLength);
      const mimeType = attachment.mimeType || "application/octet-stream";

      return `<li>${escapeHtml(name)} - ${escapeHtml(size)} - ${escapeHtml(mimeType)}</li>`;
    })
    .join("");

  return `<div class="body-label">Attachments</div><ul class="attachments-list">${items}</ul>`;
}

function formatSender(senderName?: string, senderEmail?: string): string {
  if (senderName && senderEmail) return `${senderName} <${senderEmail}>`;
  return senderName || senderEmail || "";
}

function formatRecipientField(label: string, rawValue?: string): string {
  if (!rawValue?.trim()) return "";
  return `<div class="meta-row"><span class="meta-label">${label}:</span> ${escapeHtml(rawValue.trim())}</div>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
