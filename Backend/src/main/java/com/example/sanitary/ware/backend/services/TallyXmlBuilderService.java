package com.example.sanitary.ware.backend.services;

import com.example.sanitary.ware.backend.dto.tally.*;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

/**
 * Service to build Tally XML requests
 */
@Service
public class TallyXmlBuilderService {

    private static final DateTimeFormatter TALLY_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd");

    /**
     * Build XML for creating Sales Voucher in Tally
     */
    public String buildSalesVoucherXml(TallySalesVoucherDTO voucher) {
        StringBuilder xml = new StringBuilder();

        xml.append("<ENVELOPE>\n");
        xml.append("  <HEADER>\n");
        xml.append("    <TALLYREQUEST>Import Data</TALLYREQUEST>\n");
        xml.append("  </HEADER>\n");
        xml.append("  <BODY>\n");
        xml.append("    <IMPORTDATA>\n");
        xml.append("      <REQUESTDESC>\n");
        xml.append("        <REPORTNAME>Vouchers</REPORTNAME>\n");
        xml.append("        <STATICVARIABLES>\n");
        xml.append("          <SVCURRENTCOMPANY>$$CURRENTCOMPANY</SVCURRENTCOMPANY>\n");
        xml.append("        </STATICVARIABLES>\n");
        xml.append("      </REQUESTDESC>\n");
        xml.append("      <REQUESTDATA>\n");
        xml.append("        <TALLYMESSAGE xmlns:UDF=\"TallyUDF\">\n");
        xml.append(
                "          <VOUCHER REMOTEID=\"\" VCHKEY=\"\" VCHTYPE=\"Sales\" ACTION=\"Create\" OBJVIEW=\"Invoice Voucher View\">\n");

        // Voucher Details
        xml.append("            <DATE>").append(voucher.getDate().format(TALLY_DATE_FORMAT)).append("</DATE>\n");
        xml.append("            <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>\n");
        xml.append("            <VOUCHERNUMBER>").append(escapeXml(voucher.getVoucherNumber()))
                .append("</VOUCHERNUMBER>\n");
        xml.append("            <PARTYLEDGERNAME>").append(escapeXml(voucher.getPartyName()))
                .append("</PARTYLEDGERNAME>\n");

        if (voucher.getNarration() != null) {
            xml.append("            <NARRATION>").append(escapeXml(voucher.getNarration())).append("</NARRATION>\n");
        }

        // Inventory Allocations
        if (voucher.getInventoryEntries() != null) {
            xml.append("            <ALLINVENTORYENTRIES.LIST>\n");
            for (TallySalesVoucherDTO.TallyInventoryEntry item : voucher.getInventoryEntries()) {
                xml.append("              <STOCKITEMNAME>").append(escapeXml(item.getItemName()))
                        .append("</STOCKITEMNAME>\n");
                xml.append("              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>\n");
                xml.append("              <RATE>").append(String.format("%.2f", item.getRate())).append("</RATE>\n");
                xml.append("              <AMOUNT>").append(String.format("-%.2f", item.getAmount()))
                        .append("</AMOUNT>\n");
                xml.append("              <ACTUALQTY>").append(item.getQuantity()).append(" ").append(item.getUnit())
                        .append("</ACTUALQTY>\n");
                xml.append("              <BILLEDQTY>").append(item.getQuantity()).append(" ").append(item.getUnit())
                        .append("</BILLEDQTY>\n");
            }
            xml.append("            </ALLINVENTORYENTRIES.LIST>\n");
        }

        // Ledger Entries
        if (voucher.getLedgerEntries() != null) {
            for (TallySalesVoucherDTO.TallyLedgerEntry ledger : voucher.getLedgerEntries()) {
                xml.append("            <ALLLEDGERENTRIES.LIST>\n");
                xml.append("              <LEDGERNAME>").append(escapeXml(ledger.getLedgerName()))
                        .append("</LEDGERNAME>\n");
                xml.append("              <ISDEEMEDPOSITIVE>").append(ledger.getIsDebit() ? "Yes" : "No")
                        .append("</ISDEEMEDPOSITIVE>\n");
                xml.append("              <AMOUNT>").append(String.format("%.2f", ledger.getAmount()))
                        .append("</AMOUNT>\n");
                xml.append("            </ALLLEDGERENTRIES.LIST>\n");
            }
        }

        xml.append("          </VOUCHER>\n");
        xml.append("        </TALLYMESSAGE>\n");
        xml.append("      </REQUESTDATA>\n");
        xml.append("    </IMPORTDATA>\n");
        xml.append("  </BODY>\n");
        xml.append("</ENVELOPE>");

        return xml.toString();
    }

