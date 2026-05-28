/**
 * ==========================================================================
 * STATE ENGINE & REACTION SYSTEM
 * ==========================================================================
 */

// Global State
let invoiceData = {
  template: 'classic', // classic, gem, modern
  themeColor: '#0f172a',
  logo: null,
  showLogo: false,
  showUPIQR: true,
  upiId: 'xxx@yyy',
  smartTax: true,
  taxOverride: 'intra', // intra (CGST+SGST) or inter (IGST)
  pageMargins: 12, // in mm
  orientation: 'portrait', // portrait or landscape
  fontStyle: 'sans', // sans or mono
  showDiscountCol: true,
  showHsnCol: true,
  showTransport: true,
  showBankDetails: true,
  showNotes: true,
  footerOnNewPage: false,  // if true, footer is always on its own dedicated last page

  // e-Invoice specific fields
  einvoiceIRN: '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
  einvoiceAckNo: '112233445566778',
  einvoiceAckDate: '18-May-26',
  consigneeName: 'DUMMY BUYER TRADING',
  consigneeAddress: '123, Dummy Commercial Road, Gaya,\nChunna Gali More, Balaji Market,\nGaya, Bihar - 823001, India',
  consigneeGSTIN: '10BBBBB0000B1Z7',
  consigneeState: 'Bihar',
  consigneeStateCode: '10',
  buyerName: 'DUMMY BUYER TRADING',
  buyerAddress: '123, Dummy Commercial Road, Gaya,\nChunna Gali More, Balaji Market,\nGaya, Bihar - 823001, India',
  buyerGSTIN: '10BBBBB0000B1Z7',
  buyerState: 'Bihar',
  buyerStateCode: '10',
  deliveryNote: '',
  modeTermsOfPayment: 'Direct Export',
  refNoDate: '',
  otherReferences: '',
  buyersOrderNo: '',
  buyersOrderDate: '',
  dispatchDocNo: '',
  deliveryNoteDate: '',
  dispatchedThrough: '',
  destination: '',
  termsOfDelivery: '',

  // Company details
  companyName: 'XXX YYY ZZZ CO',
  companyAddress: 'XXX, YYY Road, ZZZ Industrial Area,\nXXX Town, YYY State – 000000',
  companyPhone: '0000000000',
  companyEmail: 'xxx@yyy.zzz',
  companyGSTIN: '00XXXXX0000X0Z0',
  companyPAN: 'XXXXX0000X',
  companyState: 'YYY State',
  companyStateCode: '00',
  companyExtra: 'XXX: YYY-00000000',
  
  // Client details
  clientName: 'XXX YYY ZZZ CORP',
  clientAddress: 'XXX Street, YYY Block, ZZZ District,\nXXX City, YYY State – 000000',
  clientGSTIN: '00ZZZZZ0000Z0Z0',
  clientPAN: 'ZZZZZ0000Z',
  clientState: 'YYY State',
  clientStateCode: '00',
  clientPhone: '0000000000',
  clientExtra: 'XXX YYY ZZZ: 00000000 | Delivery: 00 XXX 2026',
  
  // Invoice Metadata
  invoiceNo: 'XXX/0000/00',
  invoiceDate: '2026-01-01',
  reverseCharge: 'N',
  placeOfSupply: 'YYY State',
  dateOfSupply: '2026-01-01',
  transportMode: 'XXX',
  vehicleNo: 'XX-00-XX-0000',
  grNo: 'XX-0000',
  carrierName: 'XXX YYY ZZZ Express',
  
  // Item table lines
  items: [
    {
      description: 'XXX YYY ZZZ Goods\nBrand: XXX | Origin: YYY',
      hsn: '00000000',
      qty: 100,
      unit: 'XXX',
      rate: 100.00,
      gstRate: 18,
      discount: 0
    }
  ],
  
  // Financial Blocks
  bankName: 'XXX BANK',
  bankAccNo: '000000000000',
  bankIFSC: 'XXXX0000000',
  bankBranch: 'XXX YYY Branch',
  
  // Additional text block lists
  terms: [
    'XXX YYY ZZZ Payment Terms',
    'Subject to XXX Jurisdiction E. & O. E.',
    'XXX YYY ZZZ Goods once sold'
  ],
  authorizedSignatory: 'XXX YYY ZZZ CO',
  notes: 'XXX YYY ZZZ warranty and certification details are true and correct.'
};

// Initial Setup & Local Storage Hydration
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  initSidebarControls();
  renderInvoice();
  
  // Initialize Sidebar Customization Accordions (Exclusive collapse/expand)
  const accordionHeaders = document.querySelectorAll('.accordion-header');
  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parent = header.parentElement;
      const wasActive = parent.classList.contains('active');
      
      // Close all accordions
      document.querySelectorAll('.accordion-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Toggle clicked accordion
      if (!wasActive) {
        parent.classList.add('active');
      }
    });
  });

  // Create dynamic hover editing tooltip on load
  if (!document.getElementById('wysiwyg-tooltip')) {
    const tooltip = document.createElement('div');
    tooltip.id = 'wysiwyg-tooltip';
    tooltip.className = 'wysiwyg-tooltip';
    tooltip.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 20h9"></path>
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
      </svg>
      <span>Click directly on A4 to Edit | Auto-saved</span>
    `;
    document.body.appendChild(tooltip);
  }
  
  // Listen for sidebar toggling on mobile
  const sidebarToggle = document.getElementById('btn-sidebar-toggle');
  const sidebarClose = document.getElementById('btn-sidebar-close');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebar = document.getElementById('sidebar');

  function openSidebar() {
    sidebar.classList.add('open');
    if (sidebarOverlay) sidebarOverlay.classList.add('active');
  }

  function closeSidebar() {
    sidebar.classList.remove('open');
    if (sidebarOverlay) sidebarOverlay.classList.remove('active');
  }

  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      if (sidebar.classList.contains('open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  if (sidebarClose) {
    sidebarClose.addEventListener('click', closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }
});

// Save to LocalStorage
function saveToLocalStorage() {
  localStorage.setItem('billcraft_draft', JSON.stringify(invoiceData));
}

// Load from LocalStorage
function loadFromLocalStorage() {
  const savedData = localStorage.getItem('billcraft_draft');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      if (parsed && typeof parsed === 'object') {
        // Safe-guard against malformed or empty item arrays that crash calculations
        if ('items' in parsed && (!Array.isArray(parsed.items) || parsed.items.length === 0 || typeof parsed.items[0] !== 'object')) {
          console.warn('Corrupted or empty items array detected in localStorage. Ignoring corrupted items.');
          delete parsed.items;
        }
        // Merge with default schema to avoid missing fields on update
        invoiceData = { ...invoiceData, ...parsed };
      }
    } catch (e) {
      console.error('Failed to parse saved draft from localStorage', e);
    }
  }
}

/**
 * ==========================================================================
 * STATE UPDATE ENGINE (Reactive Calculations)
 * ==========================================================================
 */

// Helper to set nested properties dynamically
function setNestedProperty(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    let part = parts[i];
    // Check if the part represents an array index like items[0]
    if (part.includes('[') && part.includes(']')) {
      const arrayName = part.split('[')[0];
      const index = parseInt(part.split('[')[1].replace(']', ''), 10);
      current = current[arrayName][index];
    } else {
      current = current[part];
    }
  }
  
  const lastPart = parts[parts.length - 1];
  if (lastPart.includes('[') && lastPart.includes(']')) {
    const arrayName = lastPart.split('[')[0];
    const index = parseInt(lastPart.split('[')[1].replace(']', ''), 10);
    current[arrayName][index] = value;
  } else {
    // Attempt to convert numbers if necessary
    if (lastPart === 'qty' || lastPart === 'rate' || lastPart === 'gstRate' || lastPart === 'discount') {
      const parsedNum = parseFloat(value.replace(/[^-0-9.]/g, ''));
      current[lastPart] = isNaN(parsedNum) ? 0 : parsedNum;
    } else {
      current[lastPart] = value;
    }
  }
}

// Global update dispatcher
function updateStateValue(key, value) {
  setNestedProperty(invoiceData, key, value);
  saveToLocalStorage();
}

/**
 * GST Calculation Rules:
 * Taxable Value = Qty * Rate * (1 - Discount/100)
 * SGST + CGST vs IGST choice:
 * If SmartTax is enabled: Company State == Client State -> CGST + SGST, else IGST.
 * If SmartTax is disabled: uses manual setting (taxOverride).
 */
function calculateInvoiceTotals() {
  let subtotalTaxable = 0;
  let totalCGSTAmt = 0;
  let totalSGSTAmt = 0;
  let totalIGSTAmt = 0;
  let totalTax = 0;
  
  // Determine Tax Scheme
  let isIntraState = true; // Intra is CGST+SGST, Inter is IGST
  if (invoiceData.smartTax) {
    const compState = (invoiceData.companyState || '').trim().toLowerCase();
    const clState = (invoiceData.clientState || '').trim().toLowerCase();
    const placeOfSupply = (invoiceData.placeOfSupply || '').trim().toLowerCase();
    
    // Fallback to place of supply if clientState empty
    const buyerState = clState || placeOfSupply;
    isIntraState = compState === buyerState;
  } else {
    isIntraState = invoiceData.taxOverride === 'intra';
  }

  // Calculate each item
  const calculatedItems = invoiceData.items.map((item, index) => {
    const qty = parseFloat(item.qty) || 0;
    const rate = parseFloat(item.rate) || 0;
    const discPercent = parseFloat(item.discount) || 0;
    const gstRate = parseFloat(item.gstRate) || 0;
    
    // Taxable value calculations
    const grossValue = qty * rate;
    const discountAmount = grossValue * (discPercent / 100);
    const taxableValue = roundToTwo(grossValue - discountAmount);
    
    let cgstRate = 0;
    let cgstAmt = 0;
    let sgstRate = 0;
    let sgstAmt = 0;
    let igstRate = 0;
    let igstAmt = 0;
    
    if (isIntraState) {
      cgstRate = gstRate / 2;
      cgstAmt = roundToTwo(taxableValue * (cgstRate / 100));
      sgstRate = gstRate / 2;
      sgstAmt = roundToTwo(taxableValue * (sgstRate / 100));
    } else {
      igstRate = gstRate;
      igstAmt = roundToTwo(taxableValue * (igstRate / 100));
    }
    
    const itemTax = roundToTwo(cgstAmt + sgstAmt + igstAmt);
    const rowTotal = roundToTwo(taxableValue + itemTax);
    
    subtotalTaxable += taxableValue;
    totalCGSTAmt += cgstAmt;
    totalSGSTAmt += sgstAmt;
    totalIGSTAmt += igstAmt;
    totalTax += itemTax;
    
    return {
      ...item,
      taxableValue: taxableValue,
      cgstRate: cgstRate,
      cgstAmt: cgstAmt,
      sgstRate: sgstRate,
      sgstAmt: sgstAmt,
      igstRate: igstRate,
      igstAmt: igstAmt,
      itemTax: itemTax,
      rowTotal: rowTotal
    };
  });
  
  const rawGrandTotal = roundToTwo(subtotalTaxable + totalTax);
  const roundedGrandTotal = Math.round(rawGrandTotal);
  const roundOff = roundToTwo(roundedGrandTotal - rawGrandTotal);
  
  // Tax breakup grouped by HSN/SAC
  const hsnBreakup = {};
  calculatedItems.forEach(item => {
    const hsn = item.hsn || 'N/A';
    if (!hsnBreakup[hsn]) {
      hsnBreakup[hsn] = {
        hsn: hsn,
        taxableValue: 0,
        cgstAmt: 0,
        sgstAmt: 0,
        igstAmt: 0,
        taxRate: item.gstRate,
        cgstRate: item.cgstRate,
        sgstRate: item.sgstRate,
        igstRate: item.igstRate,
        totalTax: 0
      };
    }
    hsnBreakup[hsn].taxableValue += parseFloat(item.taxableValue);
    hsnBreakup[hsn].cgstAmt += parseFloat(item.cgstAmt);
    hsnBreakup[hsn].sgstAmt += parseFloat(item.sgstAmt);
    hsnBreakup[hsn].igstAmt += parseFloat(item.igstAmt);
    hsnBreakup[hsn].totalTax += parseFloat(item.itemTax);
  });
  
  // Convert hsnBreakup to round values array
  const hsnBreakupArray = Object.values(hsnBreakup).map(h => ({
    ...h,
    taxableValue: roundToTwo(h.taxableValue),
    cgstAmt: roundToTwo(h.cgstAmt),
    sgstAmt: roundToTwo(h.sgstAmt),
    igstAmt: roundToTwo(h.igstAmt),
    totalTax: roundToTwo(h.totalTax)
  }));
  
  return {
    items: calculatedItems,
    subtotalTaxable: roundToTwo(subtotalTaxable),
    totalCGSTAmt: roundToTwo(totalCGSTAmt),
    totalSGSTAmt: roundToTwo(totalSGSTAmt),
    totalIGSTAmt: roundToTwo(totalIGSTAmt),
    totalTax: roundToTwo(totalTax),
    rawGrandTotal: roundToTwo(rawGrandTotal),
    grandTotal: roundedGrandTotal,
    roundOff: roundToTwo(roundOff),
    hsnBreakup: hsnBreakupArray,
    isIntraState: isIntraState,
    wordsTotal: numberToWords(roundedGrandTotal)
  };
}

// Helpers
function roundToTwo(num) {
  return +(Math.round(num + "e+2")  + "e-2");
}

function formatCurrency(val) {
  return val.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

/**
 * Indian Numbering System to Words Converter
 */
function numberToWords(amount) {
  if (amount === 0) return 'Rupees Zero Only';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  function convertGroup(n) {
    let word = '';
    if (n >= 100) {
      word += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      word += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    }
    if (n > 0) {
      word += ones[n] + ' ';
    }
    return word.trim();
  }
  
  function helper(num) {
    let remaining = Math.floor(num);
    let words = '';
    
    // Crores (Recursively formatted to handle arbitrarily large values)
    if (remaining >= 10000000) {
      const croreVal = Math.floor(remaining / 10000000);
      words += helper(croreVal) + ' Crore ';
      remaining %= 10000000;
    }
    
    // Lakhs
    if (remaining >= 100000) {
      words += convertGroup(Math.floor(remaining / 100000)) + ' Lakh ';
      remaining %= 100000;
    }
    
    // Thousands
    if (remaining >= 1000) {
      words += convertGroup(Math.floor(remaining / 1000)) + ' Thousand ';
      remaining %= 1000;
    }
    
    // Hundreds & Below
    if (remaining > 0) {
      words += convertGroup(remaining);
    }
    
    return words.trim();
  }
  
  let words = helper(amount);
  
  // Check decimals (Paise)
  const decimals = Math.round((amount - Math.floor(amount)) * 100);
  let paiseWords = '';
  if (decimals > 0) {
    paiseWords = ' and ' + convertGroup(decimals) + ' Paise';
  }
  
  return 'Rupees ' + (words ? words : 'Zero') + paiseWords + ' Only';
}

/**
 * DYNAMIC UPI QR CODE GENERATOR URL
 */
function getUPIQRCodeURL(totalAmount) {
  const upi = invoiceData.upiId || 'merchant@upi';
  const name = invoiceData.companyName || 'Merchant';
  const cleanUPI = upi.trim();
  // Standard format upi://pay?pa=address&pn=name&am=amount&cu=INR
  const upiURI = `upi://pay?pa=${cleanUPI}&pn=${encodeURIComponent(name)}&am=${totalAmount}&cu=INR`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiURI)}`;
}

/**
 * ==========================================================================
 * INVOICE VIEWS / TEMPLATES RENDERING PIPELINE
 * ==========================================================================
 */


/**
 * Smart page-capacity calculator based on real A4 dimensions.
 *
 * Key insight: different page roles have different safety buffers.
 *   - 'first' / 'middle': strict 8mm buffer — these pages have max-height:297mm
 *     with overflow:hidden in print, so overflow = content is cut off.
 *   - 'last' / 'first-and-last': relaxed 2mm buffer — these pages have
 *     height:auto + overflow:visible in print, so slight overflow prints
 *     on the next physical sheet but content is never hidden.
 *
 * Footer heights are measured from actual HTML element dimensions:
 *   Bottom grid (right col) = totals 5 rows × 8mm = 40mm
 *   Bottom grid (left col)  = amount-in-words(8mm) + QR(48mm) + bank(20mm)
 *   Row height              = max(left, right)
 *   HSN breakup table       = header(8mm) + 1-2 rows(14mm) = 22mm
 *   T&C section             = header(4mm) + 3 terms(13mm) = 17mm
 *   Signature section       = 100px box ≈ 26mm
 *
 * All values in mm. At 96dpi: 1px = 0.264mm.
 */
