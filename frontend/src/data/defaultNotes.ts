import type { Note } from '../types';

/* ─────────────────────────────────────────────────────────────────
   Default IFRS notes template — 34 notes
   Amounts   → [—]
   Dates     → [Current Year End] / [Prior Year End]
   Years     → [Current Year] / [Prior Year]
   Entity    → [the Company] / [the Group] / [the Parent Company]
───────────────────────────────────────────────────────────────── */

const TABLE = 'style="width:100%;border-collapse:collapse;font-size:9pt"';
const TH = 'style="border-bottom:1px solid #94a3b8;padding:4px 8px;text-align:right;font-weight:700"';
const THL = 'style="border-bottom:1px solid #94a3b8;padding:4px 8px;text-align:left;font-weight:700"';
const TD = 'style="border-bottom:1px solid #f1f5f9;padding:3px 8px;text-align:right"';
const TDL = 'style="border-bottom:1px solid #f1f5f9;padding:3px 8px;text-align:left"';
const TDT = 'style="border-top:1px solid #1a2332;border-bottom:2px solid #1a2332;padding:3px 8px;text-align:right;font-weight:700"';
const TDTL = 'style="border-top:1px solid #1a2332;border-bottom:2px solid #1a2332;padding:3px 8px;text-align:left;font-weight:700"';

function twoColTable(rows: [string, string, string][], title1 = '[Current Year End]<br>SR', title2 = '[Prior Year End]<br>SR'): string {
  const header = `<tr><th ${THL}>Description</th><th ${TH}>${title1}</th><th ${TH}>${title2}</th></tr>`;
  const body = rows.map(([lbl, cy, py], i) => {
    const last = i === rows.length - 1;
    const l = last ? TDTL : TDL;
    const v = last ? TDT : TD;
    return `<tr><td ${l}>${lbl}</td><td ${v}>${cy}</td><td ${v}>${py}</td></tr>`;
  }).join('');
  return `<table ${TABLE}>${header}${body}</table>`;
}

function movTable(rows: [string, string, string][], title1 = '[Current Year]<br>SR', title2 = '[Prior Year]<br>SR'): string {
  return twoColTable(rows, title1, title2);
}

