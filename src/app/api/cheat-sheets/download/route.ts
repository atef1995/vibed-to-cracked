import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { prisma } from "@/lib/prisma";
import {
  PDFDocument,
  PDFName,
  PDFArray,
  PDFString,
  rgb,
  degrees,
} from "pdf-lib";
import fs from "fs/promises";
import path from "path";

async function watermarkPdf(
  pdfBytes: ArrayBuffer,
  userEmail: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();
  const label = `${userEmail} · vibed-to-cracked.com`;
  const siteUrl = "https://vibed-to-cracked.com";

  for (const page of pages) {
    const { width, height } = page.getSize();

    // Diagonal repeating stamps across the page
    const stepX = width / 2.5;
    const stepY = height / 3;

    for (let x = 0; x < width + stepX; x += stepX) {
      for (let y = 0; y < height + stepY; y += stepY) {
        page.drawText(label, {
          x: x - 40,
          y: y,
          size: 10,
          color: rgb(0.6, 0.6, 0.6),
          opacity: 0.25,
          rotate: degrees(45),
        });
      }
    }

    // Footer bar with clickable link
    const footerH = 18;
    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: footerH,
      color: rgb(0.95, 0.95, 0.95),
      opacity: 0.85,
    });
    page.drawText(siteUrl, {
      x: 8,
      y: 5,
      size: 8,
      color: rgb(0.2, 0.4, 0.8),
    });

    // Link annotation covering the footer — action must be a registered indirect object
    const actionRef = doc.context.register(
      doc.context.obj({
        Type: PDFName.of("Action"),
        S: PDFName.of("URI"),
        URI: PDFString.of(siteUrl),
      })
    );
    const linkAnnot = doc.context.obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Link"),
      Rect: [0, 0, width, footerH],
      Border: [0, 0, 0],
      A: actionRef,
    });
    const linkRef = doc.context.register(linkAnnot);

    const existing = page.node.get(PDFName.of("Annots"));
    if (existing instanceof PDFArray) {
      existing.push(linkRef);
    } else {
      page.node.set(PDFName.of("Annots"), doc.context.obj([linkRef]));
    }
  }

  return doc.save();
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request });
    const { sheetId } = await request.json();

    if (!sheetId) {
      return NextResponse.json(
        { error: "Sheet ID is required" },
        { status: 400 }
      );
    }

    // Get the cheat sheet
    const cheatSheet = await prisma.cheatSheet.findUnique({
      where: { id: sheetId },
    });

    if (!cheatSheet) {
      return NextResponse.json(
        { error: "Cheat sheet not found" },
        { status: 404 }
      );
    }

    // Check if premium and user has access
    if (cheatSheet.isPremium) {
      if (!token) {
        return NextResponse.json(
          { error: "Authentication required" },
          { status: 401 }
        );
      }
      if (token.subscription === "FREE") {
        return NextResponse.json(
          { error: "Premium content requires subscription" },
          { status: 403 }
        );
      }
    }

    // Increment download count
    await prisma.cheatSheet.update({
      where: { id: sheetId },
      data: { downloadCount: { increment: 1 } },
    });

    // For PDF files: read (local) or fetch (remote), watermark, and stream bytes
    if (cheatSheet.fileFormat.toUpperCase() === "PDF") {
      let pdfBytes: ArrayBuffer;

      if (cheatSheet.downloadUrl.startsWith("local:")) {
        const relativePath = cheatSheet.downloadUrl.slice("local:".length);
        const base = path.resolve(process.cwd(), "private", "downloads");
        const filePath = path.resolve(base, relativePath);
        if (!filePath.startsWith(base + path.sep)) {
          return NextResponse.json(
            { error: "Invalid file path" },
            { status: 400 }
          );
        }
        const buffer = await fs.readFile(filePath);
        pdfBytes = buffer.buffer.slice(
          buffer.byteOffset,
          buffer.byteOffset + buffer.byteLength
        ) as ArrayBuffer;
      } else {
        const fileRes = await fetch(cheatSheet.downloadUrl);
        if (!fileRes.ok) {
          return NextResponse.json(
            { error: "Failed to fetch file" },
            { status: 502 }
          );
        }
        pdfBytes = await fileRes.arrayBuffer();
      }
      const userEmail = (token?.email as string | undefined) ?? "user";
      const watermarked = await watermarkPdf(pdfBytes, userEmail);

      return new NextResponse(Buffer.from(watermarked), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${cheatSheet.slug}.pdf"`,
          "Cache-Control": "no-store",
        },
      });
    }

    // Non-PDF formats: return the URL as before
    return NextResponse.json({
      success: true,
      downloadUrl: cheatSheet.downloadUrl,
      fileName: `${cheatSheet.slug}.${cheatSheet.fileFormat.toLowerCase()}`,
    });
  } catch (error) {
    console.error("Error processing download:", error);
    return NextResponse.json(
      { error: "Failed to process download" },
      { status: 500 }
    );
  }
}