function getPageCapacity(pageRole) {
  const margin = parseFloat(invoiceData.pageMargins) || 12;
  const isLand = invoiceData.orientation === 'landscape';
  const tmpl   = invoiceData.template || 'classic';

  const pageH  = isLand ? 210 : 297;
  const usable = pageH - 2 * margin;

  // ── Row height ───────────────────────────────────────────────────────────
  // 11px font, line-height 1.35 → ~4mm/line. Cell padding 4px top+bottom ≈ 2mm.
  // Single-line = ~6mm, but description often wraps to 2 lines → ~10mm.
  // Use 12mm portrait / 9mm landscape as conservative average.
  const rowMM = isLand ? 9 : 12;

  // ── Fixed overheads per template ─────────────────────────────────────────
  // firstHeader: measured as sum of all fixed sections on page 1
  //   tally-header (~15mm) + company-box (~28mm) + bill-details (~16mm) + bill-to (~28mm) = 87mm
  //   Use 74mm portrait (accounting for compact content in practice)
  // contHeader: compact "Company | Invoice | Page X" banner = 12mm
  // tableHeader: thead (single or double row) = 10-12mm
  const oh = {
    classic: { firstHeader: isLand ? 60 : 88, contHeader: 12, tableHeader: 12 },
    gem:     { firstHeader: isLand ? 56 : 84, contHeader: 12, tableHeader: 10 },
    modern:  { firstHeader: isLand ? 54 : 76, contHeader: 12, tableHeader: 10 },
    einvoice:{ firstHeader: isLand ? 62 : 98, contHeader: 12, tableHeader: 12 },
  }[tmpl] || { firstHeader: isLand ? 60 : 88, contHeader: 12, tableHeader: 12 };

  // ── Dynamic footer height ─────────────────────────────────────────────────
  // Bottom-grid is a 2-column layout; height = max(left col, right col)
  // Right col (totals): 5 rows × 8mm = 40mm (always present)
  // Left col with no QR, no bank: "Amount in Words" label = 8mm
  //   → row height = max(8, 40) = 40mm
  // Left col with QR (150px img ≈ 40mm + 8mm label = 48mm total):
  //   → row height = max(8 + 48, 40) = 56mm  (+16mm vs base)
  // Left col with QR + bank details (4 lines × 5mm = 20mm below QR):
  //   → row height = max(8 + 48 + 20, 40) = 76mm  (+20mm vs QR-only)
  //
  // Below the bottom-grid:
  //   HSN breakup:  header 8mm + avg 2 rows × 7mm = 22mm
  //   T&C section:  header 4mm + 3 terms × 4.3mm = 17mm
  //   Signature:    100px box ≈ 26mm
  //
  // Base footer (no QR, no bank) = 40 + 22 + 17 + 26 = 105mm

  let footerMM;
  if (tmpl === 'einvoice') {
    // e-Invoice footer is constant, has HSN table + declaration box + signature box
    footerMM = isLand ? 78 : 108;
    if (invoiceData.showNotes) footerMM += 6;
  } else if (isLand) {
    footerMM = 72; // landscape: content spreads wider, less height needed
    if (invoiceData.showUPIQR)       footerMM += 12;
    if (invoiceData.showBankDetails) footerMM += 10;
    if (invoiceData.showNotes)       footerMM +=  6;
  } else {
    footerMM = 105; // base: totals(40) + HSN(22) + T&C(17) + sig(26)
    if (invoiceData.showUPIQR)                                footerMM += 16; // left col: 8→56mm
    if (invoiceData.showUPIQR && invoiceData.showBankDetails) footerMM += 20; // left col: 56→76mm
    if (invoiceData.showNotes)                                footerMM +=  8; // notes text ~8mm
  }

  // ── Overhead for this page role ───────────────────────────────────────────
  let overhead;
  switch (pageRole) {
    case 'first':
      overhead = oh.firstHeader + oh.tableHeader;
      break;
    case 'middle':
      overhead = oh.contHeader + oh.tableHeader;
      break;
    case 'last':
      overhead = oh.contHeader + oh.tableHeader + footerMM;
      break;
    case 'first-and-last':
      overhead = oh.firstHeader + oh.tableHeader + footerMM;
      break;
    default:
      overhead = oh.contHeader + oh.tableHeader;
  }

  // ── Safety buffer ─────────────────────────────────────────────────────────
  // 'first' and 'middle' pages: strict 8mm — content beyond 297mm is hidden.
  // 'last' and 'first-and-last': relaxed 2mm — page has overflow:visible,
  //   so a tiny overshoot prints on the next physical page margin but is safe.
  const buffer = (pageRole === 'last' || pageRole === 'first-and-last') ? 2 : 8;

  const available = usable - overhead - buffer;
  return Math.max(1, Math.floor(available / rowMM));
}




// Legacy shim used by the old code path (keep for safety)
function getItemsPerPage(isFirstPage) {
  return isFirstPage
    ? getPageCapacity('first')
    : getPageCapacity('middle');
}


function renderInvoice() {
  const renderArea = document.getElementById('invoice-render-area');
  const sheet = document.getElementById('invoice-sheet');
  if (!renderArea) return;
  
  // Get active calculations (full totals across ALL items)
  const totals = calculateInvoiceTotals();
  
  // Apply theme and margin settings variables on the sheet container
  if (sheet) {
    sheet.style.setProperty('--margin-size', `${invoiceData.pageMargins}mm`);
    sheet.style.setProperty('--invoice-accent', invoiceData.themeColor);
  }
  
  // Build page class list shared across all pages
  let pageClasses = ['invoice-page'];
  if (invoiceData.orientation === 'landscape') {
    pageClasses.push('landscape');
    document.body.classList.add('print-landscape');
    document.body.classList.remove('print-portrait');
  } else {
    document.body.classList.add('print-portrait');
    document.body.classList.remove('print-landscape');
  }
  if (invoiceData.fontStyle === 'mono') {
    pageClasses.push('monospace-invoice');
  }
  if (!invoiceData.showDiscountCol) pageClasses.push('hide-discount-col');
  if (!invoiceData.showHsnCol) pageClasses.push('hide-hsn-col');
  
  // Reset sheet class (no longer primary styling target)
  if (sheet) sheet.className = '';
  
  // --- SMART PAGINATION LOGIC ---
  // We build pages greedily, always aware of whether a page is first / middle / last,
  // so each page is filled to its maximum capacity.
  // The tricky part: we don't know if a page is the last until we run out of items.
  // Strategy:
  //   1. Greedily fill pages using 'first' then 'middle' capacity.
  //   2. Once all items are distributed, check the last page:
  //      a) If remaining items on last page <= capacity('last'), it fits → done.
  //      b) If it doesn't fit, redistribute: move excess items from last page
  //         to a new overflow page, keeping the footer on the final page only.
  //   3. Edge case: if there are 0 items, we still need 1 empty page.

  const allItems = totals.items;
  const pages = [];

  if (allItems.length === 0) {
    pages.push([]);
  } else if (invoiceData.footerOnNewPage) {
    // ── MODE: Footer on New Page ─────────────────────────────────────────
    // Fill pages with as many items as possible (first/middle capacity).
    // Never worry about footer fitting — a dedicated empty last page holds it.
    let i = 0, pageIndex = 0;
    while (i < allItems.length) {
      const role = pageIndex === 0 ? 'first' : 'middle';
      const cap  = getPageCapacity(role);
      pages.push(allItems.slice(i, i + cap));
      i += cap;
      pageIndex++;
    }
    // Dedicated footer-only page (empty items array = just footer rendered)
    pages.push([]);
  } else {
    // ── MODE: Footer on Same Page (smart-fit) ───────────────────────────
    let i = 0;
    let pageIndex = 0;

    // First pass: fill pages greedily using first/middle capacity
    while (i < allItems.length) {
      const role = pageIndex === 0 ? 'first' : 'middle';
      const cap  = getPageCapacity(role);
      pages.push(allItems.slice(i, i + cap));
      i += cap;
      pageIndex++;
    }

    // Second pass: check if footer fits on the last page
    const lastRole = pages.length === 1 ? 'first-and-last' : 'last';
    const lastCap  = getPageCapacity(lastRole);
    const lastPage = pages[pages.length - 1];

    if (lastPage.length > lastCap) {
      // Footer won't fit — split excess off the last page.
      // Excess items go onto intermediate pages using MIDDLE capacity,
      // and only the final overflow page uses LAST capacity.
      const overflow = lastPage.splice(lastCap);
      let oi = 0;
      while (oi < overflow.length) {
        const remaining = overflow.length - oi;
        // Check if remaining items fit on a single 'last' page
        const wouldBeLastCap = getPageCapacity('last');
        if (remaining <= wouldBeLastCap) {
          // This is the true last page (items + footer)
          pages.push(overflow.slice(oi, oi + remaining));
          oi += remaining;
        } else {
          // Still too many — push as a middle page and continue
          const mCap = getPageCapacity('middle');
          pages.push(overflow.slice(oi, oi + mCap));
          oi += mCap;
        }
      }
    }

    // Third pass: collapse thin orphan last pages (≤3 items) upward
    while (pages.length >= 2) {
      const lastLen = pages[pages.length - 1].length;
      if (lastLen > 3) break;
      const prevIdx = pages.length - 2;
      const prevWithFooter = prevIdx === 0 ? 'first-and-last' : 'last';
      const maxWithFooter  = getPageCapacity(prevWithFooter);
      if (pages[prevIdx].length + lastLen <= maxWithFooter) {
        pages[prevIdx].push(...pages.pop());
      } else {
        break;
      }
    }
  }

  
  // --- RENDER EACH PAGE ---
  let allPagesHTML = '';
  pages.forEach((pageItems, pIdx) => {
    const isFirst = pIdx === 0;
    const isLast = pIdx === pages.length - 1;
    
    // Compute a "running" index offset so S.N. is continuous
    let startIndex = 0;
    for (let k = 0; k < pIdx; k++) {
      startIndex += pages[k].length;
    }
    
    const pageData = {
      pageItems,
      startIndex,
      totals,         // always the full invoice totals for footer
      isFirst,
      isLast,
      pageNum: pIdx + 1,
      totalPages: pages.length
    };
    
    let pageHTML = '';
    const extraClasses = (isFirst ? '' : ' invoice-page-continuation') + (isLast ? ' last-page' : '');
    const classStr = [...pageClasses, ...(isFirst ? [] : [])].join(' ') + extraClasses;
    
    if (invoiceData.template === 'classic') {
      pageHTML = `<div class="${classStr}">${getTallyHTML(pageData)}</div>`;
    } else if (invoiceData.template === 'gem') {
      pageHTML = `<div class="${classStr}">${getGemHTML(pageData)}</div>`;
    } else if (invoiceData.template === 'modern') {
      pageHTML = `<div class="${classStr}">${getModernHTML(pageData)}</div>`;
    } else if (invoiceData.template === 'einvoice') {
      pageHTML = `<div class="${classStr}">${getEInvoiceHTML(pageData)}</div>`;
    // UNDER DEVELOPMENT
    // } else if (invoiceData.template === 'minimalist') {
    //   pageHTML = `<div class="${classStr}">${getMinimalistHTML(pageData)}</div>`;
    // } else if (invoiceData.template === 'nordic') {
    //   pageHTML = `<div class="${classStr}">${getNordicHTML(pageData)}</div>`;
    }
    
    allPagesHTML += pageHTML;
  });
  
  renderArea.innerHTML = allPagesHTML;
  
  // Attach in-place WYSIWYG input listeners
  attachEditableListeners();
}

// Render dynamic calculations only (prevents full contenteditable redraws & preserves cursor)
function updateCalculatedDOM() {
  const totals = calculateInvoiceTotals();
  
  // Update computed table column fields
  totals.items.forEach((item, index) => {
    // HSN taxable values
    const taxableCol = document.querySelector(`[data-computed="item-taxable-${index}"]`);
    if (taxableCol) taxableCol.textContent = formatCurrency(item.taxableValue);
    
    // Tax Rates & Amts in Classic ERP Layout
    const cgstRateCol = document.querySelector(`[data-computed="item-cgst-rate-${index}"]`);
    if (cgstRateCol) cgstRateCol.textContent = item.cgstRate > 0 ? `${item.cgstRate}%` : '-';
    
    const cgstAmtCol = document.querySelector(`[data-computed="item-cgst-amt-${index}"]`);
    if (cgstAmtCol) cgstAmtCol.textContent = item.cgstAmt > 0 ? formatCurrency(item.cgstAmt) : '-';
    
    const sgstRateCol = document.querySelector(`[data-computed="item-sgst-rate-${index}"]`);
    if (sgstRateCol) sgstRateCol.textContent = item.sgstRate > 0 ? `${item.sgstRate}%` : '-';
    
    const sgstAmtCol = document.querySelector(`[data-computed="item-sgst-amt-${index}"]`);
    if (sgstAmtCol) sgstAmtCol.textContent = item.sgstAmt > 0 ? formatCurrency(item.sgstAmt) : '-';
    
    const igstRateCol = document.querySelector(`[data-computed="item-igst-rate-${index}"]`);
    if (igstRateCol) igstRateCol.textContent = item.igstRate > 0 ? `${item.igstRate}%` : '-';
    
    const igstAmtCol = document.querySelector(`[data-computed="item-igst-amt-${index}"]`);
    if (igstAmtCol) igstAmtCol.textContent = item.igstAmt > 0 ? formatCurrency(item.igstAmt) : '-';
    
    // Surbhi GeM Table rate columns
    const gemGstCol = document.querySelector(`[data-computed="gem-gst-amt-${index}"]`);
    if (gemGstCol) gemGstCol.textContent = `${item.gstRate}% \n Rs. ${formatCurrency(item.itemTax)}`;

    // Total Amount columns
    const totalCol = document.querySelector(`[data-computed="item-total-${index}"]`);
    if (totalCol) totalCol.textContent = formatCurrency(item.rowTotal);
  });
  
  // Update overall subtotal & tax sum fields
  const subTotalLabel = document.getElementById('calc-subtotal');
  if (subTotalLabel) subTotalLabel.textContent = formatCurrency(totals.subtotalTaxable);
  
  const subTotalSideLabel = document.getElementById('calc-subtotal-side');
  if (subTotalSideLabel) subTotalSideLabel.textContent = formatCurrency(totals.subtotalTaxable);
  
  const cgstSumLabel = document.getElementById('calc-cgst-total');
  if (cgstSumLabel) cgstSumLabel.textContent = formatCurrency(totals.totalCGSTAmt);
  
  const cgstSumSideLabel = document.getElementById('calc-cgst-total-side');
  if (cgstSumSideLabel) cgstSumSideLabel.textContent = formatCurrency(totals.totalCGSTAmt);
  
  const sgstSumLabel = document.getElementById('calc-sgst-total');
  if (sgstSumLabel) sgstSumLabel.textContent = formatCurrency(totals.totalSGSTAmt);
  
  const sgstSumSideLabel = document.getElementById('calc-sgst-total-side');
  if (sgstSumSideLabel) sgstSumSideLabel.textContent = formatCurrency(totals.totalSGSTAmt);
  
  const igstSumLabel = document.getElementById('calc-igst-total');
  if (igstSumLabel) igstSumLabel.textContent = formatCurrency(totals.totalIGSTAmt);
  
  const igstSumSideLabel = document.getElementById('calc-igst-total-side');
  if (igstSumSideLabel) igstSumSideLabel.textContent = formatCurrency(totals.totalIGSTAmt);
  
  const totalTaxLabel = document.getElementById('calc-tax-total');
  if (totalTaxLabel) totalTaxLabel.textContent = formatCurrency(totals.totalTax);
  
  const roundOffLabel = document.getElementById('calc-round-off');
  if (roundOffLabel) roundOffLabel.textContent = formatCurrency(totals.roundOff);
  
  const roundOffSideLabel = document.getElementById('calc-round-off-side');
  if (roundOffSideLabel) roundOffSideLabel.textContent = formatCurrency(totals.roundOff);
  
  const grandTotalLabel = document.getElementById('calc-grand-total');
  if (grandTotalLabel) grandTotalLabel.textContent = formatCurrency(totals.grandTotal);
  
  const grandTotalSideLabel = document.getElementById('calc-grand-total-side');
  if (grandTotalSideLabel) grandTotalSideLabel.textContent = formatCurrency(totals.grandTotal);
  
  const wordsLabel = document.getElementById('calc-words-total');
  if (wordsLabel) wordsLabel.textContent = totals.wordsTotal;
  
  // Re-generate group tax table inside footer (Classic & GeM templates)
  const hsnTableBody = document.getElementById('hsn-breakup-tbody');
  if (hsnTableBody) {
    hsnTableBody.innerHTML = getHSNBreakupHTML(totals);
  }
  
  // Update QR Code Source
  const qrImg = document.getElementById('upi-qr-image');
  if (qrImg) {
    qrImg.src = getUPIQRCodeURL(totals.grandTotal);
  }
}

/**
 * ==========================================================================
 * HTML GENERATORS FOR EACH LAYOUT PRESETS
 * ==========================================================================
 */

// Global helper for rendering the logo in templates
function getTemplateLogoHTML() {
  if (invoiceData.showLogo && invoiceData.logo) {
    return `<div class="invoice-logo-wrapper"><img src="${invoiceData.logo}" alt="Logo"></div>`;
  }
  return '';
}

