# One-pager: StockTrack – Kiosk-Mode Inventory Management for Android

## 1. TL;DR
StockTrack is a dedicated Android inventory management app designed to run in kiosk mode on tablets, preventing device misuse while providing frontline employees with an intuitive interface to track stock movements. The app features simple +/− buttons for stock adjustments, user-based transaction logging, low-stock alerts, category filtering, and comprehensive reporting capabilities. It solves the problem of manual stock tracking and accountability by providing real-time visibility into who added or removed inventory items, when, and in what quantities.

## 2. Goals
### Business Goals
* Reduce inventory discrepancies by maintaining accurate, real-time stock counts with full transaction traceability
* Minimize training time and operational friction through an intuitive, employee-friendly interface
* Improve stock replenishment efficiency with customizable low-stock alerts
* Enable data-driven inventory decisions through comprehensive transaction reporting
* Ensure device security and single-purpose usage through kiosk mode implementation

### User Goals
* Quickly add or remove stock items with minimal steps (2-3 taps per transaction)
* Easily find items using search and category filters
* Receive clear visual alerts when items reach low-stock thresholds
* Complete stock adjustments without technical knowledge or extensive training
* For admins: manage user permissions and access detailed transaction histories

### Non-Goals
* Advanced inventory features like purchase orders, supplier management, or multi-location inventory
* Integration with external accounting or ERP systems (initial version)
* iOS or web-based versions in the initial release
* Barcode scanning or RFID integration (future consideration)
* Automated stock reordering or forecasting

## 3. User stories

**Regular Employee (Stock Handler)**
* As a stock handler, I want to quickly adjust inventory counts when receiving or using items so that I can keep records accurate without slowing down my workflow.
* As a stock handler, I want to see which items are running low so that I know what needs to be reordered.
* As a stock handler, I want to search for items by name or browse by category so that I can find what I need quickly in a large inventory.

**Admin User (Inventory Manager)**
* As an inventory manager, I want to add new items to the system and set custom low-stock thresholds so that alerts are relevant to each item's usage patterns.
* As an inventory manager, I want to view transaction logs filtered by date range so that I can audit stock movements and identify patterns or discrepancies.
* As an inventory manager, I want to control which employees have access to the app so that only authorized personnel can make inventory changes.
* As an inventory manager, I want to see who made each stock adjustment so that I can maintain accountability and follow up on issues.

## 4. Functional requirements

### P0 – Must Have (Core MVP)
* **Kiosk Mode**: App locks device to prevent access to other applications or system settings
* **User Authentication**: Account-based login system that tracks all user actions
* **Item Display**: List view showing item name, current quantity, and visual low-stock indicator
* **Stock Adjustment**: +/− buttons that trigger a popup asking for quantity to add or remove
* **Transaction Logging**: Automatic recording of user ID, item, quantity change, and timestamp for every adjustment
* **Search Functionality**: Real-time search bar that queries the full inventory database
* **Category Filtering**: Category selection bar to filter items by predefined categories
* **Low-Stock Alerts**: Visual highlighting (color change/icon) for items below their individual threshold

### P1 – Should Have (Enhanced MVP)
* **Reports Page**: Transaction log viewer with filters for day/week/month/year/custom date range
* **Admin Panel**: Interface for admins to add new inventory items with name, category, initial quantity, and low-stock threshold
* **User Management**: Admin ability to add, remove, or suspend employee access
* **Transaction Details**: Popup or detail view showing full transaction information (who, when, what, how much)

### P2 – Nice to Have (Future Iterations)
* **Bulk Operations**: Ability to adjust multiple items in a single transaction
* **Export Reports**: Download transaction logs as CSV or PDF
* **Notifications**: Push alerts to admins when items hit low-stock thresholds
* **Item Images**: Photo support for each inventory item
* **Offline Mode**: Local data caching with sync when connection is restored

## 5. User experience

### Main User Journey (Stock Adjustment)
* User logs in with credentials → Main inventory screen displays
* User either searches for item or selects category filter → Item list updates
* User taps + or − button next to desired item → Popup appears asking "How many?"
* User enters quantity using number pad → Confirms action
* System records transaction (user, item, quantity, timestamp) → Updates stock count → Returns to item list
* If item is now below low-stock threshold → Item highlights in red/yellow