    /**
     * Build XML for creating Stock Item in Tally
     */
    public String buildStockItemXml(TallyStockItemDTO stockItem) {
        StringBuilder xml = new StringBuilder();

        xml.append("<ENVELOPE>\n");
        xml.append("  <HEADER>\n");
        xml.append("    <TALLYREQUEST>Import Data</TALLYREQUEST>\n");
        xml.append("  </HEADER>\n");
        xml.append("  <BODY>\n");
        xml.append("    <IMPORTDATA>\n");
        xml.append("      <REQUESTDESC>\n");
        xml.append("        <REPORTNAME>All Masters</REPORTNAME>\n");
        xml.append("        <STATICVARIABLES>\n");
        xml.append("          <SVCURRENTCOMPANY>$$CURRENTCOMPANY</SVCURRENTCOMPANY>\n");
        xml.append("        </STATICVARIABLES>\n");
        xml.append("      </REQUESTDESC>\n");
        xml.append("      <REQUESTDATA>\n");
        xml.append("        <TALLYMESSAGE xmlns:UDF=\"TallyUDF\">\n");
        xml.append("          <STOCKITEM NAME=\"").append(escapeXml(stockItem.getName()))
                .append("\" ACTION=\"Create\">\n");

        if (stockItem.getAlias() != null) {
            xml.append("            <ALIAS>").append(escapeXml(stockItem.getAlias())).append("</ALIAS>\n");
        }

        if (stockItem.getCategory() != null) {
            xml.append("            <PARENT>").append(escapeXml(stockItem.getCategory())).append("</PARENT>\n");
        }

        if (stockItem.getUnit() != null) {
            xml.append("            <BASEUNITS>").append(escapeXml(stockItem.getUnit())).append("</BASEUNITS>\n");
        }

        if (stockItem.getHsnCode() != null) {
            xml.append("            <HSNCODE>").append(escapeXml(stockItem.getHsnCode())).append("</HSNCODE>\n");
        }

        if (stockItem.getGstApplicable() != null) {
            xml.append("            <GSTAPPLICABLE>").append(stockItem.getGstApplicable()).append("</GSTAPPLICABLE>\n");
        }

        if (stockItem.getOpeningBalance() != null) {
            xml.append("            <OPENINGBALANCE>").append(stockItem.getOpeningBalance())
                    .append("</OPENINGBALANCE>\n");
        }

        if (stockItem.getOpeningRate() != null) {
            xml.append("            <OPENINGRATE>").append(stockItem.getOpeningRate()).append("</OPENINGRATE>\n");
        }

        xml.append("          </STOCKITEM>\n");
        xml.append("        </TALLYMESSAGE>\n");
        xml.append("      </REQUESTDATA>\n");
        xml.append("    </IMPORTDATA>\n");
        xml.append("  </BODY>\n");
        xml.append("</ENVELOPE>");

        return xml.toString();
    }

