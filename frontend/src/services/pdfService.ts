import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Story } from '../types';

export interface PDFOptions {
  story: Story;
  filename?: string;
}

/**
 * Preload an image and return a blob URL that html2canvas can render.
 * Falls back to the original URL if fetch fails (e.g., CORS).
 */
async function preloadImageAsBlob(url: string): Promise<string> {
  try {
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch {
    // If fetch fails, try using a canvas approach
    return new Promise<string>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(url); // fallback to original
        }
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }
}

export const pdfService = {
  generatePDF: async (options: PDFOptions): Promise<void> => {
    const { story, filename = `${story.title}.pdf` } = options;
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Container dimensions (pixels) – roughly 16:9 landscape
    const CONTAINER_W = 1400;
    const CONTAINER_H = 800;

    // Vintage background as a solid-ish colour (gradients work in html2canvas)
    const vintageGradient = `linear-gradient(135deg, #d4c4a8 0%, #c9b896 15%, #bfae85 30%, #c4b48f 50%, #d0c19a 70%, #c9b896 85%, #d4c4a8 100%)`;

    // Corner Ornament SVG
    const cornerSVG = (rot: string, pos: string) => `
      <div style="position:absolute;width:50px;height:50px;pointer-events:none;z-index:10;transform:${rot};${pos}">
        <svg viewBox="0 0 100 100" style="width:100%;height:100%">
          <path d="M5,5 Q5,25 15,35 Q5,35 5,55 M5,5 Q25,5 35,15 Q35,5 55,5"
            stroke="#3d3225" stroke-width="2" fill="none" stroke-linecap="round"/>
          <circle cx="5" cy="5" r="3" fill="#3d3225"/>
          <path d="M20,20 Q25,15 30,20 Q35,25 30,30 Q25,35 20,30 Q15,25 20,20" fill="#3d3225" opacity="0.6"/>
        </svg>
      </div>`;

    const fourCorners = () =>
      cornerSVG('rotate(0deg)', 'top:8px;left:8px;') +
      cornerSVG('rotate(90deg)', 'top:8px;right:8px;') +
      cornerSVG('rotate(270deg)', 'bottom:8px;left:8px;') +
      cornerSVG('rotate(180deg)', 'bottom:8px;right:8px;');

    // ---- Pre-load ALL images first so html2canvas can render them ----
    const blobUrls: (string | null)[] = [];
    for (const page of story.pages) {
      if (page.imageUrl) {
        try {
          const blobUrl = await preloadImageAsBlob(page.imageUrl);
          blobUrls.push(blobUrl);
        } catch {
          blobUrls.push(page.imageUrl); // fallback
        }
      } else {
        blobUrls.push(null);
      }
    }

    // ---- Generate each page spread ----
    for (let i = 0; i < story.pages.length; i++) {
      const page = story.pages[i];
      const imgSrc = blobUrls[i];

      // Build key-points HTML
      let keyPointsHTML = '';
      if (page.keyPoints && page.keyPoints.length > 0) {
        const items = page.keyPoints
          .map(
            (pt) =>
              `<li style="font-size:15px;color:#3B4F1E;margin-bottom:5px;display:flex;align-items:start;font-family:Georgia,serif;">
                <span style="color:#6B8E23;margin-right:8px;flex-shrink:0;">•</span>
                <span>${pt}</span>
              </li>`
          )
          .join('');
        keyPointsHTML = `
          <div style="margin-top:16px;padding:14px;border-radius:8px;border-left:4px solid #6B8E23;background:rgba(107,142,35,0.15);">
            <h4 style="font-size:15px;font-weight:bold;color:#556B2F;margin:0 0 8px 0;font-family:Georgia,serif;">📚 Key Points</h4>
            <ul style="list-style:none;padding:0;margin:0;">${items}</ul>
          </div>`;
      }

      // Image HTML
      const imageHTML = imgSrc
        ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous"/>`
        : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:#bfae85;font-size:20px;font-family:Georgia,serif;">No Image</div>`;

      // Build full spread HTML
      const spreadHTML = `
        <div style="width:${CONTAINER_W}px;height:${CONTAINER_H}px;display:flex;background:#2c1810;padding:20px;box-sizing:border-box;">
          <!-- LEFT PAGE (Story Text + Key Points) -->
          <div style="flex:1;position:relative;background:${vintageGradient};box-shadow:inset 0 0 60px rgba(139,119,85,0.3);padding:40px 36px;font-family:Georgia,serif;overflow:hidden;border-radius:4px 0 0 4px;display:flex;flex-direction:column;">
            ${fourCorners()}
            <!-- Story text -->
            <div style="flex:1;overflow:hidden;position:relative;z-index:20;">
              <div style="font-size:19px;line-height:1.75;color:#451a03;white-space:pre-wrap;">${page.text}</div>
            </div>
            <!-- Key Points -->
            <div style="position:relative;z-index:20;">
              ${keyPointsHTML}
            </div>
            <!-- Page Number -->
            <div style="text-align:center;margin-top:12px;color:#92400e;opacity:0.8;font-style:italic;font-size:14px;position:relative;z-index:20;">
              — ${i + 1} —
            </div>
          </div>

          <!-- CENTER DIVIDER -->
          <div style="width:6px;background:linear-gradient(to right,#6d5e43,#a89474,#d4c4a8,#a89474,#6d5e43);box-shadow:0 0 8px rgba(0,0,0,0.4);flex-shrink:0;"></div>

          <!-- RIGHT PAGE (Image) -->
          <div style="flex:1;position:relative;background:${vintageGradient};box-shadow:inset 0 0 60px rgba(139,119,85,0.3);padding:20px;display:flex;align-items:stretch;justify-content:center;border-radius:0 4px 4px 0;overflow:hidden;">
            ${fourCorners()}
            <!-- Image wrapper – full height -->
            <div style="position:relative;z-index:20;width:100%;height:100%;border:4px solid #8b7755;border-radius:8px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.3);background:#000;">
              ${imageHTML}
            </div>
          </div>
        </div>
      `;

      // Create off-screen container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.innerHTML = spreadHTML;
      document.body.appendChild(container);

      // Wait a tick for images to settle in the DOM
      await new Promise((r) => setTimeout(r, 100));

      try {
        const canvas = await html2canvas(container.firstElementChild as HTMLElement, {
          width: CONTAINER_W,
          height: CONTAINER_H,
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
        });

        if (i > 0) {
          pdf.addPage();
        }

        // Fit to A4 landscape
        const pdfW = pageWidth;
        const pdfH = (canvas.height * pdfW) / canvas.width;
        const yOffset = Math.max(0, (pageHeight - pdfH) / 2);

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        pdf.addImage(imgData, 'JPEG', 0, yOffset, pdfW, pdfH);
      } catch (error) {
        console.error(`Error generating PDF page ${i + 1}:`, error);
        // Fallback: text-only page
        if (i > 0) pdf.addPage();
        pdf.setFontSize(18);
        pdf.text(`Page ${i + 1}`, 20, 30);
        pdf.setFontSize(12);
        const lines = pdf.splitTextToSize(page.text, pageWidth - 40);
        pdf.text(lines, 20, 50);
        if (page.keyPoints && page.keyPoints.length > 0) {
          const kpY = 50 + lines.length * 7 + 10;
          pdf.setFontSize(14);
          pdf.text('Key Points:', 20, kpY);
          pdf.setFontSize(11);
          page.keyPoints.forEach((pt, idx) => {
            pdf.text(`• ${pt}`, 25, kpY + 8 + idx * 7);
          });
        }
      } finally {
        if (document.body.contains(container)) {
          document.body.removeChild(container);
        }
      }
    }

    // Revoke blob URLs to free memory
    blobUrls.forEach((url) => {
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
    });

    pdf.save(filename);
  },
};
