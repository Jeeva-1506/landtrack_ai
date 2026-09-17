import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";

const __filename = typeof import.meta !== "undefined" && import.meta.url ? fileURLToPath(import.meta.url) : __filename;
const __dirname = typeof import.meta !== "undefined" && import.meta.url ? path.dirname(__filename) : __dirname;

let cachedJsonData: any = null;

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getLegacySeedData(): any {
  const dbFile = path.join(__dirname, "../../../database/data/db.json");
  const datasetFile = path.join(__dirname, "../../../database/data/new_land_dataset.json");
  let data: any = { projects: [], parcels: [], landParcels: [], alerts: [], documents: [] };

  if (fs.existsSync(dbFile)) {
    try {
      const raw = fs.readFileSync(dbFile, "utf-8");
      data = JSON.parse(raw);
    } catch (e) {
      console.error("Error reading db.json:", e);
    }
  }

  const parcelMap = new Map<string, any>();
  if (Array.isArray(data.parcels)) {
    data.parcels.forEach((p: any) => parcelMap.set(p.id, p));
  }

  if (fs.existsSync(datasetFile)) {
    try {
      const rawDataset = fs.readFileSync(datasetFile, "utf-8");
      const parsedDataset = JSON.parse(rawDataset);
      if (parsedDataset && Array.isArray(parsedDataset.parcels)) {
        parsedDataset.parcels.forEach((p: any) => parcelMap.set(p.id, p));
      }
    } catch (e) {
      console.error("Error reading new_land_dataset.json:", e);
    }
  }

  const docFile = path.join(__dirname, "../../../database/data/document_dataset.json");
  const docMap = new Map<string, any>();
  if (Array.isArray(data.documents)) {
    data.documents.forEach((d: any) => docMap.set(d.Document_ID || d.id, d));
  }

  if (fs.existsSync(docFile)) {
    try {
      const rawDoc = fs.readFileSync(docFile, "utf-8");
      const parsedDoc = JSON.parse(rawDoc);
      if (parsedDoc && Array.isArray(parsedDoc.documents)) {
        parsedDoc.documents.forEach((d: any) => {
          // Normalize schema for UI compatibility if needed
          const normalized = {
            id: d.Document_ID,
            name: d.Document_Title,
            parcelId: d.Parcel_ID || d.Case_ID,
            surveyNumber: d.Survey_Number,
            text: d.Extracted_Content,
            category: d.Document_Category,
            risk: d.Verification_Status === 'Mismatch' ? 'High' : d.Verification_Status === 'Requires Review' ? 'Medium' : 'Low',
            verificationStatus: d.Verification_Status,
            issuesDetected: d.Issue_Detected,
            confidence: 94,
            importantTerms: (d.Keywords || "").split(";").map((k: string) => k.trim()),
            fileType: d.Document_Type,
            fileSize: `${d.File_Size_KB} KB`,
            uploadDate: d.Uploaded_Date,
            ...d
          };
          docMap.set(d.Document_ID, normalized);
        });
      }
    } catch (e) {
      console.error("Error reading document_dataset.json:", e);
    }
  }

  data.documents = Array.from(docMap.values());
  const combinedParcels = Array.from(parcelMap.values());
  data.parcels = combinedParcels;
  data.landParcels = combinedParcels;

  return data;
}

export function saveLegacySeedData(updatedData: any): void {
  const dbFile = path.join(__dirname, "../../../database/data/db.json");
  try {
    fs.writeFileSync(dbFile, JSON.stringify(updatedData, null, 2), "utf-8");
  } catch (e) {
    console.error("Error writing db.json:", e);
  }
}
