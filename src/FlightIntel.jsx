import { useState, useEffect, useCallback, useRef } from "react";

// ─── CONFIG ───
const AIRLINES = {
  united: { name: "United", color: "#0033A0", accent: "#00B2E2", code: "UA", milesName: "MileagePlus", cppValue: 1.3, childDiscount: 0, infantLap: true, infantFee: 0 },
  delta: { name: "Delta", color: "#003366", accent: "#C01933", code: "DL", milesName: "SkyMiles", cppValue: 1.2, childDiscount: 0, infantLap: true, infantFee: 0 },
  american: { name: "American", color: "#B31942", accent: "#0078D2", code: "AA", milesName: "AAdvantage", cppValue: 1.4, childDiscount: 0, infantLap: true, infantFee: 0 },
  jetblue: { name: "JetBlue", color: "#003876", accent: "#0033A0", code: "B6", milesName: "TrueBlue", cppValue: 1.3, childDiscount: 0, infantLap: true, infantFee: 0 },
  southwest: { name: "Southwest", color: "#304CB2", accent: "#FFBF27", code: "WN", milesName: "Rapid Rewards", cppValue: 1.4, childDiscount: 0, infantLap: true, infantFee: 0 },
  emirates: { name: "Emirates", color: "#D71921", accent: "#C8A850", code: "EK", milesName: "Skywards", cppValue: 1.8, childDiscount: 25, infantLap: true, infantFee: 10 },
};

const CABIN_CLASSES = ["Economy", "Premium Economy", "Business", "First"];

const AIRPORTS = [
  "JFK - New York", "LAX - Los Angeles", "ORD - Chicago", "SFO - San Francisco",
  "MIA - Miami", "DFW - Dallas", "ATL - Atlanta", "BOS - Boston", "SEA - Seattle",
  "DEN - Denver", "LAS - Las Vegas", "MCO - Orlando", "EWR - Newark", "IAH - Houston",
  "PHL - Philadelphia", "CLT - Charlotte", "MSP - Minneapolis", "DTW - Detroit",
  "FLL - Fort Lauderdale", "TPA - Tampa", "SAN - San Diego", "AUS - Austin",
  "LHR - London", "CDG - Paris", "NRT - Tokyo", "FCO - Rome", "BCN - Barcelona",
  "CUN - Cancun", "SJU - San Juan", "HNL - Honolulu", "DXB - Dubai",
  "DOH - Doha", "IST - Istanbul", "SIN - Singapore", "HKG - Hong Kong",
  "ICN - Seoul", "SYD - Sydney", "AMS - Amsterdam", "FRA - Frankfurt",
  "ZRH - Zurich", "MUC - Munich", "MAD - Madrid", "LIS - Lisbon",
];

const FEES_DB = {
  UA: { checkedBag: 40, carryOn: 0, seatEco: 12, seatPrem: 45, seatBiz: 0, seatFirst: 0 },
  DL: { checkedBag: 35, carryOn: 0, seatEco: 15, seatPrem: 40, seatBiz: 0, seatFirst: 0 },
  AA: { checkedBag: 35, carryOn: 0, seatEco: 10, seatPrem: 50, seatBiz: 0, seatFirst: 0 },
  B6: { checkedBag: 40, carryOn: 0, seatEco: 12, seatPrem: 35, seatBiz: 0, seatFirst: 0 },
  WN: { checkedBag: 0, carryOn: 0, seatEco: 0, seatPrem: 0, seatBiz: 0, seatFirst: 0 },
  EK: { checkedBag: 0, carryOn: 0, seatEco: 18, seatPrem: 55, seatBiz: 0, seatFirst: 0 },
};