export const DEFAULT_NOTES: Note[] = [
  /* ── 1 ─────────────────────────────────────────────────────── */
  {
    note_number: 1,
    title: 'ACTIVITIES',
    body: '<p>[Describe the principal activities of the Company here. This field is auto-populated from the <strong>Activities</strong> box in Entity Details on the Data Import step.]</p>',
  },

  /* ── 2 ─────────────────────────────────────────────────────── */
  {
    note_number: 2,
    title: 'BASIS OF PREPARATION',
    body: `<p><strong>2-1&nbsp;&nbsp;Statement of compliance</strong></p>
<p>These consolidated financial statements have been prepared in accordance with International Financial Reporting Standards ("IFRS") as endorsed in Saudi Arabia and other standards and pronouncements endorsed by the Saudi Organization for Chartered and Professional Accountants ("SOCPA").</p>
<p><strong>2-2&nbsp;&nbsp;Preparation of financial statements</strong></p>
<p>These consolidated financial statements have been prepared on the historical cost basis except for the following material items in the statement of financial position:</p>
<ul>
<li>Equity Investment at Fair Value through Other Comprehensive Income ("FVOCI") and Fair Value through Profit and Loss ("FVTPL") are measured at fair value.</li>
<li>The defined benefit obligation is recognised at the present value of future obligations using the Projected Unit Credit Method.</li>
</ul>
<p><strong>2-3&nbsp;&nbsp;Presentation and functional currency</strong></p>
<p>The consolidated financial statements are presented in Saudi Riyals (SR), which is the Group's presentation and functional currency, and all values are rounded to the nearest Riyal, except where otherwise indicated.</p>`,
  },

  /* ── 3 ─────────────────────────────────────────────────────── */
  {
    note_number: 3,
    title: 'BASIS OF CONSOLIDATION',
    body: `<p>These consolidated financial statements comprising the consolidated statement of financial position, consolidated statement of profit or loss, consolidated statement of comprehensive income, consolidated statement of changes in equity, consolidated statement of cash flows and notes to the consolidated financial statements of the Group include assets, liabilities and the results of the operations of the Company and its subsidiaries, as set out in note (1). The Company and its subsidiaries are collectively referred to as the "Group". Subsidiaries are entities controlled by the Group. The Group controls an entity when it is exposed to, or has rights to, variable returns from its involvement with the entity and has the ability to affect those returns through its power over the entity. Subsidiaries are consolidated from the date on which control commences until the date on which control ceases.</p>
<p>The Group accounts for the business combinations using the acquisition method when control is transferred to the Group. The consideration transferred in the acquisition is generally measured at fair value, as are the identified net assets acquired and fair value of pre-existing equity interest in the subsidiary. The excess of the cost of acquisition and amount of Non-Controlling Interest ("NCI") over the fair value of the identifiable net assets acquired is recorded as goodwill in the consolidated statement of financial position. NCI is measured at their proportionate share of the acquiree's identifiable net assets at the date of acquisition. If the business combination is achieved in stages, the acquisition date carrying value of the Group's previously held equity interest in the acquiree is re-measured to fair value at the acquisition date. Any gains or losses arising from such re-measurement are recognised in profit or loss.</p>
<p>Intra-group balances and transactions, and any unrealised income and expenses arising from intra-group transactions, are eliminated. Accounting policies of subsidiaries are aligned, where necessary, to ensure consistency with the policies adopted by the Group. The Company and its subsidiaries have the same reporting periods.</p>`,
  },

  /* ── 4 ─────────────────────────────────────────────────────── */
  {
    note_number: 4,
    title: 'SIGNIFICANT ACCOUNTING POLICIES',
    body: `<p><strong>4-1&nbsp;&nbsp;New Standards, Amendments to Standards and Interpretations</strong></p>
<p>The Group has adopted the following new standard, effective from [relevant date].</p>
<p><strong>4-1-1&nbsp;&nbsp;Amendments to IFRS 7 and IFRS 16 – Interest rate benchmark reform – Phase 2</strong></p>
<p>The Phase 2 amendments address issues that arise from the implementation of the reforms, including the replacement of one benchmark with an alternative one. The Phase 2 amendments provide additional temporary reliefs from applying specific IAS 39 and IFRS 9 hedge accounting requirements to hedging relationships directly affected by IBOR reform.</p>
<p><strong>4-1-2&nbsp;&nbsp;Amendment to IFRS 16, 'Leases' – COVID-19 related rent concessions</strong></p>
<p>As a result of the coronavirus (COVID-19) pandemic, rent concessions have been granted to lessees. In May 2020, the International Accounting Standards Board ("IASB") published an amendment to IFRS 16 that provided an optional practical expedient for lessees from assessing whether a rent concession related to COVID-19 is a lease modification. On [relevant date], the IASB published an additional amendment to extend the date of the practical expedient. Lessees can select to account for such rent concessions in the same way as they would if they were not lease modifications. In many cases, this will result in accounting for the concession as variable lease payments in the period(s) in which the event or condition that triggers the reduced payment occurs.</p>
<p>The adoption of above amendments does not have any material impact on these Consolidated Financial Statements during the year.</p>

<p><strong>4-2&nbsp;&nbsp;Standards issued but not yet effective</strong></p>
<p>Following are the new standards and amendments to standards which are effective for annual periods beginning on or after [relevant date] and earlier application is permitted; however, the Group has not early adopted them in preparing these consolidated financial statements.</p>
<p><strong>4-2-1&nbsp;&nbsp;Amendments to IAS 1 – Classification of liabilities</strong></p>
<p>These narrow-scope amendments to IAS 1, 'Presentation of financial statements', clarify that liabilities are classified as either current or non-current, depending on the rights that exist at the end of the reporting period. Classification is unaffected by the expectations of the entity or events after the reporting date. The amendment also clarifies what IAS 1 means when it refers to the 'settlement' of a liability.</p>
<p><strong>4-2-2&nbsp;&nbsp;Amendments to IFRS 3, IAS 16, IAS 37</strong></p>
<ul>
<li>IFRS 3, 'Business combinations' – update a reference in IFRS 3 to the Conceptual Framework for Financial Reporting without changing the accounting requirements for business combinations.</li>
<li>IAS 16, 'Property, plant and equipment' – prohibit a company from deducting from the cost of property, plant and equipment amounts received from selling items produced while the company is preparing the asset for its intended use. Instead, a company will recognize such sales proceeds and related cost in profit or loss.</li>
<li>IAS 37, 'Provisions, contingent liabilities and contingent assets' – specify which costs a company includes when assessing whether a contract will be loss-making.</li>
</ul>
<p><strong>4-2-3&nbsp;&nbsp;Amendments to IAS 1, Practice Statement 2 and IAS 8</strong></p>
<p>The amendments aim to improve accounting policy disclosures and to help users of these consolidated financial statements to distinguish between changes in accounting estimates and changes in accounting policies.</p>
<p><strong>4-2-4&nbsp;&nbsp;Amendment to IAS 12 – Deferred tax related to assets and liabilities arising from a single transaction</strong></p>
<p>These amendments require companies to recognize deferred tax on transactions that, on initial recognition, give rise to equal amounts of taxable and deductible temporary differences.</p>

<p><strong>4-3&nbsp;&nbsp;Cash and cash equivalents</strong></p>
<p>Cash and cash equivalents comprise cash on hand and deposits held with banks, all of which are available for use by the Group unless otherwise stated and have maturities of 90 days or less, which are subject to insignificant risk of changes in values.</p>

<p><strong>4-4&nbsp;&nbsp;Inventories</strong></p>
<p>Inventories are stated at the lower of cost and net realizable value. Costs of inventories are determined on a weighted average basis. Net realizable value represents the estimated selling price for inventories less all estimated costs of completion and costs necessary to make the sale.</p>

<p><strong>4-5&nbsp;&nbsp;Investments in associates</strong></p>
<p>An associate is an entity over which the Group has significant influence. Significant influence is the power to participate in the financial and operating policy decisions of the investee but is not control or joint control over those policies.</p>
<p>The results and assets and liabilities of the associates are incorporated in these consolidated financial statements using the equity method of accounting. Under the equity method, an investment in an associate is initially recognised in the consolidated statement of financial position at cost and adjusted thereafter to recognise the Group's share of the profit or loss and other comprehensive income of the associate. When the Group's share of losses of a subsidiary exceeds the Group's interest in that associate, the Group discontinues recognising its share of further losses. Additional losses are recognised only to the extent that the Group has incurred legal or constructive obligations or made payments on behalf of the associate.</p>
<p>An investment in an associate is accounted for using the equity method from the date on which the investee becomes an associate. On acquisition of the investment in an associate, any excess of the cost of the investment over the Group's share of the net fair value of the identifiable assets and liabilities of the investee is recognised as goodwill, which is included within the carrying amount of the investment. Any excess of the Group's share of the net fair value of associate's identifiable assets and liabilities over the cost of the investment, after reassessment, is recognised immediately in consolidated statement of profit or loss in the period in which the investment is acquired.</p>
<p>The Group is exempted from applying the equity method as stipulated in the paragraph 17 of IAS 28, therefore the Group accounted for its investments in associates at cost.</p>

<p><strong>4-6&nbsp;&nbsp;Intangible assets</strong></p>
<p>Intangible assets are measured at cost, less accumulated amortization and accumulated impairment losses, if any. Intangible assets are amortized on a straight-line basis over the estimated useful lives. Subsequent expenditure is capitalized only if it is probable that the future economic benefits associated with the expenditure will flow to the Group and amount can be measured reliably. Intangible assets' residual values, useful lives and impairment indicators are reviewed at each financial year end and adjusted prospectively, if considered necessary.</p>

<p><strong>4-7&nbsp;&nbsp;Property, plant and equipment</strong></p>
<p>Property, plant and equipment is stated at cost less accumulated depreciation and accumulated impairment losses, if any. When spare parts are expected to be used during more than one period, then they are accounted for as property, plant and equipment.</p>
<p>Historical cost includes expenditure that is directly attributable to the acquisition of the item. Subsequent costs are included in the asset's carrying amount or recognized as a separate asset, as appropriate, only when it is probable that the future economic benefits associated with the item will flow to the Group and the cost can be measured reliably.</p>
<p>Depreciation is recognized so as to write off the cost of assets less their residual values over their useful lives, using the straight-line method. The estimated useful lives, residual values and depreciation method are reviewed at the end of each reporting period, with the effect of any changes accounted for on a prospective basis.</p>
<p>The Group applies the following annual rates of depreciation to its property, plant and equipment:</p>
<table ${TABLE}>
<tr><th ${THL}>Asset category</th><th ${TH}>Useful life</th></tr>
<tr><td ${TDL}>Buildings</td><td ${TD}>4 to 33.3 years</td></tr>
<tr><td ${TDL}>Leasehold improvements</td><td ${TD}>Useful life or lease term, whichever is shorter</td></tr>
<tr><td ${TDL}>Plant, equipment and tools</td><td ${TD}>2.75 to 22 years</td></tr>
<tr><td ${TDL}>Motor vehicles</td><td ${TD}>4 to 5 years</td></tr>
<tr><td ${TDL}>Office furniture and equipment</td><td ${TD}>2 to 10 years</td></tr>
<tr><td ${TDL}>Computer hardware</td><td ${TD}>2 to 5 years</td></tr>
</table>
<p>Land and capital work in progress is not depreciated.</p>
<p>An item of property, plant and equipment is derecognized upon disposal or when no future economic benefits are expected to arise from the continued use of the asset. Any gain or loss arising on the disposal or retirement of an item of property, plant and equipment is determined as the difference between the net sales proceeds and the carrying amount of the asset and is recognized in profit or loss.</p>

<p><strong>4-8&nbsp;&nbsp;Right-of-Use Assets and Lease Liabilities</strong></p>
<p>Each lease payment is allocated between the liability and finance cost. The finance cost is charged to the consolidated statement of profit or loss over the lease period so as to produce a constant periodic rate of interest on the remaining balance of the liability for each period. The right-of-use asset is depreciated over the shorter of the asset's useful life and the lease term on a straight-line basis. Assets and liabilities arising from a lease are initially measured on a present value basis.</p>
<p><strong>i. Right-of-use assets</strong> are measured at cost comprising: the amount of the initial measurement of lease liability; any lease payments made at or before the commencement date less any lease incentives received; any initial direct costs; and restoration costs. Right-of-use assets are subsequently measured at cost less accumulated depreciation.</p>
<p><strong>ii. Lease liabilities</strong> include the net present value of fixed payments (less any lease incentives receivable), variable lease payments based on an index or rate, amounts expected to be payable under residual value guarantees, the exercise price of a purchase option if reasonably certain, and payments of penalties for terminating the lease if the lease term reflects that option.</p>
<p>The lease payments are discounted using the incremental borrowing rate. Payments associated with short-term leases and leases of low-value assets are recognised on a straight-line basis as an expense in the consolidated statement of profit or loss.</p>

<p><strong>4-9&nbsp;&nbsp;Impairment of non-financial assets</strong></p>
<p>The Group assesses at each reporting date whether there is an indication that an asset may be impaired. If any indication exists, or when annual impairment testing for an asset is required, the Group estimates the asset's recoverable amount. An asset's recoverable amount is the higher of an asset's or CGU's fair value less costs of disposal and its value in use.</p>
<p>Where the carrying amount of an asset or cash generating unit (CGU) exceeds its recoverable amount, the asset is considered impaired and is written down to its recoverable amount. In assessing value in use, the estimated future cash flows are discounted to their present value using a pre-tax discount rate that reflects current market assessments of the time value of money and the risks specific to the asset.</p>
<p>For assets excluding goodwill, an assessment is made at each reporting date as to whether there is any indication that previously recognized impairment losses may no longer exist or may have decreased. A previously recognized impairment loss is reversed only if there has been a change in the assumptions used to determine the asset's recoverable amount since the last impairment loss was recognized.</p>

<p><strong>4-10&nbsp;&nbsp;Financial instruments</strong></p>
<p>The Group recognizes a financial asset or a financial liability in its consolidated statement of financial position when it becomes a party to the contractual provisions of the instrument. At initial recognition, the Group recognizes a financial instrument at its fair value plus or minus, in the case of a financial instrument not at fair value through profit or loss, transaction costs that are directly attributable to the acquisition or issue of the financial instrument.</p>
<p><strong>Financial assets</strong></p>
<p>IFRS 9 requires all financial assets to be classified and subsequently measured at either amortized cost or fair value. Financial assets are classified into the following specified categories:</p>
<ul>
<li>Debt instruments at amortized cost;</li>
<li>Debt instruments at fair value through other comprehensive income (FVOCI), with gains or losses recycled to profit or loss on derecognition;</li>
<li>Equity instruments at FVOCI, with no recycling of gains or losses to profit or loss on derecognition; and</li>
<li>Financial assets at fair value through profit and loss (FVPL).</li>
</ul>
<p><strong>(a) Financial assets classified as amortized cost</strong></p>
<p>Debt instruments that meet the following conditions are subsequently measured at amortized cost: the asset is held within a business model whose objective is to hold assets in order to collect contractual cash flows; and the contractual terms of the instrument give rise on specified dates to cash flows that are solely payments of principal and interest on the principal amount outstanding. Income is recognized on an effective interest basis for debt instruments measured subsequently at amortized cost.</p>
<p><strong>(b) Financial assets designated as FVOCI with recycling</strong></p>
<p>Debt instruments that meet the following conditions are subsequently measured at FVOCI: the financial asset is held within a business model whose objective is achieved by both collecting contractual cash flows and selling the financial assets; and the contractual terms give rise on specified dates to cash flows that are solely payments of principal and interest. For debt financial instruments measured at FVOCI, all changes in carrying amount are recognized in other comprehensive income. When derecognized, the cumulative gains or losses previously recognized in OCI are reclassified to the consolidated statement of profit or loss.</p>
<p><strong>(c) Financial assets classified as FVPL</strong></p>
<p>Investments in equity instruments are classified as at FVPL, unless the Group designates an investment that is not held for trading as at FVOCI on initial recognition. Debt instruments that do not meet the amortized cost or FVOCI criteria are measured at FVPL. Financial assets at FVPL are measured at fair value at the end of each reporting period, with any gains or losses recognized in consolidated statement of profit or loss.</p>
<p><strong>(d) Investment in equity instruments designated as FVOCI</strong></p>
<p>On initial recognition, the Group can make an irrevocable election to designate investments in equity instruments as at FVOCI. Investments in equity instruments at FVOCI are initially measured at fair value plus transaction costs. Subsequently, they are measured at fair value with gains and losses arising from changes in fair value recognized in other comprehensive income. Gains and losses on such equity instruments are never reclassified to income statement.</p>
<p><strong>Impairment of financial assets</strong></p>
<p>The Group recognizes a loss allowance for expected credit losses (ECL) on debt instruments measured at amortized cost or at FVOCI, lease receivables, trade receivables, as well as on loan commitments and financial guarantee contracts. The Group applies the simplified approach to calculate impairment on trade receivables, always recognizing lifetime ECL on such exposures. For all other financial instruments, the Group applies the general approach to calculate impairment.</p>
<p><strong>De-recognition of financial assets</strong></p>
<p>The Group derecognizes a financial asset only when the contractual rights to the cash flows from the asset expire; or it transfers the financial asset or substantially all the risks and rewards of ownership to another entity.</p>
<p><strong>Financial liabilities</strong></p>
<p>Financial liabilities carried at amortized cost have been classified and measured at amortized cost using the effective yield method. The Group derecognizes financial liabilities when, and only when, the Group's obligations are discharged, cancelled or they expire.</p>

<p><strong>4-11&nbsp;&nbsp;Provisions</strong></p>
<p>Provisions are recognized when the Group has a present obligation (legal or constructive) as a result of a past event, it is probable that the Group will be required to settle the obligation, and a reliable estimate can be made of the amount of the obligation. The amount recognized as a provision is the best estimate of the consideration required to settle the present obligation at the end of the reporting period.</p>

<p><strong>4-12&nbsp;&nbsp;Employees' benefits</strong></p>
<p>The end-of-service benefits provision is determined using the projected unit credit method, with actuarial valuations being carried out at the end of each reporting period. Re-measurements, comprising actuarial gains and losses, are reflected immediately in the consolidated statement of financial position with a charge or credit recognized in other comprehensive income in the period in which they occur. Re-measurements recognized in other comprehensive income are reflected immediately in retained earnings and will not be reclassified to profit or loss in subsequent periods.</p>
<p>Defined benefit costs are categorized as: service cost (including current service cost, past service cost, gains and losses on curtailments and settlements); interest expense; and re-measurements. Re-measurements are presented as part of other comprehensive income.</p>

<p><strong>4-13&nbsp;&nbsp;Zakat and income tax</strong></p>
<p>Zakat is provided for in accordance with Zakat, Tax and Customs Authority regulations. Income tax for foreign entities is provided for in accordance with the relevant income tax regulations of the countries of incorporation. Adjustments arising from final Zakat and Foreign income tax assessments are recorded in the period in which such assessments are made.</p>
<p>In accordance with the rules and regulations of the Zakat, Tax and Customs Authority the Company is assessed for zakat as part of the consolidated zakat basis of its ultimate parent company, which accounts for and settles zakat liability on the basis of its consolidated financial statements. The Company has accrued for its share of zakat liability based on advice from the parent company.</p>

<p><strong>4-14&nbsp;&nbsp;Deferred Tax</strong></p>
<p>Deferred tax is recognised on temporary differences between the carrying amounts of assets and liabilities in consolidated financial statements and the corresponding tax bases used in the computation of taxable profit. Deferred tax liabilities are generally recognised for all taxable temporary differences. Deferred tax assets are generally recognised for all deductible temporary differences to the extent that it is probable that taxable profits will be available against which those deductible temporary differences can be utilised.</p>
<p>Deferred tax liabilities and assets are measured at the tax rates that are expected to apply in the period in which the liability is settled or the asset realised, based on tax rates that have been enacted or substantively enacted by the end of the reporting period.</p>

<p><strong>4-15&nbsp;&nbsp;Foreign currency transactions</strong></p>
<p>Foreign currency transactions are translated into Saudi Riyals at the rates of exchange prevailing at the time of the transactions. Monetary assets and liabilities denominated in foreign currencies at the reporting date are translated into Saudi Riyals at the exchange rates prevailing at that date. Gains and losses from settlement and translation of foreign currency transactions are included in the consolidated statement of profit or loss.</p>

<p><strong>4-16&nbsp;&nbsp;Revenue recognition</strong></p>
<p>Revenue is measured based on the consideration specified in a contract with customer and excludes amounts collected on behalf of third parties. The Group recognizes revenue when it transfers control over a product or service to a customer. The principles in IFRS 15 are applied using the following five steps:</p>
<p><strong>Step 1:</strong> The Group accounts for a contract with a customer when the contract has been approved and the parties are committed; each party's rights are identified; payment terms are defined; the contract has commercial substance; and collection is probable.</p>
<p><strong>Step 2:</strong> The Group identifies all promised goods or services in a contract and determines whether to account for each as a separate performance obligation.</p>
<p><strong>Step 3:</strong> The Group determines the transaction price, which is the amount of consideration it expects to be entitled to in exchange for transferring promised goods or services to a customer.</p>
<p><strong>Step 4:</strong> The transaction price is allocated to each separate performance obligation based on the relative standalone selling price of the good or service.</p>
<p><strong>Step 5:</strong> Revenue is recognized when control of the goods or services is transferred to the customer.</p>
<p><strong>a) Sale of goods:</strong> Sales represent the invoiced value of goods supplied by the Group during the year, net of trade and quantity discounts and are recognised when the significant risks and rewards of ownership of the goods have passed to the buyer, normally on delivery to the customer.</p>
<p><strong>b) Rental income:</strong> Revenue from leasing contracts is recognised in accordance with the terms of the lease contracts, over the lease term, on a straight-line basis.</p>

<p><strong>4-17&nbsp;&nbsp;Selling, distribution, and general and administrative expenses</strong></p>
<p>Selling, distribution, and general and administrative expenses include direct and indirect costs not specifically part of cost of revenue. Allocations between cost of revenue, selling and distribution, and general and administrative expenses, when required, are made on a consistent basis.</p>

<p><strong>4-18&nbsp;&nbsp;Borrowing costs</strong></p>
<p>Borrowing costs directly attributable to the acquisition, construction or production of qualifying assets, which are assets that necessarily take a substantial period of time to get ready for their intended use or sale, are added to the cost of those assets, until such time as the assets are substantially ready for their intended use or sale. Investment income earned on the temporary investment of specific borrowings pending their expenditure on qualifying assets is deducted from the borrowing costs eligible for capitalization. All other borrowing costs are recognized in profit or loss in the period in which they are incurred.</p>`,
  },

  /* ── 5 ─────────────────────────────────────────────────────── */
  {
    note_number: 5,
    title: 'USE OF JUDGEMENTS AND ESTIMATES UNCERTAINTY',
    body: `<p>In preparing these consolidated financial statements, management has made judgements and estimates that affect the application of the Group's accounting policies and reported amounts of assets, liabilities, income and expenses. Actual results may differ from these estimates.</p>
<p>Estimates and underlying assumptions are reviewed on an ongoing basis. Revisions to estimates are recognized prospectively.</p>`,
  },

  /* ── 6 ─────────────────────────────────────────────────────── */
  {
    note_number: 6,
    title: 'CASH AND CASH EQUIVALENTS',
    body: `<p>Cash and cash equivalents comprise cash on hand and demand deposits held with banks.</p>
${twoColTable([
  ['Cash on hand', '[—]', '[—]'],
  ['Bank current accounts', '[—]', '[—]'],
  ['Short-term deposits (≤ 90 days)', '[—]', '[—]'],
  ['Total cash and cash equivalents', '[—]', '[—]'],
])}`,
  },

  /* ── 7 ─────────────────────────────────────────────────────── */
  {
    note_number: 7,
    title: 'ACCOUNTS RECEIVABLE AND OTHER DEBIT BALANCES',
    body: `${twoColTable([
  ['Trade receivable', '[—]', '[—]'],
  ['Allowance for sales discount and rebates', '([—])', '([—])'],
  ['Allowance for doubtful debts', '([—])', '([—])'],
  ['Net trade receivable', '[—]', '[—]'],
  ['Advances to suppliers', '[—]', '[—]'],
  ['Accrued revenue', '[—]', '[—]'],
  ['Rebate earned from a supplier', '[—]', '[—]'],
  ['Prepayments', '[—]', '[—]'],
  ['Employee advances', '[—]', '[—]'],
  ['Custom duty refundable', '[—]', '[—]'],
  ['Performance bonds', '[—]', '[—]'],
  ['Other receivables', '[—]', '[—]'],
  ['Total', '[—]', '[—]'],
])}
<p><strong>Movement in the allowance for sales discounts and rebates:</strong></p>
${movTable([
  ['At beginning of the year', '[—]', '[—]'],
  ['Provision during the year', '[—]', '[—]'],
  ['Utilized during the year', '([—])', '([—])'],
  ['De-recognition of allowance on disposal of subsidiary', '([—])', '[—]'],
  ['At the end of the year', '[—]', '[—]'],
])}
<p><strong>Movement in the provision for doubtful debts:</strong></p>
${movTable([
  ['At beginning of the year', '[—]', '[—]'],
  ['Provision for the year', '[—]', '[—]'],
  ['Reversal during the year', '([—])', '([—])'],
  ['Write-off during the year', '[—]', '([—])'],
  ['Foreign currency translation adjustments', '[—]', '[—]'],
  ['De-recognition on disposal of subsidiaries', '([—])', '[—]'],
  ['At the end of the year', '[—]', '[—]'],
])}
<p><strong>Ageing of trade receivables:</strong></p>
${twoColTable([
  ['0 to 30 days', '[—]', '[—]'],
  ['31 to 60 days', '[—]', '[—]'],
  ['61 to 90 days', '[—]', '[—]'],
  ['Over 91 days', '[—]', '[—]'],
  ['Total', '[—]', '[—]'],
])}`,
  },

  /* ── 8 ─────────────────────────────────────────────────────── */
  {
    note_number: 8,
    title: 'RELATED PARTY TRANSACTIONS AND BALANCES',
    body: `<p><strong>8-1&nbsp;&nbsp;Relevant parties include:</strong></p>
<table ${TABLE}>
<tr><th ${THL}>Entity</th><th ${THL}>Relationship</th></tr>
<tr><td ${TDL}>[Parent Company]</td><td ${TDL}>Majority shareholder and parent company</td></tr>
<tr><td ${TDL}>[Related Entity A]</td><td ${TDL}>Minority shareholder</td></tr>
<tr><td ${TDL}>[Related Entity B]</td><td ${TDL}>Associate</td></tr>
<tr><td ${TDL}>[Related Entity C]</td><td ${TDL}>Affiliate (previously associate)</td></tr>
<tr><td ${TDL}>[Related Entity D]</td><td ${TDL}>Affiliate</td></tr>
<tr><td ${TDL}>[Related Entity E]</td><td ${TDL}>Affiliate</td></tr>
</table>
<p><strong>8-2&nbsp;&nbsp;Significant transactions with related parties:</strong></p>
${movTable([
  ['Dividends', '[—]', '[—]'],
  ['Transfer of funds to parent company, net', '[—]', '[—]'],
  ['Purchases', '[—]', '[—]'],
  ['Sales', '[—]', '[—]'],
  ['Offsetting balances', '[—]', '[—]'],
  ['Shared service cost allocated from related parties', '[—]', '[—]'],
  ['Other services', '[—]', '[—]'],
  ['Rent expenses', '[—]', '[—]'],
  ['Electricity expenses charged', '[—]', '[—]'],
  ['Rental income', '[—]', '[—]'],
])}
<p>During the year, the short-term benefits for key management personnel amounted to SR [—] ([Prior Year]: SR [—]).</p>
<p><strong>8-3&nbsp;&nbsp;Year end balances with related parties:</strong></p>
<p><em>Amounts due from related parties:</em></p>
${twoColTable([
  ['[Related Entity A]', '[—]', '[—]'],
  ['[Related Entity B]', '[—]', '[—]'],
  ['[Related Entity C]', '[—]', '[—]'],
  ['Other related parties', '[—]', '[—]'],
  ['Total due from related parties', '[—]', '[—]'],
  ['Less: Non-current portion', '([—])', '([—])'],
  ['Current portion', '[—]', '[—]'],
])}
<p><em>Amounts due to related parties:</em></p>
${twoColTable([
  ['[Related Entity A]', '[—]', '[—]'],
  ['[Related Entity B]', '[—]', '[—]'],
  ['Other related parties', '[—]', '[—]'],
  ['Total due to related parties', '[—]', '[—]'],
])}`,
  },

  /* ── 9 ─────────────────────────────────────────────────────── */
  {
    note_number: 9,
    title: 'INVENTORIES',
    body: `${twoColTable([
  ['Raw materials', '[—]', '[—]'],
  ['Work in progress', '[—]', '[—]'],
  ['Spare parts', '[—]', '[—]'],
  ['Finished goods', '[—]', '[—]'],
  ['Goods in transit', '[—]', '[—]'],
  ['Other', '[—]', '[—]'],
  ['Subtotal', '[—]', '[—]'],
  ['Less: provision for slow-moving inventory', '([—])', '([—])'],
  ['Total', '[—]', '[—]'],
])}
<p><strong>Movement in provision for slow-moving inventory:</strong></p>
${movTable([
  ['At beginning of the year', '[—]', '[—]'],
  ['Charge during the year', '[—]', '[—]'],
  ['Reversal during the year', '([—])', '([—])'],
  ['De-recognition on disposal of subsidiaries', '([—])', '[—]'],
  ['Write-off during the year', '[—]', '([—])'],
  ['Foreign currency translation adjustments', '[—]', '[—]'],
  ['At end of the year', '[—]', '[—]'],
])}`,
  },

  /* ── 10 ─────────────────────────────────────────────────────── */
  {
    note_number: 10,
    title: 'INVESTMENTS',
    body: `<table ${TABLE}>
<tr><th ${THL}>Investment</th><th ${TH}>Ownership %</th><th ${TH}>[Current Year End]<br>SR</th><th ${TH}>[Prior Year End]<br>SR</th></tr>
<tr><td ${TDL} colspan="4"><strong>Investments in associates:</strong></td></tr>
<tr><td ${TDL}>&nbsp;&nbsp;[Associate A]</td><td ${TD}>[X]%</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>&nbsp;&nbsp;[Associate B]</td><td ${TD}>[X]%</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDTL}>Total investment in associates</td><td ${TDT}></td><td ${TDT}>[—]</td><td ${TDT}>[—]</td></tr>
<tr><td ${TDL} colspan="4"><strong>Investments at FVOCI:</strong></td></tr>
<tr><td ${TDL}>&nbsp;&nbsp;[Entity Name]</td><td ${TD}>[X]%</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL} colspan="4"><strong>Investments at FVPL:</strong></td></tr>
<tr><td ${TDL}>&nbsp;&nbsp;[Entity Name]</td><td ${TD}>[X]%</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDTL}>Total investments</td><td ${TDT}></td><td ${TDT}>[—]</td><td ${TDT}>[—]</td></tr>
</table>
<p><strong>A)</strong>&nbsp;The Group applied the cost method for its investments in associates (Note 4-5).</p>
<p><strong>B)</strong>&nbsp;This represents an investment in equity shares of [Related Entity], a company whose main activity is [describe activity]. The company has irrevocably designated the investment at fair value through other comprehensive income on initial recognition as the intention is to hold this investment for the long term for strategic purposes.</p>
${movTable([
  ['Balance at beginning of the year', '[—]', '[—]'],
  ['Change in fair value during the year', '[—]', '([—])'],
  ['Balance at end of the year', '[—]', '[—]'],
], 'Change in FV of FVOCI investment<br>[Current Year End] SR', '[Prior Year End] SR')}
<p><strong>C)</strong>&nbsp;[Describe any FVPL investment and movement during the year.]</p>
${movTable([
  ['Balance on 1 January', '[—]', '[—]'],
  ['Fair value of acquired investment', '[—]', '[—]'],
  ['Fair value gain / (loss) for the period', '[—]', '[—]'],
  ['Transferred / disposed during the year', '([—])', '[—]'],
  ['Balance on 31 December', '[—]', '[—]'],
])}`,
  },

  /* ── 11 ─────────────────────────────────────────────────────── */
  {
    note_number: 11,
    title: 'INTANGIBLE ASSETS',
    body: `<table ${TABLE}>
<tr><th ${THL}></th><th ${TH}>Category A<br>SR</th><th ${TH}>Category B<br>SR</th><th ${TH}>Category C<br>SR</th><th ${TH}>Total<br>SR</th></tr>
<tr><td ${TDL} colspan="5"><strong>COST:</strong></td></tr>
<tr><td ${TDL}>January 1, [Prior Year]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Additions</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Disposals</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Foreign currency translation</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>[Prior Year End]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>De-recognition on disposal of subsidiaries</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td></tr>
<tr><td ${TDTL}>[Current Year End]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td></tr>
<tr><td ${TDL} colspan="5"><strong>AMORTISATION:</strong></td></tr>
<tr><td ${TDL}>January 1, [Prior Year]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Amortisation</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Foreign currency translation</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>[Prior Year End]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Amortisation</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>De-recognition on disposal of subsidiaries</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td></tr>
<tr><td ${TDTL}>[Current Year End]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td></tr>
<tr><td ${TDL} colspan="5"><strong>NET BOOK VALUE:</strong></td></tr>
<tr><td ${TDL}>[Current Year End]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>[Prior Year End]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
</table>
<p>The net book value of intangible assets de-recognized on disposal of subsidiaries is SR [—] (Note 19-C).</p>`,
  },

  /* ── 12 ─────────────────────────────────────────────────────── */
  {
    note_number: 12,
    title: 'PROPERTY, PLANT AND EQUIPMENT',
    body: `<table ${TABLE}>
<tr><th ${THL}></th><th ${TH}>Buildings &amp;<br>Leasehold SR</th><th ${TH}>Plant &amp;<br>Equipment SR</th><th ${TH}>Motor<br>Vehicles SR</th><th ${TH}>Office<br>Furniture SR</th><th ${TH}>Computer<br>Hardware SR</th><th ${TH}>Capital WIP<br>SR</th><th ${TH}>Total SR</th></tr>
<tr><td ${TDL} colspan="8"><strong>COST:</strong></td></tr>
<tr><td ${TDL}>January 1, [Prior Year]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Additions</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Transfers</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>—</td></tr>
<tr><td ${TDL}>Disposals</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Write off</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Foreign currency translation</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>[Prior Year End]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Additions</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Transfers</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>—</td></tr>
<tr><td ${TDL}>Disposals</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>De-recognition on disposal of subsidiaries</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td></tr>
<tr><td ${TDTL}>[Current Year End]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td></tr>
<tr><td ${TDL} colspan="8"><strong>ACCUMULATED DEPRECIATION:</strong></td></tr>
<tr><td ${TDL}>January 1, [Prior Year]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>—</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Charge</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>—</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Disposals</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>—</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Write off</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>—</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Foreign currency translation</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>—</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>[Prior Year End]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>—</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Charge</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>—</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Disposals</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>—</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>De-recognition on disposal of subsidiaries</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>—</td><td ${TD}>([—])</td></tr>
<tr><td ${TDTL}>[Current Year End]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>—</td><td ${TDT}>[—]</td></tr>
<tr><td ${TDL} colspan="8"><strong>NET BOOK VALUE:</strong></td></tr>
<tr><td ${TDL}>[Current Year End]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>[Prior Year End]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
</table>
<p>The net book value of property, plant and equipment de-recognized on disposal of subsidiaries is SR [—] (Note 19-C).</p>
<p><strong>a)</strong>&nbsp;Capital work in progress represents [describe assets under construction or deployment].</p>
<p><strong>b)</strong>&nbsp;Some property, plant, and equipment are pledged against loans taken from Saudi Industrial Development Fund as well as commercial banks.</p>
<p><strong>c)</strong>&nbsp;Some of the Group's production and other facilities are constructed on lands owned by related parties. The Group has been charged by related parties with its share of annual rent based on area occupied.</p>
<p><strong>d) Depreciation charge for the year is allocated as follows:</strong></p>
${movTable([
  ['Cost of revenue', '[—]', '[—]'],
  ['Other operating expenses', '[—]', '[—]'],
  ['Total depreciation charge', '[—]', '[—]'],
])}`,
  },

  /* ── 13 ─────────────────────────────────────────────────────── */
  {
    note_number: 13,
    title: 'RIGHT OF USE ASSETS AND LEASE LIABILITIES',
    body: `<p><strong>A) Right of use assets</strong></p>
<p>The right-of-use assets represent leased land and buildings.</p>
${movTable([
  ['COST – Balance at 1 January', '[—]', '[—]'],
  ['Additions', '[—]', '[—]'],
  ['Foreign currency translation adjustments', '[—]', '[—]'],
  ['De-recognition on disposal of subsidiaries', '([—])', '[—]'],
  ['Balance at 31 December', '[—]', '[—]'],
  ['ACCUMULATED DEPRECIATION – Balance at 1 January', '[—]', '[—]'],
  ['Charge', '[—]', '[—]'],
  ['Foreign currency translation adjustments', '[—]', '[—]'],
  ['De-recognition on disposal of subsidiaries', '([—])', '[—]'],
  ['Balance at 31 December', '[—]', '[—]'],
  ['NET BOOK VALUE at 31 December', '[—]', '[—]'],
])}
<p>The net book value of right-of-use assets de-recognized on disposal of subsidiaries is SR [—] (Note 19-C).</p>
<p><strong>B) Lease liabilities</strong></p>
${movTable([
  ['Balance at 1 January', '[—]', '[—]'],
  ['Additions', '[—]', '[—]'],
  ['Finance cost charged', '[—]', '[—]'],
  ['Payment of lease liabilities', '([—])', '([—])'],
  ['Foreign currency translation adjustments', '[—]', '[—]'],
  ['Discount on lease rentals', '[—]', '([—])'],
  ['Other adjustments', '([—])', '[—]'],
  ['De-recognition on disposal of subsidiaries', '([—])', '[—]'],
  ['Balance at 31 December', '[—]', '[—]'],
  ['Current portion of lease liabilities', '[—]', '[—]'],
  ['Non-current portion of lease liabilities', '[—]', '[—]'],
  ['Total lease liabilities', '[—]', '[—]'],
])}
<p>The expenses related to short-term and low-value leases are SR [—] and SR [—] respectively.</p>`,
  },

  /* ── 14 ─────────────────────────────────────────────────────── */
  {
    note_number: 14,
    title: 'ACCOUNTS PAYABLE AND OTHER CREDIT BALANCES',
    body: twoColTable([
      ['Trade payable', '[—]', '[—]'],
      ['Accrued expenses', '[—]', '[—]'],
      ['Advances from customers', '[—]', '[—]'],
      ['Accrued financial charges', '[—]', '[—]'],
      ['Accrued utilities', '[—]', '[—]'],
      ['Accrued professional fees', '[—]', '[—]'],
      ['Refund liabilities', '[—]', '[—]'],
      ['Other', '[—]', '[—]'],
      ['Total', '[—]', '[—]'],
    ]),
  },

  /* ── 15 ─────────────────────────────────────────────────────── */
  {
    note_number: 15,
    title: 'SHORT TERM BORROWINGS',
    body: `<p>The Group has obtained short-term borrowings (including bank overdraft) from local banks to finance its working capital and other requirements. The loans are principally secured by personal guarantees of the shareholders, corporate guarantees, promissory notes, and assignment of proceeds from certain receivables.</p>
<p><strong>Movement during the year in short-term borrowings:</strong></p>
${movTable([
  ['At beginning', '[—]', '[—]'],
  ['Proceeds during the year', '[—]', '[—]'],
  ['Repayments during the year', '([—])', '[—]'],
  ['Amount converted from short term to long term loan', '([—])', '[—]'],
  ['At end of the year', '[—]', '[—]'],
])}`,
  },

  /* ── 16 ─────────────────────────────────────────────────────── */
  {
    note_number: 16,
    title: 'LONG TERM BORROWINGS',
    body: `${twoColTable([
  ['SIDF loans', '[—]', '[—]'],
  ['Commercial bank loans', '[—]', '[—]'],
  ['Total', '[—]', '[—]'],
  ['Less: Current portion', '([—])', '([—])'],
  ['Non-current portion', '[—]', '[—]'],
])}
<p><strong>Movement during the year in long-term borrowings:</strong></p>
${movTable([
  ['At beginning', '[—]', '[—]'],
  ['Proceeds during the year', '[—]', '[—]'],
  ['Amount converted from short term to long term loan', '[—]', '[—]'],
  ['Repayments during the year', '([—])', '([—])'],
  ['De-recognition on disposal of subsidiaries', '([—])', '[—]'],
  ['At end of the year', '[—]', '[—]'],
])}
<p><strong>SIDF loans:</strong> The loans from SIDF are secured by personal and corporate guarantees of shareholders and mortgages over certain property, plant and equipment. The SIDF agreement contains covenants which require, among other, maintaining certain financial ratios, dividend distribution, and ceiling on capital expenditures.</p>
<p><strong>Commercial bank loans:</strong> Commercial bank loans are secured by personal and corporate guarantees, promissory notes, and assignment of proceeds from certain receivables. The loan agreements contain covenants which require maintaining certain financial ratios and bank approval prior to changes in ownership structure and distribution of dividends. As at [Current Year End], the Group was not in compliance with certain covenants.</p>`,
  },

  /* ── 17 ─────────────────────────────────────────────────────── */
  {
    note_number: 17,
    title: 'PROVISION FOR ZAKAT AND INCOME TAX',
    body: `<p><strong>a) Movement in provision for zakat and income tax:</strong></p>
<table ${TABLE}>
<tr><th ${THL}></th><th ${TH}>Zakat [CY]<br>SR</th><th ${TH}>Tax [CY]<br>SR</th><th ${TH}>Total [CY]<br>SR</th><th ${TH}>Zakat [PY]<br>SR</th><th ${TH}>Tax [PY]<br>SR</th><th ${TH}>Total [PY]<br>SR</th></tr>
<tr><td ${TDL}>At the beginning of the year</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Provided during the year – continuing operations</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Provided during the year – discontinued operations</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Settled through ultimate parent company</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Paid during the year</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td></tr>
<tr><td ${TDTL}>At the end of the year</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td></tr>
</table>
<p><strong>b) Deferred tax assets:</strong></p>
${movTable([
  ['At the beginning of the year', '[—]', '[—]'],
  ['Movement during the year', '([—])', '[—]'],
  ['At the end of the year', '[—]', '[—]'],
])}
<p><strong>c) Status of zakat assessments:</strong></p>
<p>In accordance with the rules and regulations of the Zakat, Tax and Custom Authorities, the Group is assessed for zakat as part of the consolidated zakat basis of its parent company, which accounts for and settles zakat liability on the basis of its consolidated financial statements. The Group has accrued for its share of zakat liability based on allocation from the parent company.</p>`,
  },

  /* ── 18 ─────────────────────────────────────────────────────── */
  {
    note_number: 18,
    title: 'NON-CONTROLLING INTERESTS',
    body: `<p>[Describe any transactions affecting non-controlling interests during the year, including acquisitions of NCI, disposals, and changes in ownership percentages.]</p>
<p><strong>Movement in non-controlling interest:</strong></p>
${movTable([
  ['Balance on 1 January', '[—]', '[—]'],
  ['Total comprehensive (loss) / income', '([—])', '[—]'],
  ['Balance de-recognized at the date of disposal', '([—])', '[—]'],
  ['Acquisition of NCI without a change in control', '[—]', '([—])'],
  ['Net movement in NCI', '[—]', '([—])'],
  ['Balance on 31 December', '[—]', '[—]'],
])}`,
  },

  /* ── 19 ─────────────────────────────────────────────────────── */
  {
    note_number: 19,
    title: 'DISCONTINUED OPERATIONS',
    body: `<p>[Describe the background and nature of the discontinued operations, including the board approval, disposal transaction, consideration received, and the date control passed to the acquirer.]</p>
<p><strong>A) Results of discontinued operations:</strong></p>
${movTable([
  ['Revenue', '[—]', '[—]'],
  ['Expenses', '([—])', '([—])'],
  ['Operating (loss) / profit', '([—])', '[—]'],
  ['Zakat and income tax', '([—])', '([—])'],
  ['Net (loss) / profit from discontinued operations', '([—])', '[—]'],
  ['Basic and diluted (loss) / EPS from discontinued operations', '([—])', '[—]'],
])}
<p><strong>B) Cash flows used in discontinued operations:</strong></p>
${movTable([
  ['Net cash from operating activities', '[—]', '[—]'],
  ['Net cash used in investing activities', '([—])', '([—])'],
  ['Net cash used in financing activities', '([—])', '([—])'],
  ['Cash and cash equivalents at beginning of year', '[—]', '[—]'],
  ['Cash and cash equivalents at date of disposal', '[—]', '[—]'],
], '[Current Year] SR', '[Prior Year] SR')}
<p><strong>C) Effect of disposal on the financial position of the Group:</strong></p>
${twoColTable([
  ['Cash and cash equivalents', '[—]', '[—]'],
  ['Accounts receivables – Trade', '[—]', '[—]'],
  ['Prepayments and other receivables', '[—]', '[—]'],
  ['Due from related parties', '[—]', '[—]'],
  ['Inventories', '[—]', '[—]'],
  ['Property, plant and equipment', '[—]', '[—]'],
  ['Right of use assets', '[—]', '[—]'],
  ['Intangible assets', '[—]', '[—]'],
  ['Other assets', '[—]', '[—]'],
  ['Trade payable, accrued and other liabilities', '([—])', '([—])'],
  ['Due to related parties', '([—])', '([—])'],
  ['Term loans – banks', '([—])', '([—])'],
  ['Lease liabilities', '([—])', '([—])'],
  ['Other liabilities', '([—])', '([—])'],
  ['Net assets disposed', '[—]', '[—]'],
], 'Subsidiary A SR', 'Subsidiary B SR')}
<p><strong>Gain on sale of subsidiaries:</strong></p>
${twoColTable([
  ['Cash consideration', '[—]', ''],
  ['Non-cash consideration (shares / other)', '[—]', ''],
  ['Total consideration', '[—]', ''],
  ['Carrying value of net assets sold', '([—])', ''],
  ['Gain on sale of subsidiaries', '[—]', ''],
], 'Amount SR', '')}`,
  },

  /* ── 20 ─────────────────────────────────────────────────────── */
  {
    note_number: 20,
    title: "EMPLOYEES' DEFINED BENEFITS LIABILITIES",
    body: `${movTable([
  ['Opening balance', '[—]', '[—]'],
  ['Current service cost', '[—]', '[—]'],
  ['Interest cost', '[—]', '[—]'],
  ['Paid during the year', '([—])', '([—])'],
  ['Actuarial loss / (gain)', '[—]', '[—]'],
  ['De-recognition on disposal of subsidiaries', '([—])', '[—]'],
  ['Transfer to parent company', '[—]', '([—])'],
  ['Foreign currency translation adjustments', '[—]', '[—]'],
  ['At the end of the year', '[—]', '[—]'],
])}
<p>The most recent actuarial valuation was performed by a qualified actuary using the projected unit credit method.</p>
<p><strong>Principal assumptions used:</strong></p>
<table ${TABLE}>
<tr><th ${THL}>Assumption</th><th ${TH}>[Current Year End] %</th><th ${TH}>[Prior Year End] %</th></tr>
<tr><td ${TDL}>Rate of salary increases</td><td ${TD}>[X]%</td><td ${TD}>[X]%</td></tr>
<tr><td ${TDL}>Discount rate</td><td ${TD}>[X]%</td><td ${TD}>[X]%</td></tr>
</table>
<p>All movements in employees' terminal benefits are recognized in profit or loss except for actuarial loss / (gain), which is recognized in other comprehensive income.</p>
<p><strong>Sensitivity analyses:</strong></p>
${twoColTable([
  ['Increase in discount rate of 0.5%', '[—]', '[—]'],
  ['Decrease in discount rate of 0.5%', '[—]', '[—]'],
  ['Increase in rate of salary increase of 0.5%', '[—]', '[—]'],
  ['Decrease in rate of salary increase of 0.5%', '[—]', '[—]'],
])}`,
  },

  /* ── 21 ─────────────────────────────────────────────────────── */
  {
    note_number: 21,
    title: 'SHARE CAPITAL',
    body: `<p>Share capital is divided into [shares] shares of SR [—] each. The share capital is distributed as follows:</p>
<table ${TABLE}>
<tr><th ${THL}>Shareholder</th><th ${TH}>Nationality</th><th ${TH}>Ownership %</th><th ${TH}>[Current Year End] SR</th><th ${TH}>[Prior Year End] SR</th></tr>
<tr><td ${TDL}>[Majority Shareholder]</td><td ${TD}>Saudi</td><td ${TD}>[X]%</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>[Minority Shareholder]</td><td ${TD}>Saudi</td><td ${TD}>[X]%</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDTL}>Total</td><td ${TDT}></td><td ${TDT}>100%</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td></tr>
</table>`,
  },

  /* ── 22 ─────────────────────────────────────────────────────── */
  {
    note_number: 22,
    title: 'PROPOSED SHARE CAPITAL INCREASE',
    body: `<p>[The majority shareholder granted an amount of SR [—] as interest-free subordinated loan in view of the expansion activities to be undertaken by the Group in future years. The subordinated loan was to be repaid only in the event of excess cash flow situation arising in the Group.]</p>
<p>[The majority shareholder subsequently resolved to convert the subordinated loan into proposed share capital. However, the Company has not yet proceeded with the legal formalities to convert the proposed share capital increase into share capital.]</p>`,
  },

  /* ── 23 ─────────────────────────────────────────────────────── */
  {
    note_number: 23,
    title: 'STATUTORY RESERVE',
    body: `<p>In accordance with Saudi Arabian Regulations for Companies, the Company must set aside 10% of its net profit after zakat and income tax and after deducting losses brought forward in each year until it has built up a reserve equal to 30% of the share capital. The reserve is not available for distribution to shareholders.</p>`,
  },

  /* ── 24 ─────────────────────────────────────────────────────── */
  {
    note_number: 24,
    title: 'SELLING AND DISTRIBUTION EXPENSES',
    body: movTable([
      ['Freight charges', '[—]', '[—]'],
      ['Employee cost', '[—]', '[—]'],
      ['Advertising and promotional expenses', '[—]', '[—]'],
      ['Allocation of information technology and human resource cost', '[—]', '[—]'],
      ['Rent', '[—]', '[—]'],
      ['Provision for doubtful debts', '[—]', '[—]'],
      ['Postage, telephone and utilities', '[—]', '[—]'],
      ['Royalty and licensing fees', '[—]', '[—]'],
      ['Travel', '[—]', '[—]'],
      ['Other', '[—]', '[—]'],
      ['Total', '[—]', '[—]'],
    ]),
  },

  /* ── 25 ─────────────────────────────────────────────────────── */
  {
    note_number: 25,
    title: 'GENERAL AND ADMINISTRATIVE EXPENSES',
    body: movTable([
      ['Shared service costs', '[—]', '[—]'],
      ['Consultancy charges', '[—]', '[—]'],
      ['Employee cost', '[—]', '[—]'],
      ['Depreciation and amortization', '[—]', '[—]'],
      ['Rent', '[—]', '[—]'],
      ['Professional fees', '[—]', '[—]'],
      ['Fuel and maintenance', '[—]', '[—]'],
      ['Insurance', '[—]', '[—]'],
      ['Bank charges', '[—]', '[—]'],
      ['IT expenses', '[—]', '[—]'],
      ['Travel', '[—]', '[—]'],
      ['Postage, telephone and utilities', '[—]', '[—]'],
      ['Other', '[—]', '[—]'],
      ['Total', '[—]', '[—]'],
    ]),
  },

  /* ── 26 ─────────────────────────────────────────────────────── */
  {
    note_number: 26,
    title: 'OTHER INCOME',
    body: movTable([
      ['Gain on disposal of investment in subsidiaries (Note 19)', '[—]', '[—]'],
      ['Gain on change in fair value of investment at FVTPL (Note 10)', '[—]', '[—]'],
      ['Dividend income', '[—]', '[—]'],
      ['Royalty income', '[—]', '[—]'],
      ['Income from scrap sales', '[—]', '[—]'],
      ['Gain from sale of property, plant and equipment', '[—]', '[—]'],
      ['Discount on lease rentals', '[—]', '[—]'],
      ['Reversal of accounts receivables', '[—]', '[—]'],
      ['Miscellaneous', '[—]', '[—]'],
      ['Total', '[—]', '[—]'],
    ]),
  },

  /* ── 27 ─────────────────────────────────────────────────────── */
  {
    note_number: 27,
    title: 'FINANCE COST',
    body: movTable([
      ['Interest expense on short and long term loans', '[—]', '[—]'],
      ['Interest on lease liabilities (Note 13)', '[—]', '[—]'],
      ['Interest cost related to defined benefit plans (Note 20)', '[—]', '[—]'],
      ['Foreign currency exchange loss', '[—]', '[—]'],
      ['Others', '[—]', '[—]'],
      ['Total', '[—]', '[—]'],
    ]),
  },

  /* ── 28 ─────────────────────────────────────────────────────── */
  {
    note_number: 28,
    title: 'EARNINGS PER SHARE',
    body: `<p>Earnings per share are based on net profit attributable to shareholders of the Company and a weighted average number of shares issued of [shares] shares.</p>
${movTable([
  ['Net profit attributable to shareholders of the Company', '[—]', '[—]'],
  ['Basic and diluted earnings per share (SR)', '[—]', '[—]'],
  ['Net profit – continuing operations', '[—]', '[—]'],
  ['Basic and diluted EPS – continuing operations (SR)', '[—]', '[—]'],
])}`,
  },

  /* ── 29 ─────────────────────────────────────────────────────── */
  {
    note_number: 29,
    title: 'OPERATING SEGMENTS',
    body: `<p><strong>Packaging:</strong> Production and sale of duplex cartons, rigid plastic packaging and flexible and film packaging for food &amp; beverages and printing of school books, magazines, scientific &amp; literary research and various types of high quality printed diaries. Further, the segment is also engaged in producing cylinders for plastic printing and preparing printing plates.</p>
<p><strong>Construction Project:</strong> Design, supply, installation and commissioning of equipment for [describe project].</p>
<p><strong>Liquid packaging:</strong> Manufacture and sale of packaging for dairy products, drinks and juices, trading in filling machines and production of long life aseptic food stuff packaging.</p>
<p><strong>Selected financial information – [Current Year]:</strong></p>
<table ${TABLE}>
<tr><th ${THL}></th><th ${TH}>Packaging SR</th><th ${TH}>Liquid Pkg SR</th><th ${TH}>Construction SR</th><th ${TH}>Total SR</th><th ${TH}>Eliminations SR</th><th ${TH}>Consolidated SR</th></tr>
<tr><td ${TDL}>Revenue</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Gross profit</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Selling &amp; distribution expenses</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>General &amp; administration expenses</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Other income</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Operating profit</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Finance cost</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Profit before zakat</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Zakat</td><td ${TD}>([—])</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td></tr>
<tr><td ${TDL}>Net profit – continuing operations</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Loss from discontinued operations</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td><td ${TD}>([—])</td></tr>
<tr><td ${TDTL}>Net profit for the year</td><td ${TDT}>[—]</td><td ${TDT}>([—])</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td><td ${TDT}>[—]</td></tr>
<tr><td ${TDL}>Total non-current assets</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Total current assets</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td></tr>
<tr><td ${TDL}>Total liabilities</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>[—]</td><td ${TD}>([—])</td><td ${TD}>[—]</td></tr>
</table>`,
  },

  /* ── 30 ─────────────────────────────────────────────────────── */
  {
    note_number: 30,
    title: 'CONTINGENT LIABILITIES',
    body: `<p>The outstanding letters of credit and guarantees at [Current Year End] amount to SR [—] and SR [—] respectively ([Prior Year End]: SR [—] and SR [—] respectively).</p>`,
  },

  /* ── 31 ─────────────────────────────────────────────────────── */
  {
    note_number: 31,
    title: 'FINANCIAL INSTRUMENTS',
    body: `<p><strong>31-1&nbsp;&nbsp;Fair value measurement</strong></p>
<p>Fair value is the price that would be received to sell an asset or paid to transfer a liability in an orderly transaction between market participants at the measurement date. The fair value measurement is based on the presumption that the transaction to sell the asset or transfer the liability takes place either in the principal market for the asset or liability, or in the absence of a principal market, in the most advantageous market for the asset or liability.</p>
<p>All assets and liabilities for which fair value is measured or disclosed in the consolidated financial statements are categorized within the fair value hierarchy as follows:</p>
<ul>
<li><strong>Level 1</strong> – Quoted (unadjusted) market prices in active markets for identical assets or liabilities;</li>
<li><strong>Level 2</strong> – Valuation techniques for which the lowest level input that is significant to the fair value measurement is directly or indirectly observable;</li>
<li><strong>Level 3</strong> – Valuation techniques for which the lowest level input that is significant to the fair value measurement is unobservable.</li>
</ul>
<p><strong>31-2&nbsp;&nbsp;Financial risk management</strong></p>
<p><strong>Capital management:</strong> The Group manages its capital to ensure it will be able to continue as a going concern while maximizing the return to stakeholders through the optimization of the debt and equity balance. The capital structure of the Group consists of equity and debt comprising share capital, statutory reserve, fair value reserve, retained earnings and loans.</p>
<p><strong>Market Risk:</strong> Market risk is the risk that the fair value of future cash flows of a financial instrument will fluctuate because of changes in market prices. Market prices comprise three types of risk: interest rate risk, currency risk and other price risk such as equity price risk and commodity price risk.</p>
<p><strong>Credit risk:</strong> Credit risk is the risk that a counterparty will not meet its obligations under a financial instrument or customer contract, leading to a financial loss. The Group places its cash with banks that have sound credit ratings. Accounts receivables and due from related parties are carried net of provision for doubtful debts.</p>
<p><strong>Liquidity risk:</strong> Liquidity risk is the risk that an enterprise will encounter difficulty in raising funds to meet commitments associated with financial instruments. Liquidity risk is managed by monitoring on a regular basis that sufficient funds are available through committed credit facilities to meet any future commitments.</p>
<p><strong>Currency risk:</strong> Currency risk is the risk that the value of financial instruments will fluctuate due to changes in foreign exchange rates. The Group is subject to fluctuations in foreign exchange rates in the normal course of its business. As SR is pegged to USD, balances in USD are not considered to represent significant currency risk.</p>`,
  },

  /* ── 32 ─────────────────────────────────────────────────────── */
  {
    note_number: 32,
    title: 'DIVIDENDS',
    body: `<p>[Describe dividend resolutions made during the year, including dates and amounts approved by shareholders.]</p>
${movTable([
  ['Investment distributed as dividend in kind', '[—]', '[—]'],
  ['Dividend distributed through current account', '[—]', '[—]'],
  ['Dividend paid in cash', '[—]', '[—]'],
  ['Total distributed dividends', '[—]', '[—]'],
], 'Amount [Current Year] SR', 'Amount [Prior Year] SR')}`,
  },

  /* ── 33 ─────────────────────────────────────────────────────── */
  {
    note_number: 33,
    title: 'SUBSEQUENT EVENTS',
    body: `<p>In the opinion of management, there have been no significant subsequent events since the year-end that require disclosure or adjustment in these consolidated financial statements.</p>`,
  },

  /* ── 34 ─────────────────────────────────────────────────────── */
  {
    note_number: 34,
    title: 'APPROVAL OF THE CONSOLIDATED FINANCIAL STATEMENTS',
    body: `<p>The consolidated financial statements have been approved by the Board of Directors on [approval date].</p>`,
  },
];
