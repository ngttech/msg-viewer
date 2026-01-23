import type { Message } from "../../msg/types/message";

/**
 * Generates an RFC 5322 compliant .eml file from a parsed MSG message
 */
export function generateEml(message: Message): string {
  const { content, recipients, attachments } = message;
  
  // Generate boundary for MIME multipart
  const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  
  // Build headers
  const headers: string[] = [];
  
  // From header
  const fromEmail = sanitizeHeaderValue(content.senderEmail || "unknown@unknown.com");
  const fromName = sanitizeHeaderValue(content.senderName || "");
  const fromHeader = fromName 
    ? `${encodeHeaderValue(fromName)} <${fromEmail}>`
    : fromEmail;
  headers.push(`From: ${fromHeader}`);
  
  // To header
  const toRecipients = getRecipientsList(recipients, content.toRecipients, "to");
  if (toRecipients.length > 0) {
    headers.push(`To: ${toRecipients.join(", ")}`);
  }
  
  // Cc header
  const ccRecipients = getRecipientsList(recipients, content.ccRecipients, "cc");
  if (ccRecipients.length > 0) {
    headers.push(`Cc: ${ccRecipients.join(", ")}`);
  }
  
  // Subject header
  const subject = sanitizeHeaderValue(content.subject || "(No Subject)");
  headers.push(`Subject: ${encodeHeaderValue(subject)}`);
  
  // Date header
  const date = content.date ? toRfc2822Date(content.date) : toRfc2822Date(new Date());
  headers.push(`Date: ${date}`);
  
  // MIME headers
  headers.push(`MIME-Version: 1.0`);
  
  // Filter attachments (exclude embedded MSG objects)
  const realAttachments = attachments.filter(a => a.content && !a.embeddedMsgObj);
  
  // Determine content type
  const hasAttachments = realAttachments.length > 0;
  
  if (hasAttachments) {
    headers.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
  } else {
    // Single part message
    const isHtml = content.bodyHTML && content.bodyHTML.trim().length > 0;
    if (isHtml) {
      headers.push(`Content-Type: text/html; charset="utf-8"`);
      headers.push(`Content-Transfer-Encoding: base64`);
    } else {
      headers.push(`Content-Type: text/plain; charset="utf-8"`);
      headers.push(`Content-Transfer-Encoding: quoted-printable`);
    }
  }
  
  // Build body
  const parts: string[] = [];
  
  // Add headers
  parts.push(headers.join("\r\n"));
  parts.push("\r\n");
  
  if (hasAttachments) {
    // Multipart message with body and attachments
    parts.push(`This is a multi-part message in MIME format.\r\n`);
    parts.push(`\r\n--${boundary}\r\n`);
    
    // Body part
    const isHtml = content.bodyHTML && content.bodyHTML.trim().length > 0;
    const bodyContent = isHtml ? content.bodyHTML : content.body || "";
    
    if (isHtml) {
      parts.push(`Content-Type: text/html; charset="utf-8"\r\n`);
      parts.push(`Content-Transfer-Encoding: base64\r\n`);
      parts.push(`\r\n`);
      parts.push(wrap76(bytesToBase64(new TextEncoder().encode(bodyContent))));
    } else {
      parts.push(`Content-Type: text/plain; charset="utf-8"\r\n`);
      parts.push(`Content-Transfer-Encoding: quoted-printable\r\n`);
      parts.push(`\r\n`);
      parts.push(quotedPrintableEncode(bodyContent));
    }
    
    // Attachment parts
    for (const attachment of realAttachments) {
      parts.push(`\r\n--${boundary}\r\n`);
      
      const mimeType = attachment.mimeType || "application/octet-stream";
      const fileName = sanitizeFilename(attachment.displayName || attachment.fileName || "attachment");
      
      parts.push(`Content-Type: ${mimeType}; name="${encodeHeaderValue(fileName)}"\r\n`);
      parts.push(`Content-Transfer-Encoding: base64\r\n`);
      parts.push(`Content-Disposition: attachment; filename="${encodeHeaderValue(fileName)}"\r\n`);
      parts.push(`\r\n`);
      
      // Convert Buffer/DataView to base64
      const attachmentBytes = bufferToUint8Array(attachment.content);
      parts.push(wrap76(bytesToBase64(attachmentBytes)));
    }
    
    // End boundary
    parts.push(`\r\n--${boundary}--\r\n`);
  } else {
    // Single part message (no attachments)
    const isHtml = content.bodyHTML && content.bodyHTML.trim().length > 0;
    const bodyContent = isHtml ? content.bodyHTML : content.body || "";
    
    if (isHtml) {
      parts.push(wrap76(bytesToBase64(new TextEncoder().encode(bodyContent))));
    } else {
      parts.push(quotedPrintableEncode(bodyContent));
    }
  }
  
  return parts.join("");
}