// ─── AIRLINE POLICIES DATABASE ───
const POLICIES_DB = {
  UA: {
    cancellation: [
      { label: "24-Hour Free Cancel", value: "Full refund within 24hrs of booking", icon: "✅" },
      { label: "Basic Economy", value: "Non-refundable. No changes allowed.", icon: "🚫" },
      { label: "Economy / Premium", value: "$200 domestic / $400 intl change fee (waived for MileagePlus Premier)", icon: "💰" },
      { label: "Business / First", value: "Free cancellation for full refund or flight credit", icon: "✅" },
      { label: "Refund Method", value: "Original payment method (refundable) or travel credit (non-refundable)", icon: "💳" },
    ],
    changes: [
      { label: "Basic Economy", value: "No changes permitted. Must purchase new ticket.", icon: "🚫" },
      { label: "Economy", value: "No change fee; fare difference applies", icon: "✅" },
      { label: "Same-Day Change", value: "$75 or free for Premier members. Subject to availability.", icon: "⏱️" },
      { label: "Same-Day Standby", value: "Free for all fare classes", icon: "✅" },
      { label: "Name Changes", value: "Not permitted. Ticket is non-transferable.", icon: "🚫" },
    ],
    seats: [
      { label: "Standard Seat", value: "Free at check-in (24hrs before). $12-$50 to pre-select.", icon: "💺" },
      { label: "Economy Plus", value: "$49-$199 per segment. Extra 3-5\" legroom.", icon: "💺" },
      { label: "Preferred Seat", value: "$12-$39. Front of economy, aisle/window.", icon: "💺" },
      { label: "Exit Row", value: "$49-$99. Must be 15+ years old.", icon: "🚪" },
      { label: "Pitch / Width", value: "Eco: 30-32\" / 17.3\" · Biz: 78\" flat bed / 21\"", icon: "📏" },
    ],
    baggage: [
      { label: "Personal Item", value: "Free. Must fit under seat (17×10×9\")", icon: "👜" },
      { label: "Carry-On", value: "Free (except Basic Economy intl). 22×14×9\"", icon: "🧳" },
      { label: "1st Checked Bag", value: "$40 ($0 for Premier Silver+). 50 lbs max.", icon: "🧳" },
      { label: "2nd Checked Bag", value: "$50. 50 lbs max.", icon: "🧳" },
      { label: "Overweight (51-70 lbs)", value: "$100 additional per bag", icon: "⚖️" },
      { label: "Oversized", value: "$200 per bag. 63-115 linear inches.", icon: "📦" },
    ],
    amenities: [
      { label: "WiFi", value: "Free for MileagePlus members. Starlink on select aircraft.", icon: "📶" },
      { label: "Entertainment", value: "Seatback screens on widebody. Personal device on narrowbody.", icon: "🎬" },
      { label: "Meals", value: "Complimentary on intl & premium. Buy-on-board domestic economy.", icon: "🍽️" },
      { label: "Power Outlets", value: "AC power + USB on most aircraft", icon: "🔌" },
      { label: "Lounge Access", value: "United Club: Premier 1K, Global Services, or $59 day pass", icon: "🛋️" },
    ],
  },
  DL: {
    cancellation: [
      { label: "24-Hour Free Cancel", value: "Full refund within 24hrs for any fare", icon: "✅" },
      { label: "Basic Economy", value: "Non-refundable. No changes. Ticket value forfeited.", icon: "🚫" },
      { label: "Main Cabin+", value: "No cancel fee. eCredit for future travel.", icon: "✅" },
      { label: "Delta One / First", value: "Fully refundable to original payment", icon: "✅" },
      { label: "Award Tickets", value: "Miles redeposited. Taxes refunded. No redeposit fee.", icon: "⭐" },
    ],
    changes: [
      { label: "Basic Economy", value: "No changes allowed", icon: "🚫" },
      { label: "Main Cabin & Above", value: "No change fee. Fare difference applies.", icon: "✅" },
      { label: "Same-Day Change", value: "Free for Diamond/Platinum. $75 others.", icon: "⏱️" },
      { label: "Same-Day Standby", value: "Free for all fare classes", icon: "✅" },
      { label: "Upgrades", value: "Complimentary upgrades for Medallion members at gate", icon: "⬆️" },
    ],
    seats: [
      { label: "Standard Seat", value: "Free at check-in. $15-$59 to pre-select.", icon: "💺" },
      { label: "Comfort+", value: "$30-$170. Extra 3\" legroom, dedicated overhead.", icon: "💺" },
      { label: "Preferred", value: "$15-$49. Front of main cabin.", icon: "💺" },
      { label: "Delta One Suite", value: "Included. Closing door suite on A350/A330-900.", icon: "🚪" },
      { label: "Pitch / Width", value: "Eco: 31-33\" / 18\" · Delta One: 78\" flat / 21\"", icon: "📏" },
    ],
    baggage: [
      { label: "Personal Item", value: "Free. Must fit under seat.", icon: "👜" },
      { label: "Carry-On", value: "Free (except Basic Economy). 22×14×9\"", icon: "🧳" },
      { label: "1st Checked Bag", value: "$35 ($0 for Medallion, Delta Amex). 50 lbs.", icon: "🧳" },
      { label: "2nd Checked Bag", value: "$45. 50 lbs max.", icon: "🧳" },
      { label: "Overweight", value: "$100 (51-70 lbs), $200 (71-100 lbs)", icon: "⚖️" },
    ],
    amenities: [
      { label: "WiFi", value: "Free for all passengers on most domestic flights", icon: "📶" },
      { label: "Entertainment", value: "Seatback screens on widebody. Delta Studio on device.", icon: "🎬" },
      { label: "Meals", value: "Free meals in all cabins on select routes. Snacks in economy.", icon: "🍽️" },
      { label: "Power Outlets", value: "AC power + USB-C on most aircraft", icon: "🔌" },
      { label: "Sky Club", value: "Amex Platinum/Reserve, Diamond Medallion, or $50 day pass", icon: "🛋️" },
    ],
  },
  AA: {
    cancellation: [
      { label: "24-Hour Free Cancel", value: "Full refund within 24hrs of booking", icon: "✅" },
      { label: "Basic Economy", value: "Non-refundable, non-changeable. Total forfeit.", icon: "🚫" },
      { label: "Main Cabin", value: "No cancel fee. Trip credit issued.", icon: "✅" },
      { label: "Business / First", value: "Fully refundable to original form of payment", icon: "✅" },
      { label: "Award Tickets", value: "No redeposit fee. Miles returned immediately.", icon: "⭐" },
    ],
    changes: [
      { label: "Basic Economy", value: "No changes permitted", icon: "🚫" },
      { label: "Main Cabin & Above", value: "No change fee. Fare difference applies.", icon: "✅" },
      { label: "Same-Day Change", value: "$75 or free for ExPlat/ConciergeKey", icon: "⏱️" },
      { label: "Upgrade Waitlist", value: "Complimentary for AAdvantage elite at gate", icon: "⬆️" },
      { label: "Standby", value: "Free same-day standby for all fares", icon: "✅" },
    ],
    seats: [
      { label: "Standard Seat", value: "Free at check-in. $10-$45 to pre-select.", icon: "💺" },
      { label: "Main Cabin Extra", value: "$30-$160. Extra legroom + early boarding.", icon: "💺" },
      { label: "Preferred", value: "$10-$35. Aisle/window closer to front.", icon: "💺" },
      { label: "Flagship Suite", value: "Included in fare. Privacy door on select 777/A321XLR.", icon: "🚪" },
      { label: "Pitch / Width", value: "Eco: 30-31\" / 17\" · Biz: 79\" flat / 21\"", icon: "📏" },
    ],
    baggage: [
      { label: "Personal Item", value: "Free. Fits under seat.", icon: "👜" },
      { label: "Carry-On", value: "Free (except Basic Economy). 22×14×9\"", icon: "🧳" },
      { label: "1st Checked Bag", value: "$35 ($0 Citi AAdvantage cardholders). 50 lbs.", icon: "🧳" },
      { label: "2nd Checked Bag", value: "$45. 50 lbs max.", icon: "🧳" },
      { label: "Military", value: "All active duty: up to 5 bags free", icon: "🎖️" },
    ],
    amenities: [
      { label: "WiFi", value: "$10-$35/flight. Free on select routes.", icon: "📶" },
      { label: "Entertainment", value: "Seatback on widebody. Streaming on narrowbody.", icon: "🎬" },
      { label: "Meals", value: "Buy-on-board domestic. Free intl all cabins.", icon: "🍽️" },
      { label: "Power Outlets", value: "AC + USB on most. Some older aircraft lack power.", icon: "🔌" },
      { label: "Admirals Club", value: "Citi ExAA card, ConciergeKey, or $65 day pass", icon: "🛋️" },
    ],
  },
  B6: {
    cancellation: [
      { label: "24-Hour Free Cancel", value: "Full refund within 24hrs", icon: "✅" },
      { label: "Blue Basic", value: "Non-refundable. $100 cancel fee for credit.", icon: "💰" },
      { label: "Blue / Blue Plus", value: "No cancel fee. JetBlue credit issued.", icon: "✅" },
      { label: "Mint (Business)", value: "Fully refundable to original payment", icon: "✅" },
      { label: "TrueBlue Awards", value: "Points redeposited free. Taxes credited.", icon: "⭐" },
    ],
    changes: [
      { label: "Blue Basic", value: "$100 change fee + fare difference", icon: "💰" },
      { label: "Blue & Above", value: "No change fee. Fare difference applies.", icon: "✅" },
      { label: "Same-Day Switch", value: "$75 or free for Mosaic members", icon: "⏱️" },
      { label: "Standby", value: "Not available on JetBlue", icon: "🚫" },
      { label: "Even More Speed", value: "Expedited security at select airports", icon: "⚡" },
    ],
    seats: [
      { label: "Standard Seat", value: "Assigned at check-in (Blue Basic) or free select.", icon: "💺" },
      { label: "Even More Space", value: "$25-$110. Up to 38\" pitch. Early boarding.", icon: "💺" },
      { label: "Core Seats", value: "$12-$35. Window/aisle preference.", icon: "💺" },
      { label: "Mint Suite", value: "Lie-flat seat with closing door on A321LR.", icon: "🚪" },
      { label: "Pitch / Width", value: "Eco: 32-33\" / 17.8\" · Mint: 76\" flat / 22\"", icon: "📏" },
    ],
    baggage: [
      { label: "Personal Item", value: "Free. Must fit under seat.", icon: "👜" },
      { label: "Carry-On", value: "Free for Blue+ and above. $65 for Blue Basic.", icon: "🧳" },
      { label: "1st Checked Bag", value: "$40 ($0 Blue Plus, Mosaic). 50 lbs.", icon: "🧳" },
      { label: "2nd Checked Bag", value: "$55. 50 lbs max.", icon: "🧳" },
      { label: "Overweight", value: "$150 per bag (51-99 lbs)", icon: "⚖️" },
    ],
    amenities: [
      { label: "WiFi", value: "Free Fly-Fi on all flights (gate-to-gate)", icon: "📶" },
      { label: "Entertainment", value: "Free seatback screens on every aircraft. 100+ channels.", icon: "🎬" },
      { label: "Snacks", value: "Free snacks & soft drinks. Alcohol available for purchase.", icon: "🍿" },
      { label: "Power Outlets", value: "AC power + USB at every seat", icon: "🔌" },
      { label: "Legroom", value: "Industry-leading 32-33\" pitch in economy", icon: "📏" },
    ],
  },
  WN: {
    cancellation: [
      { label: "No Cancel Fees Ever", value: "All fares can be cancelled for full credit or refund", icon: "✅" },
      { label: "Wanna Get Away", value: "Cancel for travel credit (Rapid Rewards credit). Non-refundable to cash.", icon: "💰" },
      { label: "Wanna Get Away Plus", value: "Cancel for transferable travel credit", icon: "✅" },
      { label: "Anytime / Biz Select", value: "Fully refundable to original payment method", icon: "✅" },
      { label: "No-Show Policy", value: "Wanna Get Away: funds forfeited if you no-show", icon: "⚠️" },
    ],
    changes: [
      { label: "All Fares", value: "No change fees ever. Fare difference applies (credit if cheaper).", icon: "✅" },
      { label: "Same-Day Change", value: "Free for all fare classes", icon: "✅" },
      { label: "Standby", value: "Free same-day standby for all", icon: "✅" },
      { label: "Transferable Credits", value: "Wanna Get Away Plus credits can be transferred to others", icon: "🔄" },
      { label: "Flexibility Rating", value: "★★★★★ Most flexible US carrier", icon: "⭐" },
    ],
    seats: [
      { label: "Open Seating", value: "No assigned seats. Board by group (A/B/C) and choose.", icon: "💺" },
      { label: "EarlyBird Check-In", value: "$15-$25. Automatic early boarding position.", icon: "⚡" },
      { label: "Upgraded Boarding", value: "$30-$50 at gate for A1-A15 positions", icon: "⬆️" },
      { label: "Business Select", value: "Guaranteed A1-A15 boarding + free drink", icon: "🥂" },
      { label: "Pitch / Width", value: "All Economy: 32-33\" / 17.8\". No first/business class.", icon: "📏" },
    ],
    baggage: [
      { label: "Personal Item", value: "Free", icon: "👜" },
      { label: "Carry-On", value: "Free for all fares. 24×16×10\"", icon: "🧳" },
      { label: "1st Checked Bag", value: "FREE for all fares. 50 lbs.", icon: "✅" },
      { label: "2nd Checked Bag", value: "FREE for all fares. 50 lbs.", icon: "✅" },
      { label: "Overweight (51-100)", value: "$75 per bag", icon: "⚖️" },
    ],
    amenities: [
      { label: "WiFi", value: "$8/day. Free messaging (iMessage, WhatsApp).", icon: "📶" },
      { label: "Entertainment", value: "Free streaming to personal device. No seatback screens.", icon: "🎬" },
      { label: "Snacks", value: "Free snacks & non-alcoholic beverages", icon: "🍿" },
      { label: "Power Outlets", value: "USB at every seat. No AC power.", icon: "🔌" },
      { label: "Companion Pass", value: "Earn with 135K points — a friend flies free for a year", icon: "👫" },
    ],
  },
  EK: {
    cancellation: [
      { label: "24-Hour Free Cancel", value: "Full refund within 24hrs for most fares", icon: "✅" },
      { label: "Special/Saver Fares", value: "Non-refundable. AED 300-500 (~$82-$136) no-show fee.", icon: "💰" },
      { label: "Flex / Saver Flex", value: "Refundable with AED 200-400 (~$55-$109) fee", icon: "💰" },
      { label: "Business Flex", value: "Fully refundable. No penalties.", icon: "✅" },
      { label: "First Class", value: "Fully refundable. Priority rebooking.", icon: "✅" },
    ],
    changes: [
      { label: "Special Fares", value: "AED 200-300 (~$55-$82) change fee + fare difference", icon: "💰" },
      { label: "Saver / Flex", value: "Free date/time change. Fare difference applies.", icon: "✅" },
      { label: "Business / First", value: "Unlimited free changes. No fare difference on same class.", icon: "✅" },
      { label: "Route Change", value: "Permitted on Flex fares. Fee on Saver.", icon: "🔄" },
      { label: "Upgrade at Airport", value: "Cash or miles upgrade available at check-in counter", icon: "⬆️" },
    ],
    seats: [
      { label: "Economy Standard", value: "Free at check-in. $18-$55 to pre-select.", icon: "💺" },
      { label: "Economy Preferred", value: "$35-$80. Extra legroom, bulkhead, exit row.", icon: "💺" },
      { label: "Business Lie-Flat", value: "Included. 72\" fully flat bed with mini-bar.", icon: "🛏️" },
      { label: "First Class Suite", value: "Included. Fully enclosed private suite on 777.", icon: "🏠" },
      { label: "A380 Shower Spa", value: "Complimentary for First Class passengers on A380", icon: "🚿" },
      { label: "Pitch / Width", value: "Eco: 32-34\" / 18\" · Biz: 72\" flat / 22\" · First: 87\" / 23\"", icon: "📏" },
    ],
    baggage: [
      { label: "Cabin Bag", value: "Free. 15 lbs. 22×15×8\"", icon: "👜" },
      { label: "Checked (Economy)", value: "2 bags FREE. 50 lbs each (Special), 70 lbs (Flex).", icon: "✅" },
      { label: "Checked (Business)", value: "2 bags FREE. 70 lbs each.", icon: "✅" },
      { label: "Checked (First)", value: "2 bags FREE. 70 lbs each.", icon: "✅" },
      { label: "Excess Bags", value: "$100-$300 per additional bag depending on route", icon: "🧳" },
      { label: "Sporting Equipment", value: "Golf, ski, bikes: $150-$300 per piece per direction", icon: "⛳" },
    ],
    amenities: [
      { label: "WiFi", value: "Free 20MB. Paid plans from $4.99 for full flight.", icon: "📶" },
      { label: "ICE Entertainment", value: "Free. 6,500+ channels on every seat. Seatback screens.", icon: "🎬" },
      { label: "Meals", value: "Free multi-course meals all cabins. Dine-on-demand in premium.", icon: "🍽️" },
      { label: "Chauffeur Service", value: "Free airport transfer for Business/First Class", icon: "🚘" },
      { label: "Lounge", value: "Emirates Lounge: Business/First at DXB. Priority Pass at outstations.", icon: "🛋️" },
      { label: "Kids", value: "Free kids' meals, toys, and entertainment packs on all flights", icon: "🧸" },
    ],
  },
};

