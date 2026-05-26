# BillCraft ERP - Professional Tax Invoice Generator

BillCraft ERP is an offline-first, highly dynamic, and beautiful professional tax invoice generator. It lets you create, edit, customize, and print GST-compliant professional invoices directly in your browser. Whether you need a classic Tally/Marg ERP style, a GeM standard format, or a modern corporate look, BillCraft ERP supports them all with automated calculations, customizable print settings, and UPI scan-to-pay generation.

---

## 🚀 Key Features

### 1. Choice of Multi-Page Templates
Choose from three professional invoice templates, each automatically paginated and optimized for printing:
* **Classic ERP**: A legacy, dense grid inspired by Tally ERP and Marg ERP. Includes dual-sided summary layout elements.
* **GeM Standard**: A structured box layout conforming to the Government e-Marketplace (GeM) standard.
* **Modern Corporate**: A sleek, contemporary design with light borders and professional spacing.

### 2. Accent Color Customization
* Pick a custom color using the native browser picker, or select one of our premium curated color presets (`Sleek Dark`, `Ocean Blue`, `Deep Green`, `Wine Red`) to style headers, accent lines, and highlighted grand totals to match your brand's aesthetic.

### 3. Dynamic Logo Uploads
* Toggle the **Company Logo** section on or off.
* Upload any standard logo format (PNG/JPG) which gets securely read as a Base64 string and persisted in your browser's local storage.

### 4. Smart UPI QR Code Generator
* Embed an instant **UPI Scan to Pay** QR code directly into the invoice summary block.
* Automatically recalculates the payment payload on any item or price change to embed the precise **Grand Total** and your configured **Merchant UPI ID**.
* Compatible with all major UPI apps (BHIM, PhonePe, Google Pay, Paytm, etc.).

### 5. Smart GST Tax Routing
* **Automatic Routing**: Reads the State field of the Company (Seller) and the Client (Buyer). If they match, it automatically applies **CGST + SGST** (Intra-State). If they differ, it routes as **IGST** (Inter-State).
* **Manual Override**: Toggle off smart routing to manually override and lock the invoice under either the Intra-State or Inter-State tax schemes.

### 6. A4 Print Customization
* **Adjustable Margins**: Use a live slider control to adjust print margins from 5mm up to 25mm.
* **Orientation Toggle**: Instantly switch between standard **A4 Portrait** and **A4 Landscape** depending on the complexity of your data columns.
* **Page-Break Pagination**: Intelligent calculation automatically paginates items into multiple sheets with continuation headers and running page numbering (`Page X of Y`), resolving common printing clipping issues.

### 7. Typography Themes
* **Modern Corporate (Sans-serif)**: Uses clean, highly readable modern sans-serif typefaces (`Inter` and `Outfit`).
* **Classic Dot-Matrix (Monospace)**: Leverages a specialized monospace system (`JetBrains Mono`) for retro billing systems.

### 8. Toggleable Columns & Optional Sections
Keep the invoice minimal and focused by enabling only the sections you need:
* **Show/Hide Discount Column**
* **Show/Hide HSN/SAC Column**
* **Show/Hide Transport Details**: Toggle vehicle number, G.R. number, carrier name, and transport mode.
* **Show/Hide Bank Account Details**: Toggle bank name, account number, IFSC code, and branch location.
* **Show/Hide Notes & Declarations**: Toggle a footer section containing custom warranty/guarantee notes.

### 9. Interactive WYSIWYG & Table Operations
* **Direct Inline Editing**: Click on any text, address, metadata cell, or financial value on the simulated A4 page to edit details directly in real-time.
* **Item Management**: Add or delete item rows instantly. Row values recalculate live as you type.
* **Terms & Conditions**: Dynamically add and remove custom terms of service directly on the document canvas.

### 10. Perfect Financial Balance & Currency-to-Words
* **Float Protection**: Tax computations aggregate rounded row-level taxes to avoid fractional ₹0.01 mismatch errors.
* **Automatic Words Converter**: Converts the calculated numeric grand total into traditional Indian Rupees style words dynamically, supporting high crore values recursively.

### 11. Secure Draft Backups (JSON Import/Export)
* **Local Storage Secure**: Automatically saves changes on every keypress so you never lose a draft.
* **JSON Export**: Backup your active invoice to a lightweight `.json` file.
* **JSON Import**: Upload any previous BillCraft JSON draft to instantly reload your templates and settings.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5 (Semantic Structure) & JavaScript (ES6+ Reactive State Engine)
* **Styling**: Vanilla CSS3 (Custom properties, grid systems, custom layout print media rules)
* **Storage**: Browser-native Web Storage (`localStorage`) and `FileReader` APIs for offline drafts and Base64 images.
* **APIs**: Dynamic UPI QR codes fetched securely via dynamic query strings.

---

## 🚀 How to Run

1. **Prerequisites**: Ensure you have Node.js installed on your computer.
2. **Setup**:
   Clone or copy the files into a directory and install dev dependencies if any:
   ```bash
   npm install
   ```
3. **Run Dev Server**:
   Start the development server:
   ```bash
   npm run dev
   ```
4. **Build & Production**:
   To test clean packaging and standard production compilations, compile the static site assets via your bundler command.

---

## 📄 Print Instructions

* When printing, click the floating **Print Invoice** or sidebar **Print / Save PDF** action.
* In the system print dialog:
  * Set **Destination** to `Save as PDF` or select your physical printer.
  * Check that the selected **Layout** matches your customization settings (**Portrait** or **Landscape**).
  * Set **Paper size** to `A4`.
  * Select **Headers and footers** -> `Unchecked` (to hide default browser URL page titles).
  * Select **Background graphics** -> `Checked` (to preserve custom color stripes, card backgrounds, and accent colors).