    /**
     * Build XML for creating Ledger (Customer) in Tally
     */
    public String buildLedgerXml(TallyLedgerDTO ledger) {
        StringBuilder xml = new StringBuilder();

        xml.append("<ENVELOPE>\n");
        xml.append("  <HEADER>\n");
        xml.append("    <TALLYREQUEST>Import Data</TALLYREQUEST>\n");
        xml.append("  </HEADER>\n");
        xml.append("  <BODY>\n");
        xml.append("    <IMPORTDATA>\n");
        xml.append("      <REQUESTDESC>\n");
        xml.append("        <REPORTNAME>All Masters</REPORTNAME>\n");
        xml.append("        <STATICVARIABLES>\n");
        xml.append("          <SVCURRENTCOMPANY>$$CURRENTCOMPANY</SVCURRENTCOMPANY>\n");
        xml.append("        </STATICVARIABLES>\n");
        xml.append("      </REQUESTDESC>\n");
        xml.append("      <REQUESTDATA>\n");
        xml.append("        <TALLYMESSAGE xmlns:UDF=\"TallyUDF\">\n");
        xml.append("          <LEDGER NAME=\"").append(escapeXml(ledger.getName())).append("\" ACTION=\"Create\">\n");

        if (ledger.getAlias() != null) {
            xml.append("            <ALIAS>").append(escapeXml(ledger.getAlias())).append("</ALIAS>\n");
        }

        xml.append("            <PARENT>").append(escapeXml(ledger.getParent())).append("</PARENT>\n");

        // Address Details
        if (ledger.getAddress() != null || ledger.getCity() != null) {
            xml.append("            <ADDRESS.LIST TYPE=\"String\">\n");
            if (ledger.getAddress() != null) {
                xml.append("              <ADDRESS>").append(escapeXml(ledger.getAddress())).append("</ADDRESS>\n");
            }
            if (ledger.getCity() != null) {
                String addressLine = ledger.getCity();
                if (ledger.getState() != null) {
                    addressLine += ", " + ledger.getState();
                }
                if (ledger.getPincode() != null) {
                    addressLine += " - " + ledger.getPincode();
                }
                xml.append("              <ADDRESS>").append(escapeXml(addressLine)).append("</ADDRESS>\n");
            }
            xml.append("            </ADDRESS.LIST>\n");
        }

        if (ledger.getPhone() != null) {
            xml.append("            <PHONE>").append(escapeXml(ledger.getPhone())).append("</PHONE>\n");
        }

        if (ledger.getEmail() != null) {
            xml.append("            <EMAIL>").append(escapeXml(ledger.getEmail())).append("</EMAIL>\n");
        }

        if (ledger.getGstin() != null) {
            xml.append("            <PARTYGSTIN>").append(escapeXml(ledger.getGstin())).append("</PARTYGSTIN>\n");
        }

        if (ledger.getPan() != null) {
            xml.append("            <INCOMETAXNUMBER>").append(escapeXml(ledger.getPan()))
                    .append("</INCOMETAXNUMBER>\n");
        }

        if (ledger.getOpeningBalance() != null) {
            xml.append("            <OPENINGBALANCE>").append(ledger.getOpeningBalance()).append("</OPENINGBALANCE>\n");
        }

        xml.append("          </LEDGER>\n");
        xml.append("        </TALLYMESSAGE>\n");
        xml.append("      </REQUESTDATA>\n");
        xml.append("    </IMPORTDATA>\n");
        xml.append("  </BODY>\n");
        xml.append("</ENVELOPE>");

        return xml.toString();
    }

    /**
     * Build XML to test Tally connection
     */
    public String buildTestConnectionXml() {
        return "<ENVELOPE>\n" +
                "  <HEADER>\n" +
                "    <VERSION>1</VERSION>\n" +
                "    <TALLYREQUEST>Export</TALLYREQUEST>\n" +
                "    <TYPE>Data</TYPE>\n" +
                "    <ID>Company Info</ID>\n" +
                "  </HEADER>\n" +
                "  <BODY>\n" +
                "    <DESC>\n" +
                "      <STATICVARIABLES>\n" +
                "        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>\n" +
                "      </STATICVARIABLES>\n" +
                "      <TDL>\n" +
                "        <TDLMESSAGE>\n" +
                "          <REPORT NAME=\"Company Info\">\n" +
                "            <FORMS>Company Info</FORMS>\n" +
                "          </REPORT>\n" +
                "          <FORM NAME=\"Company Info\">\n" +
                "            <PARTS>Company Info</PARTS>\n" +
                "          </FORM>\n" +
                "          <PART NAME=\"Company Info\">\n" +
                "            <LINES>Company Info</LINES>\n" +
                "            <REPEAT>Company Info : Company Collection</REPEAT>\n" +
                "            <SCROLLED>Vertical</SCROLLED>\n" +
                "          </PART>\n" +
                "          <LINE NAME=\"Company Info\">\n" +
                "            <FIELDS>Company Name</FIELDS>\n" +
                "          </LINE>\n" +
                "          <FIELD NAME=\"Company Name\">\n" +
                "            <SET>$Name</SET>\n" +
                "          </FIELD>\n" +
                "          <COLLECTION NAME=\"Company Collection\">\n" +
                "            <TYPE>Company</TYPE>\n" +
                "          </COLLECTION>\n" +
                "        </TDLMESSAGE>\n" +
                "      </TDL>\n" +
                "    </DESC>\n" +
                "  </BODY>\n" +
                "</ENVELOPE>";
    }