function getPassengerPricing(adultPrice, pax, airlineKey) {
  const al = AIRLINES[airlineKey];
  let total = 0;
  const breakdown = [];
  for (let i = 0; i < pax.adults; i++) {
    total += adultPrice;
    breakdown.push({ type: "Adult", price: adultPrice, discount: 0 });
  }
  for (const child of pax.children) {
    let discount = 0, label = "";
    if (child.age < 2) {
      if (child.needsSeat) {
        discount = 25; label = `Infant (${child.age}y, seat)`;
      } else {
        const pct = al.infantFee;
        const p = Math.round(adultPrice * pct / 100);
        total += p;
        breakdown.push({ type: `Infant (${child.age}y, lap)`, price: p, discount: 100 - pct });
        continue;
      }
    } else if (child.age <= 11) {
      discount = al.childDiscount; label = `Child (${child.age}y)`;
    } else {
      discount = 0; label = `Youth (${child.age}y)`;
    }
    const cp = Math.round(adultPrice * (1 - discount / 100));
    total += cp;
    breakdown.push({ type: label, price: cp, discount });
  }
  return { total, breakdown, perAdult: adultPrice };
}

function generateFlights(origin, dest, date, pax, cabin) {
  const or3 = origin.slice(0, 3), de3 = dest.slice(0, 3);
  const hash = (or3 + de3 + date).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const results = [];
  const intlCodes = ["LHR","CDG","NRT","FCO","BCN","DXB","DOH","IST","SIN","HKG","ICN","SYD","AMS","FRA","ZRH","MUC","MAD","LIS"];
  const isIntl = intlCodes.includes(de3) || intlCodes.includes(or3);
  const totalPax = pax.adults + pax.children.length;

  for (const [key, airline] of Object.entries(AIRLINES)) {
    const i = Object.keys(AIRLINES).indexOf(key);
    const seed = (hash * (i + 1) * 17) % 1000;
    if (key === "emirates" && !isIntl) continue;
    if (key === "southwest" && isIntl) continue;
    if (seed % 5 === 0) continue;

    const nf = 1 + (seed % 3);
    for (let f = 0; f < nf; f++) {
      const depH = 6 + ((seed * (f + 1)) % 14), depM = ((seed * (f + 2)) % 4) * 15;
      const dur = (isIntl ? 360 : 120) + ((seed * (f + 3)) % (isIntl ? 300 : 240));
      const arrH = depH + Math.floor(dur / 60), arrM = (depM + dur) % 60;
      const cabM = cabin === "Economy" ? 1 : cabin === "Premium Economy" ? 1.8 : cabin === "Business" ? 3.5 : 5.5;
      const adultBase = Math.round((150 + (seed * (f + 1)) % 500) * cabM * (isIntl ? 2.2 : 1) * (key === "emirates" ? 1.15 : 1));
      const pricing = getPassengerPricing(adultBase, pax, key);
      const milesBase = Math.round((8000 + (seed * (f + 1)) % 40000) * cabM * (isIntl ? 1.8 : 1));

      results.push({
        id: `${key}-${f}-${date}`, airline: key, airlineName: airline.name, airlineCode: airline.code,
        flightNumber: `${airline.code}${100 + ((seed * (f + 1)) % 900)}`,
        origin: or3, destination: de3, date,
        departure: `${String(depH % 24).padStart(2, "0")}:${String(depM).padStart(2, "0")}`,
        arrival: `${String(arrH % 24).padStart(2, "0")}:${String(arrM).padStart(2, "0")}`,
        duration: dur, durationStr: `${Math.floor(dur / 60)}h ${dur % 60}m`,
        cabin, price: pricing.total, pricePerAdult: adultBase, pricingBreakdown: pricing.breakdown,
        milesRequired: milesBase, milesTaxes: Math.round(5.6 * totalPax + (seed % 80)),
        totalPax, pax, direct: true, isIntl,
        aircraft: key === "emirates" ? ["Boeing 777-300ER", "Airbus A380", "Boeing 787-10"][seed % 3] : ["Boeing 737-900", "Boeing 787-9", "Airbus A320neo", "Airbus A321XLR", "Boeing 777-200"][seed % 5],
      });
    }
  }
  return results.sort((a, b) => a.price - b.price);
}

function generateFlexDates(origin, dest, date, pax, cabin) {
  const d = new Date(date), results = [];
  for (let off = -3; off <= 3; off++) {
    const nd = new Date(d); nd.setDate(nd.getDate() + off);
    const ds = nd.toISOString().split("T")[0];
    const fl = generateFlights(origin, dest, ds, pax, cabin);
    if (fl[0]) results.push({ date: ds, offset: off, bestPrice: fl[0].price, bestMiles: fl[0].milesRequired, flightCount: fl.length, bestFlight: fl[0] });
  }
  return results;
}

function getUberEstimate(dist) {
  return { uberX: Math.round(15 + dist * 1.2), uberComfort: Math.round(22 + dist * 1.6), uberXL: Math.round(28 + dist * 2.0), uberBlack: Math.round(45 + dist * 3.2) };
}