// 1. Classic Marg/Tally ERP Grid — supports multi-page pagination
function getTallyHTML(pageData) {
  const { pageItems, startIndex, totals, isFirst, isLast, pageNum, totalPages } = pageData;

  const itemsRows = pageItems.map((item, localIdx) => {
    const globalIdx = startIndex + localIdx; // real item index for data-key
    return `
    <tr>
      <td class="center">${globalIdx + 1}
        <div class="table-row-actions no-print">
          <button class="btn-row-action btn-row-delete" onclick="deleteItemRow(${globalIdx})" title="Delete Line">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
      <td contenteditable="true" data-key="items[${globalIdx}].description" placeholder="Description of Goods">${escapeHTML(item.description)}</td>
      <td class="center col-hsn" contenteditable="true" data-key="items[${globalIdx}].hsn" placeholder="-">${escapeHTML(item.hsn)}</td>
      <td class="center" contenteditable="true" data-key="items[${globalIdx}].unit" placeholder="Pcs">${escapeHTML(item.unit)}</td>
      <td class="right" contenteditable="true" data-key="items[${globalIdx}].qty" placeholder="0">${item.qty}</td>
      <td class="right" contenteditable="true" data-key="items[${globalIdx}].rate" placeholder="0.00">${item.rate}</td>
      <td class="right col-discount" contenteditable="true" data-key="items[${globalIdx}].discount" placeholder="0">${item.discount}</td>
      <td class="right bold" data-computed="item-taxable-${globalIdx}">${formatCurrency(item.taxableValue)}</td>
      ${totals.isIntraState ? `
        <td class="center" data-computed="item-cgst-rate-${globalIdx}">${item.cgstRate > 0 ? item.cgstRate + '%' : '-'}</td>
        <td class="right" data-computed="item-cgst-amt-${globalIdx}">${item.cgstAmt > 0 ? formatCurrency(item.cgstAmt) : '-'}</td>
        <td class="center" data-computed="item-sgst-rate-${globalIdx}">${item.sgstRate > 0 ? item.sgstRate + '%' : '-'}</td>
        <td class="right" data-computed="item-sgst-amt-${globalIdx}">${item.sgstAmt > 0 ? formatCurrency(item.sgstAmt) : '-'}</td>
      ` : `
        <td class="center" data-computed="item-igst-rate-${globalIdx}">${item.igstRate > 0 ? item.igstRate + '%' : '-'}</td>
        <td class="right" data-computed="item-igst-amt-${globalIdx}">${item.igstAmt > 0 ? formatCurrency(item.igstAmt) : '-'}</td>
      `}
      <td class="right bold" data-computed="item-total-${globalIdx}">${formatCurrency(item.rowTotal)}</td>
    </tr>
  `}).join('');

  const tableHeader = `
    <table class="tally-bordered-table tally-grid-table">
      <thead>
        <tr>
          <th rowspan="2" style="width: 5%;">S.N.</th>
          <th rowspan="2" style="width: 32%;">Description of Goods</th>
          <th rowspan="2" class="col-hsn" style="width: 10%;">HSN Code</th>
          <th rowspan="2" style="width: 5%;">UOM</th>
          <th rowspan="2" style="width: 7%;">Qty</th>
          <th rowspan="2" style="width: 8%;">Rate</th>
          <th rowspan="2" class="col-discount" style="width: 5%;">Disc%</th>
          <th rowspan="2" style="width: 10%;">Taxable<br>Value</th>
          ${totals.isIntraState ? `
            <th colspan="2" class="tax-group-header" style="width: 10%;">CGST</th>
            <th colspan="2" class="tax-group-header" style="width: 10%;">SGST</th>
          ` : `
            <th colspan="2" class="tax-group-header" style="width: 20%;">IGST</th>
          `}
          <th rowspan="2" style="width: 10%;">Total<br>Amount</th>
        </tr>
        <tr>
          ${totals.isIntraState ? `
            <th style="font-size:9px;">Rate</th><th style="font-size:9px;">Amt</th>
            <th style="font-size:9px;">Rate</th><th style="font-size:9px;">Amt</th>
          ` : `
            <th style="font-size:9px;">Rate</th><th style="font-size:9px;">Amt</th>
          `}
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      ${isLast ? `
        <tfoot>
          <tr class="bold">
            <td></td>
            <td class="right">TOTAL</td>
            <td class="col-hsn"></td>
            <td></td>
            <td class="right">${totals.items.reduce((sum, item) => sum + (parseFloat(item.qty) || 0), 0)}</td>
            <td></td>
            <td class="col-discount"></td>
            <td class="right" id="calc-subtotal">${formatCurrency(totals.subtotalTaxable)}</td>
            ${totals.isIntraState ? `
              <td></td>
              <td class="right" id="calc-cgst-total">${formatCurrency(totals.totalCGSTAmt)}</td>
              <td></td>
              <td class="right" id="calc-sgst-total">${formatCurrency(totals.totalSGSTAmt)}</td>
            ` : `
              <td></td>
              <td class="right" id="calc-igst-total">${formatCurrency(totals.totalIGSTAmt)}</td>
            `}
            <td class="right" id="calc-grand-total">${formatCurrency(totals.grandTotal)}</td>
          </tr>
        </tfoot>
      ` : ''}
    </table>`;

  return `
    <div class="tally-double-border template-tally">
      
      ${isFirst ? `
        <!-- Top header (Page 1 only) -->
        <header class="tally-header">
          ${getTemplateLogoHTML()}
          <h1 class="bold" style="font-size: 20px; letter-spacing: 1px;">TAX INVOICE</h1>
          <p style="font-size: 10px; margin-top: 2px;">ORIGINAL FOR BUYER</p>
        </header>

        <!-- Seller block (Page 1 only) -->
        <section class="tally-company-box">
          <h2 class="bold" contenteditable="true" data-key="companyName" placeholder="Company Name" style="font-size: 16px; color: var(--invoice-accent);">${escapeHTML(invoiceData.companyName)}</h2>
          <p contenteditable="true" data-key="companyAddress" placeholder="Company Address" style="white-space: pre-wrap; font-size: 11px; margin-top: 4px;">${escapeHTML(invoiceData.companyAddress)}</p>
          <p style="margin-top: 4px; font-size: 11px;">
            <span>Phone: <strong contenteditable="true" data-key="companyPhone" placeholder="Phone">${escapeHTML(invoiceData.companyPhone)}</strong></span> &bull; 
            <span>Email: <strong contenteditable="true" data-key="companyEmail" placeholder="Email">${escapeHTML(invoiceData.companyEmail)}</strong></span>
          </p>
          <p style="margin-top: 2px; font-size: 11px;">
            <span>GSTIN: <strong contenteditable="true" data-key="companyGSTIN" placeholder="GSTIN">${escapeHTML(invoiceData.companyGSTIN)}</strong></span> &bull;
            <span>PAN: <strong contenteditable="true" data-key="companyPAN" placeholder="PAN">${escapeHTML(invoiceData.companyPAN)}</strong></span> &bull;
            <span>State: <strong contenteditable="true" data-key="companyState" placeholder="State">${escapeHTML(invoiceData.companyState)}</strong> (Code: <strong contenteditable="true" data-key="companyStateCode" placeholder="Code">${escapeHTML(invoiceData.companyStateCode)}</strong>)</span>
          </p>
          <p contenteditable="true" data-key="companyExtra" placeholder="Custom Field (e.g. GeM ID)" style="font-size: 11px; margin-top: 2px; color: #555;">${escapeHTML(invoiceData.companyExtra)}</p>
        </section>

        <!-- Bill / Transport Grid metadata (Page 1 only) -->
        <section class="tally-bill-details">
          <table class="tally-bordered-table">
            ${invoiceData.showTransport ? `
              <colgroup>
                <col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;"><col style="width: 25%;">
              </colgroup>
              <tr>
                <td>Invoice No:<br><strong contenteditable="true" data-key="invoiceNo">${escapeHTML(invoiceData.invoiceNo)}</strong></td>
                <td>Dated:<br><strong contenteditable="true" data-key="invoiceDate">${escapeHTML(invoiceData.invoiceDate)}</strong></td>
                <td>Transport Mode:<br><strong contenteditable="true" data-key="transportMode">${escapeHTML(invoiceData.transportMode)}</strong></td>
                <td>Vehicle Number:<br><strong contenteditable="true" data-key="vehicleNo">${escapeHTML(invoiceData.vehicleNo)}</strong></td>
              </tr>
              <tr>
                <td>Date of Supply:<br><strong contenteditable="true" data-key="dateOfSupply">${escapeHTML(invoiceData.dateOfSupply)}</strong></td>
                <td>Reverse Charge Y/N:<br><strong contenteditable="true" data-key="reverseCharge">${escapeHTML(invoiceData.reverseCharge)}</strong></td>
                <td>G.R./R.R. No:<br><strong contenteditable="true" data-key="grNo">${escapeHTML(invoiceData.grNo)}</strong></td>
                <td>Carrier Name:<br><strong contenteditable="true" data-key="carrierName">${escapeHTML(invoiceData.carrierName)}</strong></td>
              </tr>
            ` : `
              <colgroup>
                <col style="width: 50%;"><col style="width: 50%;">
              </colgroup>
              <tr>
                <td>Invoice No:<br><strong contenteditable="true" data-key="invoiceNo">${escapeHTML(invoiceData.invoiceNo)}</strong></td>
                <td>Dated:<br><strong contenteditable="true" data-key="invoiceDate">${escapeHTML(invoiceData.invoiceDate)}</strong></td>
              </tr>
              <tr>
                <td>Place of Supply:<br><strong contenteditable="true" data-key="placeOfSupply">${escapeHTML(invoiceData.placeOfSupply)}</strong></td>
                <td>Reverse Charge Y/N:<br><strong contenteditable="true" data-key="reverseCharge">${escapeHTML(invoiceData.reverseCharge)}</strong></td>
              </tr>
            `}
          </table>
        </section>

        <!-- Buyer details block (Page 1 only) -->
        <section class="tally-bill-to">
          <p class="bold" style="font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 6px;">BILL TO PARTY</p>
          <h3 class="bold" contenteditable="true" data-key="clientName" placeholder="Client Name" style="font-size: 13px;">${escapeHTML(invoiceData.clientName)}</h3>
          <p contenteditable="true" data-key="clientAddress" placeholder="Client Address" style="white-space: pre-wrap; font-size: 11px; margin-top: 4px;">${escapeHTML(invoiceData.clientAddress)}</p>
          <p style="margin-top: 4px; font-size: 11px;">
            <span>Client GSTIN: <strong contenteditable="true" data-key="clientGSTIN" placeholder="GSTIN">${escapeHTML(invoiceData.clientGSTIN)}</strong></span> &bull; 
            <span>PAN: <strong contenteditable="true" data-key="clientPAN" placeholder="PAN">${escapeHTML(invoiceData.clientPAN)}</strong></span> &bull; 
            <span>State: <strong contenteditable="true" data-key="clientState" placeholder="State">${escapeHTML(invoiceData.clientState)}</strong> (Code: <strong contenteditable="true" data-key="clientStateCode" placeholder="Code">${escapeHTML(invoiceData.clientStateCode)}</strong>)</span>
          </p>
          <p style="margin-top: 2px; font-size: 11px;">
            <span>Contact Number: <strong contenteditable="true" data-key="clientPhone">${escapeHTML(invoiceData.clientPhone)}</strong></span> &bull; 
            <span contenteditable="true" data-key="clientExtra" placeholder="GeM Order details...">${escapeHTML(invoiceData.clientExtra)}</span>
          </p>
        </section>
      ` : `
        <!-- Compact continuation header (Pages 2+) -->
        <div class="page-continuation-header">
          <span><strong>${escapeHTML(invoiceData.companyName)}</strong> | Invoice: ${escapeHTML(invoiceData.invoiceNo)} | Date: ${escapeHTML(invoiceData.invoiceDate)}</span>
          <span style="font-size: 9px; color: #888;">Page ${pageNum} of ${totalPages} (Continued)</span>
        </div>
      `}

      <!-- Dense Items list table (skipped on footer-only page) -->
      ${pageItems.length > 0 ? tableHeader : ''}
      
      <!-- Interactive Add Row Button for Editor UI (last items page only, not footer-only page) -->
      ${isLast && pageItems.length > 0 ? `
        <div class="table-append-row no-print">
          <button class="btn-add-row" onclick="addItemRow()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Item Row
          </button>
        </div>
      ` : !isLast ? `
        <div class="no-print" style="text-align:center; padding: 4px 0; font-size: 10px; color: #94a3b8; border-top: 1px dashed #cbd5e1;">— Continued on Page ${pageNum + 1} —</div>
      ` : ''}


      ${isLast ? `
        <!-- Bottom summaries, Bank details, Sign block (Last page only) -->
        <section class="tally-bottom-grid">
          <table class="tally-bordered-table" style="border: none;">
            <colgroup>
              <col style="width: 55%;"><col style="width: 45%;">
            </colgroup>
            <tr>
              <td style="vertical-align: top; border: none; border-right: 1px solid #000;">
                <p style="font-size: 11px;">Amount in Words:<br><strong id="calc-words-total" style="font-size: 11px;">${totals.wordsTotal}</strong></p>
                
                ${invoiceData.showUPIQR ? `
                  <div class="modern-qr-block" style="margin-top: 10px; max-width: 320px;">
                    <img id="upi-qr-image" class="modern-qr-code" src="${getUPIQRCodeURL(totals.grandTotal)}" alt="Scan to Pay">
                    <div class="modern-qr-text">
                      <strong>Scan to Pay instantly</strong><br>
                      UPI: ${escapeHTML(invoiceData.upiId)}<br>
                      Instant mobile banking secure payment.
                    </div>
                  </div>
                ` : ''}
                
                ${invoiceData.showBankDetails ? `
                  <div class="tally-bank-box" style="margin-top: 10px; border-top: 1px solid #000; padding: 6px 0 0 0;">
                    <p class="bold" style="text-decoration: underline; font-size: 10px;">Bank Account Details:</p>
                    <p style="font-size: 10px; margin-top: 2px;">
                      Bank Name: <strong contenteditable="true" data-key="bankName">${escapeHTML(invoiceData.bankName)}</strong><br>
                      A/c Number: <strong contenteditable="true" data-key="bankAccNo">${escapeHTML(invoiceData.bankAccNo)}</strong><br>
                      IFSC Code: <strong contenteditable="true" data-key="bankIFSC">${escapeHTML(invoiceData.bankIFSC)}</strong><br>
                      Branch Location: <strong contenteditable="true" data-key="bankBranch">${escapeHTML(invoiceData.bankBranch)}</strong>
                    </p>
                  </div>
                ` : ''}
              </td>
              <td style="vertical-align: top; border: none; padding: 0;">
                <table class="tally-bordered-table" style="border: none; width: 100%;">
                  <tr style="font-size: 11px;">
                    <td>Gross Taxable Amt</td>
                    <td class="right bold" id="calc-subtotal-side">${formatCurrency(totals.subtotalTaxable)}</td>
                  </tr>
                  ${totals.isIntraState ? `
                    <tr style="font-size: 11px;">
                      <td>Add CGST Total</td>
                      <td class="right" id="calc-cgst-total-side">${formatCurrency(totals.totalCGSTAmt)}</td>
                    </tr>
                    <tr style="font-size: 11px;">
                      <td>Add SGST Total</td>
                      <td class="right" id="calc-sgst-total-side">${formatCurrency(totals.totalSGSTAmt)}</td>
                    </tr>
                  ` : `
                    <tr style="font-size: 11px;">
                      <td>Add IGST Total</td>
                      <td class="right" id="calc-igst-total-side">${formatCurrency(totals.totalIGSTAmt)}</td>
                    </tr>
                  `}
                  <tr style="font-size: 11px;">
                    <td>Round Off Adjustment</td>
                    <td class="right" id="calc-round-off-side">${formatCurrency(totals.roundOff)}</td>
                  </tr>
                  <tr class="bold" style="font-size: 13px; background-color: #f1f5f9;">
                    <td>GRAND TOTAL</td>
                    <td class="right" style="color: var(--invoice-accent);" id="calc-grand-total-side">${formatCurrency(totals.grandTotal)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </section>

        <!-- HSN/SAC group wise Tax break-up block -->
        <section style="border-top: 1px solid #000;">
          <table class="tally-bordered-table" style="border: none;">
            <thead>
              <tr>
                <th rowspan="2" style="font-size: 9px; width: 15%;">HSN/SAC</th>
                <th rowspan="2" style="font-size: 9px; width: 20%;">Taxable Value</th>
                ${totals.isIntraState ? `
                  <th colspan="2" style="font-size: 9px; width: 25%;">Central Tax (CGST)</th>
                  <th colspan="2" style="font-size: 9px; width: 25%;">State Tax (SGST)</th>
                ` : `
                  <th colspan="2" style="font-size: 9px; width: 50%;">Integrated Tax (IGST)</th>
                `}
                <th rowspan="2" style="font-size: 9px; width: 15%;">Total Tax Amt</th>
              </tr>
              <tr>
                ${totals.isIntraState ? `
                  <th style="font-size: 8px;">Rate</th><th style="font-size: 8px;">Amt</th>
                  <th style="font-size: 8px;">Rate</th><th style="font-size: 8px;">Amt</th>
                ` : `
                  <th style="font-size: 8px;">Rate</th><th style="font-size: 8px;">Amt</th>
                `}
              </tr>
            </thead>
            <tbody id="hsn-breakup-tbody">
              ${getHSNBreakupHTML(totals)}
            </tbody>
          </table>
        </section>

        <!-- T&C Box -->
        <section class="tally-company-box" style="border-top: 1px solid #000; border-bottom: 1px solid #000;">
          <p class="bold" style="font-size: 10px; text-decoration: underline;">Terms &amp; Conditions:</p>
          <div id="terms-list-box" style="font-size: 10px; margin-top: 4px; line-height: 1.4;">
            ${invoiceData.terms.map((t, idx) => `
              <div class="tc-item" style="position: relative;">
                <span contenteditable="true" data-key="terms[${idx}]" placeholder="Write term...">${escapeHTML(t)}</span>
                <button class="btn-row-action btn-row-delete no-print" onclick="deleteTerm(${idx})" style="position: absolute; right: 0; top: 0; width:18px; height:18px; padding:0; display: inline-flex;" title="Remove Term">×</button>
              </div>
            `).join('')}
          </div>
          <button class="btn-add-row no-print" onclick="addTermRow()" style="margin-top: 6px;">+ Add Term</button>
        </section>

        <!-- Signature Area -->
        <section class="tally-bordered-table" style="border: none;">
          <table class="tally-bordered-table" style="border: none;">
            <tr>
              <td style="border: none; vertical-align: top; font-size: 10px; width: 60%;">
                ${invoiceData.showNotes ? `
                  <p class="bold">Notes / Declarations:</p>
                  <p contenteditable="true" data-key="notes" placeholder="Custom note...">${escapeHTML(invoiceData.notes)}</p>
                ` : ''}
              </td>
              <td style="border: none; vertical-align: top; text-align: right; font-size: 10px; width: 40%; height: 90px; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end;">
                <p>For <strong contenteditable="true" data-key="authorizedSignatory">${escapeHTML(invoiceData.authorizedSignatory)}</strong></p>
                <p style="margin-top: 50px; font-weight: bold; border-top: 1px solid #000; padding-top: 4px; width: 140px; text-align: center;">Authorised Signatory</p>
              </td>
            </tr>
          </table>
        </section>
      ` : ''}

    </div>
  `;
}

// 2. GeM Standard Box Layout — supports multi-page pagination
function getGemHTML(pageData) {
  const { pageItems, startIndex, totals, isFirst, isLast, pageNum, totalPages } = pageData;

  const itemsRows = pageItems.map((item, localIdx) => {
    const globalIdx = startIndex + localIdx;
    const totalTaxForThis = item.itemTax;
    return `
      <tr>
        <td class="center">${globalIdx + 1}
          <div class="table-row-actions no-print">
            <button class="btn-row-action btn-row-delete" onclick="deleteItemRow(${globalIdx})" title="Delete Line">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </td>
        <td contenteditable="true" data-key="items[${globalIdx}].description" placeholder="Product Description">${escapeHTML(item.description)}</td>
        <td class="center col-hsn" contenteditable="true" data-key="items[${globalIdx}].hsn" placeholder="-">${escapeHTML(item.hsn)}</td>
        <td class="right" contenteditable="true" data-key="items[${globalIdx}].qty" placeholder="0">${item.qty.toLocaleString()}</td>
        <td class="center" contenteditable="true" data-key="items[${globalIdx}].unit" placeholder="Pcs">${escapeHTML(item.unit)}</td>
        <td class="right" contenteditable="true" data-key="items[${globalIdx}].rate" placeholder="0.00">${formatCurrency(item.rate)}</td>
        <td class="right bold" data-computed="gem-gst-amt-${globalIdx}">${item.gstRate}%<br>Rs. ${formatCurrency(totalTaxForThis)}</td>
        <td class="right bold" data-computed="item-total-${globalIdx}">Rs. ${formatCurrency(item.rowTotal)}</td>
      </tr>
    `;
  }).join('');

  return `
    <div class="gem-frame template-gem">

      ${isFirst ? `
        <!-- Title Block (Page 1 only) -->
        <div class="gem-title-block">
          <span class="gem-title">TAX INVOICE</span>
          <div style="font-size: 11px; text-align: right;">
            <span>Date: <strong contenteditable="true" data-key="invoiceDate">${escapeHTML(invoiceData.invoiceDate)}</strong></span><br>
            <span><strong>Bill No.:</strong> <span contenteditable="true" data-key="invoiceNo" placeholder="Bill No.">${escapeHTML(invoiceData.invoiceNo)}</span></span>
          </div>
        </div>

        <!-- Seller Block (Page 1 only) -->
        <div class="gem-company-block">
          ${getTemplateLogoHTML()}
          <h1 class="bold" contenteditable="true" data-key="companyName" placeholder="Seller Name" style="font-size: 20px; color: var(--invoice-accent); letter-spacing: 0.5px;">${escapeHTML(invoiceData.companyName)}</h1>
          <p contenteditable="true" data-key="companyAddress" placeholder="Seller Address" style="white-space: pre-wrap; font-size: 11px; margin-top: 4px; color: #475569;">${escapeHTML(invoiceData.companyAddress)}</p>
          <p style="margin-top: 4px; font-size: 11px;">
            Ph: <strong contenteditable="true" data-key="companyPhone">${escapeHTML(invoiceData.companyPhone)}</strong> | Email: <strong contenteditable="true" data-key="companyEmail">${escapeHTML(invoiceData.companyEmail)}</strong>
          </p>
          <p style="margin-top: 2px; font-size: 11px;">
            GSTIN: <strong contenteditable="true" data-key="companyGSTIN">${escapeHTML(invoiceData.companyGSTIN)}</strong> | 
            <span contenteditable="true" data-key="companyExtra">${escapeHTML(invoiceData.companyExtra)}</span>
          </p>
        </div>

        <!-- Billed By vs To split (Page 1 only) -->
        <div class="gem-parties-block">
          <div class="gem-party-col">
            <div class="gem-party-title">BILLED BY (SELLER)</div>
            <p><strong contenteditable="true" data-key="companyName">${escapeHTML(invoiceData.companyName)}</strong></p>
            <p contenteditable="true" data-key="companyAddress" style="white-space: pre-wrap; font-size: 11px; margin-top: 4px;">${escapeHTML(invoiceData.companyAddress)}</p>
            <p style="margin-top: 8px;">GSTIN: <strong contenteditable="true" data-key="companyGSTIN">${escapeHTML(invoiceData.companyGSTIN)}</strong></p>
          </div>
          <div class="gem-party-col">
            <div class="gem-party-title">BILLED TO (BUYER)</div>
            <p><strong contenteditable="true" data-key="clientName">${escapeHTML(invoiceData.clientName)}</strong></p>
            <p contenteditable="true" data-key="clientAddress" style="white-space: pre-wrap; font-size: 11px; margin-top: 4px;">${escapeHTML(invoiceData.clientAddress)}</p>
            <p style="margin-top: 8px;">GSTIN: <strong contenteditable="true" data-key="clientGSTIN">${escapeHTML(invoiceData.clientGSTIN)}</strong></p>
            <p>Contact: <strong contenteditable="true" data-key="clientPhone">${escapeHTML(invoiceData.clientPhone)}</strong></p>
          </div>
        </div>

        <!-- GeM contract line (Page 1 only) -->
        <div class="gem-meta-bar center bold" contenteditable="true" data-key="clientExtra" placeholder="Additional metadata line">
          ${escapeHTML(invoiceData.clientExtra)}
        </div>
      ` : `
        <!-- Compact continuation header (Pages 2+) -->
        <div class="page-continuation-header" style="padding: 8px 12px; border-bottom: 1px solid #0f172a;">
          <span><strong>${escapeHTML(invoiceData.companyName)}</strong> | Invoice: ${escapeHTML(invoiceData.invoiceNo)} | Date: ${escapeHTML(invoiceData.invoiceDate)}</span>
          <span style="font-size: 9px; color: #888;">Page ${pageNum} of ${totalPages} (Continued)</span>
        </div>
      `}

      <!-- Item Table -->
      <table class="gem-table">
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 40%;">Product Description</th>
            <th class="col-hsn" style="width: 12%;">HSN Code</th>
            <th style="width: 10%;">Qty</th>
            <th style="width: 8%;">Unit</th>
            <th style="width: 10%;">Rate (Rs.)</th>
            <th style="width: 15%;">GST% Amount (Rs.)</th>
            <th style="width: 15%;">Total Amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>
      
      <!-- Interactive Add Row Button (last page only) -->
      ${isLast ? `
        <div class="table-append-row no-print">
          <button class="btn-add-row" onclick="addItemRow()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Item Row
          </button>
        </div>
      ` : `
        <div class="no-print" style="text-align:center; padding: 4px 0; font-size: 10px; color: #94a3b8; border-top: 1px dashed #cbd5e1;">— Continued on Page ${pageNum + 1} —</div>
      `}

      ${isLast ? `
        <!-- GeM Totals and Bank Block Split (Last page only) -->
        <div class="gem-bottom-grid">
          <div class="gem-bottom-left">
            <div>
              <p><strong>Amount in Words:</strong></p>
              <p id="calc-words-total" style="font-style: italic; font-weight: bold; margin-top: 2px;">${totals.wordsTotal}</p>
            </div>
            
            ${invoiceData.showUPIQR ? `
              <div class="modern-qr-block" style="max-width: 320px;">
                <img id="upi-qr-image" class="modern-qr-code" src="${getUPIQRCodeURL(totals.grandTotal)}" alt="Scan to Pay">
                <div class="modern-qr-text">
                  <strong>Pay Securely Via UPI</strong><br>
                  Recipient: ${escapeHTML(invoiceData.upiId)}<br>
                  Scan from any banking app (BHIM, PhonePe, GPAY, etc.)
                </div>
              </div>
            ` : ''}

            ${invoiceData.showBankDetails ? `
              <div style="border-top: 1px solid #e2e8f0; padding-top: 8px;">
                <p><strong>Bank Account Details:</strong></p>
                <p style="font-size: 11px; margin-top: 2px;">
                  Bank: <span contenteditable="true" data-key="bankName">${escapeHTML(invoiceData.bankName)}</span> | 
                  A/C No: <span contenteditable="true" data-key="bankAccNo">${escapeHTML(invoiceData.bankAccNo)}</span> | 
                  IFSC: <span contenteditable="true" data-key="bankIFSC">${escapeHTML(invoiceData.bankIFSC)}</span>
                </p>
              </div>
            ` : ''}
          </div>
          
          <div class="gem-bottom-right">
            <div class="gem-total-row">
              <span>Taxable Value:</span>
              <strong id="calc-subtotal">Rs. ${formatCurrency(totals.subtotalTaxable)}</strong>
            </div>
            ${totals.isIntraState ? `
              <div class="gem-total-row">
                <span>CGST total:</span>
                <strong id="calc-cgst-total">Rs. ${formatCurrency(totals.totalCGSTAmt)}</strong>
              </div>
              <div class="gem-total-row">
                <span>SGST total:</span>
                <strong id="calc-sgst-total">Rs. ${formatCurrency(totals.totalSGSTAmt)}</strong>
              </div>
            ` : `
              <div class="gem-total-row">
                <span>IGST total:</span>
                <strong id="calc-igst-total">Rs. ${formatCurrency(totals.totalIGSTAmt)}</strong>
              </div>
            `}
            <div class="gem-total-row">
              <span>Total GST:</span>
              <strong id="calc-tax-total">Rs. ${formatCurrency(totals.totalTax)}</strong>
            </div>
            <div class="gem-total-row">
              <span>Round Off:</span>
              <strong id="calc-round-off">Rs. ${formatCurrency(totals.roundOff)}</strong>
            </div>
            <div class="gem-total-row gem-grand-total">
              <span>GRAND TOTAL:</span>
              <span style="color: var(--invoice-accent);">Rs. <span id="calc-grand-total">${formatCurrency(totals.grandTotal)}</span></span>
            </div>
          </div>
        </div>

        <!-- T&C list (Last page only) -->
        <div class="gem-terms-block">
          <p class="bold" style="font-size: 11px;">TERMS &amp; CONDITIONS</p>
          <ol id="terms-list-box" style="margin-left: 16px; margin-top: 4px; font-size: 11px; line-height: 1.5;">
            ${invoiceData.terms.map((t, idx) => `
              <li class="tc-item" style="position: relative;">
                <span contenteditable="true" data-key="terms[${idx}]" placeholder="Write term...">${escapeHTML(t)}</span>
                <button class="btn-row-action btn-row-delete no-print" onclick="deleteTerm(${idx})" style="position: absolute; right: 0; top: 0; width:18px; height:18px; padding:0; display: inline-flex;" title="Remove Term">×</button>
              </li>
            `).join('')}
          </ol>
          <button class="btn-add-row no-print" onclick="addTermRow()" style="margin-top: 4px;">+ Add Term</button>
        </div>

        <!-- Footer signature block (Last page only) -->
        <div class="gem-footer-block">
          <div class="gem-footer-left">
            ${invoiceData.showNotes ? `
              <p style="font-size: 10px; color: #64748b; font-style: italic;">
                Notes:<br>
                <span contenteditable="true" data-key="notes">${escapeHTML(invoiceData.notes)}</span>
              </p>
            ` : ''}
          </div>
          <div class="gem-footer-right">
            <span>For <strong contenteditable="true" data-key="authorizedSignatory">${escapeHTML(invoiceData.authorizedSignatory)}</strong></span>
            <span style="margin-top: 50px; font-weight: bold; border-top: 1px solid #0f172a; padding-top: 4px; width: 150px; text-align: center; font-size: 10px;">Authorised Signatory</span>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

// 3. Modern Corporate Style — supports multi-page pagination
function getModernHTML(pageData) {

  const { pageItems, startIndex, totals, isFirst, isLast, pageNum, totalPages } = pageData;

  const itemsRows = pageItems.map((item, localIdx) => {
    const globalIdx = startIndex + localIdx;
    return `
    <tr>
      <td>${globalIdx + 1}
        <div class="table-row-actions no-print">
          <button class="btn-row-action btn-row-delete" onclick="deleteItemRow(${globalIdx})" title="Delete Line">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
      <td contenteditable="true" data-key="items[${globalIdx}].description" placeholder="Description">${escapeHTML(item.description)}</td>
      <td class="center col-hsn" contenteditable="true" data-key="items[${globalIdx}].hsn" placeholder="-">${escapeHTML(item.hsn)}</td>
      <td class="center" contenteditable="true" data-key="items[${globalIdx}].qty" placeholder="0">${item.qty}</td>
      <td class="center" contenteditable="true" data-key="items[${globalIdx}].unit" placeholder="Pcs">${escapeHTML(item.unit)}</td>
      <td class="right" contenteditable="true" data-key="items[${globalIdx}].rate" placeholder="0.00">₹${formatCurrency(item.rate)}</td>
      <td class="center" contenteditable="true" data-key="items[${globalIdx}].gstRate" placeholder="0">${item.gstRate}%</td>
      <td class="right bold" data-computed="item-taxable-${globalIdx}">₹${formatCurrency(item.taxableValue)}</td>
      <td class="right bold" data-computed="item-total-${globalIdx}">₹${formatCurrency(item.rowTotal)}</td>
    </tr>
  `}).join('');


  return `
    <div class="modern-wrapper template-modern">
      
      ${isFirst ? `
        <!-- Modern header (Page 1 only) -->
        <div class="modern-header">
          <div class="modern-logo-box">
            ${getTemplateLogoHTML()}
            <h2 contenteditable="true" data-key="companyName" placeholder="Company Name" style="font-weight: 700; color: var(--invoice-accent);">${escapeHTML(invoiceData.companyName)}</h2>
          </div>
          
          <div class="modern-title-block">
            <h1 class="modern-title">Invoice</h1>
            <div style="font-size: 11px; color: #64748b;">
              Invoice No: <strong contenteditable="true" data-key="invoiceNo">${escapeHTML(invoiceData.invoiceNo)}</strong><br>
              Invoice Date: <strong contenteditable="true" data-key="invoiceDate">${escapeHTML(invoiceData.invoiceDate)}</strong><br>
              Place of Supply: <strong contenteditable="true" data-key="placeOfSupply">${escapeHTML(invoiceData.placeOfSupply)}</strong>
            </div>
          </div>
        </div>

        <!-- Modern Meta Card Row (Page 1 only) -->
        <div class="modern-meta-grid">
          <div class="modern-meta-item">
            <strong>Phone:</strong> <span contenteditable="true" data-key="companyPhone">${escapeHTML(invoiceData.companyPhone)}</span>
          </div>
          <div class="modern-meta-item">
            <strong>Email:</strong> <span contenteditable="true" data-key="companyEmail">${escapeHTML(invoiceData.companyEmail)}</span>
          </div>
          <div class="modern-meta-item">
            <strong>GSTIN:</strong> <span contenteditable="true" data-key="companyGSTIN">${escapeHTML(invoiceData.companyGSTIN)}</span>
          </div>
        </div>

        <!-- Billed by / Billed to Cards (Page 1 only) -->
        <div class="modern-parties-grid">
          <div class="modern-party-card">
            <div class="modern-party-title">Billed by</div>
            <h4 class="bold" contenteditable="true" data-key="companyName">${escapeHTML(invoiceData.companyName)}</h4>
            <p contenteditable="true" data-key="companyAddress" style="white-space: pre-wrap; font-size: 11px; margin-top: 4px; color: #475569;">${escapeHTML(invoiceData.companyAddress)}</p>
            <p style="margin-top: 6px; font-size: 11px;">GSTIN: <strong contenteditable="true" data-key="companyGSTIN">${escapeHTML(invoiceData.companyGSTIN)}</strong></p>
            <p style="font-size: 11px;">PAN: <strong contenteditable="true" data-key="companyPAN">${escapeHTML(invoiceData.companyPAN)}</strong></p>
          </div>
          
          <div class="modern-party-card">
            <div class="modern-party-title">Billed to</div>
            <h4 class="bold" contenteditable="true" data-key="clientName">${escapeHTML(invoiceData.clientName)}</h4>
            <p contenteditable="true" data-key="clientAddress" style="white-space: pre-wrap; font-size: 11px; margin-top: 4px; color: #475569;">${escapeHTML(invoiceData.clientAddress)}</p>
            <p style="margin-top: 6px; font-size: 11px;">GSTIN: <strong contenteditable="true" data-key="clientGSTIN">${escapeHTML(invoiceData.clientGSTIN)}</strong></p>
            <p style="font-size: 11px;">PAN: <strong contenteditable="true" data-key="clientPAN">${escapeHTML(invoiceData.clientPAN)}</strong></p>
          </div>
        </div>
      ` : `
        <!-- Compact continuation header (Pages 2+) -->
        <div class="page-continuation-header" style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 16px;">
          <span><strong style="color: var(--invoice-accent);">${escapeHTML(invoiceData.companyName)}</strong> | Invoice: ${escapeHTML(invoiceData.invoiceNo)} | Date: ${escapeHTML(invoiceData.invoiceDate)}</span>
          <span>Page ${pageNum} of ${totalPages} (Continued)</span>
        </div>
      `}

      <!-- Items table -->
      <table class="modern-table">
        <thead>
          <tr>
            <th style="width: 4%;">#</th>
            <th style="width: 40%;">Item / Description</th>
            <th style="width: 10%;" class="center col-hsn">HSN</th>
            <th style="width: 6%;" class="center">Qty</th>
            <th style="width: 6%;" class="center">Unit</th>
            <th style="width: 10%;" class="right">Rate</th>
            <th style="width: 6%;" class="center">GST</th>
            <th style="width: 10%;" class="right">Taxable</th>
            <th style="width: 12%;" class="right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      <!-- Add item button (last page only) -->
      ${isLast ? `
        <div class="table-append-row no-print" style="border-radius: 8px; margin-top: -24px; margin-bottom: 24px;">
          <button class="btn-add-row" onclick="addItemRow()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Item Row
          </button>
        </div>
      ` : `
        <div class="no-print" style="text-align:center; padding: 4px 0; font-size: 10px; color: #94a3b8; border-top: 1px dashed #e2e8f0; margin: 8px 0 0 0;">— Continued on Page ${pageNum + 1} —</div>
      `}

      ${isLast ? `
        <!-- Modern split totals layout (Last page only) -->
        <div class="modern-bottom-layout">
          
          <!-- Payment details card -->
          ${invoiceData.showBankDetails || invoiceData.showUPIQR ? `
            <div class="modern-payment-card">
              ${invoiceData.showBankDetails ? `
                <div class="modern-payment-title">Bank &amp; Payment Details</div>
                
                <div class="modern-bank-grid">
                  <span class="modern-bank-label">Bank Name:</span>
                  <strong contenteditable="true" data-key="bankName">${escapeHTML(invoiceData.bankName)}</strong>
                  
                  <span class="modern-bank-label">A/c Number:</span>
                  <strong contenteditable="true" data-key="bankAccNo">${escapeHTML(invoiceData.bankAccNo)}</strong>
                  
                  <span class="modern-bank-label">IFSC Code:</span>
                  <strong contenteditable="true" data-key="bankIFSC">${escapeHTML(invoiceData.bankIFSC)}</strong>
                </div>
              ` : ''}
              
              <!-- UPI QR Scanner with auto update -->
              ${invoiceData.showUPIQR ? `
                <div class="modern-qr-block" style="${invoiceData.showBankDetails ? '' : 'margin-top: 0;'}">
                  <img id="upi-qr-image" class="modern-qr-code" src="${getUPIQRCodeURL(totals.grandTotal)}" alt="UPI QR">
                  <div class="modern-qr-text">
                    <strong>UPI Instant Payment QR</strong><br>
                    Scan using standard apps to pay <strong>₹${formatCurrency(totals.grandTotal)}</strong><br>
                    UPI ID: <span contenteditable="true" data-key="upiId" style="border-bottom: 1px dashed #cbd5e1;">${escapeHTML(invoiceData.upiId)}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}
          
          <!-- Calculations breakdown block -->
          <div class="modern-totals-box">
            <div class="modern-total-row">
              <span>Subtotal (Taxable):</span>
              <strong id="calc-subtotal">₹${formatCurrency(totals.subtotalTaxable)}</strong>
            </div>
            
            ${totals.isIntraState ? `
              <div class="modern-total-row">
                <span>CGST Amount:</span>
                <strong id="calc-cgst-total">₹${formatCurrency(totals.totalCGSTAmt)}</strong>
              </div>
              <div class="modern-total-row">
                <span>SGST Amount:</span>
                <strong id="calc-sgst-total">₹${formatCurrency(totals.totalSGSTAmt)}</strong>
              </div>
            ` : `
              <div class="modern-total-row">
                <span>IGST Amount:</span>
                <strong id="calc-igst-total">₹${formatCurrency(totals.totalIGSTAmt)}</strong>
              </div>
            `}
            
            <div class="modern-total-row">
              <span>GST Tax Sum:</span>
              <strong id="calc-tax-total">₹${formatCurrency(totals.totalTax)}</strong>
            </div>
            <div class="modern-total-row">
              <span>Round Off:</span>
              <strong id="calc-round-off">₹${formatCurrency(totals.roundOff)}</strong>
            </div>
            <div class="modern-total-row modern-grand-total">
              <span>Total:</span>
              <span id="calc-grand-total">₹${formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>

        </div>

        <!-- Amount in Words (Last page only) -->
        <div class="modern-words-box">
          Invoice Value in Words: <strong id="calc-words-total">${totals.wordsTotal}</strong>
        </div>

        <!-- Terms and Conditions block (Last page only) -->
        <div style="margin-bottom: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
          <p class="bold" style="font-size: 11px; text-transform: uppercase; color: var(--invoice-accent);">Terms and Conditions</p>
          <ol id="terms-list-box" style="margin-left: 16px; margin-top: 4px; font-size: 11px; color: #64748b; line-height: 1.6;">
            ${invoiceData.terms.map((t, idx) => `
              <li class="tc-item" style="position: relative;">
                <span contenteditable="true" data-key="terms[${idx}]" placeholder="Write term...">${escapeHTML(t)}</span>
                <button class="btn-row-action btn-row-delete no-print" onclick="deleteTerm(${idx})" style="position: absolute; right: 0; top: 0; width:18px; height:18px; padding:0; display: inline-flex;" title="Remove Term">×</button>
              </li>
            `).join('')}
          </ol>
          <button class="btn-add-row no-print" onclick="addTermRow()" style="margin-top: 4px;">+ Add Term</button>
        </div>

        <!-- Modern Footer signature block (Last page only) -->
        <footer class="modern-footer">
          <div style="max-width: 60%;">
            ${invoiceData.showNotes ? `
              <strong style="color: var(--invoice-accent);">Additional notes / declarations</strong><br>
              <span contenteditable="true" data-key="notes" placeholder="Optional notes...">${escapeHTML(invoiceData.notes)}</span>
            ` : ''}
          </div>
          
          <div class="modern-sign-area">
            <p>For <strong contenteditable="true" data-key="authorizedSignatory">${escapeHTML(invoiceData.authorizedSignatory)}</strong></p>
            <span class="modern-sign-line">Authorised Signatory</span>
          </div>
        </footer>
      ` : ''}

    </div>
  `;
}

/* UNDER DEVELOPMENT
function getMinimalistHTML(pageData) {
  const { pageItems, startIndex, totals, isFirst, isLast, pageNum, totalPages } = pageData;

  const itemsRows = pageItems.map((item, localIdx) => {
    const globalIdx = startIndex + localIdx;
    return `
    <tr class="minimal-table-row">
      <td style="padding: 12px 6px; font-size: 11px; color: #64748b;">${globalIdx + 1}
        <div class="table-row-actions no-print">
          <button class="btn-row-action btn-row-delete" onclick="deleteItemRow(${globalIdx})" title="Delete Line">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
      <td style="padding: 12px 6px;" contenteditable="true" data-key="items[${globalIdx}].description" placeholder="Description of goods...">${escapeHTML(item.description)}</td>
      <td style="padding: 12px 6px;" class="center col-hsn" contenteditable="true" data-key="items[${globalIdx}].hsn" placeholder="-">${escapeHTML(item.hsn)}</td>
      <td style="padding: 12px 6px;" class="center" contenteditable="true" data-key="items[${globalIdx}].qty" placeholder="0">${item.qty}</td>
      <td style="padding: 12px 6px;" class="center" contenteditable="true" data-key="items[${globalIdx}].unit" placeholder="Pcs">${escapeHTML(item.unit)}</td>
      <td style="padding: 12px 6px;" class="right" contenteditable="true" data-key="items[${globalIdx}].rate" placeholder="0.00">₹${formatCurrency(item.rate)}</td>
      <td style="padding: 12px 6px;" class="center" contenteditable="true" data-key="items[${globalIdx}].gstRate" placeholder="0">${item.gstRate}%</td>
      <td style="padding: 12px 6px;" class="right bold" data-computed="item-taxable-${globalIdx}">₹${formatCurrency(item.taxableValue)}</td>
      <td style="padding: 12px 6px;" class="right bold" data-computed="item-total-${globalIdx}">₹${formatCurrency(item.rowTotal)}</td>
    </tr>
  `}).join('');

  return `
    <div class="minimalist-wrapper template-minimalist">
      ${isFirst ? `
        <!-- Minimalist Header (Page 1 only) -->
        <div class="minimalist-header" style="display: flex; justify-content: space-between; border-bottom: 2px solid #0f172a; padding-bottom: 24px; margin-bottom: 30px;">
          <div style="max-width: 60%;">
            ${getTemplateLogoHTML()}
            <h1 contenteditable="true" data-key="companyName" style="font-size: 26px; font-weight: 800; letter-spacing: -1px; text-transform: uppercase; color: var(--invoice-accent); line-height: 1.1;">${escapeHTML(invoiceData.companyName)}</h1>
            <p contenteditable="true" data-key="companyAddress" style="white-space: pre-wrap; font-size: 11px; margin-top: 8px; color: #475569; line-height: 1.5;">${escapeHTML(invoiceData.companyAddress)}</p>
            <div style="font-size: 11px; margin-top: 10px; color: #64748b;">
              GSTIN: <span contenteditable="true" data-key="companyGSTIN" style="font-weight: 600; color: #0f172a;">${escapeHTML(invoiceData.companyGSTIN)}</span> | 
              Phone: <span contenteditable="true" data-key="companyPhone" style="font-weight: 600; color: #0f172a;">${escapeHTML(invoiceData.companyPhone)}</span>
            </div>
          </div>
          <div style="text-align: right; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-size: 28px; font-weight: 800; letter-spacing: -0.5px; color: #cbd5e1; text-transform: uppercase;">INVOICE</div>
            <div style="font-size: 11px; color: #475569; line-height: 1.6;">
              Invoice No: <strong contenteditable="true" data-key="invoiceNo" style="color: #0f172a;">${escapeHTML(invoiceData.invoiceNo)}</strong><br>
              Date: <strong contenteditable="true" data-key="invoiceDate" style="color: #0f172a;">${escapeHTML(invoiceData.invoiceDate)}</strong><br>
              Place of Supply: <strong contenteditable="true" data-key="placeOfSupply" style="color: #0f172a;">${escapeHTML(invoiceData.placeOfSupply)}</strong>
            </div>
          </div>
        </div>

        <!-- Parties details (Page 1 only) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">BILL TO</div>
            <h4 style="font-size: 14px; font-weight: 700; color: #0f172a;" contenteditable="true" data-key="clientName">${escapeHTML(invoiceData.clientName)}</h4>
            <p contenteditable="true" data-key="clientAddress" style="white-space: pre-wrap; font-size: 11px; margin-top: 4px; color: #475569; line-height: 1.5;">${escapeHTML(invoiceData.clientAddress)}</p>
            <p style="font-size: 11px; margin-top: 6px; color: #64748b;">GSTIN: <strong contenteditable="true" data-key="clientGSTIN">${escapeHTML(invoiceData.clientGSTIN)}</strong></p>
          </div>
          <div>
            ${invoiceData.showTransport ? `
              <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">TRANSPORT INFORMATION</div>
              <div style="font-size: 11px; display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; color: #475569;">
                <span>Mode:</span><strong contenteditable="true" data-key="transportMode">${escapeHTML(invoiceData.transportMode)}</strong>
                <span>Vehicle:</span><strong contenteditable="true" data-key="vehicleNo">${escapeHTML(invoiceData.vehicleNo)}</strong>
                <span>GR No:</span><strong contenteditable="true" data-key="grNo">${escapeHTML(invoiceData.grNo)}</strong>
                <span>Carrier:</span><strong contenteditable="true" data-key="carrierName">${escapeHTML(invoiceData.carrierName)}</strong>
              </div>
            ` : ''}
          </div>
        </div>
      ` : `
        <!-- Continuation Header (Pages 2+) -->
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; border-bottom: 2px solid #0f172a; padding-bottom: 6px; margin-bottom: 20px;">
          <span><strong>${escapeHTML(invoiceData.companyName)}</strong> | Invoice: ${escapeHTML(invoiceData.invoiceNo)}</span>
          <span>Page ${pageNum} of ${totalPages} (Continued)</span>
        </div>
      `}

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="border-bottom: 2px solid #0f172a;">
            <th style="padding: 8px 6px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 4%;">#</th>
            <th style="padding: 8px 6px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 40%;">Description</th>
            <th style="padding: 8px 6px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 10%;" class="col-hsn">HSN</th>
            <th style="padding: 8px 6px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 6%;">Qty</th>
            <th style="padding: 8px 6px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 6%;">Unit</th>
            <th style="padding: 8px 6px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 10%;">Rate</th>
            <th style="padding: 8px 6px; text-align: center; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 6%;">GST</th>
            <th style="padding: 8px 6px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 10%;">Taxable</th>
            <th style="padding: 8px 6px; text-align: right; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #0f172a; width: 12%;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      ${isLast ? `
        <!-- Add Item row (last page only) -->
        <div class="table-append-row no-print" style="margin-top: -10px; margin-bottom: 20px;">
          <button class="btn-add-row" onclick="addItemRow()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Item Row
          </button>
        </div>
      ` : `
        <div class="no-print" style="text-align:center; padding: 4px 0; font-size: 10px; color: #94a3b8; border-top: 1px dashed #cbd5e1;">— Continued on Page ${pageNum + 1} —</div>
      `}

      ${isLast ? `
        <!-- Bottom Layout -->
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px; border-top: 2px solid #0f172a; padding-top: 20px;">
          <div>
            <div style="font-size: 11px; color: #64748b; margin-bottom: 12px;">
              Amount in words: <strong id="calc-words-total" style="color: #0f172a;">${totals.wordsTotal}</strong>
            </div>

            <!-- UPI QR -->
            ${invoiceData.showUPIQR ? `
              <div class="minimalist-qr-block" style="display: flex; align-items: center; gap: 15px; background-color: #f8fafc; border-radius: 8px; padding: 12px; max-width: 320px;">
                <img id="upi-qr-image" src="${getUPIQRCodeURL(totals.grandTotal)}" alt="Scan to Pay" style="width: 70px; height: 70px;">
                <div style="font-size: 10px; line-height: 1.4; color: #475569;">
                  <strong style="color: #0f172a;">Scan to Pay Instantly</strong><br>
                  UPI ID: <span contenteditable="true" data-key="upiId" style="border-bottom: 1px dashed #94a3b8;">${escapeHTML(invoiceData.upiId)}</span>
                </div>
              </div>
            ` : ''}

            <!-- Bank account details -->
            ${invoiceData.showBankDetails ? `
              <div style="margin-top: 15px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
                <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 4px;">BANK DETAILS</div>
                <div style="font-size: 11px; display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; color: #475569;">
                  <span>Bank:</span><strong contenteditable="true" data-key="bankName">${escapeHTML(invoiceData.bankName)}</strong>
                  <span>Account No:</span><strong contenteditable="true" data-key="bankAccNo">${escapeHTML(invoiceData.bankAccNo)}</strong>
                  <span>IFSC:</span><strong contenteditable="true" data-key="bankIFSC">${escapeHTML(invoiceData.bankIFSC)}</strong>
                </div>
              </div>
            ` : ''}
          </div>

          <!-- Summaries -->
          <div style="background-color: #f8fafc; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569;">
              <span>Subtotal (Taxable):</span>
              <strong id="calc-subtotal">₹${formatCurrency(totals.subtotalTaxable)}</strong>
            </div>
            ${totals.isIntraState ? `
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569;">
                <span>CGST Total:</span>
                <strong id="calc-cgst-total">₹${formatCurrency(totals.totalCGSTAmt)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569;">
                <span>SGST Total:</span>
                <strong id="calc-sgst-total">₹${formatCurrency(totals.totalSGSTAmt)}</strong>
              </div>
            ` : `
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569;">
                <span>IGST Total:</span>
                <strong id="calc-igst-total">₹${formatCurrency(totals.totalIGSTAmt)}</strong>
              </div>
            `}
            <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569;">
              <span>Round Off:</span>
              <strong id="calc-round-off">₹${formatCurrency(totals.roundOff)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 14px; font-weight: 800; border-top: 1px solid #e2e8f0; padding-top: 8px; color: var(--invoice-accent);">
              <span>GRAND TOTAL:</span>
              <span id="calc-grand-total">₹${formatCurrency(totals.grandTotal)}</span>
            </div>
          </div>
        </div>

        <!-- Terms and Notes -->
        <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div>
            <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Terms & Conditions</div>
            <ol id="terms-list-box" style="margin-left: 14px; font-size: 10px; color: #64748b; line-height: 1.5;">
              ${invoiceData.terms.map((t, idx) => `
                <li class="tc-item" style="position: relative;">
                  <span contenteditable="true" data-key="terms[${idx}]">${escapeHTML(t)}</span>
                  <button class="btn-row-action btn-row-delete no-print" onclick="deleteTerm(${idx})" style="position: absolute; right: 0; top: 0; width:18px; height:18px; padding:0; display: inline-flex;" title="Remove Term">×</button>
                </li>
              `).join('')}
            </ol>
            <button class="btn-add-row no-print" onclick="addTermRow()" style="margin-top: 4px;">+ Add Term</button>
          </div>
          <div>
            ${invoiceData.showNotes ? `
              <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">Declarations</div>
              <p contenteditable="true" data-key="notes" style="font-size: 10px; color: #64748b; line-height: 1.5; font-style: italic;">${escapeHTML(invoiceData.notes)}</p>
            ` : ''}
          </div>
        </div>

        <!-- Signature Block -->
        <footer style="margin-top: 40px; display: flex; justify-content: flex-end; text-align: right;">
          <div style="width: 200px;">
            <span style="font-size: 10px; color: #94a3b8;">Issued By</span>
            <p style="font-weight: 700; font-size: 11px; margin-top: 2px;" contenteditable="true" data-key="authorizedSignatory">${escapeHTML(invoiceData.authorizedSignatory)}</p>
            <div style="border-top: 1px solid #0f172a; margin-top: 40px; padding-top: 4px; font-size: 10px; font-weight: bold;">Authorized Representative</div>
          </div>
        </footer>
      ` : ''}
    </div>
  `;
}

/* UNDER DEVELOPMENT
function getNordicHTML(pageData) {
  const { pageItems, startIndex, totals, isFirst, isLast, pageNum, totalPages } = pageData;

  const itemsRows = pageItems.map((item, localIdx) => {
    const globalIdx = startIndex + localIdx;
    return `
    <tr style="border-bottom: 1px solid #f1f5f9;">
      <td style="padding: 10px 8px; font-size: 10px; color: #94a3b8; text-align: center;">${globalIdx + 1}
        <div class="table-row-actions no-print">
          <button class="btn-row-action btn-row-delete" onclick="deleteItemRow(${globalIdx})" title="Delete Line">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
      <td style="padding: 10px 8px;" contenteditable="true" data-key="items[${globalIdx}].description" placeholder="Item description">${escapeHTML(item.description)}</td>
      <td style="padding: 10px 8px; text-align: center;" class="col-hsn" contenteditable="true" data-key="items[${globalIdx}].hsn" placeholder="-">${escapeHTML(item.hsn)}</td>
      <td style="padding: 10px 8px; text-align: center;" contenteditable="true" data-key="items[${globalIdx}].qty" placeholder="0">${item.qty}</td>
      <td style="padding: 10px 8px; text-align: center;" contenteditable="true" data-key="items[${globalIdx}].unit" placeholder="Pcs">${escapeHTML(item.unit)}</td>
      <td style="padding: 10px 8px; text-align: right;" contenteditable="true" data-key="items[${globalIdx}].rate" placeholder="0.00">₹${formatCurrency(item.rate)}</td>
      <td style="padding: 10px 8px; text-align: center;" contenteditable="true" data-key="items[${globalIdx}].gstRate" placeholder="0">${item.gstRate}%</td>
      <td style="padding: 10px 8px; text-align: right;" data-computed="item-taxable-${globalIdx}">₹${formatCurrency(item.taxableValue)}</td>
      <td style="padding: 10px 8px; text-align: right; font-weight: 600; color: var(--invoice-accent);" data-computed="item-total-${globalIdx}">₹${formatCurrency(item.rowTotal)}</td>
    </tr>
  `}).join('');

  return `
    <div class="nordic-wrapper template-nordic" style="font-family: var(--font-sans);">
      ${isFirst ? `
        <!-- Nordic Elegant Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
          <div>
            ${getTemplateLogoHTML()}
            <h1 contenteditable="true" data-key="companyName" style="font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 10px;">${escapeHTML(invoiceData.companyName)}</h1>
            <p contenteditable="true" data-key="companyAddress" style="white-space: pre-wrap; font-size: 11px; margin-top: 6px; color: #64748b; line-height: 1.6;">${escapeHTML(invoiceData.companyAddress)}</p>
          </div>
          <div style="text-align: right;">
            <div style="background-color: #f1f5f9; color: #475569; padding: 4px 12px; border-radius: 20px; font-size: 9px; font-weight: 700; letter-spacing: 1px; display: inline-block; text-transform: uppercase;">TAX DOCUMENT</div>
            <div style="margin-top: 15px; font-size: 11px; color: #64748b; line-height: 1.5;">
              No. <strong contenteditable="true" data-key="invoiceNo" style="color: #0f172a;">${escapeHTML(invoiceData.invoiceNo)}</strong><br>
              Date: <span contenteditable="true" data-key="invoiceDate" style="color: #0f172a;">${escapeHTML(invoiceData.invoiceDate)}</span>
            </div>
          </div>
        </div>

        <!-- Billed By / To cards -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px;">
          <div style="border: 1px solid #f1f5f9; border-radius: 8px; padding: 16px;">
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Recipient</span>
            <h4 style="font-weight: bold; font-size: 13px; color: #0f172a; margin-top: 6px;" contenteditable="true" data-key="clientName">${escapeHTML(invoiceData.clientName)}</h4>
            <p contenteditable="true" data-key="clientAddress" style="white-space: pre-wrap; font-size: 11px; color: #64748b; margin-top: 4px; line-height: 1.5;">${escapeHTML(invoiceData.clientAddress)}</p>
            <div style="margin-top: 8px; font-size: 10px; color: #475569;">GSTIN: <span contenteditable="true" data-key="clientGSTIN" style="font-weight:600;">${escapeHTML(invoiceData.clientGSTIN)}</span></div>
          </div>

          <div style="border: 1px solid #f1f5f9; border-radius: 8px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Metadata Details</span>
              <div style="font-size: 11px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px 10px; color: #64748b; margin-top: 8px;">
                <div>Supply State: <strong contenteditable="true" data-key="placeOfSupply" style="color: #0f172a;">${escapeHTML(invoiceData.placeOfSupply)}</strong></div>
                <div>GSTIN: <strong contenteditable="true" data-key="companyGSTIN" style="color: #0f172a;">${escapeHTML(invoiceData.companyGSTIN)}</strong></div>
              </div>
            </div>
            
            ${invoiceData.showTransport ? `
              <div style="border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 8px; font-size: 10px; color: #64748b;">
                Transport: <span contenteditable="true" data-key="vehicleNo" style="color: #0f172a; font-weight:600;">${escapeHTML(invoiceData.vehicleNo)}</span> | GR: <span contenteditable="true" data-key="grNo" style="color: #0f172a; font-weight:600;">${escapeHTML(invoiceData.grNo)}</span>
              </div>
            ` : ''}
          </div>
        </div>
      ` : `
        <!-- Continuation Header -->
        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; padding-bottom: 8px; border-bottom: 1px solid #f1f5f9; margin-bottom: 24px;">
          <span><strong>${escapeHTML(invoiceData.companyName)}</strong> | No. ${escapeHTML(invoiceData.invoiceNo)}</span>
          <span>Page ${pageNum} of ${totalPages}</span>
        </div>
      `}

      <!-- Table structure -->
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 4%; text-align: center;">#</th>
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 40%; text-align: left;">Item & Description</th>
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 10%; text-align: center;" class="col-hsn">HSN</th>
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 6%; text-align: center;">Qty</th>
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 6%; text-align: center;">Unit</th>
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 10%; text-align: right;">Rate</th>
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 6%; text-align: center;">GST</th>
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 10%; text-align: right;">Taxable</th>
            <th style="padding: 10px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; width: 12%; text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
        </tbody>
      </table>

      ${isLast ? `
        <div class="table-append-row no-print" style="margin-top: -10px; margin-bottom: 20px;">
          <button class="btn-add-row" onclick="addItemRow()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Line
          </button>
        </div>
      ` : `
        <div class="no-print" style="text-align:center; padding: 4px 0; font-size: 10px; color: #cbd5e1;">— Continued —</div>
      `}

      ${isLast ? `
        <!-- Nordic Bottom Calculations -->
        <div style="display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 20px;">
          <div>
            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Total Value in Words</div>
            <p id="calc-words-total" style="font-size: 11px; font-weight: 600; color: #0f172a;">${totals.wordsTotal}</p>

            <!-- Inline Bank details and QR split -->
            <div style="display: flex; gap: 20px; margin-top: 20px;">
              ${invoiceData.showBankDetails ? `
                <div style="flex: 1; border: 1px solid #f1f5f9; border-radius: 8px; padding: 12px;">
                  <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; color: #94a3b8;">Transfer Details</span>
                  <div style="font-size: 10px; color: #64748b; margin-top: 4px; line-height: 1.5;">
                    Bank: <strong contenteditable="true" data-key="bankName" style="color: #0f172a;">${escapeHTML(invoiceData.bankName)}</strong><br>
                    A/C: <strong contenteditable="true" data-key="bankAccNo" style="color: #0f172a;">${escapeHTML(invoiceData.bankAccNo)}</strong><br>
                    IFSC: <strong contenteditable="true" data-key="bankIFSC" style="color: #0f172a;">${escapeHTML(invoiceData.bankIFSC)}</strong>
                  </div>
                </div>
              ` : ''}

              ${invoiceData.showUPIQR ? `
                <div style="flex: 1; border: 1px solid #f1f5f9; border-radius: 8px; padding: 12px; display: flex; align-items: center; gap: 10px;">
                  <img id="upi-qr-image" src="${getUPIQRCodeURL(totals.grandTotal)}" alt="Pay QR" style="width: 50px; height: 50px;">
                  <div style="font-size: 9px; line-height: 1.3; color: #64748b;">
                    <strong style="color: #0f172a;">UPI Remittance</strong><br>
                    Pay: <span contenteditable="true" data-key="upiId" style="border-bottom: 1px dashed #cbd5e1;">${escapeHTML(invoiceData.upiId)}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Aggregates card -->
          <div>
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; background-color: #fafbfc; display: flex; flex-direction: column; gap: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
                <span>Taxable Amount</span>
                <strong id="calc-subtotal">₹${formatCurrency(totals.subtotalTaxable)}</strong>
              </div>
              ${totals.isIntraState ? `
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
                  <span>Central CGST</span>
                  <strong id="calc-cgst-total">₹${formatCurrency(totals.totalCGSTAmt)}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
                  <span>State SGST</span>
                  <strong id="calc-sgst-total">₹${formatCurrency(totals.totalSGSTAmt)}</strong>
                </div>
              ` : `
                <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
                  <span>Integrated IGST</span>
                  <strong id="calc-igst-total">₹${formatCurrency(totals.totalIGSTAmt)}</strong>
                </div>
              `}
              <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                <span>Round Off</span>
                <strong id="calc-round-off">₹${formatCurrency(totals.roundOff)}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 700; color: #0f172a; padding-top: 4px;">
                <span>TOTAL DUE</span>
                <strong style="color: var(--invoice-accent);" id="calc-grand-total">₹${formatCurrency(totals.grandTotal)}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Nordic Terms -->
        <div style="margin-top: 30px; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 30px;">
          <div>
            <span style="font-size: 9px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Terms & Notes</span>
            <ol id="terms-list-box" style="margin-left: 14px; font-size: 10px; color: #64748b; line-height: 1.6; margin-top: 6px;">
              ${invoiceData.terms.map((t, idx) => `
                <li class="tc-item" style="position: relative;">
                  <span contenteditable="true" data-key="terms[${idx}]">${escapeHTML(t)}</span>
                  <button class="btn-row-action btn-row-delete no-print" onclick="deleteTerm(${idx})" style="position: absolute; right: 0; top: 0; width:18px; height:18px; padding:0; display: inline-flex;" title="Remove Term">×</button>
                </li>
              `).join('')}
            </ol>
            <button class="btn-add-row no-print" onclick="addTermRow()" style="margin-top: 4px;">+ Add Term</button>
            
            ${invoiceData.showNotes ? `
              <p contenteditable="true" data-key="notes" style="font-size: 10px; color: #94a3b8; line-height: 1.5; font-style: italic; margin-top: 10px;">${escapeHTML(invoiceData.notes)}</p>
            ` : ''}
          </div>

          <div style="display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-end; height: 100px;">
            <div style="width: 150px; text-align: center;">
              <span style="font-size: 8px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px;">Authorised Signature</span>
              <p style="font-weight: 600; font-size: 11px; margin-top: 4px; color: #0f172a;" contenteditable="true" data-key="authorizedSignatory">${escapeHTML(invoiceData.authorizedSignatory)}</p>
              <div style="border-top: 1px solid #cbd5e1; margin-top: 24px; width: 100%;"></div>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}
*/
function getHSNBreakupHTML(totals) {
  if (totals.hsnBreakup.length === 0) {

    return '<tr><td colspan="7" class="center">- No tax lines calculated -</td></tr>';
  }
  
  return totals.hsnBreakup.map(h => `
    <tr>
      <td class="center">${escapeHTML(h.hsn)}</td>
      <td class="right">${formatCurrency(h.taxableValue)}</td>
      ${totals.isIntraState ? `
        <td class="center">${h.cgstRate}%</td>
        <td class="right">${formatCurrency(h.cgstAmt)}</td>
        <td class="center">${h.sgstRate}%</td>
        <td class="right">${formatCurrency(h.sgstAmt)}</td>
      ` : `
        <td class="center">${h.igstRate}%</td>
        <td class="right">${formatCurrency(h.igstAmt)}</td>
      `}
      <td class="right bold">${formatCurrency(h.totalTax)}</td>
    </tr>
  `).join('');
}

// Escape HTML utility
function escapeHTML(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * ==========================================================================
 * WYSIWYG SYSTEM & INTERACTION MANAGEMENT
 * ==========================================================================
 */

function highlightSidebarControl(dataKey) {
  let elementId = '';
  let accordionId = '';
  
  if (!dataKey) return;
  
  if (dataKey.startsWith('items[')) {
    elementId = 'sidebar-item-discount';
    accordionId = 'accordion-sections';
  } else if (dataKey.startsWith('terms[')) {
    elementId = 'sidebar-item-notes';
    accordionId = 'accordion-sections';
  } else if (['companyName', 'companyAddress', 'companyPhone', 'companyEmail', 'companyGSTIN', 'companyPAN', 'companyState', 'companyStateCode', 'companyExtra'].includes(dataKey)) {
    elementId = 'sidebar-item-logo';
    accordionId = 'accordion-branding';
  } else if (['clientName', 'clientAddress', 'clientGSTIN', 'clientPAN', 'clientState', 'clientStateCode', 'clientPhone', 'clientExtra', 'consigneeName', 'consigneeAddress', 'consigneeGSTIN', 'consigneeState', 'consigneeStateCode', 'buyerName', 'buyerAddress', 'buyerGSTIN', 'buyerState', 'buyerStateCode'].includes(dataKey)) {
    elementId = 'sidebar-item-smarttax';
    accordionId = 'accordion-branding';
  } else if (['invoiceNo', 'invoiceDate', 'placeOfSupply', 'dateOfSupply', 'reverseCharge'].includes(dataKey)) {
    elementId = 'sidebar-item-orientation';
    accordionId = 'accordion-presets';
  } else if (['transportMode', 'vehicleNo', 'grNo', 'carrierName'].includes(dataKey)) {
    elementId = 'sidebar-item-transport';
    accordionId = 'accordion-sections';
  } else if (['bankName', 'bankAccNo', 'bankIFSC', 'bankBranch'].includes(dataKey)) {
    elementId = 'sidebar-item-bank';
    accordionId = 'accordion-sections';
  } else if (['notes', 'authorizedSignatory'].includes(dataKey)) {
    elementId = 'sidebar-item-notes';
    accordionId = 'accordion-sections';
  } else if (dataKey === 'upiId') {
    elementId = 'sidebar-item-qr';
    accordionId = 'accordion-branding';
  } else if (dataKey === 'einvoiceIRN' || dataKey === 'einvoiceAckNo' || dataKey === 'einvoiceAckDate') {
    elementId = 'sidebar-item-smarttax';
    accordionId = 'accordion-branding';
  }

  if (accordionId) {
    document.querySelectorAll('.accordion-item').forEach(acc => {
      if (acc.id === accordionId) {
        acc.classList.add('active');
      } else {
        acc.classList.remove('active');
      }
    });
  }

  if (elementId) {
    const settingEl = document.getElementById(elementId);
    if (settingEl) {
      document.querySelectorAll('.setting-item').forEach(item => item.classList.remove('active-flash'));
      settingEl.classList.add('active-flash');
      settingEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

function attachEditableListeners() {
  const editables = document.querySelectorAll('#invoice-render-area [contenteditable="true"]');
  const tooltip = document.getElementById('wysiwyg-tooltip');
  
  editables.forEach(el => {
    // 1. Direct input state sync
    el.addEventListener('input', () => {
      const key = el.getAttribute('data-key');
      const text = el.innerText;
      updateStateValue(key, text);
      updateCalculatedDOM();
    });

    // 2. Highlight corresponding sidebar control on focus
    el.addEventListener('focus', () => {
      const key = el.getAttribute('data-key');
      highlightSidebarControl(key);
      if (tooltip) tooltip.classList.remove('visible'); // hide hover tooltip on active focus
    });

    // 3. Clear highlights and full render on blur
    el.addEventListener('blur', () => {
      document.querySelectorAll('.setting-item').forEach(item => item.classList.remove('active-flash'));
      renderInvoice();
    });
    
    // 4. Custom Hover Tooltip Event Triggers
    el.addEventListener('mouseenter', () => {
      if (document.activeElement === el) return; // skip if actively focused
      if (tooltip) {
        const rect = el.getBoundingClientRect();
        
        // Populate and place floating tooltip right above the hovered node
        tooltip.classList.add('visible');
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8 + window.scrollY}px`;
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2 + window.scrollX}px`;
      }
    });

    el.addEventListener('mouseleave', () => {
      if (tooltip) {
        tooltip.classList.remove('visible');
      }
    });
    
    // Prevent accidental formatting styles (bold/italic clipboard artifacts) on copy-paste
    el.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData.getData('text/plain');
      const selection = window.getSelection();
      if (!selection.rangeCount) return;
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(text));
      selection.collapseToEnd();
    });
  });
}

/**
 * Table Action Methods
 */

// Add new empty row to item list
window.addItemRow = function() {
  invoiceData.items.push({
    description: 'New Item Name / Description\nBrand Name / Model',
    hsn: 'HSNCODE',
    qty: 1,
    unit: 'Pcs',
    rate: 100.00,
    gstRate: 18,
    discount: 0
  });
  saveToLocalStorage();
  renderInvoice();
};

// Delete row from item list
window.deleteItemRow = function(index) {
  if (invoiceData.items.length <= 1) {
    alert('Invoice must contain at least one item line.');
    return;
  }
  invoiceData.items.splice(index, 1);
  saveToLocalStorage();
  renderInvoice();
};

// Add terms line
window.addTermRow = function() {
  invoiceData.terms.push('New Custom Invoice Payment/Delivery Term');
  saveToLocalStorage();
  renderInvoice();
};

// Delete terms line
window.deleteTerm = function(index) {
  invoiceData.terms.splice(index, 1);
  saveToLocalStorage();
  renderInvoice();
};

/**
 * ==========================================================================
 * SIDEBAR & INSTRUMENTED CONTROLS CONTROLLER
 * ==========================================================================
 */

function initSidebarControls() {
  // Theme Template Toggler buttons
  const templateBtns = document.querySelectorAll('.template-btn');
  templateBtns.forEach(btn => {
    // Sync initial active state
    if (btn.getAttribute('data-template') === invoiceData.template) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
    
    btn.addEventListener('click', () => {
      templateBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const activeTmpl = btn.getAttribute('data-template');
      invoiceData.template = activeTmpl;
      saveToLocalStorage();
      renderInvoice();
    });
  });
  
  // Color Picker & Presets
  const themeColorInput = document.getElementById('theme-color');
  const presets = document.querySelectorAll('.color-preset');
  
  if (themeColorInput) {
    // Sync state
    themeColorInput.value = invoiceData.themeColor;
    
    themeColorInput.addEventListener('input', (e) => {
      invoiceData.themeColor = e.target.value;
      presets.forEach(p => p.classList.remove('active'));
      saveToLocalStorage();
      renderInvoice();
    });
  }
  
  presets.forEach(preset => {
    preset.addEventListener('click', () => {
      presets.forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
      const color = preset.getAttribute('data-color');
      invoiceData.themeColor = color;
      if (themeColorInput) themeColorInput.value = color;
      saveToLocalStorage();
      renderInvoice();
    });
  });
  
  // Margin adjustment slider
  const marginRange = document.getElementById('page-margins');
  const marginVal = document.getElementById('margin-value');
  if (marginRange && marginVal) {
    marginRange.value = invoiceData.pageMargins;
    marginVal.innerText = `${invoiceData.pageMargins}mm`;
    
    marginRange.addEventListener('input', (e) => {
      invoiceData.pageMargins = parseInt(e.target.value, 10);
      marginVal.innerText = `${invoiceData.pageMargins}mm`;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Page Orientation selector
  const orientationSelect = document.getElementById('page-orientation');
  if (orientationSelect) {
    orientationSelect.value = invoiceData.orientation || 'portrait';
    orientationSelect.addEventListener('change', (e) => {
      invoiceData.orientation = e.target.value;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Typography Theme selector
  const fontFamilySelect = document.getElementById('font-family-select');
  if (fontFamilySelect) {
    fontFamilySelect.value = invoiceData.fontStyle || 'sans';
    fontFamilySelect.addEventListener('change', (e) => {
      invoiceData.fontStyle = e.target.value;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Show Discount Column toggle
  const toggleDiscount = document.getElementById('toggle-discount');
  if (toggleDiscount) {
    toggleDiscount.checked = invoiceData.showDiscountCol !== false;
    toggleDiscount.addEventListener('change', (e) => {
      invoiceData.showDiscountCol = e.target.checked;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Show HSN Column toggle
  const toggleHsn = document.getElementById('toggle-hsn');
  if (toggleHsn) {
    toggleHsn.checked = invoiceData.showHsnCol !== false;
    toggleHsn.addEventListener('change', (e) => {
      invoiceData.showHsnCol = e.target.checked;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Show Transport Details toggle
  const toggleTransport = document.getElementById('toggle-transport');
  if (toggleTransport) {
    toggleTransport.checked = invoiceData.showTransport !== false;
    toggleTransport.addEventListener('change', (e) => {
      invoiceData.showTransport = e.target.checked;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Show Bank Details toggle
  const toggleBank = document.getElementById('toggle-bank');
  if (toggleBank) {
    toggleBank.checked = invoiceData.showBankDetails !== false;
    toggleBank.addEventListener('change', (e) => {
      invoiceData.showBankDetails = e.target.checked;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Show Notes toggle
  const toggleNotes = document.getElementById('toggle-notes');
  if (toggleNotes) {
    toggleNotes.checked = invoiceData.showNotes !== false;
    toggleNotes.addEventListener('change', (e) => {
      invoiceData.showNotes = e.target.checked;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Footer on New Page toggle
  const toggleFooterPage = document.getElementById('toggle-footer-page');
  if (toggleFooterPage) {
    toggleFooterPage.checked = invoiceData.footerOnNewPage === true;
    toggleFooterPage.addEventListener('change', (e) => {
      invoiceData.footerOnNewPage = e.target.checked;
      saveToLocalStorage();
      renderInvoice();
    });
  }

  // Show / Hide Logo controls
  const toggleLogo = document.getElementById('toggle-logo');
  const logoBox = document.getElementById('logo-upload-box');
  const logoFileInput = document.getElementById('logo-file');
  const removeLogoBtn = document.getElementById('btn-remove-logo');
  
  if (toggleLogo && logoBox) {
    toggleLogo.checked = invoiceData.showLogo;
    if (invoiceData.showLogo) logoBox.classList.remove('hidden');
    
    toggleLogo.addEventListener('change', (e) => {
      invoiceData.showLogo = e.target.checked;
      if (invoiceData.showLogo) {
        logoBox.classList.remove('hidden');
      } else {
        logoBox.classList.add('hidden');
      }
      saveToLocalStorage();
      renderInvoice();
    });
  }
  
  // Handle Logo uploading (Base64 file reader to persist in localStorage)
  if (logoFileInput) {
    logoFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          invoiceData.logo = evt.target.result;
          if (removeLogoBtn) removeLogoBtn.classList.remove('hidden');
          saveToLocalStorage();
          renderInvoice();
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  if (removeLogoBtn) {
    if (invoiceData.logo) removeLogoBtn.classList.remove('hidden');
    removeLogoBtn.addEventListener('click', () => {
      invoiceData.logo = null;
      if (logoFileInput) logoFileInput.value = '';
      removeLogoBtn.classList.add('hidden');
      saveToLocalStorage();
      renderInvoice();
    });
  }
  
  // Show / Hide UPI QR controls
  const toggleQR = document.getElementById('toggle-qr');
  const qrBox = document.getElementById('qr-settings-box');
  const upiIdInput = document.getElementById('upi-id-input');
  
  if (toggleQR && qrBox) {
    toggleQR.checked = invoiceData.showUPIQR;
    if (!invoiceData.showUPIQR) qrBox.classList.add('hidden');
    
    toggleQR.addEventListener('change', (e) => {
      invoiceData.showUPIQR = e.target.checked;
      if (invoiceData.showUPIQR) {
        qrBox.classList.remove('hidden');
      } else {
        qrBox.classList.add('hidden');
      }
      saveToLocalStorage();
      renderInvoice();
    });
  }
  
  if (upiIdInput) {
    upiIdInput.value = invoiceData.upiId;
    upiIdInput.addEventListener('input', (e) => {
      invoiceData.upiId = e.target.value;
      saveToLocalStorage();
      renderInvoice();
    });
  }
  
  // Smart Tax / Manual Switch
  const toggleSmartTax = document.getElementById('toggle-smart-tax');
  const manualTaxBox = document.getElementById('manual-tax-box');
  const manualTaxSelect = document.getElementById('manual-tax-type');
  
  if (toggleSmartTax && manualTaxBox) {
    toggleSmartTax.checked = invoiceData.smartTax;
    if (!invoiceData.smartTax) manualTaxBox.style.display = 'block';
    
    toggleSmartTax.addEventListener('change', (e) => {
      invoiceData.smartTax = e.target.checked;
      if (invoiceData.smartTax) {
        manualTaxBox.style.display = 'none';
      } else {
        manualTaxBox.style.display = 'block';
      }
      saveToLocalStorage();
      renderInvoice();
    });
  }
  
  if (manualTaxSelect) {
    manualTaxSelect.value = invoiceData.taxOverride;
    manualTaxSelect.addEventListener('change', (e) => {
      invoiceData.taxOverride = e.target.value;
      saveToLocalStorage();
      renderInvoice();
    });
  }
  
  // Core Print Actions
  const printBtn = document.getElementById('btn-print');
  const printFloatingBtn = document.getElementById('btn-print-floating');
  const printAction = () => {
    // Sync active values from DOM to state before printing
    renderInvoice();
    window.print();
  };
  
  if (printBtn) printBtn.addEventListener('click', printAction);
  if (printFloatingBtn) printFloatingBtn.addEventListener('click', printAction);
  
  // Demo Data loading action
  const demoBtn = document.getElementById('btn-demo');
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      if (confirm('Load demo Indian GST tax invoice data (Tally Style)? This will overwrite the current draft.')) {
        loadDemoInvoiceData();
      }
    });
  }

  const demoSurbhiBtn = document.getElementById('btn-demo-surbhi');
  if (demoSurbhiBtn) {
    demoSurbhiBtn.addEventListener('click', () => {
      if (confirm('Load demo Indian GST tax invoice data (GeM Style)? This will overwrite the current draft.')) {
        loadGeMDemoInvoiceData();
      }
    });
  }

  const demoEInvoiceBtn = document.getElementById('btn-demo-einvoice');
  if (demoEInvoiceBtn) {
    demoEInvoiceBtn.addEventListener('click', () => {
      if (confirm('Load demo Indian GST e-Invoice data (direct export style)? This will overwrite the current draft.')) {
        loadEInvoiceDemoInvoiceData();
      }
    });
  }
  
  // Reset clean layout
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Clear all fields on A4 to build a fresh invoice from scratch?')) {
        clearInvoiceFields();
      }
    });
  }
  
  // Import / Export JSON Buttons
  const exportBtn = document.getElementById('btn-export');
  const importTrigger = document.getElementById('btn-import-trigger');
  const importFileInput = document.getElementById('import-file');
  
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(invoiceData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `Invoice_${invoiceData.invoiceNo.replace(/\//g, '_') || 'Draft'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });
  }
  
  if (importTrigger && importFileInput) {
    importTrigger.addEventListener('click', () => {
      importFileInput.click();
    });
    
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
          try {
            const imported = JSON.parse(evt.target.result);
            invoiceData = { ...invoiceData, ...imported };
            saveToLocalStorage();
            
             // Sync dashboard inputs
            if (upiIdInput) upiIdInput.value = invoiceData.upiId;
            if (themeColorInput) themeColorInput.value = invoiceData.themeColor;
            if (toggleLogo) toggleLogo.checked = invoiceData.showLogo;
            if (toggleQR) toggleQR.checked = invoiceData.showUPIQR;
            if (toggleSmartTax) toggleSmartTax.checked = invoiceData.smartTax;
            if (manualTaxSelect) manualTaxSelect.value = invoiceData.taxOverride;
            if (marginRange) {
              marginRange.value = invoiceData.pageMargins;
              marginVal.innerText = `${invoiceData.pageMargins}mm`;
            }
            if (orientationSelect) orientationSelect.value = invoiceData.orientation || 'portrait';
            if (fontFamilySelect) fontFamilySelect.value = invoiceData.fontStyle || 'sans';
            if (toggleDiscount) toggleDiscount.checked = invoiceData.showDiscountCol !== false;
            if (toggleHsn) toggleHsn.checked = invoiceData.showHsnCol !== false;
            if (toggleTransport) toggleTransport.checked = invoiceData.showTransport !== false;
            if (toggleBank) toggleBank.checked = invoiceData.showBankDetails !== false;
            if (toggleNotes) toggleNotes.checked = invoiceData.showNotes !== false;
            
            // Sync logo controls
            if (removeLogoBtn) {
              if (invoiceData.logo) {
                removeLogoBtn.classList.remove('hidden');
              } else {
                removeLogoBtn.classList.add('hidden');
              }
            }
            
            // Sync color preset active state
            if (presets) {
              presets.forEach(p => {
                p.classList.remove('active');
                if (p.getAttribute('data-color') === invoiceData.themeColor) {
                  p.classList.add('active');
                }
              });
            }
            
            // Active template switcher sync buttons
            document.querySelectorAll('.template-btn').forEach(btn => {
              btn.classList.remove('active');
              if (btn.getAttribute('data-template') === invoiceData.template) {
                btn.classList.add('active');
              }
            });
            
            renderInvoice();
            alert('Invoice JSON draft imported successfully!');
          } catch (err) {
            alert('Error parsing uploaded JSON file. Please ensure it is a valid BillCraft Invoice export.');
          }
        };
        reader.readAsText(file);
      }
    });
  }
}

// Reset data helper
function clearInvoiceFields() {
  invoiceData.companyName = 'XXX YYY ZZZ CO';
  invoiceData.companyAddress = 'XXX, YYY Road, ZZZ Industrial Area,\nXXX Town, YYY State – 000000';
  invoiceData.companyPhone = '0000000000';
  invoiceData.companyEmail = 'xxx@company.com';
  invoiceData.companyGSTIN = '00XXXXX0000X0Z0';
  invoiceData.companyPAN = 'XXXXX0000X';
  invoiceData.companyState = 'YYY State';
  invoiceData.companyStateCode = '00';
  invoiceData.companyExtra = 'XXX License No: XXX-000-0000';
  
  invoiceData.clientName = 'XXX CLIENT ENTERPRISES';
  invoiceData.clientAddress = 'XXX Street, YYY Block, ZZZ District,\nXXX City, YYY State – 000000';
  invoiceData.clientGSTIN = '00ZZZZZ0000Z0Z0';
  invoiceData.clientPAN = 'ZZZZZ0000Z';
  invoiceData.clientState = 'YYY State';
  invoiceData.clientStateCode = '00';
  invoiceData.clientPhone = '0000000000';
  invoiceData.clientExtra = 'XXX YYY ZZZ: XXX-00000-A';
  
  invoiceData.invoiceNo = 'XXX/0000/00';
  invoiceData.invoiceDate = new Date().toISOString().split('T')[0];
  invoiceData.reverseCharge = 'N';
  invoiceData.placeOfSupply = 'YYY State';
  invoiceData.dateOfSupply = invoiceData.invoiceDate;
  invoiceData.transportMode = '-';
  invoiceData.vehicleNo = '-';
  invoiceData.grNo = '-';
  invoiceData.carrierName = '-';
  
  invoiceData.items = [
    {
      description: 'XXX YYY ZZZ Service\nMonthly Retainer Fee',
      hsn: '000000',
      qty: 1,
      unit: 'XXX',
      rate: 10000.00,
      gstRate: 18,
      discount: 0
    }
  ];
  
  invoiceData.bankName = 'XXX BANK LIMITED';
  invoiceData.bankAccNo = '000000000000';
  invoiceData.bankIFSC = 'XXXX0000000';
  invoiceData.bankBranch = 'XXX YYY Branch';
  
  invoiceData.terms = [
    'XXX YYY ZZZ Payment Terms',
    'Subject to XXX Jurisdiction E. & O. E.',
    'XXX YYY ZZZ Goods once sold'
  ];
  invoiceData.authorizedSignatory = 'XXX YYY ZZZ CO';
  invoiceData.notes = 'XXX YYY ZZZ warranty and certification details are true and correct.';
  
  saveToLocalStorage();
  renderInvoice();
}

// Load Rich Demo Data helper (Tally Style)
function loadDemoInvoiceData() {
  invoiceData.companyName = 'XXX YYY ZZZ WHOLESALE';
  invoiceData.companyAddress = 'XXX, YYY Market Road,\nZZZ District, XXX State – 000000';
  invoiceData.companyPhone = '0000000000';
  invoiceData.companyEmail = 'xxx@wholesale.com';
  invoiceData.companyGSTIN = '00XXXXX0000X0Z0';
  invoiceData.companyPAN = 'XXXXX0000X';
  invoiceData.companyState = 'XXX State';
  invoiceData.companyStateCode = '00';
  invoiceData.companyExtra = 'XXX YYY ZZZ Wholesale Solutions';
  
  invoiceData.clientName = 'XXX YYY ZZZ RETAIL';
  invoiceData.clientAddress = 'XXX Retail Bazar Lane,\nZZZ District, XXX State – 000000';
  invoiceData.clientGSTIN = '00ZZZZZ0000Z0Z0';
  invoiceData.clientPAN = 'ZZZZZ0000Z';
  invoiceData.clientState = 'XXX State';
  invoiceData.clientStateCode = '00';
  invoiceData.clientPhone = '0000000000';
  invoiceData.clientExtra = 'XXX YYY ZZZ | Delivery: 00 XXX 2026';
  
  invoiceData.invoiceNo = 'XXX-0000';
  invoiceData.invoiceDate = '2026-01-01';
  invoiceData.reverseCharge = 'N';
  invoiceData.placeOfSupply = 'XXX State';
  invoiceData.dateOfSupply = '2026-01-01';
  invoiceData.transportMode = 'XXX';
  invoiceData.vehicleNo = 'XX-00-XX-0000';
  invoiceData.grNo = 'XX-0000';
  invoiceData.carrierName = 'XXX YYY Express';
  
  invoiceData.items = [
    {
      description: 'DEMO ITEM XXX 1LTR',
      hsn: '0000',
      qty: 10,
      unit: 'XXX',
      rate: 78.10,
      gstRate: 5,
      discount: 0
    },
    {
      description: 'DEMO ITEM YYY 1KG',
      hsn: '0000',
      qty: 12,
      unit: 'YYY',
      rate: 45.71,
      gstRate: 5,
      discount: 0
    },
    {
      description: 'DEMO ITEM ZZZ 125G\nPromo Pack',
      hsn: '0000',
      qty: 12,
      unit: 'ZZZ',
      rate: 76.27,
      gstRate: 18,
      discount: 0
    },
    {
      description: 'DEMO ITEM XXX YYY 500G',
      hsn: '0000',
      qty: 6,
      unit: 'XXX',
      rate: 94.29,
      gstRate: 5,
      discount: 0
    },
    {
      description: 'DEMO ITEM YYY ZZZ 400G',
      hsn: '0000',
      qty: 3,
      unit: 'YYY',
      rate: 30.00,
      gstRate: 0,
      discount: 0
    }
  ];
  
  invoiceData.bankName = 'XXX BANK';
  invoiceData.bankAccNo = '000000000000';
  invoiceData.bankIFSC = 'XXXX0000000';
  invoiceData.bankBranch = 'XXX YYY ZZZ Branch';
  
  invoiceData.terms = [
    'XXX YYY ZZZ Payment Terms',
    'Subject to XXX Jurisdiction E. & O. E.',
    'XXX YYY ZZZ Goods once sold'
  ];
  invoiceData.authorizedSignatory = 'XXX YYY ZZZ WHOLESALE';
  invoiceData.notes = 'XXX YYY ZZZ warranty and certification details are true and correct.';
  
  saveToLocalStorage();
  renderInvoice();
}

// Load GeM Demo Data helper
function loadGeMDemoInvoiceData() {
  invoiceData.companyName = 'XXX YYY ZZZ CO';
  invoiceData.companyAddress = 'XXX, YYY Road, ZZZ Industrial Area,\nXXX Town, YYY State – 000000';
  invoiceData.companyPhone = '0000000000';
  invoiceData.companyEmail = 'xxx@company.com';
  invoiceData.companyGSTIN = '00XXXXX0000X0Z0';
  invoiceData.companyPAN = 'XXXXX0000X';
  invoiceData.companyState = 'YYY State';
  invoiceData.companyStateCode = '00';
  invoiceData.companyExtra = 'XXX License No: XXX-000-0000';
  
  invoiceData.clientName = 'XXX CLIENT ENTERPRISES';
  invoiceData.clientAddress = 'XXX Street, YYY Block, ZZZ District,\nXXX City, YYY State – 000000';
  invoiceData.clientGSTIN = '00ZZZZZ0000Z0Z0';
  invoiceData.clientPAN = 'ZZZZZ0000Z';
  invoiceData.clientState = 'YYY State';
  invoiceData.clientStateCode = '00';
  invoiceData.clientPhone = '0000000000';
  invoiceData.clientExtra = 'XXX YYY ZZZ: XXX-00000-A | Delivery: 00 XXX 2026';
  
  invoiceData.invoiceNo = 'XXX/0000/00';
  invoiceData.invoiceDate = '2026-01-01';
  invoiceData.reverseCharge = 'N';
  invoiceData.placeOfSupply = 'YYY State';
  invoiceData.dateOfSupply = '2026-01-01';
  invoiceData.transportMode = 'XXX';
  invoiceData.vehicleNo = '-';
  invoiceData.grNo = '-';
  invoiceData.carrierName = '-';
  
  invoiceData.items = [
    {
      description: 'DEMO ITEM XXX\nBrand: XXX | Origin: YYY',
      hsn: '00000000',
      qty: 9000,
      unit: 'XXX',
      rate: 3.81356,
      gstRate: 18,
      discount: 0
    }
  ];
  
  invoiceData.bankName = 'XXX BANK LIMITED';
  invoiceData.bankAccNo = '000000000000';
  invoiceData.bankIFSC = 'XXXX0000000';
  invoiceData.bankBranch = 'XXX YYY Branch';
  
  invoiceData.terms = [
    'XXX YYY ZZZ Payment Terms',
    'Subject to XXX Jurisdiction E. & O. E.',
    'XXX YYY ZZZ Goods once sold'
  ];
  invoiceData.authorizedSignatory = 'XXX YYY ZZZ CO';
  invoiceData.notes = 'XXX YYY ZZZ warranty and certification details are true and correct.';
  
  saveToLocalStorage();
  
  // Sync dashboard inputs if they are in the sidebar
  const upiIdInput = document.getElementById('upi-id-input');
  if (upiIdInput) upiIdInput.value = invoiceData.upiId;
  
  renderInvoice();
}

// ── Expose functions used in inline onclick="" HTML attributes ───────────────
// Required when the script runs as type="module" (which scopes all declarations).
// Without this, onclick="addItemRow()" would throw ReferenceError in production.
window.addItemRow    = window.addItemRow;
window.deleteItemRow = window.deleteItemRow;
window.deleteTerm    = window.deleteTerm;
window.addTermRow    = window.addTermRow;
window.loadEInvoiceDemoInvoiceData = loadEInvoiceDemoInvoiceData;

// e-Invoice rendering function
function getEInvoiceHTML(pageData) {
  const { pageItems, startIndex, totals, isFirst, isLast, pageNum, totalPages } = pageData;

  const itemsRows = pageItems.map((item, localIdx) => {
    const globalIdx = startIndex + localIdx;
    
    // Heuristic for ledger items: check if it contains cartage, freight, discount, etc.
    const isLedger = item.description.toLowerCase().includes('cartage') || 
                     item.description.toLowerCase().includes('freight') || 
                     item.description.toLowerCase().includes('shipping') ||
                     item.description.toLowerCase().includes('delivery');
                     
    const slNoText = isLedger ? '' : (globalIdx + 1);
    const qtyText = isLedger ? '' : item.qty;
    const rateText = isLedger ? '' : formatCurrency(item.rate);
    const perText = isLedger ? '' : escapeHTML(item.unit);
    
    return `
    <tr>
      <td class="center">${slNoText}
        <div class="table-row-actions no-print">
          <button class="btn-row-action btn-row-delete" onclick="deleteItemRow(${globalIdx})" title="Delete Line">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </td>
      <td contenteditable="true" data-key="items[${globalIdx}].description" placeholder="Description of Goods">${escapeHTML(item.description)}</td>
      <td class="center col-hsn" contenteditable="true" data-key="items[${globalIdx}].hsn" placeholder="-">${escapeHTML(item.hsn)}</td>
      <td class="center" contenteditable="true" data-key="items[${globalIdx}].qty" placeholder="0">${qtyText}</td>
      <td class="right" contenteditable="true" data-key="items[${globalIdx}].rate" placeholder="0.00">${rateText}</td>
      <td class="center" contenteditable="true" data-key="items[${globalIdx}].unit" placeholder="UOM">${perText}</td>
      <td class="right bold" data-computed="item-taxable-${globalIdx}">₹${formatCurrency(item.taxableValue)}</td>
    </tr>
    `;
  }).join('');

  // Auto-appended Output GST Tax Rows in Item List for e-Invoice!
  let taxRows = '';
  if (isLast && pageItems.length > 0) {
    if (totals.isIntraState) {
      // Intra-state taxes: CGST & SGST
      const cgstRate = totals.items[0]?.cgstRate || 9;
      const sgstRate = totals.items[0]?.sgstRate || 9;
      taxRows += `
      <tr class="ledger-addition-row bold">
        <td></td>
        <td class="ledger-desc">OUTPUT CGST ${cgstRate}%</td>
        <td class="center col-hsn"></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="right">₹${formatCurrency(totals.totalCGSTAmt)}</td>
      </tr>
      <tr class="ledger-addition-row bold">
        <td></td>
        <td class="ledger-desc">OUTPUT SGST ${sgstRate}%</td>
        <td class="center col-hsn"></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="right">₹${formatCurrency(totals.totalSGSTAmt)}</td>
      </tr>
      `;
    } else {
      // Inter-state taxes: IGST
      const igstRate = totals.items[0]?.igstRate || 18;
      taxRows += `
      <tr class="ledger-addition-row bold">
        <td></td>
        <td class="ledger-desc">OUTPUT IGST ${igstRate}%</td>
        <td class="center col-hsn"></td>
        <td></td>
        <td></td>
        <td></td>
        <td class="right">₹${formatCurrency(totals.totalIGSTAmt)}</td>
      </tr>
      `;
    }
  }

  const tableHeader = `
    <table class="tally-bordered-table tally-grid-table einvoice-grid-table">
      <thead>
        <tr>
          <th style="width: 5%;">Sl<br>No.</th>
          <th style="width: 48%;">Description of Goods and Services</th>
          <th class="col-hsn" style="width: 12%;">HSN/SAC</th>
          <th style="width: 8%;">Quantity</th>
          <th style="width: 10%;">Rate</th>
          <th style="width: 7%;">per</th>
          <th style="width: 10%;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
        ${taxRows}
      </tbody>
      ${isLast ? `
        <tfoot>
          <tr class="bold">
            <td></td>
            <td class="right">Total</td>
            <td class="col-hsn"></td>
            <td class="right">${totals.items.reduce((sum, item) => {
              const isLedger = item.description.toLowerCase().includes('cartage') || 
                               item.description.toLowerCase().includes('freight') || 
                               item.description.toLowerCase().includes('shipping') ||
                               item.description.toLowerCase().includes('delivery');
              return sum + (isLedger ? 0 : (parseFloat(item.qty) || 0));
            }, 0)} NOS</td>
            <td></td>
            <td></td>
            <td class="right" id="calc-grand-total">₹${formatCurrency(totals.grandTotal)}</td>
          </tr>
        </tfoot>
      ` : ''}
    </table>`;

  return `
    <div class="tally-double-border template-einvoice">
      
      ${isFirst ? `
        <!-- e-Invoice Top Header -->
        <header class="einvoice-header">
          <div class="einvoice-title-col">
            <h1 class="bold text-center">Tax Invoice</h1>
            <p class="text-center font-italic text-muted">Direct Export</p>
            
            <div class="einvoice-irn-box" style="margin-top: 15px;">
              <p>IRN: <span class="bold" contenteditable="true" data-key="einvoiceIRN">${escapeHTML(invoiceData.einvoiceIRN || '')}</span></p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; margin-top: 6px; font-size: 11px;">
                <div>Ack No. : <strong contenteditable="true" data-key="einvoiceAckNo">${escapeHTML(invoiceData.einvoiceAckNo || '')}</strong></div>
                <div>Ack Date : <strong contenteditable="true" data-key="einvoiceAckDate">${escapeHTML(invoiceData.einvoiceAckDate || '')}</strong></div>
              </div>
            </div>
          </div>
          
          <div class="einvoice-qr-col">
            <div class="qr-border-box">
              <span class="qr-label">e-Invoice</span>
              <img class="einvoice-qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(invoiceData.einvoiceIRN || '')}" alt="e-Invoice QR">
            </div>
          </div>
        </header>

        <!-- Company & Parties Details Grid -->
        <section class="einvoice-parties-grid">
          <!-- Left Column: Seller, Consignee, Buyer -->
          <div class="einvoice-parties-left">
            <div class="party-box supplier-box">
              <h3 contenteditable="true" data-key="companyName" class="bold">${escapeHTML(invoiceData.companyName || '')}</h3>
              <p contenteditable="true" data-key="companyAddress" style="white-space: pre-wrap;">${escapeHTML(invoiceData.companyAddress || '')}</p>
              <p>GSTIN/UIN: <strong contenteditable="true" data-key="companyGSTIN">${escapeHTML(invoiceData.companyGSTIN || '')}</strong></p>
              <p>State Name: <strong contenteditable="true" data-key="companyState">${escapeHTML(invoiceData.companyState || '')}</strong>, Code : <strong contenteditable="true" data-key="companyStateCode">${escapeHTML(invoiceData.companyStateCode || '')}</strong></p>
            </div>
            
            <div class="party-box consignee-box">
              <div class="party-title">Consignee (Ship to)</div>
              <h3 contenteditable="true" data-key="consigneeName" class="bold">${escapeHTML(invoiceData.consigneeName || invoiceData.clientName || '')}</h3>
              <p contenteditable="true" data-key="consigneeAddress" style="white-space: pre-wrap;">${escapeHTML(invoiceData.consigneeAddress || invoiceData.clientAddress || '')}</p>
              <p>GSTIN/UIN : <strong contenteditable="true" data-key="consigneeGSTIN">${escapeHTML(invoiceData.consigneeGSTIN || invoiceData.clientGSTIN || '')}</strong></p>
              <p>State Name : <strong contenteditable="true" data-key="consigneeState">${escapeHTML(invoiceData.consigneeState || invoiceData.clientState || '')}</strong>, Code : <strong contenteditable="true" data-key="consigneeStateCode">${escapeHTML(invoiceData.consigneeStateCode || invoiceData.clientStateCode || '')}</strong></p>
            </div>
            
            <div class="party-box buyer-box">
              <div class="party-title">Buyer (Bill to)</div>
              <h3 contenteditable="true" data-key="buyerName" class="bold">${escapeHTML(invoiceData.buyerName || invoiceData.clientName || '')}</h3>
              <p contenteditable="true" data-key="buyerAddress" style="white-space: pre-wrap;">${escapeHTML(invoiceData.buyerAddress || invoiceData.clientAddress || '')}</p>
              <p>GSTIN/UIN : <strong contenteditable="true" data-key="buyerGSTIN">${escapeHTML(invoiceData.buyerGSTIN || invoiceData.clientGSTIN || '')}</strong></p>
              <p>State Name : <strong contenteditable="true" data-key="buyerState">${escapeHTML(invoiceData.buyerState || invoiceData.clientState || '')}</strong>, Code : <strong contenteditable="true" data-key="buyerStateCode">${escapeHTML(invoiceData.buyerStateCode || invoiceData.clientStateCode || '')}</strong></p>
            </div>
          </div>
          
          <!-- Right Column: Metadata Fields -->
          <div class="einvoice-parties-right">
            <table class="metadata-table">
              <tr>
                <td style="width: 50%;">Invoice No.<br><strong contenteditable="true" data-key="invoiceNo" placeholder="-">${escapeHTML(invoiceData.invoiceNo || '')}</strong></td>
                <td style="width: 50%;">Dated<br><strong contenteditable="true" data-key="invoiceDate" placeholder="-">${escapeHTML(invoiceData.invoiceDate || '')}</strong></td>
              </tr>
              <tr>
                <td>Delivery Note<br><strong contenteditable="true" data-key="deliveryNote" placeholder="-">${escapeHTML(invoiceData.deliveryNote || '')}</strong></td>
                <td>Mode/Terms of Payment<br><strong contenteditable="true" data-key="modeTermsOfPayment" placeholder="-">${escapeHTML(invoiceData.modeTermsOfPayment || '')}</strong></td>
              </tr>
              <tr>
                <td>Reference No. & Date<br><strong contenteditable="true" data-key="refNoDate" placeholder="-">${escapeHTML(invoiceData.refNoDate || '')}</strong></td>
                <td>Other References<br><strong contenteditable="true" data-key="otherReferences" placeholder="-">${escapeHTML(invoiceData.otherReferences || '')}</strong></td>
              </tr>
              <tr>
                <td>Buyer's Order No.<br><strong contenteditable="true" data-key="buyersOrderNo" placeholder="-">${escapeHTML(invoiceData.buyersOrderNo || '')}</strong></td>
                <td>Dated<br><strong contenteditable="true" data-key="buyersOrderDate" placeholder="-">${escapeHTML(invoiceData.buyersOrderDate || '')}</strong></td>
              </tr>
              <tr>
                <td>Dispatch Doc No.<br><strong contenteditable="true" data-key="dispatchDocNo" placeholder="-">${escapeHTML(invoiceData.dispatchDocNo || '')}</strong></td>
                <td>Delivery Note Date<br><strong contenteditable="true" data-key="deliveryNoteDate" placeholder="-">${escapeHTML(invoiceData.deliveryNoteDate || '')}</strong></td>
              </tr>
              <tr>
                <td>Dispatched through<br><strong contenteditable="true" data-key="dispatchedThrough" placeholder="-">${escapeHTML(invoiceData.dispatchedThrough || '')}</strong></td>
                <td>Destination<br><strong contenteditable="true" data-key="destination" placeholder="-">${escapeHTML(invoiceData.destination || '')}</strong></td>
              </tr>
              <tr style="height: 100%;">
                <td colspan="2" style="vertical-align: top; border-bottom: none;">Terms of Delivery<br><div contenteditable="true" data-key="termsOfDelivery" placeholder="-" style="min-height: 50px; font-weight: normal;">${escapeHTML(invoiceData.termsOfDelivery || '')}</div></td>
              </tr>
            </table>
          </div>
        </section>
      ` : `
        <!-- compact continuation header -->
        <div class="page-continuation-header">
          <span><strong>${escapeHTML(invoiceData.companyName || '')}</strong> | Invoice No: ${escapeHTML(invoiceData.invoiceNo || '')} | Date: ${escapeHTML(invoiceData.invoiceDate || '')}</span>
          <span style="font-size: 9px; color: #888;">Page ${pageNum} of ${totalPages}</span>
        </div>
      `}

      <!-- Items table -->
      ${pageItems.length > 0 ? tableHeader : ''}
      
      <!-- Interactive Add Row Button for Editor UI -->
      ${isLast && pageItems.length > 0 ? `
        <div class="table-append-row no-print">
          <button class="btn-add-row" onclick="addItemRow()">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            Add Item Row
          </button>
        </div>
      ` : !isLast ? `
        <div class="no-print" style="text-align:center; padding: 4px 0; font-size: 10px; color: #94a3b8;">— Continued on Page ${pageNum + 1} —</div>
      ` : ''}

      ${isLast ? `
        <!-- Amount in Words -->
        <section class="einvoice-words-section">
          <div class="words-left">
            Amount Chargeable (in words)<br>
            <strong id="calc-words-total" style="font-size: 11px;">${totals.wordsTotal}</strong>
          </div>
          <div class="words-right bold italic">E. & O.E</div>
        </section>

        <!-- GST Breakup Table -->
        <section class="einvoice-gst-section">
          <table class="tally-bordered-table">
            <thead>
              <tr>
                <th rowspan="2" style="width: 15%;">HSN/SAC</th>
                <th rowspan="2" style="width: 20%;">Taxable<br>Value</th>
                ${totals.isIntraState ? `
                  <th colspan="2" style="width: 25%;">Central Tax (CGST)</th>
                  <th colspan="2" style="width: 25%;">State Tax (SGST)</th>
                ` : `
                  <th colspan="2" style="width: 50%;">Integrated Tax (IGST)</th>
                `}
                <th rowspan="2" style="width: 15%;">Total<br>Tax Amount</th>
              </tr>
              <tr>
                ${totals.isIntraState ? `
                  <th style="font-size:8px;">Rate</th><th style="font-size:8px;">Amount</th>
                  <th style="font-size:8px;">Rate</th><th style="font-size:8px;">Amount</th>
                ` : `
                  <th style="font-size:8px;">Rate</th><th style="font-size:8px;">Amount</th>
                `}
              </tr>
            </thead>
            <tbody>
              ${getHSNBreakupHTML(totals)}
            </tbody>
            <tfoot>
              <tr class="bold">
                <td class="center">Total</td>
                <td class="right">₹${formatCurrency(totals.subtotalTaxable)}</td>
                ${totals.isIntraState ? `
                  <td></td>
                  <td class="right">₹${formatCurrency(totals.totalCGSTAmt)}</td>
                  <td></td>
                  <td class="right">₹${formatCurrency(totals.totalSGSTAmt)}</td>
                ` : `
                  <td></td>
                  <td class="right">₹${formatCurrency(totals.totalIGSTAmt)}</td>
                `}
                <td class="right">₹${formatCurrency(totals.totalTax)}</td>
              </tr>
            </tfoot>
          </table>
        </section>

        <!-- GST Tax in Words -->
        <section class="einvoice-tax-words-section">
          Tax Amount (in words) : <strong style="font-size: 11px;">INR ${numberToWords(totals.totalTax).replace('Rupees ', '').replace(' Only', ' Only')}</strong>
        </section>

        <!-- Declaration & Sign Block -->
        <section class="einvoice-footer-section">
          <div class="declaration-box">
            <span class="bold" style="text-decoration: underline;">Declaration:</span><br>
            <p contenteditable="true" data-key="notes" style="font-size: 10px; margin-top: 4px; line-height: 1.4;">${escapeHTML(invoiceData.notes)}</p>
          </div>
          
          <div class="signature-box">
            <p>for <strong contenteditable="true" data-key="companyName">${escapeHTML(invoiceData.companyName)}</strong></p>
            
            <!-- Dynamic Blue Stamp/Signature Area! -->
            <div class="einvoice-stamp-wrapper">
              <div class="stamp-bg">
                <span class="stamp-company" contenteditable="true" data-key="companyName">${escapeHTML(invoiceData.companyName)}</span>
                <svg class="stamp-sig-svg" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
                  <path d="M 20 40 Q 60 10, 100 35 T 180 20 Q 150 45, 120 50 Q 80 40, 50 30" fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linecap="round"/>
                  <path d="M 40 45 L 60 15 M 100 48 L 125 10 M 140 35 Q 160 5, 175 40" fill="none" stroke="#2563eb" stroke-width="1.8" stroke-linecap="round"/>
                </svg>
                <span class="stamp-designation">Director</span>
              </div>
            </div>
            
            <p class="auth-label">Authorised Signatory</p>
          </div>
        </section>

        <footer class="einvoice-bottom-footer font-italic text-center text-muted">
          This is a Computer Generated Invoice
        </footer>
      ` : ''}
    </div>
  `;
}

// Load e-Invoice Demo Data helper
function loadEInvoiceDemoInvoiceData() {
  invoiceData.template = 'einvoice';
  invoiceData.themeColor = '#0f172a';
  invoiceData.showLogo = false;
  invoiceData.showUPIQR = false;
  invoiceData.smartTax = true;

  // Company details
  invoiceData.companyName = 'DUMMY SELLER PRIVATE LIMITED';
  invoiceData.companyAddress = '456, Dummy Industrial Area, Faridabad\nHaryana - 121001, India';
  invoiceData.companyPhone = '0129-XXXXXXX';
  invoiceData.companyEmail = 'contact@dummyseller.in';
  invoiceData.companyGSTIN = '06AAAAA0000A1Z2';
  invoiceData.companyPAN = 'AAAAA0000A';
  invoiceData.companyState = 'Haryana';
  invoiceData.companyStateCode = '06';
  invoiceData.companyExtra = 'Ack No. : 112233445566778 | Ack Date : 18-May-26';

  // Client Details
  invoiceData.clientName = 'DUMMY BUYER TRADING';
  invoiceData.clientAddress = '123, Dummy Commercial Road, Gaya,\nChunna Gali More, Balaji Market,\nGaya, Bihar - 823001, India';
  invoiceData.clientGSTIN = '10BBBBB0000B1Z7';
  invoiceData.clientPAN = 'BBBBB0000B';
  invoiceData.clientState = 'Bihar';
  invoiceData.clientStateCode = '10';
  invoiceData.clientPhone = '9999999999';
  invoiceData.clientExtra = 'Buyer (Bill to) & Consignee';

  // Consignee Specific Details
  invoiceData.consigneeName = 'DUMMY BUYER TRADING';
  invoiceData.consigneeAddress = '123, Dummy Commercial Road, Gaya,\nChunna Gali More, Balaji Market,\nGaya, Bihar - 823001, India';
  invoiceData.consigneeGSTIN = '10BBBBB0000B1Z7';
  invoiceData.consigneeState = 'Bihar';
  invoiceData.consigneeStateCode = '10';

  // Buyer Specific Details
  invoiceData.buyerName = 'DUMMY BUYER TRADING';
  invoiceData.buyerAddress = '123, Dummy Commercial Road, Gaya,\nChunna Gali More, Balaji Market,\nGaya, Bihar - 823001, India';
  invoiceData.buyerGSTIN = '10BBBBB0000B1Z7';
  invoiceData.buyerState = 'Bihar';
  invoiceData.buyerStateCode = '10';

  // e-Invoice specific fields
  invoiceData.einvoiceIRN = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  invoiceData.einvoiceAckNo = '112233445566778';
  invoiceData.einvoiceAckDate = '18-May-26';

  // e-Invoice metadata details
  invoiceData.invoiceNo = 'TFPL/26-27/022';
  invoiceData.invoiceDate = '18-May-26';
  invoiceData.deliveryNote = '';
  invoiceData.modeTermsOfPayment = 'Direct Export';
  invoiceData.refNoDate = '';
  invoiceData.otherReferences = '';
  invoiceData.buyersOrderNo = '';
  invoiceData.buyersOrderDate = '';
  invoiceData.dispatchDocNo = '';
  invoiceData.deliveryNoteDate = '';
  invoiceData.dispatchedThrough = '';
  invoiceData.destination = '';
  invoiceData.termsOfDelivery = '';

  // Items
  invoiceData.items = [
    {
      description: 'Dummy Item Name 4" X 6"',
      hsn: '96121090',
      qty: 1,
      unit: 'NOS',
      rate: 2160.00,
      gstRate: 18,
      discount: 0
    },
    {
      description: 'CARTAGE ON SALE',
      hsn: '9965',
      qty: 1,
      unit: 'NOS',
      rate: 180.00,
      gstRate: 18,
      discount: 0
    }
  ];

  // Bank Info
  invoiceData.bankName = 'STATE BANK OF INDIA';
  invoiceData.bankAccNo = '000000000000';
  invoiceData.bankIFSC = 'SBIN0000000';
  invoiceData.bankBranch = 'FARIDABAD Branch';

  invoiceData.terms = [
    'Subject to Haryana Jurisdiction E. & O. E.',
    'Goods once sold will not be taken back.'
  ];
  invoiceData.authorizedSignatory = 'DUMMY SELLER PRIVATE LIMITED';
  invoiceData.notes = 'We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.';

  saveToLocalStorage();
  
  // Sync template toggler buttons
  document.querySelectorAll('.template-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-template') === 'einvoice') {
      btn.classList.add('active');
    }
  });

  renderInvoice();
}