    /**
     * Escape special XML characters
     */
    private String escapeXml(String input) {
        if (input == null) {
            return "";
        }
        return input.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }

    /**
     * Build XML to fetch all stock items from Tally
     */
    public String buildGetStockItemsXml() {
        return "\u003cENVELOPE\u003e\n" +
                "  \u003cHEADER\u003e\n" +
                "    \u003cVERSION\u003e1\u003c/VERSION\u003e\n" +
                "    \u003cTALLYREQUEST\u003eExport\u003c/TALLYREQUEST\u003e\n" +
                "    \u003cTYPE\u003eCollection\u003c/TYPE\u003e\n" +
                "    \u003cID\u003eStock Items\u003c/ID\u003e\n" +
                "  \u003c/HEADER\u003e\n" +
                "  \u003cBODY\u003e\n" +
                "    \u003cDESC\u003e\n" +
                "      \u003cSTATICVARIABLES\u003e\n" +
                "        \u003cSVEXPORTFORMAT\u003e$$SysName:XML\u003c/SVEXPORTFORMAT\u003e\n" +
                "        \u003cSVCURRENTCOMPANY\u003e$$CURRENTCOMPANY\u003c/SVCURRENTCOMPANY\u003e\n" +
                "      \u003c/STATICVARIABLES\u003e\n" +
                "      \u003cTDL\u003e\n" +
                "        \u003cTDLMESSAGE\u003e\n" +
                "          \u003cREPORT NAME=\"Stock Items\"\u003e\n" +
                "            \u003cFORMS\u003eStock Items\u003c/FORMS\u003e\n" +
                "          \u003c/REPORT\u003e\n" +
                "          \u003cFORM NAME=\"Stock Items\"\u003e\n" +
                "            \u003cPARTS\u003eStock Items\u003c/PARTS\u003e\n" +
                "          \u003c/FORM\u003e\n" +
                "          \u003cPART NAME=\"Stock Items\"\u003e\n" +
                "            \u003cLINES\u003eStock Items\u003c/LINES\u003e\n" +
                "            \u003cREPEAT\u003eStock Items : Stock Items Collection\u003c/REPEAT\u003e\n" +
                "            \u003cSCROLLED\u003eVertical\u003c/SCROLLED\u003e\n" +
                "          \u003c/PART\u003e\n" +
                "          \u003cLINE NAME=\"Stock Items\"\u003e\n" +
                "            \u003cFIELDS\u003eItem Name, Item Alias, Parent, Base Units, HSN Code, GST Applicable, Closing Balance, Closing Value, Closing Rate, Opening Balance, Opening Value, Opening Rate, GUID\u003c/FIELDS\u003e\n"
                +
                "          \u003c/LINE\u003e\n" +
                "          \u003cFIELD NAME=\"Item Name\"\u003e\n" +
                "            \u003cSET\u003e$Name\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Item Alias\"\u003e\n" +
                "            \u003cSET\u003e$Alias\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Parent\"\u003e\n" +
                "            \u003cSET\u003e$Parent\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Base Units\"\u003e\n" +
                "            \u003cSET\u003e$BaseUnits\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"HSN Code\"\u003e\n" +
                "            \u003cSET\u003e$HSNCode\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"GST Applicable\"\u003e\n" +
                "            \u003cSET\u003e$IsGSTApplicable\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Closing Balance\"\u003e\n" +
                "            \u003cSET\u003e$ClosingBalance\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Closing Value\"\u003e\n" +
                "            \u003cSET\u003e$ClosingValue\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Closing Rate\"\u003e\n" +
                "            \u003cSET\u003e$ClosingRate\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Opening Balance\"\u003e\n" +
                "            \u003cSET\u003e$OpeningBalance\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Opening Value\"\u003e\n" +
                "            \u003cSET\u003e$OpeningValue\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Opening Rate\"\u003e\n" +
                "            \u003cSET\u003e$OpeningRate\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"GUID\"\u003e\n" +
                "            \u003cSET\u003e$GUID\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cCOLLECTION NAME=\"Stock Items Collection\"\u003e\n" +
                "            \u003cTYPE\u003eStock Item\u003c/TYPE\u003e\n" +
                "          \u003c/COLLECTION\u003e\n" +
                "        \u003c/TDLMESSAGE\u003e\n" +
                "      \u003c/TDL\u003e\n" +
                "    \u003c/DESC\u003e\n" +
                "  \u003c/BODY\u003e\n" +
                "\u003c/ENVELOPE\u003e";
    }