/**
 * Get recipients list from parsed recipients or fallback string
 */
function getRecipientsList(
  recipients: Array<{ name: string; email: string }>,
  fallbackString: string,
  type: "to" | "cc"
): string[] {
  // Try to use structured recipients first
  const filtered = recipients.filter(r => {
    // We don't have a type field, so we'll use the fallback string to determine
    if (fallbackString) {
      const cleanFallback = fallbackString.endsWith('\x00') 
        ? fallbackString.slice(0, -1) 
        : fallbackString;
      return cleanFallback.includes(r.name);
    }
    return false;
  });
  
  if (filtered.length > 0) {
    return filtered.map(r => {
      const name = sanitizeHeaderValue(r.name);
      const email = sanitizeHeaderValue(r.email);
      return name ? `${encodeHeaderValue(name)} <${email}>` : email;
    });
  }
  
  // Fallback to parsing the string
  if (fallbackString) {
    const cleanStr = fallbackString.endsWith('\x00') 
      ? fallbackString.slice(0, -1) 
      : fallbackString;
    
    return cleanStr.split(";").map(s => s.trim()).filter(s => s.length > 0);
  }
  
  return [];
}

/**
 * Convert Date to RFC 2822 format (e.g., "Mon, 23 Jan 2026 10:30:00 +0000")
 */
function toRfc2822Date(date: Date): string {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const day = days[date.getUTCDay()];
  const dateNum = String(date.getUTCDate()).padStart(2, "0");
  const month = months[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  
  return `${day}, ${dateNum} ${month} ${year} ${hours}:${minutes}:${seconds} +0000`;
}

/**
 * Encode header value using RFC 2047 encoded-word if it contains non-ASCII
 */
function encodeHeaderValue(value: string): string {
  // Check if encoding is needed
  if (/^[\x20-\x7E]*$/.test(value)) {
    // Only ASCII printable characters, no encoding needed
    return value;
  }
  
  // Use RFC 2047 encoded-word: =?UTF-8?B?...?=
  const encoded = bytesToBase64(new TextEncoder().encode(value));
  return `=?UTF-8?B?${encoded}?=`;
}

/**
 * Sanitize header value by removing CRLF and null terminators
 */
function sanitizeHeaderValue(value: string): string {
  if (!value) return "";
  return value
    .replace(/[\r\n\x00]/g, "")
    .trim();
}

/**
 * Sanitize filename for attachment
 */
function sanitizeFilename(filename: string): string {
  if (!filename) return "attachment";
  return filename
    .replace(/[\r\n\x00]/g, "")
    .replace(/[\/\\:*?"<>|]/g, "_")
    .trim();
}

/**
 * Convert Uint8Array to base64 string
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Convert Buffer or DataView to Uint8Array
 */
function bufferToUint8Array(buffer: any): Uint8Array {
  if (buffer instanceof Uint8Array) {
    return buffer;
  }
  if (buffer instanceof DataView) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  if (buffer instanceof ArrayBuffer) {
    return new Uint8Array(buffer);
  }
  if (buffer.buffer instanceof ArrayBuffer) {
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  }
  // Fallback
  return new Uint8Array(buffer);
}

/**
 * Wrap base64 string to 76 characters per line with CRLF
 */
function wrap76(text: string): string {
  const lines: string[] = [];
  for (let i = 0; i < text.length; i += 76) {
    lines.push(text.substring(i, i + 76));
  }
  return lines.join("\r\n") + "\r\n";
}

/**
 * Encode text using Quoted-Printable encoding
 */
function quotedPrintableEncode(text: string): string {
  const lines = text.split(/\r\n|\r|\n/);
  const encoded: string[] = [];
  
  for (const line of lines) {
    let encodedLine = "";
    let lineLength = 0;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const code = char.charCodeAt(0);
      
      // Characters that need encoding
      if (code < 33 || code > 126 || char === "=") {
        const hex = code.toString(16).toUpperCase().padStart(2, "0");
        const encoded = `=${hex}`;
        
        // Soft line break if needed
        if (lineLength + encoded.length > 75) {
          encodedLine += "=\r\n";
          lineLength = 0;
        }
        
        encodedLine += encoded;
        lineLength += encoded.length;
      } else {
        // Soft line break if needed
        if (lineLength + 1 > 75) {
          encodedLine += "=\r\n";
          lineLength = 0;
        }
        
        encodedLine += char;
        lineLength += 1;
      }
    }
    
    encoded.push(encodedLine);
  }
  
  return encoded.join("\r\n") + "\r\n";
}