### Admin User Journey (Item Management)
* Admin logs in → Accesses admin panel from menu
* Selects "Add New Item" → Enters item name, category, initial quantity, low-stock threshold
* Saves item → New item appears in inventory list for all users

### Admin User Journey (Reporting)
* Admin accesses Reports page → Views all transactions by default
* Selects date filter (Today/This Week/This Month/This Year/Custom) → Transaction list updates
* Optionally filters by specific user or item → Views detailed transaction history
* Reviews data for audit or analysis purposes

### Edge Cases & UI Notes
* **Empty Search Results**: Display "No items found" message with option to clear search
* **Zero or Negative Stock**: Allow negative values to track backorders; display warning icon
* **Duplicate Item Names**: Prevent or warn when adding items with identical names
* **Session Timeout**: Auto-logout after 15 minutes of inactivity for security
* **Network Errors**: Display clear error messages; queue transactions for retry if using cloud sync
* **Low-Stock Visual**: Use high-contrast color (red/orange) with icon for accessibility
* **Popup Validation**: Prevent non-numeric input; require confirmation before large adjustments (e.g., >100 units)

## 6. Narrative

**7:45 AM – Warehouse Floor**

Maria arrives for her shift at the distribution center and picks up the tablet stationed at the receiving dock. The device is already running StockTrack in kiosk mode—no distractions, no other apps, just the inventory interface she needs. She logs in with her employee credentials in seconds.

A delivery truck has just arrived with 50 cases of thermal labels. Maria taps the search bar, types "thermal," and the item appears immediately. She taps the + button next to "Thermal Labels 4x6," enters "50" in the popup, and confirms. Done. The system logs that Maria added 50 units at 7:47 AM. The entire process took less than 15 seconds.

As she scrolls through her category filter set to "Shipping Supplies," she notices three items highlighted in red—they're below their low-stock thresholds. She makes a mental note to mention it to her supervisor, who will reorder before they run out.

**2:30 PM – Manager's Office**

David, the inventory manager, opens the Reports page on his tablet. He selects "This Week" and reviews all stock movements. He notices an unusual pattern: 200 units of packing tape were removed yesterday by Jake, but only 50 were logged as added two days prior. He filters the view to show only Jake's transactions and sees the discrepancy clearly.

David walks to the warehouse floor and asks Jake about it. Jake explains they found an unopened box from a previous shipment that wasn't logged—an honest mistake. David returns to his office and uses the admin panel to add the missing 150 units himself, with a note in the system. The inventory is now accurate, and the accountability trail is complete.

**5:00 PM – End of Day**

Maria's shift is ending. She checks the low-stock items one more time using the category filter. Everything she flagged this morning is still highlighted. She knows David has already ordered replacements because she saw him at his desk earlier. The system did its job—simple, accurate, and accountable. She logs out, and the tablet is ready for the night shift.

## 7. Success metrics

* **Adoption Rate**: 90%+ of stock handlers using the app within 2 weeks of deployment
* **Transaction Accuracy**: <2% discrepancy rate between physical counts and system records
* **Time Savings**: Average stock adjustment completed in <20 seconds (baseline: 2-3 minutes with manual logging)
* **Low-Stock Response Time**: Reduction in stockout incidents by 50% within first quarter
* **User Satisfaction**: 4+ out of 5 rating on ease-of-use survey
* **Audit Compliance**: 100% of stock movements traceable to individual users with timestamps
* **System Uptime**: 99%+ availability during operational hours

## 8. Milestones & sequencing

**Phase 1: Core MVP (Weeks 1-6)**
* Kiosk mode implementation and device lockdown
* User authentication system with basic role management
* Item list view with search and category filtering
* Stock adjustment UI (+/− buttons with quantity popup)
* Transaction logging backend
* Low-stock highlighting logic

**Phase 2: Admin & Reporting (Weeks 7-10)**
* Admin panel for adding/editing items and setting thresholds
* User management interface (add/remove access)
* Reports page with date filtering (day/week/month/year/custom)
* Transaction detail views

**Phase 3: Polish & Deploy (Weeks 11-12)**
* User acceptance testing with 3-5 employees
* UI/UX refinements based on feedback
* Performance optimization and bug fixes
* Production deployment to all devices
* Training sessions for staff

**Phase 4: Iteration (Ongoing)**
* Collect usage data and user feedback
* Prioritize P2 features based on real-world needs
* Consider integrations or advanced features (barcode scanning, offline mode, export functionality) 