    /**
     * Build XML for creating Purchase Voucher in Tally
     */
    public String buildPurchaseVoucherXml(TallyPurchaseVoucherDTO voucher) {
        StringBuilder xml = new StringBuilder();

        xml.append("\u003cENVELOPE\u003e\n");
        xml.append("  \u003cHEADER\u003e\n");
        xml.append("    \u003cTALLYREQUEST\u003eImport Data\u003c/TALLYREQUEST\u003e\n");
        xml.append("  \u003c/HEADER\u003e\n");
        xml.append("  \u003cBODY\u003e\n");
        xml.append("    \u003cIMPORTDATA\u003e\n");
        xml.append("      \u003cREQUESTDESC\u003e\n");
        xml.append("        \u003cREPORTNAME\u003eVouchers\u003c/REPORTNAME\u003e\n");
        xml.append("        \u003cSTATICVARIABLES\u003e\n");
        xml.append("          \u003cSVCURRENTCOMPANY\u003e$$CURRENTCOMPANY\u003c/SVCURRENTCOMPANY\u003e\n");
        xml.append("        \u003c/STATICVARIABLES\u003e\n");
        xml.append("      \u003c/REQUESTDESC\u003e\n");
        xml.append("      \u003cREQUESTDATA\u003e\n");
        xml.append("        \u003cTALLYMESSAGE xmlns:UDF=\"TallyUDF\"\u003e\n");
        xml.append(
                "          \u003cVOUCHER REMOTEID=\"\" VCHKEY=\"\" VCHTYPE=\"Purchase\" ACTION=\"Create\" OBJVIEW=\"Invoice Voucher View\"\u003e\n");

        // Voucher Details
        xml.append("            \u003cDATE\u003e").append(voucher.getDate().format(TALLY_DATE_FORMAT))
                .append("\u003c/DATE\u003e\n");
        xml.append("            \u003cVOUCHERTYPENAME\u003ePurchase\u003c/VOUCHERTYPENAME\u003e\n");
        // Use Reference Number for Purchase Vouchers often
        xml.append("            \u003cREFERENCE\u003e").append(escapeXml(voucher.getVoucherNumber()))
                .append("\u003c/REFERENCE\u003e\n");
        xml.append("            \u003cVOUCHERNUMBER\u003e").append(escapeXml(voucher.getVoucherNumber()))
                .append("\u003c/VOUCHERNUMBER\u003e\n");
        xml.append("            \u003cPARTYLEDGERNAME\u003e").append(escapeXml(voucher.getPartyName()))
                .append("\u003c/PARTYLEDGERNAME\u003e\n");

        if (voucher.getSupplierInvoiceNumber() != null) {
            xml.append("            \u003cREFERENCEDATE\u003e").append(voucher.getDate().format(TALLY_DATE_FORMAT))
                    .append("\u003c/REFERENCEDATE\u003e\n");
        }

        if (voucher.getNarration() != null) {
            xml.append("            \u003cNARRATION\u003e").append(escapeXml(voucher.getNarration()))
                    .append("\u003c/NARRATION\u003e\n");
        }

        // Inventory Allocations (Purchase side stocks increase)
        if (voucher.getInventoryEntries() != null) {
            xml.append("            \u003cALLINVENTORYENTRIES.LIST\u003e\n");
            for (TallyPurchaseVoucherDTO.TallyInventoryEntry item : voucher.getInventoryEntries()) {
                xml.append("              \u003cSTOCKITEMNAME\u003e").append(escapeXml(item.getItemName()))
                        .append("\u003c/STOCKITEMNAME\u003e\n");
                xml.append("              \u003cISDEEMEDPOSITIVE\u003eYes\u003c/ISDEEMEDPOSITIVE\u003e\n"); // Stock In
                                                                                                            // is
                                                                                                            // Positive
                xml.append("              \u003cRATE\u003e").append(String.format("%.2f", item.getRate()))
                        .append("\u003c/RATE\u003e\n");
                xml.append("              \u003cAMOUNT\u003e").append(String.format("-%.2f", item.getAmount()))
                        .append("\u003c/AMOUNT\u003e\n"); // Debit is negative in Tally XML for Amount? Wait, usually
                                                          // Debit is negative/positive depends. Let's stick to standard
                                                          // practice. Actually, creating voucher behaves differently.
                                                          // If deemed positive is yes, amount is usually negative.
                xml.append("              \u003cACTUALQTY\u003e").append(item.getQuantity()).append(" ")
                        .append(item.getUnit())
                        .append("\u003c/ACTUALQTY\u003e\n");
                xml.append("              \u003cBILLEDQTY\u003e").append(item.getQuantity()).append(" ")
                        .append(item.getUnit())
                        .append("\u003c/BILLEDQTY\u003e\n");
            }
            xml.append("            \u003c/ALLINVENTORYENTRIES.LIST\u003e\n");
        }

        // Ledger Entries
        if (voucher.getLedgerEntries() != null) {
            for (TallyPurchaseVoucherDTO.TallyLedgerEntry ledger : voucher.getLedgerEntries()) {
                xml.append("            \u003cALLLEDGERENTRIES.LIST\u003e\n");
                xml.append("              \u003cLEDGERNAME\u003e").append(escapeXml(ledger.getLedgerName()))
                        .append("\u003c/LEDGERNAME\u003e\n");
                xml.append("              \u003cISDEEMEDPOSITIVE\u003e").append(ledger.getIsDebit() ? "Yes" : "No")
                        .append("\u003c/ISDEEMEDPOSITIVE\u003e\n");
                xml.append("              \u003cAMOUNT\u003e").append(String.format("%.2f", ledger.getAmount()))
                        .append("\u003c/AMOUNT\u003e\n");
                xml.append("            \u003c/ALLLEDGERENTRIES.LIST\u003e\n");
            }
        }

        xml.append("          \u003c/VOUCHER\u003e\n");
        xml.append("        \u003c/TALLYMESSAGE\u003e\n");
        xml.append("      \u003c/REQUESTDATA\u003e\n");
        xml.append("    \u003c/IMPORTDATA\u003e\n");
        xml.append("  \u003c/BODY\u003e\n");
        xml.append("\u003c/ENVELOPE\u003e");

        return xml.toString();
    }

