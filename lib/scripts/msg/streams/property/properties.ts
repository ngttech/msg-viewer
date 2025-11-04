import { PtypBinary, PtypObject, PtypString, PtypString8, PtypTime, PtypInteger32, type PropertyType } from "./property-types";

export const enum PropertySource { 
  Stream, // Property can be found in a dedicated stream
  Property // Property is located in property stream
}

export const CODEPAGE_PROPERTY: Property = { id: "3FDE", name:"codepage", types: [PtypInteger32], source: PropertySource.Property };

export const CODEPAGES = new Map<number, string>([
  [874, "windows-874"],
  [932, "shift_jis"],
  [936, "gb2312"],
  [949, "big5"],
  [1200, "utf-16"],
  [1201, "utf-16be"],
  [1250, "windows-1250"],
  [1251, "windows-1251"],
  [1252, "windows-1252"],
  [1253, "windows-1253"],
  [1254, "windows-1254"],
  [1255, "windows-1255"],
  [1256, "windows-1256"],
  [1257, "windows-1257"],
  [1258, "windows-1258"],
  [20127, "us-ascii"],
  [20866, "koi8-r"],
  [21866, "koi8-u"],
  [28591, "iso-8859-1"],
  [28592, "iso-8859-2"],
  [28593, "iso-8859-3"],
  [28594, "iso-8859-4"],
  [28595, "iso-8859-5"],
  [28596, "iso-8859-6"],
  [28597, "iso-8859-7"],
  [38598, "iso-8859-8"],
  [28599, "iso-8859-9"],
  [28603, "iso-8859-13"],
  [28604, "iso-8859-14"],
  [28605, "iso-8859-15"],
  [28606, "iso-8859-16"],
  [50220, "iso-2022-jp"],
  [50221, "csISO2022JP"],
  [51932, "euc-jp"],
  [51949, "euc-kr"],
  [52936, "gb_2312"],
  [65001, "utf-8"],
]);

export const ROOT_PROPERTIES: Property[] = [
  { id: "0E06", name:"date", types: [PtypTime], source: PropertySource.Property },
  { id: "0037", name:"subject", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "0c1a", name:"senderName", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "0c1f", name:"senderEmail", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "1000", name:"body", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "1013", name:"bodyHTML", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "1009", name:"bodyRTF", types: [PtypBinary, PtypString8], source: PropertySource.Stream },
  { id: "007d", name:"headers", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "0E04", name:"toRecipients", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "0E03", name:"ccRecipients", types: [PtypString, PtypString8], source: PropertySource.Stream },
];

export const ATTACH_PROPERTIES: Property[]= [
  { id: "3703", name:"extension", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "3707", name:"fileName", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "370e", name:"mimeType", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "3A0C", name:"language", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "3001", name:"displayName", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "3701", name:"content", types: [PtypBinary], source: PropertySource.Stream },
  { id: "3701", name:"embeddedMsgObj", types: [PtypObject], source: PropertySource.Stream },
];

export const RECIP_PROPERTIES: Property[] = [
  { id: "3001", name:"name", types: [PtypString, PtypString8], source: PropertySource.Stream },
  { id: "39fe", name:"email", types: [PtypString, PtypString8], source: PropertySource.Stream },
];

export interface Property {
  id: string,
  name: string,
  types: PropertyType[],
  source: PropertySource,
}