function generateOptimizationTips(flights, milesBalances, fees, uberCost, pax, flexDates, cabin) {
  const tips = [];
  if (!flights.length) return tips;
  const best = flights[0];
  const totalPax = pax.adults + pax.children.length;
  const youngKids = pax.children.filter(c => c.age >= 2 && c.age <= 11);
  const infants = pax.children.filter(c => c.age < 2);
  const emiratesFlight = flights.find(f => f.airline === "emirates");

  if (youngKids.length > 0 && emiratesFlight) {
    const emSav = youngKids.length * Math.round(emiratesFlight.pricePerAdult * 0.25);
    tips.push({ type: "child", icon: "👶", title: "Emirates Child Discount", text: `Emirates offers 25% off for children aged 2-11. With ${youngKids.length} qualifying child${youngKids.length > 1 ? "ren" : ""}, you'd save ~$${emSav} vs full adult fares. Most US carriers charge full adult fare for children 2+.`, savings: emSav, priority: emSav > 100 ? "high" : "medium" });
  }
  if (infants.length > 0) {
    const lapInf = infants.filter(c => !c.needsSeat);
    if (lapInf.length > 0) tips.push({ type: "infant", icon: "🍼", title: "Lap Infant Strategy", text: `${lapInf.length} infant${lapInf.length > 1 ? "s" : ""} under 2 fly free as lap children on most US carriers. Emirates charges 10%. Book US carriers for infant savings.`, savings: lapInf.length * Math.round(best.pricePerAdult * 0.10), priority: "medium" });
  }

  let bestMD = null;
  flights.forEach(f => { const b = milesBalances[f.airline] || 0; if (b >= f.milesRequired) { const cpp = (f.pricePerAdult / f.milesRequired) * 100; if (!bestMD || cpp > bestMD.cpp) bestMD = { flight: f, cpp }; } });
  if (bestMD && bestMD.cpp >= 1.2) {
    const saved = bestMD.flight.price - bestMD.flight.milesTaxes;
    tips.push({ type: "miles", icon: "⭐", title: `${bestMD.cpp.toFixed(1)}cpp Miles Redemption`, text: `Using ${bestMD.flight.milesRequired.toLocaleString()} ${AIRLINES[bestMD.flight.airline].milesName} miles for ${bestMD.flight.airlineName} ${bestMD.flight.flightNumber} gives ${bestMD.cpp.toFixed(1)} cents per point — ${bestMD.cpp >= 1.5 ? "well above" : "near"} the ${AIRLINES[bestMD.flight.airline].cppValue}cpp avg. Save $${saved} in cash.`, savings: saved, priority: bestMD.cpp >= 1.5 ? "high" : "medium" });
  }

  if (flexDates.length > 1) {
    const ch = flexDates.reduce((a, b) => a.bestPrice < b.bestPrice ? a : b);
    const sel = flexDates.find(x => x.offset === 0);
    if (sel && ch.date !== sel.date && ch.bestPrice < sel.bestPrice) {
      const s = sel.bestPrice - ch.bestPrice;
      tips.push({ type: "flex", icon: "📅", title: `Save $${s} — Move ${Math.abs(ch.offset)} Day${Math.abs(ch.offset) > 1 ? "s" : ""} ${ch.offset < 0 ? "Earlier" : "Later"}`, text: `Flying ${new Date(ch.date + "T12:00:00").toLocaleDateString("en", { weekday: "long", month: "short", day: "numeric" })} saves $${s}. Best: ${ch.bestFlight.airlineName} at $${ch.bestPrice}.`, savings: s, priority: s > 200 ? "high" : s > 75 ? "medium" : "low" });
    }
  }

  const swF = flights.find(f => f.airlineCode === "WN");
  if (swF && parseInt(fees.checkedBags) > 0) {
    const bs = (parseInt(fees.checkedBags) || 0) * 40 * totalPax;
    const pd = swF.price - best.price;
    if (pd < bs) tips.push({ type: "bags", icon: "🧳", title: "Southwest Free Bags", text: `Southwest includes 2 free checked bags/person. Save $${bs} in fees. ${pd > 0 ? `Base fare is $${pd} more but` : "Base fare is cheaper and"} true total is ${pd < bs ? "cheaper" : "similar"}.`, savings: Math.max(0, bs - Math.max(0, pd)), priority: bs > 100 ? "high" : "medium" });
  }

  if (emiratesFlight && emiratesFlight.isIntl) {
    const sv = (parseInt(fees.checkedBags) > 0 ? 80 * totalPax : 0) + (cabin !== "Economy" ? uberCost : 0);
    tips.push({ type: "perks", icon: "✨", title: "Emirates: Free Bags & Perks", text: `Emirates includes 2 checked bags in Economy (saving ~$80/person), meals, and Business/First chauffeur service (replacing your $${uberCost} Uber).`, savings: sv, priority: sv > 100 ? "high" : "medium" });
  }

  const trueCost = best.price + (parseInt(fees.checkedBags) || 0) * (FEES_DB[best.airlineCode]?.checkedBag || 0) * totalPax + uberCost;
  if (trueCost > best.price * 1.15) {
    tips.push({ type: "warning", icon: "⚠️", title: `Hidden Costs Add ${Math.round((trueCost / best.price - 1) * 100)}%`, text: `Cheapest fare is $${best.price}, but true cost with bags, seats, transport is $${trueCost} — ${Math.round((trueCost / best.price - 1) * 100)}% more. Always compare true totals.`, savings: 0, priority: "high" });
  }

  // Age-specific tip
  const almostInfants = pax.children.filter(c => c.age === 1);
  if (almostInfants.length > 0) {
    tips.push({ type: "age", icon: "🎂", title: "Book Before They Turn 2!", text: `You have ${almostInfants.length} child${almostInfants.length > 1 ? "ren" : ""} aged 1. If they turn 2 before the return date, they'll need a paid seat. Book now to lock in free lap infant pricing.`, savings: Math.round(best.pricePerAdult * 0.75), priority: "high" });
  }

  return tips.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] ?? 2) - ({ high: 0, medium: 1, low: 2 }[b.priority] ?? 2) || b.savings - a.savings);
}