    /**
     * Build XML to fetch all Ledgers from Tally
     */
    public String buildGetLedgersXml() {
        return "\u003cENVELOPE\u003e\n" +
                "  \u003cHEADER\u003e\n" +
                "    \u003cVERSION\u003e1\u003c/VERSION\u003e\n" +
                "    \u003cTALLYREQUEST\u003eExport\u003c/TALLYREQUEST\u003e\n" +
                "    \u003cTYPE\u003eCollection\u003c/TYPE\u003e\n" +
                "    \u003cID\u003eLedgers\u003c/ID\u003e\n" +
                "  \u003c/HEADER\u003e\n" +
                "  \u003cBODY\u003e\n" +
                "    \u003cDESC\u003e\n" +
                "      \u003cSTATICVARIABLES\u003e\n" +
                "        \u003cSVEXPORTFORMAT\u003e$$SysName:XML\u003c/SVEXPORTFORMAT\u003e\n" +
                "        \u003cSVCURRENTCOMPANY\u003e$$CURRENTCOMPANY\u003c/SVCURRENTCOMPANY\u003e\n" +
                "      \u003c/STATICVARIABLES\u003e\n" +
                "      \u003cTDL\u003e\n" +
                "        \u003cTDLMESSAGE\u003e\n" +
                "          \u003cREPORT NAME=\"Ledgers\"\u003e\n" +
                "            \u003cFORMS\u003eLedgers\u003c/FORMS\u003e\n" +
                "          \u003c/REPORT\u003e\n" +
                "          \u003cFORM NAME=\"Ledgers\"\u003e\n" +
                "            \u003cPARTS\u003eLedgers\u003c/PARTS\u003e\n" +
                "          \u003c/FORM\u003e\n" +
                "          \u003cPART NAME=\"Ledgers\"\u003e\n" +
                "            \u003cLINES\u003eLedgers\u003c/LINES\u003e\n" +
                "            \u003cREPEAT\u003eLedgers : Ledgers Collection\u003c/REPEAT\u003e\n" +
                "            \u003cSCROLLED\u003eVertical\u003c/SCROLLED\u003e\n" +
                "          \u003c/PART\u003e\n" +
                "          \u003cLINE NAME=\"Ledgers\"\u003e\n" +
                "            \u003cFIELDS\u003eName, Parent, Opening Balance, Closing Balance, GUID\u003c/FIELDS\u003e\n"
                +
                "          \u003c/LINE\u003e\n" +
                "          \u003cFIELD NAME=\"Name\"\u003e\n" +
                "            \u003cSET\u003e$Name\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Parent\"\u003e\n" +
                "            \u003cSET\u003e$Parent\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Opening Balance\"\u003e\n" +
                "            \u003cSET\u003e$OpeningBalance\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"Closing Balance\"\u003e\n" +
                "            \u003cSET\u003e$ClosingBalance\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cFIELD NAME=\"GUID\"\u003e\n" +
                "            \u003cSET\u003e$GUID\u003c/SET\u003e\n" +
                "          \u003c/FIELD\u003e\n" +
                "          \u003cCOLLECTION NAME=\"Ledgers Collection\"\u003e\n" +
                "            \u003cTYPE\u003eLedger\u003c/TYPE\u003e\n" +
                "          \u003c/COLLECTION\u003e\n" +
                "        \u003c/TDLMESSAGE\u003e\n" +
                "      \u003c/TDL\u003e\n" +
                "    \u003c/DESC\u003e\n" +
                "  \u003c/BODY\u003e\n" +
                "\u003c/ENVELOPE\u003e";
    }

    /**
     * Build XML to fetch all Voucher Types from Tally
     */
    public String buildGetVoucherTypesXml() {
        return "<ENVELOPE>\n" +
                "  <HEADER>\n" +
                "    <VERSION>1</VERSION>\n" +
                "    <TALLYREQUEST>Export</TALLYREQUEST>\n" +
                "    <TYPE>Collection</TYPE>\n" +
                "    <ID>VoucherType</ID>\n" +
                "  </HEADER>\n" +
                "  <BODY>\n" +
                "    <DESC>\n" +
                "      <STATICVARIABLES>\n" +
                "        <SVEXPORTFORMAT>$$SysName:XML</SVEXPORTFORMAT>\n" +
                "        <SVCURRENTCOMPANY>$$CURRENTCOMPANY</SVCURRENTCOMPANY>\n" +
                "      </STATICVARIABLES>\n" +
                "      <TDL>\n" +
                "        <TDLMESSAGE>\n" +
                "          <REPORT NAME=\"VoucherTypes\">\n" +
                "            <FORMS>VoucherTypes</FORMS>\n" +
                "          </REPORT>\n" +
                "          <FORM NAME=\"VoucherTypes\">\n" +
                "            <PARTS>VoucherTypes</PARTS>\n" +
                "          </FORM>\n" +
                "          <PART NAME=\"VoucherTypes\">\n" +
                "            <LINES>VoucherTypes</LINES>\n" +
                "            <REPEAT>VoucherTypes : VoucherTypes Collection</REPEAT>\n" +
                "            <SCROLLED>Vertical</SCROLLED>\n" +
                "          </PART>\n" +
                "          <LINE NAME=\"VoucherTypes\">\n" +
                "            <FIELDS>Name, Parent, NumberingMethod, IsDeemedPositive</FIELDS>\n" +
                "          </LINE>\n" +
                "          <FIELD NAME=\"Name\">\n" +
                "            <SET>$Name</SET>\n" +
                "          </FIELD>\n" +
                "          <FIELD NAME=\"Parent\">\n" +
                "            <SET>$Parent</SET>\n" +
                "          </FIELD>\n" +
                "          <FIELD NAME=\"NumberingMethod\">\n" +
                "            <SET>$NumberingMethod</SET>\n" +
                "          </FIELD>\n" +
                "          <FIELD NAME=\"IsDeemedPositive\">\n" +
                "            <SET>$IsDeemedPositive</SET>\n" +
                "          </FIELD>\n" +
                "          <COLLECTION NAME=\"VoucherTypes Collection\">\n" +
                "            <TYPE>VoucherType</TYPE>\n" +
                "          </COLLECTION>\n" +
                "        </TDLMESSAGE>\n" +
                "      </TDL>\n" +
                "    </DESC>\n" +
                "  </BODY>\n" +
                "</ENVELOPE>";
    }
}