// Icons
const PlaneIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>;
const SearchIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>;
const StarIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>;
const CheckIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>;
const CarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 17h2m10 0h2M3 11l1.5-5A2 2 0 016.4 4h11.2a2 2 0 011.9 1.5L21 11"/><rect x="3" y="11" width="18" height="7" rx="1"/><circle cx="7" cy="18" r="1.5" fill="currentColor"/><circle cx="17" cy="18" r="1.5" fill="currentColor"/></svg>;
const XIcon = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const PlusIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const UserIcon = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const TipIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>;

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700&family=Space+Mono:wght@400;700&display=swap');
:root{--bg:#0B0F1A;--bg2:#121829;--bg3:#1A2138;--bg4:#222B45;--text:#E8ECF4;--text2:#8F9BB3;--text3:#5A6580;--accent:#3366FF;--accent2:#00E096;--accent3:#FFAA00;--danger:#FF3D71;--border:#2A3352;--card:#151C30;--glow:rgba(51,102,255,0.15);--emirates:#D71921}
*{margin:0;padding:0;box-sizing:border-box}
body,#root{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);min-height:100vh}
.app{max-width:1320px;margin:0 auto;padding:16px 20px}
.header{display:flex;align-items:center;gap:14px;padding:16px 0 22px;border-bottom:1px solid var(--border);margin-bottom:20px}
.header h1{font-size:22px;font-weight:700;letter-spacing:-0.5px;background:linear-gradient(135deg,var(--accent),var(--accent2));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.header .sub{font-size:11px;color:var(--text2);margin-top:2px}
.logo-box{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,var(--accent),#6644ff);display:flex;align-items:center;justify-content:center;color:#fff;flex-shrink:0}
.tabs{display:flex;gap:4px;margin-bottom:20px;background:var(--bg2);border-radius:12px;padding:4px}
.tab{flex:1;padding:9px 14px;border-radius:10px;font-size:12px;font-weight:500;color:var(--text2);cursor:pointer;text-align:center;transition:all .2s;border:none;background:none;font-family:inherit}
.tab:hover{color:var(--text)} .tab.active{background:var(--accent);color:#fff}
.field{display:flex;flex-direction:column;gap:3px}
.field label{font-size:10px;font-weight:600;color:var(--text2);text-transform:uppercase;letter-spacing:.5px}
.field input,.field select{background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:9px 11px;color:var(--text);font-size:13px;font-family:inherit;outline:none;transition:border .2s;width:100%}
.field input:focus,.field select:focus{border-color:var(--accent)} .field select{cursor:pointer}
.search-btn{align-self:flex-end;background:linear-gradient(135deg,var(--accent),#5544ee);color:#fff;border:none;border-radius:10px;padding:9px 24px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:7px;transition:transform .15s,box-shadow .15s;white-space:nowrap;font-family:inherit}
.search-btn:hover{transform:translateY(-1px);box-shadow:0 4px 20px var(--glow)}
.grid5{display:grid;grid-template-columns:1fr 1fr 1fr 1fr auto;gap:10px;margin-bottom:12px}
.grid4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:10px;margin-bottom:16px}
.pax-panel{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px}
.pax-panel h3{font-size:13px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.pax-row{display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)}
.pax-row:last-child{border-bottom:none}
.pax-type{display:flex;flex-direction:column;min-width:140px}
.pax-type .name{font-size:13px;font-weight:500}
.pax-type .desc{font-size:10px;color:var(--text3)}
.pax-controls{display:flex;align-items:center;gap:8px}
.pax-btn{width:30px;height:30px;border-radius:8px;border:1px solid var(--border);background:var(--bg3);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:600;transition:all .15s;font-family:inherit}
.pax-btn:hover{border-color:var(--accent);color:var(--accent)}
.pax-btn:disabled{opacity:.3;cursor:default}
.pax-count{font-size:16px;font-weight:700;font-family:'Space Mono',monospace;min-width:24px;text-align:center}
.child-row{display:flex;align-items:center;gap:10px;padding:8px 12px;background:var(--bg3);border-radius:8px;margin-top:6px}
.child-row .field{flex:0 0 70px}
.child-remove{width:26px;height:26px;border-radius:6px;border:1px solid var(--border);background:var(--bg);color:var(--danger);cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .15s;flex-shrink:0}
.child-remove:hover{background:var(--danger);color:#fff;border-color:var(--danger)}
.add-child-btn{display:flex;align-items:center;gap:6px;margin-top:8px;padding:8px 14px;border-radius:8px;border:1px dashed var(--border);background:transparent;color:var(--text2);cursor:pointer;font-size:12px;font-family:inherit;transition:all .15s}
.add-child-btn:hover{border-color:var(--accent);color:var(--accent)}
.lap-toggle{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--text2);cursor:pointer}
.lap-toggle input{width:auto;padding:0;accent-color:var(--accent)}
.miles-panel{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px}
.miles-panel h3{font-size:13px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.miles-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:8px}
.mile-input{display:flex;align-items:center;gap:10px;background:var(--bg3);border-radius:10px;padding:10px 14px;border:1px solid var(--border)}
.mile-input .dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.mile-input span{font-size:11px;color:var(--text2);white-space:nowrap;flex:1}
.mile-input input{background:transparent;border:none;color:var(--text);font-size:14px;font-weight:600;width:90px;outline:none;font-family:'Space Mono',monospace;text-align:right}
.uber-panel{background:var(--bg2);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:16px}
.uber-panel h3{font-size:13px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.tips-panel{margin-bottom:20px}
.tips-panel h3{font-size:14px;font-weight:600;margin-bottom:12px;display:flex;align-items:center;gap:8px}
.tip-card{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:8px;display:flex;gap:14px;align-items:flex-start;transition:border-color .2s}
.tip-card:hover{border-color:var(--accent)}
.tip-card.high{border-left:3px solid var(--accent2)}
.tip-card.medium{border-left:3px solid var(--accent3)}
.tip-card.low{border-left:3px solid var(--text3)}
.tip-icon{font-size:22px;flex-shrink:0;margin-top:2px}
.tip-body{flex:1}
.tip-title{font-size:13px;font-weight:600;margin-bottom:4px}
.tip-text{font-size:12px;color:var(--text2);line-height:1.6}
.tip-savings{background:var(--bg3);border-radius:6px;padding:4px 10px;font-family:'Space Mono',monospace;font-size:12px;font-weight:700;color:var(--accent2);white-space:nowrap;align-self:center}
.results-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:8px}
.results-header h2{font-size:15px;font-weight:600}
.results-count{font-size:11px;color:var(--text2)}
.sort-btns{display:flex;gap:3px}
.sort-btn{background:var(--bg3);border:1px solid var(--border);border-radius:6px;padding:5px 10px;color:var(--text2);font-size:10px;cursor:pointer;font-family:inherit;transition:all .15s}
.sort-btn.active{background:var(--accent);color:#fff;border-color:var(--accent)}
.flight-card{background:var(--card);border:1px solid var(--border);border-radius:14px;padding:16px;margin-bottom:8px;transition:border-color .2s,transform .15s;cursor:pointer;position:relative;overflow:hidden}
.flight-card:hover{border-color:var(--accent);transform:translateY(-1px)}
.flight-card.best::before{content:'BEST VALUE';position:absolute;top:0;right:18px;background:var(--accent2);color:#000;font-size:8px;font-weight:700;padding:2px 8px;border-radius:0 0 6px 6px;letter-spacing:.5px}
.flight-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px}
.airline-badge{display:flex;align-items:center;gap:10px}
.airline-dot{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:700}
.airline-info{display:flex;flex-direction:column}
.airline-name{font-size:13px;font-weight:600}
.flight-num{font-size:10px;color:var(--text2);font-family:'Space Mono',monospace}
.price-box{text-align:right}
.price-cash{font-size:20px;font-weight:700;color:var(--accent2);font-family:'Space Mono',monospace}
.price-pp{font-size:10px;color:var(--text2)}
.flight-middle{display:flex;align-items:center;gap:14px;padding:10px 0;border-top:1px solid var(--border);border-bottom:1px solid var(--border)}
.time-block{text-align:center}
.time{font-size:18px;font-weight:700;font-family:'Space Mono',monospace}
.airport{font-size:10px;color:var(--text2);margin-top:1px}
.flight-line{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px}
.line-bar{width:100%;height:2px;background:var(--border);position:relative}
.line-bar::after{content:'';position:absolute;right:-4px;top:-3px;width:8px;height:8px;background:var(--accent);border-radius:50%}
.line-bar::before{content:'';position:absolute;left:-4px;top:-3px;width:8px;height:8px;background:var(--accent2);border-radius:50%}
.duration-tag{font-size:10px;color:var(--text2)}
.direct-tag{font-size:9px;color:var(--accent2);font-weight:600;text-transform:uppercase}
.flight-bottom{display:flex;justify-content:space-between;align-items:center;margin-top:10px;flex-wrap:wrap;gap:6px}
.tags{display:flex;gap:4px;flex-wrap:wrap}
.tag{background:var(--bg3);border-radius:4px;padding:2px 7px;font-size:9px;color:var(--text2);display:flex;align-items:center;gap:3px}
.miles-option{display:flex;align-items:center;gap:8px;background:var(--bg3);border-radius:8px;padding:5px 10px}
.miles-val{font-size:12px;font-weight:700;color:var(--accent3);font-family:'Space Mono',monospace}
.miles-tax{font-size:9px;color:var(--text3)}
.cost-breakdown{background:var(--bg3);border-radius:10px;padding:14px;margin-top:10px;border:1px solid var(--border)}
.cost-section-title{font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.5px;margin:8px 0 4px;padding-top:8px;border-top:1px solid var(--border)}
.cost-section-title:first-child{border-top:none;margin-top:0;padding-top:0}
.cost-row{display:flex;justify-content:space-between;align-items:center;padding:3px 0;font-size:11px}
.cost-row .lbl{color:var(--text2)} .cost-row .val{font-family:'Space Mono',monospace;color:var(--text)}
.cost-row.total{border-top:2px solid var(--border);margin-top:8px;padding-top:8px;font-weight:700;font-size:13px}
.cost-row.total .val{color:var(--accent2);font-size:15px}
.cost-row.miles-alt{margin-top:6px;padding:6px 10px;background:rgba(255,170,0,.06);border-radius:6px}
.cost-row.miles-alt .val{color:var(--accent3)}
.cost-row.discount .val{color:var(--accent2)}
.flex-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:20px}
.flex-card{background:var(--card);border:1px solid var(--border);border-radius:10px;padding:10px 6px;text-align:center;cursor:pointer;transition:all .2s}
.flex-card:hover{border-color:var(--accent)}
.flex-card.cheapest{border-color:var(--accent2);background:rgba(0,224,150,.05)}
.flex-card.selected{border-color:var(--accent);background:rgba(51,102,255,.1)}
.flex-date{font-size:11px;font-weight:600} .flex-day{font-size:9px;color:var(--text2);margin-bottom:4px}
.flex-price{font-size:14px;font-weight:700;font-family:'Space Mono',monospace;color:var(--accent2)}
.flex-diff{font-size:9px;margin-top:2px} .flex-diff.save{color:var(--accent2)} .flex-diff.more{color:var(--danger)}
.flex-count{font-size:9px;color:var(--text3);margin-top:3px}
.analysis-card{background:linear-gradient(135deg,rgba(51,102,255,.08),rgba(100,68,255,.08));border:1px solid rgba(51,102,255,.25);border-radius:14px;padding:18px;margin-bottom:16px}
.analysis-card h3{font-size:13px;font-weight:600;margin-bottom:10px;display:flex;align-items:center;gap:8px}
.analysis-loading{display:flex;align-items:center;gap:10px;color:var(--text2);font-size:12px}
.analysis-loading .dot-pulse{display:flex;gap:4px}
.analysis-loading .dot-pulse span{width:6px;height:6px;border-radius:50%;background:var(--accent);animation:pulse 1.2s ease-in-out infinite}
.analysis-loading .dot-pulse span:nth-child(2){animation-delay:.2s}
.analysis-loading .dot-pulse span:nth-child(3){animation-delay:.4s}
@keyframes pulse{0%,100%{opacity:.3}50%{opacity:1}}
.empty-state{text-align:center;padding:50px 20px;color:var(--text3)}
.empty-state .big-icon{font-size:44px;margin-bottom:10px;opacity:.3}
.empty-state p{font-size:13px}
.expanded-card{border-color:var(--accent)}
.savings-total{margin-top:16px;padding:14px;background:var(--bg2);border-radius:12px;border:1px solid var(--border)}
.savings-total .amt{font-size:28px;font-weight:700;font-family:'Space Mono',monospace;color:var(--accent2)}

/* INFO BOX */
.info-box{margin-top:12px;background:var(--bg2);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.info-tabs{display:flex;border-bottom:1px solid var(--border);overflow-x:auto;-webkit-overflow-scrolling:touch}
.info-tab{padding:9px 14px;font-size:10px;font-weight:600;color:var(--text3);cursor:pointer;border:none;background:none;font-family:inherit;white-space:nowrap;transition:all .15s;border-bottom:2px solid transparent;text-transform:uppercase;letter-spacing:.4px}
.info-tab:hover{color:var(--text2)}
.info-tab.active{color:var(--accent);border-bottom-color:var(--accent);background:rgba(51,102,255,.04)}
.info-content{padding:14px 16px;max-height:320px;overflow-y:auto}
.info-content::-webkit-scrollbar{width:4px}
.info-content::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
.info-row{display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(42,51,82,.4)}
.info-row:last-child{border-bottom:none}
.info-row-icon{font-size:16px;flex-shrink:0;width:24px;text-align:center;margin-top:1px}
.info-row-body{flex:1;display:flex;flex-direction:column;gap:2px}
.info-row-label{font-size:11px;font-weight:600;color:var(--text)}
.info-row-value{font-size:11px;color:var(--text2);line-height:1.5}
.info-row-value.good{color:var(--accent2)}
.info-row-value.warn{color:var(--accent3)}
.info-row-value.bad{color:var(--danger)}
.info-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}
.info-header .airline-tag{font-size:10px;padding:3px 10px;border-radius:5px;font-weight:600;color:#fff}
.info-disclaimer{font-size:9px;color:var(--text3);padding:8px 16px 10px;border-top:1px solid var(--border);line-height:1.5;font-style:italic}

@media(max-width:900px){.grid5{grid-template-columns:1fr 1fr}.grid4{grid-template-columns:1fr 1fr}.flex-grid{grid-template-columns:repeat(4,1fr)}}
@media(max-width:600px){.grid5{grid-template-columns:1fr}.grid4{grid-template-columns:1fr}.flex-grid{grid-template-columns:repeat(3,1fr)}.info-tabs{gap:0}}
`;

export default function FlightIntel() {
  const [tab, setTab] = useState("search");
  const [origin, setOrigin] = useState("JFK - New York");
  const [dest, setDest] = useState("LHR - London");
  const [date, setDate] = useState("2026-04-15");
  const [returnDate, setReturnDate] = useState("2026-04-22");
  const [cabin, setCabin] = useState("Economy");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState([{ age: 5, needsSeat: true }, { age: 1, needsSeat: false }]);
  const pax = { adults, children };
  const totalPax = adults + children.length;
  const addChild = () => setChildren(p => [...p, { age: 8, needsSeat: true }]);
  const removeChild = (i) => setChildren(p => p.filter((_, idx) => idx !== i));
  const updateChild = (i, field, val) => setChildren(p => p.map((c, idx) => idx === i ? { ...c, [field]: field === "age" ? parseInt(val) || 0 : val } : c));
  const [milesBalances, setMilesBalances] = useState({ united: 85000, delta: 42000, american: 120000, jetblue: 15000, southwest: 30000, emirates: 55000 });
  const [fees, setFees] = useState({ checkedBags: 1, carryOns: 1, seatUpgrade: 0 });
  const [uberPickup, setUberPickup] = useState("Home Address");
  const [uberDistance, setUberDistance] = useState(25);
  const [uberEstimates, setUberEstimates] = useState(null);
  const [selectedUber, setSelectedUber] = useState("uberX");
  const [flights, setFlights] = useState([]);
  const [flexDates, setFlexDates] = useState([]);
  const [tips, setTips] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [sortBy, setSortBy] = useState("totalCost");
  const [searched, setSearched] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [infoTab, setInfoTab] = useState("cancellation");
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const search = useCallback(async () => {
    setLoading(true);
    setApiError("");
    setSearched(true);
    setExpandedId(null);
    setFlights([]);

    const cabinMap = { "Economy": 1, "Premium Economy": 2, "Business": 3, "First": 4 };
    const or3 = origin.slice(0, 3);
    const de3 = dest.slice(0, 3);
    const childCount = children.filter(c => c.age >= 2).length;
    const infantCount = children.filter(c => c.age < 2).length;

    try {
      const params = new URLSearchParams({
        origin: or3,
        destination: de3,
        date,
        adults: String(adults),
        children: String(childCount),
        infants: String(infantCount),
        cabin: String(cabinMap[cabin] || 1),
        stops: "0", // nonstop only
      });
      if (returnDate) params.set("returnDate", returnDate);

      const res = await fetch(`/api/flights?${params.toString()}`);
      const data = await res.json();

      if (data.error) {
        setApiError(data.error);
        setFlights([]);
        setLoading(false);
        return;
      }

      // Transform API results into our app format — only nonstop
      const transformed = (data.flights || []).filter(f => f.isDirect).map((f, i) => {
        const airlineName = f.airline || "Unknown";
        // Match to our airline DB
        const alKey = Object.keys(AIRLINES).find(k =>
          airlineName.toLowerCase().includes(AIRLINES[k].name.toLowerCase())
        ) || null;
        const al = alKey ? AIRLINES[alKey] : null;
        const airlineCode = al ? al.code : (f.airlineCode || airlineName.slice(0, 2).toUpperCase());

        const adultPrice = Math.round(f.price / Math.max(1, adults + childCount));
        const pricing = alKey
          ? getPassengerPricing(adultPrice, pax, alKey)
          : { total: f.price, breakdown: [{ type: `All passengers`, price: f.price, discount: 0 }], perAdult: adultPrice };

        const milesEstimate = Math.round(adultPrice * 75); // rough cpp estimate

        return {
          id: `api-${i}-${date}`,
          airline: alKey || airlineName.toLowerCase().replace(/\s/g, ""),
          airlineName,
          airlineCode,
          airlineLogo: f.airlineLogo || null,
          flightNumber: f.flightNumber || "",
          origin: f.departure?.code || or3,
          destination: f.arrival?.code || de3,
          date,
          departure: f.departure?.time || "",
          arrival: f.arrival?.time || "",
          duration: f.duration || 0,
          durationStr: f.durationStr || "",
          cabin,
          price: f.price || 0,
          pricePerAdult: adultPrice,
          pricingBreakdown: pricing.breakdown,
          milesRequired: milesEstimate,
          milesTaxes: Math.round(5.6 * (adults + children.length) + 25),
          totalPax: adults + children.length,
          pax,
          direct: f.isDirect,
          isIntl: f.departure?.code !== or3 || !["US"].includes("US"),
          aircraft: f.airplane || "",
          wifi: f.legs?.[0]?.wifi || false,
          power: f.legs?.[0]?.power || false,
          entertainment: f.legs?.[0]?.entertainment || false,
          legroom: f.legs?.[0]?.legroom || "",
          extensions: f.extensions || [],
          tier: f.tier,
          carbon: f.carbon || {},
          realData: true,
        };
      });

      setFlights(transformed);

      // Price insights for flex dates
      if (data.priceInsights) {
        // Store price insights if available
      }
    } catch (err) {
      setApiError("Failed to connect to flight search. Check your connection.");
      setFlights([]);
    }

    const ub = getUberEstimate(uberDistance);
    setUberEstimates(ub);
    setLoading(false);
    setAnalyzing(true);
    setTips([]);
    setTimeout(() => {
      setTips(generateOptimizationTips(flights, milesBalances, fees, ub[selectedUber] || 0, pax, flexDates, cabin));
      setAnalyzing(false);
    }, 800);
  }, [origin, dest, date, returnDate, adults, children, cabin, uberDistance, selectedUber, milesBalances, fees]);

  const getTotalCost = (f) => {
    const af = FEES_DB[f.airlineCode] || {};
    const ck = f.cabin === "Economy" ? "Eco" : f.cabin === "Premium Economy" ? "Prem" : f.cabin === "Business" ? "Biz" : "First";
    const bags = (parseInt(fees.checkedBags) || 0) * (af.checkedBag || 0) * totalPax;
    const seat = (af[`seat${ck}`] || 0) * totalPax;
    const uber = uberEstimates ? (uberEstimates[selectedUber] || 0) : 0;
    return { base: f.price, bags, seat, uber, total: f.price + bags + seat + uber };
  };

  const sorted = [...flights].sort((a, b) => {
    if (sortBy === "totalCost") return getTotalCost(a).total - getTotalCost(b).total;
    if (sortBy === "price") return a.price - b.price;
    if (sortBy === "duration") return a.duration - b.duration;
    if (sortBy === "departure") return a.departure.localeCompare(b.departure);
    if (sortBy === "miles") return a.milesRequired - b.milesRequired;
    return 0;
  });
  const cheapestFlex = flexDates.length ? flexDates.reduce((a, b) => a.bestPrice < b.bestPrice ? a : b) : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        <div className="header">
          <div className="logo-box"><PlaneIcon /></div>
          <div><h1>FlightIntel</h1><div className="sub">Live Google Flights Data — Miles · Cash · Child Pricing · True Cost</div></div>
        </div>
        <div className="tabs">
          {[["search","Search"],["optimize","Optimizer"],["suggestions","Flex Dates"],["miles","Miles & Settings"]].map(([k,l]) => (
            <button key={k} className={`tab ${tab === k ? "active" : ""}`} onClick={() => setTab(k)}>{l}</button>
          ))}
        </div>

        {tab === "miles" && (
          <>
            <div className="miles-panel">
              <h3><StarIcon /> My Miles Balances</h3>
              <div className="miles-grid">
                {Object.entries(AIRLINES).map(([key, al]) => (
                  <div key={key} className="mile-input">
                    <div className="dot" style={{ background: al.color }} />
                    <span>{al.milesName}</span>
                    <input type="number" value={milesBalances[key] || 0} onChange={e => setMilesBalances(p => ({ ...p, [key]: parseInt(e.target.value) || 0 }))} />
                  </div>
                ))}
              </div>
            </div>
            <div className="uber-panel">
              <h3><CarIcon /> Ground Transportation</h3>
              <div className="grid4">
                <div className="field"><label>Pickup Location</label><input value={uberPickup} onChange={e => setUberPickup(e.target.value)} /></div>
                <div className="field"><label>Distance to Airport (mi)</label><input type="number" min="1" max="200" value={uberDistance} onChange={e => setUberDistance(parseInt(e.target.value) || 0)} /></div>
                <div className="field"><label>Ride Type</label><select value={selectedUber} onChange={e => setSelectedUber(e.target.value)}><option value="uberX">UberX</option><option value="uberComfort">Comfort</option><option value="uberXL">XL</option><option value="uberBlack">Black</option></select></div>
                <div className="field"><label>Default Checked Bags</label><input type="number" min="0" max="5" value={fees.checkedBags} onChange={e => setFees(p => ({ ...p, checkedBags: e.target.value }))} /></div>
              </div>
            </div>
          </>
        )}

        {tab === "search" && (
          <>
            <div className="grid5">
              <div className="field"><label>From</label><select value={origin} onChange={e => setOrigin(e.target.value)}>{AIRPORTS.map(a => <option key={a}>{a}</option>)}</select></div>
              <div className="field"><label>To</label><select value={dest} onChange={e => setDest(e.target.value)}>{AIRPORTS.map(a => <option key={a}>{a}</option>)}</select></div>
              <div className="field"><label>Depart</label><input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
              <div className="field"><label>Return</label><input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} /></div>
              <button className="search-btn" onClick={search}><SearchIcon /> Search</button>
            </div>
            <div className="grid4" style={{ marginBottom: 4 }}>
              <div className="field"><label>Cabin</label><select value={cabin} onChange={e => setCabin(e.target.value)}>{CABIN_CLASSES.map(c => <option key={c}>{c}</option>)}</select></div>
              <div className="field"><label>Checked Bags / Person</label><input type="number" min="0" max="5" value={fees.checkedBags} onChange={e => setFees(p => ({ ...p, checkedBags: e.target.value }))} /></div>
              <div className="field"><label>Carry-Ons / Person</label><input type="number" min="0" max="2" value={fees.carryOns} onChange={e => setFees(p => ({ ...p, carryOns: e.target.value }))} /></div>
              <div className="field"><label>Seat Upgrade $</label><input type="number" min="0" value={fees.seatUpgrade} onChange={e => setFees(p => ({ ...p, seatUpgrade: e.target.value }))} /></div>
            </div>

            <div className="pax-panel">
              <h3><UserIcon /> Passengers ({totalPax} total)</h3>
              <div className="pax-row">
                <div className="pax-type"><span className="name">Adults</span><span className="desc">Age 12+</span></div>
                <div className="pax-controls">
                  <button className="pax-btn" disabled={adults <= 1} onClick={() => setAdults(a => Math.max(1, a - 1))}>−</button>
                  <span className="pax-count">{adults}</span>
                  <button className="pax-btn" onClick={() => setAdults(a => Math.min(9, a + 1))}>+</button>
                </div>
              </div>
              <div className="pax-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="pax-type"><span className="name">Children / Infants</span><span className="desc">Age affects pricing — Emirates gives 25% off ages 2-11</span></div>
                  <span style={{ fontSize: 12, color: "var(--text2)" }}>{children.length}</span>
                </div>
                {children.map((c, i) => (
                  <div key={i} className="child-row">
                    <div className="field">
                      <label>Age</label>
                      <input type="number" min="0" max="17" value={c.age} onChange={e => updateChild(i, "age", e.target.value)} />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                      <span style={{ fontSize: 11, color: "var(--text2)" }}>
                        {c.age < 2 ? (c.needsSeat ? "Infant — own seat (75% fare)" : "Infant — lap child (free on US carriers)") : c.age <= 11 ? "Child (2-11) — 25% off on Emirates, full fare US carriers" : "Youth (12-17) — full adult fare"}
                      </span>
                      {c.age < 2 && (
                        <label className="lap-toggle">
                          <input type="checkbox" checked={c.needsSeat} onChange={e => updateChild(i, "needsSeat", e.target.checked)} />
                          Needs own seat
                        </label>
                      )}
                    </div>
                    <button className="child-remove" onClick={() => removeChild(i)}><XIcon /></button>
                  </div>
                ))}
                <button className="add-child-btn" onClick={addChild}><PlusIcon /> Add Child / Infant</button>
              </div>
            </div>

            {searched && loading && (
              <div className="analysis-card">
                <div className="analysis-loading">
                  <div className="dot-pulse"><span /><span /><span /></div>
                  Searching real flights on Google Flights via SerpApi...
                </div>
              </div>
            )}

            {apiError && (
              <div style={{ background: "rgba(255,61,113,0.1)", border: "1px solid var(--danger)", borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--danger)", marginBottom: 4 }}>Search Error</div>
                <div style={{ fontSize: 12, color: "var(--text2)" }}>{apiError}</div>
              </div>
            )}

            {searched && !loading && flights.length > 0 && (
              <>
                <div className="results-header">
                  <div>
                    <h2>Direct Flights · {adults} Adult{adults > 1 ? "s" : ""}{children.length > 0 ? ` · ${children.length} Child${children.length > 1 ? "ren" : ""}` : ""} <span style={{ fontSize: 9, background: "var(--accent2)", color: "#000", padding: "2px 8px", borderRadius: 4, fontWeight: 700, marginLeft: 8, verticalAlign: "middle" }}>LIVE</span></h2>
                    <span className="results-count">{flights.length} nonstop options · sorted by {sortBy === "totalCost" ? "true cost" : sortBy}</span>
                  </div>
                  <div className="sort-btns">
                    {[["totalCost","True Cost"],["price","Base"],["duration","Duration"],["departure","Time"],["miles","Miles"]].map(([k,l]) => (
                      <button key={k} className={`sort-btn ${sortBy === k ? "active" : ""}`} onClick={() => setSortBy(k)}>{l}</button>
                    ))}
                  </div>
                </div>
                {sorted.map((f, i) => {
                  const costs = getTotalCost(f);
                  const isExp = expandedId === f.id;
                  const al = AIRLINES[f.airline] || null;
                  const hasMiles = al && (milesBalances[f.airline] || 0) >= f.milesRequired;
                  const cpp = hasMiles ? ((f.pricePerAdult / f.milesRequired) * 100).toFixed(1) : null;
                  return (
                    <div key={f.id} className={`flight-card ${i === 0 && sortBy === "totalCost" ? "best" : ""} ${isExp ? "expanded-card" : ""}`} onClick={() => setExpandedId(isExp ? null : f.id)}>
                      <div className="flight-top">
                        <div className="airline-badge">
                          {f.airlineLogo
                            ? <img src={f.airlineLogo} alt={f.airlineName} style={{ width: 34, height: 34, borderRadius: 10, objectFit: "contain", background: "#fff" }} />
                            : <div className="airline-dot" style={{ background: al?.color || "var(--accent)" }}>{f.airlineCode?.slice(0,2)}</div>
                          }
                          <div className="airline-info"><span className="airline-name">{f.airlineName}</span><span className="flight-num">{f.flightNumber}{f.aircraft ? ` · ${f.aircraft}` : ""}{f.legroom ? ` · ${f.legroom}` : ""}</span></div>
                        </div>
                        <div className="price-box">
                          <div className="price-cash">${costs.total.toLocaleString()}</div>
                          <div className="price-pp">true total · base ${f.price.toLocaleString()}</div>
                        </div>
                      </div>
                      <div className="flight-middle">
                        <div className="time-block"><div className="time">{f.departure}</div><div className="airport">{f.origin}</div></div>
                        <div className="flight-line"><div className="line-bar" /><div className="duration-tag">{f.durationStr}</div><div className="direct-tag">✈ Direct</div></div>
                        <div className="time-block"><div className="time">{f.arrival}</div><div className="airport">{f.destination}</div></div>
                      </div>
                      <div className="flight-bottom">
                        <div className="tags">
                          <span className="tag">{f.cabin}</span>
                          {f.airline === "emirates" && <span className="tag" style={{ color: "#C8A850" }}>Emirates</span>}
                          {f.pricingBreakdown.some(p => p.discount > 0) && <span className="tag" style={{ color: "var(--accent2)" }}>Child Discount</span>}
                          {f.airlineCode === "WN" && <span className="tag" style={{ color: "var(--accent2)" }}>Free Bags</span>}
                          {f.airlineCode === "EK" && <span className="tag" style={{ color: "#C8A850" }}>Free Bags</span>}
                        </div>
                        <div className="miles-option">
                          <div><div className="miles-val">{f.milesRequired.toLocaleString()} mi</div><div className="miles-tax">+${f.milesTaxes} tax</div></div>
                          {hasMiles ? <span className="tag" style={{ color: "var(--accent2)" }}><CheckIcon /> {cpp}cpp</span> : <span className="tag" style={{ color: "var(--danger)" }}>Need miles</span>}
                        </div>
                      </div>
                      {isExp && (
                        <>
                        <div className="cost-breakdown">
                          <div className="cost-section-title">Passenger Fares</div>
                          {f.pricingBreakdown.map((p, pi) => (
                            <div key={pi} className={`cost-row ${p.discount > 0 ? "discount" : ""}`}>
                              <span className="lbl">{p.type}{p.discount > 0 ? ` (${p.discount}% off)` : ""}</span>
                              <span className="val">{p.price === 0 ? "FREE" : `$${p.price.toLocaleString()}`}</span>
                            </div>
                          ))}
                          <div className="cost-section-title">Additional Fees</div>
                          <div className="cost-row"><span className="lbl">Checked bags ({fees.checkedBags} × {totalPax})</span><span className="val">${costs.bags.toLocaleString()}</span></div>
                          <div className="cost-row"><span className="lbl">Seat selection ({totalPax} pax)</span><span className="val">${costs.seat.toLocaleString()}</span></div>
                          <div className="cost-row"><span className="lbl">Uber {selectedUber} (~{uberDistance}mi)</span><span className="val">${costs.uber.toLocaleString()}</span></div>
                          <div className="cost-row total"><span className="lbl">TRUE TOTAL</span><span className="val">${costs.total.toLocaleString()}</span></div>
                          {hasMiles && (
                            <div className="cost-row miles-alt">
                              <span className="lbl">Alt: {f.milesRequired.toLocaleString()} {al.milesName} + ${f.milesTaxes + costs.bags + costs.seat + costs.uber} cash</span>
                              <span className="val">{cpp}cpp</span>
                            </div>
                          )}
                        </div>

                        {/* ── FLIGHT INFO BOX ── */}
                        {(() => {
                          const policies = POLICIES_DB[f.airlineCode];
                          if (!policies) return null;
                          const infoCategories = [
                            { key: "cancellation", label: "Cancellation", icon: "✕" },
                            { key: "changes", label: "Changes", icon: "↻" },
                            { key: "seats", label: "Seats", icon: "◻" },
                            { key: "baggage", label: "Baggage", icon: "▪" },
                            { key: "amenities", label: "Amenities", icon: "★" },
                          ];
                          const activeCategory = infoTab;
                          const items = policies[activeCategory] || [];
                          return (
                            <div className="info-box" onClick={e => e.stopPropagation()}>
                              <div className="info-header" style={{ padding: "10px 16px 0" }}>
                                <span style={{ fontSize: 12, fontWeight: 600 }}>{al.name} — Flight Policies</span>
                                <span className="airline-tag" style={{ background: al.color }}>{al.code} {f.flightNumber}</span>
                              </div>
                              <div className="info-tabs">
                                {infoCategories.map(cat => (
                                  <button key={cat.key} className={`info-tab ${activeCategory === cat.key ? "active" : ""}`} onClick={e => { e.stopPropagation(); setInfoTab(cat.key); }}>
                                    {cat.label}
                                  </button>
                                ))}
                              </div>
                              <div className="info-content">
                                {items.map((item, idx) => (
                                  <div key={idx} className="info-row">
                                    <div className="info-row-icon">{item.icon}</div>
                                    <div className="info-row-body">
                                      <div className="info-row-label">{item.label}</div>
                                      <div className={`info-row-value ${item.value.startsWith("Free") || item.value.startsWith("Full refund") || item.value.startsWith("No change fee") || item.value.startsWith("No cancel") || item.value.includes("FREE") ? "good" : item.value.startsWith("Non-refundable") || item.value.startsWith("No changes") || item.value.startsWith("Not ") ? "bad" : item.value.includes("$") && !item.value.startsWith("Free") ? "warn" : ""}`}>
                                        {item.value}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="info-disclaimer">
                                Policies are approximate and may vary by fare class, route, and date of purchase. Always confirm with {al.name} directly before booking.
                              </div>
                            </div>
                          );
                        })()}
                        </>
                      )}
                    </div>
                  );
                })}
              </>
            )}
            {searched && !loading && !flights.length && !apiError && <div className="empty-state"><div className="big-icon">✈</div><p>No nonstop flights found for this route and date. Try different dates or airports.</p></div>}
            {!searched && <div className="empty-state"><div className="big-icon">✈</div><p>Search real flights from Google Flights. Enter your trip details and hit Search.</p></div>}
          </>
        )}

        {tab === "optimize" && (
          <>
            {analyzing && <div className="analysis-card"><div className="analysis-loading"><div className="dot-pulse"><span /><span /><span /></div>Running optimization engine across {Object.keys(AIRLINES).length} airlines...</div></div>}
            {tips.length > 0 ? (
              <div className="tips-panel">
                <h3><TipIcon /> {tips.length} Optimization{tips.length > 1 ? "s" : ""} Found</h3>
                <p style={{ fontSize: 11, color: "var(--text2)", marginBottom: 14 }}>
                  For {adults} adult{adults > 1 ? "s" : ""}{children.length > 0 ? `, ${children.length} child${children.length > 1 ? "ren" : ""} (ages ${children.map(c => c.age).join(", ")})` : ""} · {origin.slice(0, 3)} → {dest.slice(0, 3)} · {cabin}
                </p>
                {tips.map((tip, i) => (
                  <div key={i} className={`tip-card ${tip.priority}`}>
                    <div className="tip-icon">{tip.icon}</div>
                    <div className="tip-body"><div className="tip-title">{tip.title}</div><div className="tip-text">{tip.text}</div></div>
                    {tip.savings > 0 && <div className="tip-savings">-${tip.savings}</div>}
                  </div>
                ))}
                <div className="savings-total">
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Total Potential Savings</div>
                  <div className="amt">${tips.reduce((s, t) => s + t.savings, 0).toLocaleString()}</div>
                  <div style={{ fontSize: 10, color: "var(--text3)", marginTop: 2 }}>if all applicable optimizations are used</div>
                </div>
              </div>
            ) : (
              !analyzing && <div className="empty-state"><div className="big-icon">💡</div><p>Search for flights first to see optimization tips.</p></div>
            )}
          </>
        )}

        {tab === "suggestions" && (
          <>
            {flexDates.length > 0 ? (
              <>
                <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Flexible Date Finder</h2>
                <p style={{ fontSize: 11, color: "var(--text2)", marginBottom: 14 }}>±3 days around your selected date. Click to re-search.</p>
                <div className="flex-grid">
                  {flexDates.map(fd => {
                    const d = new Date(fd.date + "T12:00:00");
                    const isCh = cheapestFlex && fd.date === cheapestFlex.date;
                    const isSel = fd.date === date;
                    const diff = fd.bestPrice - (flexDates.find(x => x.offset === 0)?.bestPrice || fd.bestPrice);
                    return (
                      <div key={fd.date} className={`flex-card ${isCh ? "cheapest" : ""} ${isSel ? "selected" : ""}`} onClick={() => { setDate(fd.date); setTab("search"); setTimeout(search, 100); }}>
                        <div className="flex-day">{d.toLocaleDateString("en", { weekday: "short" })}</div>
                        <div className="flex-date">{d.toLocaleDateString("en", { month: "short", day: "numeric" })}</div>
                        <div className="flex-price">${fd.bestPrice.toLocaleString()}</div>
                        {fd.offset !== 0 && <div className={`flex-diff ${diff < 0 ? "save" : diff > 0 ? "more" : ""}`}>{diff < 0 ? `Save $${Math.abs(diff)}` : diff > 0 ? `+$${diff}` : "Same"}</div>}
                        {isCh && <div style={{ fontSize: 8, color: "var(--accent2)", fontWeight: 700, marginTop: 3 }}>CHEAPEST</div>}
                        <div className="flex-count">{fd.flightCount} flights</div>
                      </div>
                    );
                  })}
                </div>
                {cheapestFlex && cheapestFlex.date !== date && (
                  <div className="analysis-card">
                    <h3><StarIcon /> Savings Suggestion</h3>
                    <div style={{ fontSize: 12, color: "var(--text2)", lineHeight: 1.7 }}>
                      Move to <strong style={{ color: "var(--text)" }}>{new Date(cheapestFlex.date + "T12:00:00").toLocaleDateString("en", { weekday: "long", month: "long", day: "numeric" })}</strong> to save <strong style={{ color: "var(--accent2)" }}>${Math.abs(cheapestFlex.bestPrice - (flexDates.find(x => x.offset === 0)?.bestPrice || 0))}</strong> — {cheapestFlex.bestFlight.airlineName} {cheapestFlex.bestFlight.flightNumber} at {cheapestFlex.bestFlight.departure}.
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state"><div className="big-icon">📅</div><p>Search for flights first to see flexible date options.</p></div>
            )}
          </>
        )}
      </div>
    </>
  );
}
